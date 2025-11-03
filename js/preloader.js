// ==========================================
// PRELOADER SCRIPT - ISOLATED
// Handles: SessionStorage, Video Preloading, Transition
// Does NOT interfere with main.js or hamburger menu
// ==========================================

(function() {
    'use strict';
    
    // Check if preloader has been seen in this session
    const preloaderSeen = sessionStorage.getItem('nairoreelPreloaderSeen');
    const preloaderOverlay = document.getElementById('preloader-overlay');
    const preloaderSwitch = document.getElementById('preloader-switch');
    
    // If already seen, hide immediately and unlock body
    if (preloaderSeen === 'true') {
        // Don't add preloader-active class, just ensure it's hidden
        preloaderOverlay.style.display = 'none';
        return; // Exit early, don't run any other preloader code
    }
    
    // First time visitor - show preloader and lock body scroll
    document.body.classList.add('preloader-active');
    
    // Start preloading hero video immediately
    preloadHeroVideo();
    
    // Track if video is ready
    let videoReady = false;
    
    // Minimum display time for preloader (so it doesn't flash too quickly)
    let minimumTimeElapsed = false;
    setTimeout(() => {
        minimumTimeElapsed = true;
    }, 2000); // Show preloader for at least 2 seconds
    
    // Function to preload hero video
    function preloadHeroVideo() {
        const heroVideo = document.querySelector('.hero-video-bg video');
        
        if (!heroVideo) {
            // If video doesn't exist, mark as ready immediately
            videoReady = true;
            return;
        }
        
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        // Check if video can play through without buffering
        const checkVideoReady = () => {
            if (heroVideo.readyState >= 3) { // HAVE_FUTURE_DATA or HAVE_ENOUGH_DATA
                videoReady = true;
            }
        };
        
        // Listen for video load events
        heroVideo.addEventListener('canplaythrough', () => {
            videoReady = true;
        });
        
        heroVideo.addEventListener('loadeddata', checkVideoReady);
        
        // Check immediately in case it's already loaded
        checkVideoReady();
        
        // IMPORTANT: Only force load on desktop, not mobile
        // Mobile devices have stricter autoplay policies
        if (!isMobile) {
            // Force video to start loading only on desktop
            heroVideo.load();
        } else {
            // On mobile, just mark as ready after a short delay
            // This allows the video to load naturally without interference
            setTimeout(() => {
                videoReady = true;
            }, 500);
        }
    }
    
    // Handle switch click
    preloaderSwitch.addEventListener('change', function() {
        if (this.checked) {
            // Wait for switch animation to complete
            setTimeout(() => {
                // Check if we're ready to transition
                if (videoReady && minimumTimeElapsed) {
                    transitionToHomepage();
                } else {
                    // Wait for video and minimum time
                    const checkReadyInterval = setInterval(() => {
                        if (videoReady && minimumTimeElapsed) {
                            clearInterval(checkReadyInterval);
                            transitionToHomepage();
                        }
                    }, 100);
                }
            }, 600); // Let switch animation play (0.6s)
        }
    });
    
    // Transition function
    function transitionToHomepage() {
        // Mark preloader as seen for this session
        sessionStorage.setItem('nairoreelPreloaderSeen', 'true');
        
        // Fade out preloader
        preloaderOverlay.classList.add('preloader-hidden');
        
        // Unlock body scroll after transition
        setTimeout(() => {
            document.body.classList.remove('preloader-active');
        }, 1000); // Match CSS transition duration
        
        // Remove preloader from DOM after full transition
        setTimeout(() => {
            preloaderOverlay.style.display = 'none';
        }, 2000); // Extra buffer time
    }
    
})();