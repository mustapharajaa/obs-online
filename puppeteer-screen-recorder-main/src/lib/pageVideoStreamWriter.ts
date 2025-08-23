import { EventEmitter } from 'events';
import os from 'os';
import { extname } from 'path';
import { PassThrough, Writable } from 'stream';
import { spawn, ChildProcess } from 'child_process';

import ffmpeg, { setFfmpegPath } from 'fluent-ffmpeg';

import {
  pageScreenFrame,
  SupportedFileFormats,
  VIDEO_WRITE_STATUS,
  VideoOptions,
} from './pageVideoStreamTypes';

/**
 * @ignore
 */
const SUPPORTED_FILE_FORMATS = [
  SupportedFileFormats.MP4,
  SupportedFileFormats.AVI,
  SupportedFileFormats.MOV,
  SupportedFileFormats.WEBM,
];

/**
 * @ignore
 */
export default class PageVideoStreamWriter extends EventEmitter {
  private readonly screenLimit = 10;
  private screenCastFrames = [];
  public duration = '00:00:00:00';
  public frameGain = 0;
  public frameLoss = 0;


  private status = VIDEO_WRITE_STATUS.NOT_STARTED;
  private options: VideoOptions;
  private streamId: string; // Add Stream ID for tracking

  private videoMediatorStream: PassThrough = new PassThrough();
  private writerPromise: Promise<boolean>;
  private ffmpegProcess: ChildProcess;
  
  // RTMP Retry Logic - DISABLED
  private maxRetries = 0;
  private currentRetry = 0;
  private originalRtmpUrl: string;
  private forceTerminated = false;

  constructor(destinationSource: string | Writable, options?: VideoOptions) {
    super();

    if (options) {
      this.options = options;
      this.streamId = options.streamId || 'Unknown'; // Extract Stream ID from options
    } else {
      this.streamId = 'Unknown';
    }

    const isWritable = this.isWritableStream(destinationSource);
    this.configureFFmPegPath();
    if (isWritable) {
      this.configureVideoWritableStream(destinationSource as Writable);
    } else {
      this.configureVideoFile(destinationSource as string);
    }
  }

  private get videoFrameSize(): string {
    const { width, height } = this.options.videoFrame;

    return width !== null && height !== null ? `${width}x${height}` : '100%';
  }

  private get autopad(): { activation: boolean; color?: string } {
    const autopad = this.options.autopad;

    return !autopad
      ? { activation: false }
      : { activation: true, color: autopad.color };
  }

  private getFfmpegPath(): string | null {
    if (this.options.ffmpeg_Path) {
      return this.options.ffmpeg_Path;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ffmpeg = require('@ffmpeg-installer/ffmpeg');
      if (ffmpeg.path) {
        return ffmpeg.path;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  private getDestinationPathExtension(destinationFile): SupportedFileFormats {
    const fileExtension = extname(destinationFile);
    return fileExtension.includes('.')
      ? (fileExtension.replace('.', '') as SupportedFileFormats)
      : (fileExtension as SupportedFileFormats);
  }

  private configureFFmPegPath(): void {
    const ffmpegPath = this.getFfmpegPath();

    if (!ffmpegPath) {
      throw new Error(
        'FFmpeg path is missing, \n Set the FFMPEG_PATH env variable',
      );
    }

    setFfmpegPath(ffmpegPath);
  }

  private isWritableStream(destinationSource: string | Writable): boolean {
    if (destinationSource && typeof destinationSource !== 'string') {
      if (
        !(destinationSource instanceof Writable) ||
        !('writable' in destinationSource) ||
        !destinationSource.writable
      ) {
        throw new Error('Output should be a writable stream');
      }
      return true;
    }
    return false;
  }

  private configureVideoFile(destinationPath: string): void {
    // Check if destination is RTMP URL
    if (destinationPath.startsWith('rtmp://')) {
      this.configureRTMPStream(destinationPath);
      return;
    }

    const fileExt = this.getDestinationPathExtension(destinationPath);

    if (!SUPPORTED_FILE_FORMATS.includes(fileExt)) {
      throw new Error('File format is not supported');
    }

    this.writerPromise = new Promise((resolve) => {
      const outputStream = this.getDestinationStream();

      outputStream
        .on('error', (e) => {
          this.handleWriteStreamError(e.message);
          resolve(false);
        })
        .on('stderr', (e) => {
          this.handleWriteStreamError(e);
          resolve(false);
        })
        .on('end', () => resolve(true))
        .save(destinationPath);

      if (fileExt == SupportedFileFormats.WEBM) {
        outputStream
          .videoCodec('libvpx')
          .videoBitrate(this.options.videoBitrate || 1000, true)
          .outputOptions('-flags', '+global_header', '-psnr');
      }
    });
  }

  private configureRTMPStream(rtmpUrl: string): void {
    console.log(`🚀 PATCHED LIBRARY: Configuring direct RTMP output to ${rtmpUrl}`);
    
    // Store original RTMP URL for retries
    this.originalRtmpUrl = rtmpUrl;
    this.currentRetry = 0;

    this.startRTMPStreamWithRetry(rtmpUrl);
  }

  private startRTMPStreamWithRetry(rtmpUrl: string): void {
    this.writerPromise = new Promise((resolve, reject) => {
      const ffmpegPath = this.getFfmpegPath();
      if (!ffmpegPath) {
        const errorMsg = 'FFmpeg path is missing. Set the FFMPEG_PATH env variable.';
        console.error(`🚨 PATCHED LIBRARY: ${errorMsg}`);
        this.emit('videoStreamWriterError', errorMsg);
        return reject(new Error(errorMsg));
      }

      const videoBitrate = this.options.videoBitrate || 2500;
      const audioInput = ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100'];

      // Build completely clean FFMPEG command using raw spawn to avoid fluent-ffmpeg conflicts
      const videoArgs = [
        '-f', 'image2pipe',
        '-r', `${this.options.fps}`,
        '-i', 'pipe:0', 
        ...audioInput,
        '-vcodec', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-vf', `scale=${this.options.videoFrame.width}:${this.options.videoFrame.height}`,  // Scale to specified resolution
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-g', `${this.options.fps * 2}`,
        '-b:v', `${videoBitrate}k`,
        '-minrate', `${videoBitrate}k`,
        '-maxrate', `${videoBitrate}k`,
        '-bufsize', `${videoBitrate * 2}k`,
        '-acodec', 'aac',
        '-b:a', '128k',
        '-f', 'flv',
        '-loglevel', 'info',
        rtmpUrl
      ];

      console.log('📡 PATCHED LIBRARY: RTMP streaming started:', ffmpegPath, ...videoArgs);

      this.ffmpegProcess = spawn(ffmpegPath, videoArgs, { stdio: ['pipe', 'pipe', 'pipe'] });

      this.ffmpegProcess.stdout.on('data', () => {
        // Suppress verbose FFMPEG output
      });

      this.ffmpegProcess.stderr.on('data', (data) => {
        const message = data.toString();
        // Show useful progress info (fps, bitrate, speed) but filter out verbose startup info
        if (message.includes('frame=') || message.includes('fps=') || message.includes('bitrate=') || message.includes('speed=')) {
          console.log(`🔧 PATCHED LIBRARY: FFMPEG [Stream ${this.streamId}]: ${message.trim()}`);
        } else if (message.includes('Error') || message.includes('failed')) {
          console.log(`🚨 PATCHED LIBRARY: FFMPEG [Stream ${this.streamId}] ERROR: ${message}`);
        }
        // Suppress verbose startup configuration output
      });

      this.ffmpegProcess.on('close', (code) => {
        console.log(`🚪 PATCHED LIBRARY: FFMPEG [Stream ${this.streamId}] process closed with code ${code}`);
        if (code !== 0) {
          const errorMessage = `FFMPEG process exited with code ${code}`;
          console.error(`🚨 PATCHED LIBRARY: [Stream ${this.streamId}] ${errorMessage}`);
          this.emit('videoStreamWriterError', errorMessage);
          
          // NO RETRIES when force terminated
          if (this.forceTerminated) {
            console.log(`🛡️ PATCHED LIBRARY: [Stream ${this.streamId}] Force terminated - no retry allowed`);
            resolve(true);
            return;
          }
          
          // Kill FFMPEG process immediately on any error
          if (this.ffmpegProcess && this.ffmpegProcess.pid) {
            console.log(`💀 PATCHED LIBRARY: [Stream ${this.streamId}] Killing FFMPEG PID ${this.ffmpegProcess.pid}`);
            this.ffmpegProcess.kill('SIGKILL');
          }
          
          // Only retry once for genuine network errors (not forced termination)
          if (this.shouldRetryRTMPConnection(code) && this.currentRetry < this.maxRetries) {
            this.currentRetry++;
            console.log(`🔄 PATCHED LIBRARY: [Stream ${this.streamId}] Network error, retrying (${this.currentRetry}/${this.maxRetries})...`);
            
            // Wait 2 seconds before retry
            setTimeout(() => {
              if (!this.forceTerminated) {
                this.startRTMPStreamWithRetry(this.originalRtmpUrl);
              }
            }, 2000);
            return;
          }
          
          if (code === 1) {
            console.log(`🛡️ PATCHED LIBRARY: [Stream ${this.streamId}] Treating exit code 1 as expected termination`);
            resolve(true);  // Resolve instead of reject for forced termination
          } else {
            if (this.currentRetry >= this.maxRetries) {
              console.error(`❌ PATCHED LIBRARY: [Stream ${this.streamId}] Max retries (${this.maxRetries}) exceeded, giving up`);
            }
            resolve(true);  // Don't reject, just resolve to prevent hanging
          }
        } else {
          resolve(true);
        }
      });

      this.ffmpegProcess.stdin.on('error', (err) => {
        console.error(`🚨 PATCHED LIBRARY: FFMPEG [Stream ${this.streamId}] stdin error:`, err);
        this.emit('videoStreamWriterError', `FFMPEG stdin error: ${err}`);
        resolve(false);
      });

      // Pipe video frames to FFMPEG
      this.videoMediatorStream.pipe(this.ffmpegProcess.stdin);
    });
  }

  private shouldRetryRTMPConnection(exitCode: number): boolean {
    // Retry on common RTMP connection error codes
    const retryableCodes = [
      1,    // General error (often network issues)
      255,  // FFMPEG generic error
      -1,   // Process killed/interrupted
    ];
    
    return retryableCodes.includes(exitCode);
  }

  private configureVideoWritableStream(writableStream: Writable) {
    this.writerPromise = new Promise((resolve) => {
      const outputStream = this.getDestinationStream();

      outputStream
        .on('error', (e) => {
          writableStream.emit('error', e);
          resolve(false);
        })
        .on('stderr', (e) => {
          writableStream.emit('error', { message: e });
          resolve(false);
        })
        .on('end', () => {
          writableStream.end();
          resolve(true);
        });

      outputStream.toFormat('mp4');
      // Configure FFMPEG for direct RTMP streaming with FIXED YouTube Live compatibility
      const outputOptions = [
        // Audio settings - ADD SILENT AUDIO TRACK (YouTube requires audio)
        '-f lavfi',
        '-i anullsrc=channel_layout=stereo:sample_rate=44100',
        '-acodec aac',
        '-b:a 128k',
        '-ar 44100',
        '-ac 2',
        
        // Video settings - SIMPLIFIED for YouTube Live
        '-vcodec libx264',
        '-b:v 2500k',  // YouTube recommended bitrate
        '-maxrate 2500k',
        '-minrate 2500k',
        '-bufsize 5000k',
        `-filter:v scale=w='if(gt(a,${this.options.aspectRatio}),${this.options.videoFrame.width},trunc(${this.options.videoFrame.height}*a/2)*2)':h='if(lt(a,${this.options.aspectRatio}),${this.options.videoFrame.height},trunc(${this.options.videoFrame.width}/a/2)*2)',pad=w=${this.options.videoFrame.width}:h=${this.options.videoFrame.height}:x='if(gt(a,${this.options.aspectRatio}),0,(${this.options.videoFrame.width}-iw)/2)':y='if(lt(a,${this.options.aspectRatio}),0,(${this.options.videoFrame.height}-ih)/2)':color=black`,
        '-preset ultrafast',
        '-tune zerolatency',
        '-pix_fmt yuv420p',
        '-g 30',  // GOP size
        '-keyint_min 15',
        '-sc_threshold 0',
        '-r 15',  // Frame rate
        
        // Output format
        '-f flv',
        '-flvflags no_duration_filesize'
      ];  
      outputStream.addOutputOptions(outputOptions);
      outputStream.pipe(writableStream);
    });
  }

  private getOutputOption() {
    const cpu = Math.max(1, os.cpus().length - 1);
    const videoOutputOptions = this.options.videOutputOptions ?? [];

    const outputOptions = [];
    outputOptions.push(`-crf ${this.options.videoCrf ?? 23}`);
    outputOptions.push(`-preset ${this.options.videoPreset || 'ultrafast'}`);
    outputOptions.push(
      `-pix_fmt ${this.options.videoPixelFormat || 'yuv420p'}`,
    );
    outputOptions.push(`-minrate ${this.options.videoBitrate || 1000}`);
    outputOptions.push(`-maxrate ${this.options.videoBitrate || 1000}`);
    outputOptions.push('-framerate 1');
    outputOptions.push(`-threads ${cpu}`);
    outputOptions.push(`-loglevel error`);

    videoOutputOptions.forEach((options) => {
      outputOptions.push(options);
    });

    return outputOptions;
  }

  private addVideoMetadata(outputStream: ReturnType<typeof ffmpeg>) {
    const metadataOptions = this.options.metadata ?? [];

    for (const metadata of metadataOptions) {
      outputStream.outputOptions('-metadata', metadata);
    }
  }

  private getDestinationStream(): ffmpeg {
    const outputStream = ffmpeg({
      source: this.videoMediatorStream,
      priority: 20,
    })
      .videoCodec(this.options.videoCodec || 'libx264')
      .size(this.videoFrameSize)
      .aspect(this.options.aspectRatio || '4:3')
      .autopad(this.autopad.activation, this.autopad?.color)
      .inputFormat('image2pipe')
      .inputFPS(this.options.fps)
      .outputOptions(this.getOutputOption())
      .on('progress', (progressDetails) => {
        this.duration = progressDetails.timemark;
      });

    this.addVideoMetadata(outputStream);

    if (this.options.recordDurationLimit) {
      outputStream.duration(this.options.recordDurationLimit);
    }

    return outputStream;
  }

  private handleWriteStreamError(errorMessage): void {
    this.emit('videoStreamWriterError', errorMessage);

    if (
      this.status !== VIDEO_WRITE_STATUS.IN_PROGRESS &&
      errorMessage.includes('pipe:0: End of file')
    ) {
      return;
    }
    return console.error(
      `Error unable to capture video stream: ${errorMessage}`,
    );
  }

  private findSlot(timestamp: number): number {
    if (this.screenCastFrames.length === 0) {
      return 0;
    }

    let i: number;
    let frame: pageScreenFrame;

    for (i = this.screenCastFrames.length - 1; i >= 0; i--) {
      frame = this.screenCastFrames[i];

      if (timestamp > frame.timestamp) {
        break;
      }
    }

    return i + 1;
  }

  public insert(frame: pageScreenFrame): void {
    // reduce the queue into half when it is full
    if (this.screenCastFrames.length === this.screenLimit) {
      const numberOfFramesToSplice = Math.floor(this.screenLimit / 2);
      const framesToProcess = this.screenCastFrames.splice(
        0,
        numberOfFramesToSplice,
      );
      this.processFrameBeforeWrite(
        framesToProcess,
        this.screenCastFrames[0].timestamp,
      );
    }

    const insertionIndex = this.findSlot(frame.timestamp);

    if (insertionIndex === this.screenCastFrames.length) {
      this.screenCastFrames.push(frame);
    } else {
      this.screenCastFrames.splice(insertionIndex, 0, frame);
    }
  }

  private trimFrame(
    fameList: pageScreenFrame[],
    chunckEndTime: number,
  ): pageScreenFrame[] {
    return fameList.map((currentFrame: pageScreenFrame, index: number) => {
      const endTime =
        index !== fameList.length - 1
          ? fameList[index + 1].timestamp
          : chunckEndTime;
      const duration = endTime - currentFrame.timestamp;

      return {
        ...currentFrame,
        duration,
      };
    });
  }

  private processFrameBeforeWrite(
    frames: pageScreenFrame[],
    chunckEndTime: number,
  ): void {
    const processedFrames = this.trimFrame(frames, chunckEndTime);

    processedFrames.forEach(({ blob, duration }) => {
      this.write(blob, duration);
    });
  }

  public write(data: Buffer, durationSeconds = 1): void {
    this.status = VIDEO_WRITE_STATUS.IN_PROGRESS;

    const totalFrames = durationSeconds * this.options.fps;
    const floored = Math.floor(totalFrames);

    let numberOfFPS = Math.max(floored, 1);
    if (floored === 0) {
      this.frameGain += 1 - totalFrames;
    } else {
      this.frameLoss += totalFrames - floored;
    }

    while (1 < this.frameLoss) {
      this.frameLoss--;
      numberOfFPS++;
    }
    while (1 < this.frameGain) {
      this.frameGain--;
      numberOfFPS--;
    }

    for (let i = 0; i < numberOfFPS; i++) {
      this.videoMediatorStream.write(data);
    }
  }

  private drainFrames(stoppedTime: number): void {
    this.processFrameBeforeWrite(this.screenCastFrames, stoppedTime);
    this.screenCastFrames = [];
  }

  public stop(stoppedTime = Date.now() / 1000): Promise<boolean> {
    if (this.status === VIDEO_WRITE_STATUS.COMPLETED) {
      return this.writerPromise;
    }

    this.drainFrames(stoppedTime);

    this.videoMediatorStream.end();
    this.status = VIDEO_WRITE_STATUS.COMPLETED;
    return this.writerPromise;
  }

  // Expose FFMPEG process for targeted termination
  public getFfmpegProcess(): ChildProcess | null {
    return this.ffmpegProcess || null;
  }

  // Expose FFMPEG process PID for targeted termination
  public getFfmpegPid(): number | null {
    return this.ffmpegProcess?.pid || null;
  }

  // Mark stream as force terminated to prevent retries
  public markForceTerminated(): void {
    this.forceTerminated = true;
    console.log(`🚫 PATCHED LIBRARY: [Stream ${this.streamId}] Marked as force terminated - retries disabled`);
    
    // Immediately kill FFMPEG process when force terminated
    if (this.ffmpegProcess && this.ffmpegProcess.pid) {
      console.log(`💀 PATCHED LIBRARY: [Stream ${this.streamId}] Force killing FFMPEG PID ${this.ffmpegProcess.pid}`);
      this.ffmpegProcess.kill('SIGKILL');
    }
  }
}
