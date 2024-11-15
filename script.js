document.addEventListener('DOMContentLoaded', function () {
    const animationButtons = document.querySelectorAll('#buttons button');
    const backgroundButtons = document.querySelectorAll('#background-buttons button');
    const unicorn = document.querySelector('#unicorn');
    const submitButton = document.getElementById('submit-button');
    const removeButton = document.getElementById('remove-button');
    const unicornContainer = document.getElementById('unicorn-container');
    const body = document.body;
    const animationMapping = {
        "Wave": "wave",
        "Jump": "jump",
        "Wag Tail": "wagTail",
        "Blink": "blink",
        "Nod Head": "nodHead",
        "Wiggle Ears": "wiggleEars",
        "Shake Mane": "shakeMane",
        "Shoot Horn": "shootHorn",
        "Rainbow Body": "rainbowBody",
        "Spin": "spin",
        "Twirl": "twirl"
    };

    const audioPlayer = document.getElementById('audio-player');
    const waveContainer = document.getElementById('wave-animation-container');

    // SVG Wave Animation as Full-Width Background
    const waveSVG = `
        <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
            <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
          </g>
        </svg>
    `;
    // addWaveAnimation();
    // Function to add SVG wave animation as a background
    function addWaveAnimation() {
        waveContainer.innerHTML = waveSVG;
        waveContainer.classList.remove('hidden');
    }

    // Function to remove SVG wave animation
    function removeWaveAnimation() {
        waveContainer.innerHTML = ''; // Clear SVG
        waveContainer.classList.add('hidden');
    }

    // Add event listeners for audio playback
    audioPlayer.addEventListener('play', () => {
        addWaveAnimation();
    });

    audioPlayer.addEventListener('pause', () => {
        removeWaveAnimation();
    });

    audioPlayer.addEventListener('ended', () => {
        removeWaveAnimation();
    });



    let speechBubble = null;

    // Start the bounce animation
    unicorn.classList.add('bounce-animation');

    // Event listeners for animation buttons
    animationButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const animation = button.getAttribute('data-animation');

            // Remove bounce animation
            unicorn.classList.remove('bounce-animation');

            // Call the selected animation function
            animations[animation]().then(function () {
                // After the animation ends, add bounce animation back
                unicorn.classList.add('bounce-animation');
            });
        });
    });

    // Event listeners for background buttons
    backgroundButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const bg = button.getAttribute('data-bg');

            // Remove any existing background classes
            body.classList.remove('bg-moving-stripes', 'bg-flashy', 'bg-waves', 'bg-sparkles', 'bg-grass');

            // Add the selected background class
            switch (bg) {
                case 'moving-stripes':
                    body.classList.add('bg-moving-stripes');
                    break;
                case 'flashy':
                    body.classList.add('bg-flashy');
                    break;
                case 'waves':
                    body.classList.add('bg-waves');
                    break;
                case 'sparkles':
                    body.classList.add('bg-sparkles');
                    break;
                case 'grass':
                    body.classList.add('bg-grass');
                    break;
                default:
                    // Default background
                    body.style.background = '#f0f8ff';
            }
        });
    });

    // Submit Speech Button
    submitButton.addEventListener('click', function () {
        submitSpeech();
    });

    // Remove Speech Button
    removeButton.addEventListener('click', function () {
        deleteSpeech();
    });


    // Toaster helper functions
    function showToaster(message) {
        const toaster = document.getElementById('toaster');
        toaster.textContent = message;
        toaster.classList.remove('hidden');
        toaster.classList.add('visible');
    }

    function hideToaster() {
        const toaster = document.getElementById('toaster');
        toaster.classList.remove('visible');
        toaster.classList.add('hidden');
    }

    function submitSpeech() {
        const inputText = document.getElementById('speech-input').value;
        if (!inputText.trim()) return;

        // Show loading toaster
        showToaster("Pippin thinking...");

        // Make API call with POST request
        fetch('http://104.198.103.82:5000/landing/get-gpt-response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: inputText })
        })
            .then(response => response.json())
            .then(data => {
                hideToaster();

                const audioUrl = data.audio_url;
                const animationTitle = data.animation; // Optional: Use this for additional effects

                if (audioUrl) {
                    const audioPlayer = document.getElementById('audio-player');
                    const audioContainer = document.getElementById('audio-player-container');

                    // Set the audio source and show the player
                    audioPlayer.src = audioUrl;
                    audioContainer.classList.remove('hidden');

                    // Play the audio automatically on first load
                    audioPlayer.play();

                    // Add animation for the audio player when playing
                    audioPlayer.addEventListener('play', () => {
                        audioContainer.classList.add('playing');
                        audioContainer.classList.remove('paused');
                    });

                    // Remove animation when audio is paused
                    audioPlayer.addEventListener('pause', () => {
                        audioContainer.classList.remove('playing');
                        audioContainer.classList.add('paused');
                    });

                    // Remove animation when audio ends
                    audioPlayer.addEventListener('ended', () => {
                        audioContainer.classList.remove('playing');
                        audioContainer.classList.add('paused');
                    });


                    // Trigger the relevant animation
                    const animationName = animationMapping[animationTitle];
                    if (animationName && animations[animationName]) {
                        animations[animationName]();
                    }

                  
                }

                // Clear input field after submission
                document.getElementById('speech-input').value = '';
            })
            .catch(error => {
                console.error('Error:', error);
                showToaster("Error loading audio.");
                setTimeout(hideToaster, 3000); // Hide toaster after 3 seconds if error
            });
    }

    // Function to type text with synchronized typing speed
    function typeText(text, element, typingSpeed = 50) {
        let index = 0;

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, typingSpeed);
            }
        }

        // Start typing
        type();
    }



    // Function to remove speech bubble
    function deleteSpeech() {
        if (speechBubble) {
            speechBubble.remove();
            speechBubble = null;

            // Hide the Remove button
            removeButton.classList.add('hidden');

            // Clear input field
            document.getElementById('speech-input').value = '';
        }
    }

    const animations = {
        wave: function () {
            return new Promise(function (resolve) {
                const frontLegHoof = document.querySelector('#front-leg-hoof');

                frontLegHoof.classList.add('wave-animation');

                frontLegHoof.addEventListener('animationend', function handler() {
                    frontLegHoof.classList.remove('wave-animation');
                    frontLegHoof.style.transform = 'none';
                    frontLegHoof.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        jump: function () {
            return new Promise(function (resolve) {
                unicorn.classList.add('jump-animation');

                unicorn.addEventListener('animationend', function handler() {
                    unicorn.classList.remove('jump-animation');
                    unicorn.style.transform = 'none';
                    unicorn.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        wagTail: function () {
            return new Promise(function (resolve) {
                const tail = document.querySelector('#tail');

                tail.classList.add('wag-tail-animation');

                tail.addEventListener('animationend', function handler() {
                    tail.classList.remove('wag-tail-animation');
                    tail.style.transform = 'none';
                    tail.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        blink: function () {
            return new Promise(function (resolve) {
                const eyes = document.querySelector('#eyes');

                eyes.classList.add('blink-animation');

                eyes.addEventListener('animationend', function handler() {
                    eyes.classList.remove('blink-animation');
                    eyes.style.opacity = '1';
                    eyes.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        nodHead: function () {
            return new Promise(function (resolve) {
                const headNeckGroup = document.querySelector('#head-neck-group');

                headNeckGroup.classList.add('nod-head-animation');

                headNeckGroup.addEventListener('animationend', function handler() {
                    headNeckGroup.classList.remove('nod-head-animation');
                    headNeckGroup.style.transform = 'none';
                    headNeckGroup.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        wiggleEars: function () {
            return new Promise(function (resolve) {
                const ears = document.querySelector('#ears');

                ears.classList.add('wiggle-ears-animation');

                ears.addEventListener('animationend', function handler() {
                    ears.classList.remove('wiggle-ears-animation');
                    ears.style.transform = 'none';
                    ears.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        shakeMane: function () {
            return new Promise(function (resolve) {
                const mane = document.querySelector('#mane');

                mane.classList.add('shake-mane-animation');

                mane.addEventListener('animationend', function handler() {
                    mane.classList.remove('shake-mane-animation');
                    mane.style.transform = 'none';
                    mane.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        shootHorn: function () {
            return new Promise(function (resolve) {
                const horn = document.querySelector('#horn');

                horn.classList.add('shoot-horn-animation');

                horn.addEventListener('animationend', function handler() {
                    horn.classList.remove('shoot-horn-animation');
                    horn.style.transform = 'none';
                    horn.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        rainbowBody: function () {
            return new Promise(function (resolve) {
                const bodyShape = document.querySelector('#body-shape');

                bodyShape.classList.add('rainbow-body-animation');

                bodyShape.addEventListener('animationend', function handler() {
                    bodyShape.classList.remove('rainbow-body-animation');
                    bodyShape.style.fill = '#fff';
                    bodyShape.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        spin: function () {
            return new Promise(function (resolve) {
                unicorn.classList.add('spin-animation');

                unicorn.addEventListener('animationend', function handler() {
                    unicorn.classList.remove('spin-animation');
                    unicorn.style.transform = 'none';
                    unicorn.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        },
        twirl: function () {
            return new Promise(function (resolve) {
                unicorn.classList.add('twirl-animation');

                unicorn.addEventListener('animationend', function handler() {
                    unicorn.classList.remove('twirl-animation');
                    unicorn.style.transform = 'none';
                    unicorn.removeEventListener('animationend', handler);
                    resolve();
                });
            });
        }
    };
});
