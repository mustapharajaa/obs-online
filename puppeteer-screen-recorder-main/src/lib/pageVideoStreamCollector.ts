import { EventEmitter } from 'events';

import { CDPSession, Page } from 'puppeteer';

import { PuppeteerScreenRecorderOptions } from './pageVideoStreamTypes';

/**
 * @ignore
 */
export class pageVideoStreamCollector extends EventEmitter {
  private page: Page;
  private options: PuppeteerScreenRecorderOptions;
  private sessionsStack: [CDPSession?] = [];
  private isStreamingEnded = false;
  private frameCount = 0;
  private captureTimer?: NodeJS.Timeout;

  private isFrameAckReceived: Promise<void>;

  constructor(page: Page, options: PuppeteerScreenRecorderOptions) {
    super();
    this.page = page;
    this.options = options;
  }

  private get shouldFollowPopupWindow(): boolean {
    return this.options.followNewTab;
  }

  private async getPageSession(page: Page): Promise<CDPSession | null> {
    try {
      const context = page.target();
      return await context.createCDPSession();
    } catch (error) {
      console.log('Failed to create CDP Session', error);
      return null;
    }
  }

  private getCurrentSession(): CDPSession | null {
    return this.sessionsStack[this.sessionsStack.length - 1];
  }

  private addListenerOnTabOpens(page: Page): void {
    page.on('popup', (newPage) => this.registerTabListener(newPage));
  }

  private removeListenerOnTabClose(page: Page): void {
    page.off('popup', (newPage) => this.registerTabListener(newPage));
  }

  private async registerTabListener(newPage: Page): Promise<void> {
    await this.startSession(newPage);
    newPage.once('close', async () => await this.endSession());
  }

  private async startScreenCast(shouldDeleteSessionOnFailure = false) {
    const currentSession = this.getCurrentSession();
    const quality = Number.isNaN(this.options.quality)
      ? 100
      : Math.max(Math.min(this.options.quality, 100), 0);
    try {
      console.log('🎬 PATCHED LIBRARY: Starting Chrome screencast...');
      await currentSession.send('Animation.setPlaybackRate', {
        playbackRate: 1,
      });
      await currentSession.send('Page.startScreencast', {
        everyNthFrame: 1,
        format: this.options.format || 'jpeg',
        quality: quality,
        maxWidth: 1920,
        maxHeight: 1080,
      });
      
      // Enable page domain for better frame capture control
      await currentSession.send('Page.enable');
      
      // Force continuous frame capture by enabling runtime and setting up timer
      await currentSession.send('Runtime.enable');
      
      // Set up continuous frame capture timer
      this.setupContinuousCapture(currentSession);
      console.log('✅ PATCHED LIBRARY: Chrome screencast started successfully');
    } catch (e) {
      console.error('❌ PATCHED LIBRARY: Chrome screencast failed:', e.message);
      if (shouldDeleteSessionOnFailure) {
        this.endSession();
      }
    }
  }

  private setupContinuousCapture(session: CDPSession) {
    // Clear any existing timer
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
    }
    
    // Set up continuous frame capture - force frames even on static pages
    this.captureTimer = setInterval(async () => {
      try {
        // Force Chrome to capture a frame by making a very subtle visual change
        await session.send('Runtime.evaluate', {
          expression: `
            (function() {
              // Create a 1px invisible element that forces repaint
              const tick = Date.now();
              const elem = document.createElement('div');
              elem.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;opacity:0.001;z-index:-999999;pointer-events:none;';
              elem.setAttribute('data-tick', tick.toString());
              document.body.appendChild(elem);
              
              // Force layout calculation
              elem.offsetHeight;
              
              // Remove immediately after forcing repaint
              setTimeout(() => {
                if (elem.parentNode) {
                  elem.parentNode.removeChild(elem);
                }
              }, 1);
              
              // Also change a data attribute as backup
              document.documentElement.setAttribute('data-frame-tick', tick.toString());
            })();
          `,
          silent: true
        });
      } catch (e) {
        // Fallback: try simpler approach
        try {
          await session.send('Runtime.evaluate', {
            expression: `document.documentElement.setAttribute('data-tick', Date.now().toString());`,
            silent: true
          });
        } catch (e2) {
          // Ignore all errors - continue trying
        }
      }
    }, 66); // ~15 FPS (1000ms / 15 = 66ms)
  }

  private async stopScreenCast() {
    const currentSession = this.getCurrentSession();
    if (!currentSession) {
      return;
    }
    
    // Clear capture timer
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = undefined;
    }
    
    await currentSession.send('Page.stopScreencast');
  }

  private async startSession(page: Page): Promise<void> {
    const pageSession = await this.getPageSession(page);
    if (!pageSession) {
      return;
    }
    await this.stopScreenCast();
    this.sessionsStack.push(pageSession);
    this.handleScreenCastFrame(pageSession);
    await this.startScreenCast(true);
  }

  private async handleScreenCastFrame(session) {
    console.log('🎯 PATCHED LIBRARY: Setting up frame handler...');
    this.isFrameAckReceived = new Promise((resolve) => {
      session.on(
        'Page.screencastFrame',
        async ({ metadata, data, sessionId }) => {
          // Reduced logging - show every ~300 frames (20 seconds at 15 FPS) to sync with FFMPEG logs
          if (!this.frameCount) this.frameCount = 0;
          this.frameCount++;
          
          // Only show at exact 300-frame intervals (300, 600, 900, etc.) to match FFMPEG logs
          if (this.frameCount % 300 === 0 && this.frameCount > 0) {
            console.log(`📸 PATCHED LIBRARY: Frame ${this.frameCount} (${Math.round(data.length/1024)}KB)`);
          }
          
          if (!metadata.timestamp || this.isStreamingEnded) {
            return resolve();
          }

          const ackPromise = session.send('Page.screencastFrameAck', {
            sessionId: sessionId,
          });

          this.emit('pageScreenFrame', {
            blob: Buffer.from(data, 'base64'),
            timestamp: metadata.timestamp,
          });

          try {
            await ackPromise;
          } catch (error) {
            console.error(
              'Error in sending Acknowledgment for PageScreenCast',
              error.message,
            );
          }
        },
      );
    });
  }

  private async endSession(): Promise<void> {
    // Clear capture timer when ending session
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = undefined;
    }
    
    this.sessionsStack.pop();
    await this.startScreenCast();
  }

  public async start(): Promise<void> {
    await this.startSession(this.page);
    this.page.once('close', async () => await this.endSession());

    if (this.shouldFollowPopupWindow) {
      this.addListenerOnTabOpens(this.page);
    }
  }

  public async stop(): Promise<boolean> {
    if (this.isStreamingEnded) {
      return this.isStreamingEnded;
    }

    if (this.shouldFollowPopupWindow) {
      this.removeListenerOnTabClose(this.page);
    }

    await Promise.race([
      this.isFrameAckReceived,
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]);

    this.isStreamingEnded = true;

    try {
      for (const currentSession of this.sessionsStack) {
        await currentSession.detach();
      }
    } catch (e) {
      console.warn('Error detaching session', e.message);
    }

    return true;
  }
}
