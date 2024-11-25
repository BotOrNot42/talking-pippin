document.addEventListener('DOMContentLoaded', function () {
    const animationButtons = document.querySelectorAll('#buttons button');
    const backgroundButtons = document.querySelectorAll('#background-buttons button');
    const unicorn = document.querySelector('#unicorn');
    const submitButton = document.getElementById('submit-button');
    const removeButton = document.getElementById('remove-button');
    const unicornContainer = document.getElementById('speech-bubble-container');
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
        console.log("ddd")
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
        showToaster("Pippin is crafting a response to your question..");

        // Hide Replay button when submitting a new question
        const replayButton = document.getElementById('replay-button');
        replayButton.classList.add('hidden');

        // Make API call with POST request
        fetch('https://api.fomofm.show/landing/pippin-response', {
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
                const animationTitle = data.animation;
                const pippinResponse = data.pippin_response


                // Create or update speech bubble
                if (!speechBubble) {
                    speechBubble = document.createElement('div');
                    speechBubble.classList.add('speech-bubble');
                    unicornContainer.appendChild(speechBubble);
                    removeButton.classList.remove('hidden');
                }

                // Clear previous content and add bubble-text element
                speechBubble.innerHTML = '<span class="bubble-text"></span>';
                const bubbleTextElement = speechBubble.querySelector('.bubble-text');

                if (audioUrl) {
                    const audio = new Audio(audioUrl);


                    audio.onloadedmetadata = () => {
                        const audioDuration = audio.duration * 1000; // Convert to milliseconds
                        const typingSpeed = Math.max(audioDuration / pippinResponse.length, 20); // Min speed of 20ms

                        // Start typing immediately
                        typeText(pippinResponse, bubbleTextElement, typingSpeed);

                        // Delay audio by a fraction of a second to sync with typing
                        setTimeout(() => {
                            // Add wave animation when audio starts
                            audio.addEventListener('play', addWaveAnimation);

                            // Remove wave animation when audio ends
                            audio.addEventListener('ended', removeWaveAnimation);

                            // Play the audio automatically
                            audio.play();

                            // Show Replay button when audio starts playing
                            replayButton.classList.remove('hidden');

                            // Handle Replay button click
                            replayButton.onclick = () => {
                                audio.currentTime = 0; // Reset audio to the beginning
                                audio.play();
                            };

                            // Trigger the relevant animation
                            const animationName = animationMapping[animationTitle];
                            if (animationName && animations[animationName]) {
                                animations[animationName]();
                            }
                        }, 200); // 200ms delay for better synchronization
                    };


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
    let currentInterval = null; // Global tracker for the currently running animation loop

    const animations = {
        wave: function () {
            return new Promise(function (resolve) {
                const frontLegHoof = document.querySelector('#front-leg-hoof');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    frontLegHoof.classList.add('wave-animation');
                    frontLegHoof.addEventListener('animationend', function handler() {
                        frontLegHoof.classList.remove('wave-animation');
                        frontLegHoof.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        jump: function () {
            return new Promise(function (resolve) {
                const unicorn = document.getElementById('unicorn');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    unicorn.classList.add('jump-animation');
                    unicorn.addEventListener('animationend', function handler() {
                        unicorn.classList.remove('jump-animation');
                        unicorn.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing to match the animation duration
            });
        },
        wagTail: function () {
            return new Promise(function (resolve) {
                const tail = document.querySelector('#tail');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    tail.classList.add('wag-tail-animation');
                    tail.addEventListener('animationend', function handler() {
                        tail.classList.remove('wag-tail-animation');
                        tail.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        blink: function () {
            return new Promise(function (resolve) {
                const eyes = document.querySelector('#eyes');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    eyes.classList.add('blink-animation');
                    eyes.addEventListener('animationend', function handler() {
                        eyes.classList.remove('blink-animation');
                        eyes.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        nodHead: function () {
            return new Promise(function (resolve) {
                const headNeckGroup = document.querySelector('#head-neck-group');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    headNeckGroup.classList.add('nod-head-animation');
                    headNeckGroup.addEventListener('animationend', function handler() {
                        headNeckGroup.classList.remove('nod-head-animation');
                        headNeckGroup.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        wiggleEars: function () {
            return new Promise(function (resolve) {
                const ears = document.querySelector('#ears');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    ears.classList.add('wiggle-ears-animation');
                    ears.addEventListener('animationend', function handler() {
                        ears.classList.remove('wiggle-ears-animation');
                        ears.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        shakeMane: function () {
            return new Promise(function (resolve) {
                const mane = document.querySelector('#mane');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    mane.classList.add('shake-mane-animation');
                    mane.addEventListener('animationend', function handler() {
                        mane.classList.remove('shake-mane-animation');
                        mane.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        shootHorn: function () {
            return new Promise(function (resolve) {
                const horn = document.querySelector('#horn');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    horn.classList.add('shoot-horn-animation');
                    horn.addEventListener('animationend', function handler() {
                        horn.classList.remove('shoot-horn-animation');
                        horn.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        rainbowBody: function () {
            return new Promise(function (resolve) {
                const bodyShape = document.querySelector('#body-shape');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    bodyShape.classList.add('rainbow-body-animation');
                    bodyShape.addEventListener('animationend', function handler() {
                        bodyShape.classList.remove('rainbow-body-animation');
                        bodyShape.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        spin: function () {
            return new Promise(function (resolve) {
                const unicorn = document.getElementById('unicorn');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    unicorn.classList.add('spin-animation');
                    unicorn.addEventListener('animationend', function handler() {
                        unicorn.classList.remove('spin-animation');
                        unicorn.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        },
        twirl: function () {
            return new Promise(function (resolve) {
                const unicorn = document.getElementById('unicorn');

                // Clear any previous animation loop
                clearAnimationLoop();

                // Start a new animation loop
                currentInterval = setInterval(() => {
                    unicorn.classList.add('twirl-animation');
                    unicorn.addEventListener('animationend', function handler() {
                        unicorn.classList.remove('twirl-animation');
                        unicorn.removeEventListener('animationend', handler);
                    });
                }, 500); // Adjust timing as needed
            });
        }
    };

    // Helper function to clear the current animation loop
    function clearAnimationLoop() {
        if (currentInterval) {
            clearInterval(currentInterval);
            currentInterval = null;
        }
    }

});
