// Dynamic scoreboard that reads actual match data from current page
// Copy this code and paste it into your browser console (F12)

console.log('⚽ Adding PERSISTENT dynamic match scoreboard...');

// Remove existing scoreboard if present
const existingScoreboard = document.getElementById('dynamic-scoreboard-overlay');
if (existingScoreboard) {
    existingScoreboard.remove();
    console.log('🗑️ Removed existing dynamic scoreboard');
}

// Make scoreboard position ABSOLUTELY FIXED and persistent
const FIXED_POSITION = {
    top: '450px',
    left: '20px',
    width: '700px'
};

// Function to extract match data from current page
function extractMatchData() {
    let matchData = {
        homeTeam: 'Home Team',
        awayTeam: 'Away Team',
        homeScore: '0',
        awayScore: '0',
        matchTime: '0\'',
        homeLogo: '',
        awayLogo: ''
    };

    try {
        // Find the main match container with exact selector from your HTML
        const matchContainer = document.querySelector('.flex.w-bar-100.homeBox');
        
        if (matchContainer) {
            // Extract home team name (inside .home-box)
            const homeTeamElement = matchContainer.querySelector('.home-box .teamName a[itemprop="homeTeam"]');
            if (homeTeamElement) {
                matchData.homeTeam = homeTeamElement.textContent.trim();
            }

            // Extract away team name (inside .away-box)
            const awayTeamElement = matchContainer.querySelector('.away-box .teamName a[itemprop="awayTeam"]');
            if (awayTeamElement) {
                matchData.awayTeam = awayTeamElement.textContent.trim();
            }

            // Extract home score (inside .h-top-center.matchStatus2)
            const homeScoreElement = matchContainer.querySelector('.h-top-center.matchStatus2 .font-bold.home-score span');
            if (homeScoreElement) {
                matchData.homeScore = homeScoreElement.textContent.trim();
            }

            // Extract away score (inside .h-top-center.matchStatus2)
            const awayScoreElement = matchContainer.querySelector('.h-top-center.matchStatus2 .font-bold.away-score span');
            if (awayScoreElement) {
                matchData.awayScore = awayScoreElement.textContent.trim();
            }

            // Extract match time (inside .scoreBox .color-red)
            const timeElement = matchContainer.querySelector('.scoreBox .color-red span:first-child');
            if (timeElement) {
                matchData.matchTime = timeElement.textContent.trim();
                // Add the apostrophe if it exists
                const apostrophe = matchContainer.querySelector('.scoreBox .color-red .Twinkle');
                if (apostrophe) {
                    matchData.matchTime += apostrophe.textContent.trim();
                }
            }

            // Extract home team logo (inside .home-box .team-logo)
            const homeLogoElement = matchContainer.querySelector('.home-box .team-logo img[itemprop="logo"]');
            if (homeLogoElement) {
                matchData.homeLogo = homeLogoElement.src;
            }

            // Extract away team logo (inside .away-box .team-logo)
            const awayLogoElement = matchContainer.querySelector('.away-box .team-logo img[itemprop="logo"]');
            if (awayLogoElement) {
                matchData.awayLogo = awayLogoElement.src;
            }
        }

        console.log('📊 Extracted match data:', matchData);
        return matchData;

    } catch (error) {
        console.log('⚠️ Could not extract match data, using defaults');
        console.log('Error:', error);
        return matchData;
    }
}

// Get current match data
const currentMatch = extractMatchData();

// Create dynamic scoreboard overlay
const overlay = document.createElement('div');
overlay.id = 'dynamic-scoreboard-overlay';
overlay.innerHTML = `
    <div id="dynamic-match-scoreboard" style="
        position: fixed !important; 
        top: ${FIXED_POSITION.top} !important; 
        left: ${FIXED_POSITION.left} !important;
        width: ${FIXED_POSITION.width} !important;
        background: rgba(255, 255, 255, 0.95) !important;
        border: 2px solid #ddd !important;
        border-radius: 10px !important;
        padding: 20px !important;
        z-index: 999999 !important;
        font-family: Arial, sans-serif !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        transform: none !important;
        margin: 0 !important;
        will-change: auto !important;
        zoom: 1 !important;
        scale: 1 !important;
    ">
        <div class="dynamic-match-container" style="display: flex !important; align-items: center !important; justify-content: space-between !important;">
            <!-- Home Team -->
            <div class="dynamic-home-box" style="display: flex !important; align-items: center !important; flex: 1 !important;">
                <div class="dynamic-team-name" style="font-weight: 500 !important; margin-right: 10px !important; font-size: 16px !important; color: #333 !important;">
                    ${currentMatch.homeTeam}
                </div> 
                ${currentMatch.homeLogo ? `<img src="${currentMatch.homeLogo}" alt="${currentMatch.homeTeam}" style="width: 40px !important; height: 40px !important; border-radius: 50% !important; margin-right: 10px !important;">` : ''}
            </div>
            
            <!-- Score Section -->
            <div class="dynamic-score-center" style="display: flex !important; align-items: center !important; justify-content: center !important; flex: 1 !important;">
                <div class="dynamic-home-score" style="font-weight: bold !important; font-size: 32px !important; color: #333 !important; margin-right: 20px !important;">
                    ${currentMatch.homeScore}
                </div> 
                <div class="dynamic-time-box" style="text-align: center !important; margin: 0 20px !important;">
                    <div style="margin-bottom: 4px !important;">
                        <span style="color: #ff0000 !important; font-weight: bold !important; font-size: 14px !important;">
                            ${currentMatch.matchTime}
                        </span>
                    </div>
                </div> 
                <div class="dynamic-away-score" style="font-weight: bold !important; font-size: 32px !important; color: #333 !important; margin-left: 20px !important;">
                    ${currentMatch.awayScore}
                </div>
            </div>
            
            <!-- Away Team -->
            <div class="dynamic-away-box" style="display: flex !important; align-items: center !important; flex: 1 !important; justify-content: flex-end !important;">
                ${currentMatch.awayLogo ? `<img src="${currentMatch.awayLogo}" alt="${currentMatch.awayTeam}" style="width: 40px !important; height: 40px !important; border-radius: 50% !important; margin-left: 10px !important;">` : ''}
                <div class="dynamic-team-name" style="font-weight: 500 !important; margin-left: 10px !important; font-size: 16px !important; color: #333 !important;">
                    ${currentMatch.awayTeam}
                </div>
            </div>
        </div>
    </div>
`;
document.body.appendChild(overlay);

// Make the scoreboard position ABSOLUTELY LOCKED
const scoreboardElement = document.getElementById('dynamic-match-scoreboard');
if (scoreboardElement) {
    // Lock the position with multiple CSS properties
    scoreboardElement.style.setProperty('position', 'fixed', 'important');
    scoreboardElement.style.setProperty('top', FIXED_POSITION.top, 'important');
    scoreboardElement.style.setProperty('left', FIXED_POSITION.left, 'important');
    scoreboardElement.style.setProperty('width', FIXED_POSITION.width, 'important');
    scoreboardElement.style.setProperty('transform', 'none', 'important');
    scoreboardElement.style.setProperty('margin', '0', 'important');
    scoreboardElement.style.setProperty('z-index', '999999', 'important');
    scoreboardElement.style.setProperty('zoom', '1', 'important');
    scoreboardElement.style.setProperty('scale', '1', 'important');
    
    // Prevent any CSS animations or transitions that might move it
    scoreboardElement.style.setProperty('transition', 'none', 'important');
    scoreboardElement.style.setProperty('animation', 'none', 'important');
    
    console.log('🔒 Scoreboard position LOCKED at:', FIXED_POSITION);
}

// Monitor and maintain position every 2 seconds
setInterval(() => {
    const scoreboard = document.getElementById('dynamic-match-scoreboard');
    if (scoreboard) {
        // Force position if it has changed
        const currentTop = scoreboard.style.top;
        const currentLeft = scoreboard.style.left;
        
        if (currentTop !== FIXED_POSITION.top || currentLeft !== FIXED_POSITION.left) {
            console.log('⚠️ Scoreboard position changed! Restoring...');
            scoreboard.style.setProperty('top', FIXED_POSITION.top, 'important');
            scoreboard.style.setProperty('left', FIXED_POSITION.left, 'important');
            console.log('✅ Position restored to:', FIXED_POSITION);
        }
    }
}, 2000);

console.log('✅ PERSISTENT dynamic match scoreboard added successfully!');
console.log('⚽ Showing: ' + currentMatch.homeTeam + ' ' + currentMatch.homeScore + ' - ' + currentMatch.awayScore + ' ' + currentMatch.awayTeam);
console.log('🔒 Position LOCKED at: top=' + FIXED_POSITION.top + ', left=' + FIXED_POSITION.left);
console.log('🔄 To remove: document.getElementById("dynamic-scoreboard-overlay").remove()');
console.log('🛡️ Position monitoring active - scoreboard will stay in place!');
