const defaultConfig = {
    mute: false,
    skip: true,
    volume: 50,
    brightness: 80,
    adsHistorySize: 5,
};

const state = { mute: false, isAds: false, volume: null, brightness: null };

const normalState = { mute: false, volume: null, brightness: null };

const adsConfig = {};
Object.assign(adsConfig, defaultConfig);

const adsHistory = [];

// Get the state
function getState() {
    const state = {
        isAds: false,
        mute: null,
        volume: null,
        isSkipableButton: false,
        isUnskipableButton: false,
    };

    // Get the mute state
    const mute = document.querySelector('.ytp-mute-button.ytp-button');
    if (mute) {
        const muteTitle = mute.attributes['data-title-no-tooltip'].value;
        if (muteTitle === 'Mute') {
            // If it was in unmuted state, mute it.
            state.mute = false;
        } else if (muteTitle === 'Unmute') {
            // If muted, leave as is
            state.mute = true;
        } else {
            // If it is neither of the two cases, do nothing
        }
    } else {
        // If the mute button is not found, do nothing
    }

    // Get the volume
    // TODO This part is not working well, but it seems that the video is being recreated and the result is successful, so let's leave it for now.
    const vol = document.querySelector(`.ytp-volume-panel`);
    if (vol && vol.attributes[`aria-valuenow`]) {
        state.volume = vol.attributes[`aria-valuenow`].value;
    } else {
        // If the volume button is not found, do nothing
    }

    // Skip button waiting version
    const btn = document.querySelector('.ytp-ad-skip-button-container,[id="ad-text:m"]');
    state.isSkipableButton = btn && btn.style.display !== 'none';
    // Forced wait version
    const waitText = document.querySelector('.ytp-ad-preview-container>.ytp-ad-text,.ytp-ad-preview-container.countdown-next-to-thumbnail');
    state.isUnskipableButton = waitText && waitText.style.display !== 'none';

    // Determine whether advertising is being displayed
    state.isAds = state.isSkipableButton || state.isUnskipableButton;

    return state;
}

function setState(currState, newState) {
    // Set the mute state
    if (currState.mute !== newState.mute) {
        // Process only if the mute state is different from the specified one
        // console.log(`${new Date().toLocaleString()} setMute=${newState.mute}, curr=${currState.mute}`,);
        const mute = document.querySelector('.ytp-mute-button.ytp-button');
        if (mute) {
            // Toggle mute state
            // mute.click();
        } else {
            // If the mute button is not found, do nothing
        }
    } else {
        // If the mute state does not change, do nothing
    }
    // Set the volume
    const videoElem = document.querySelector('.video-stream.html5-main-video');
    // console.log(`new volume=${newState.volume}, curr=${currState.volume}`);
    if (videoElem) {
        if (newState.volume === null) {
        } else {
            if (currState.volume < newState.volume) {
            } else {
                videoElem.volume = Number(newState.volume) / 100;
            }
        }
        if (newState.brightness === null) {
            videoElem.style.removeProperty('filter')
        } else {
            videoElem.style.filter = `brightness(${newState.brightness}%)`;
        }
    } else {
        //
    }
}

// Polling the skip ad button
function pollSkip() {
    const currState = getState();
    if (!state.isSkipableButton && currState.isSkipableButton) {
        // Skip button is displayed
        if (adsConfig.skip) {
            // Press the skip button
            const btn = document.querySelector('.ytp-ad-skip-button-container,[id="ad-text:m"]');
            btn.click();
            // At the end of the advertisement
            // Restore the state
            setState(currState, normalState);
        } else {
        }
        // adsHistory.push({
    }
    // Status change exists
    if (state.isAds !== currState.isAds) {
        // Status change exists
        if (currState.isAds) {
            // At the start of displaying an advertisement
            // Get the initial state when the advertisement starts
            normalState.volume = currState.volume;
            normalState.mute = currState.mute;

            // Set the volume
            setState(currState, {
                mute: Number(adsConfig.volume) === 0 || adsConfig.mute,
                volume: adsConfig.volume,
                brightness: adsConfig.brightness,
            });

            // Update advertising history
            while (adsHistory.length >= adsConfig.adsHistorySize) {
                adsHistory.shift(); // If the queue has reached its maximum size, remove the first element.
            }
            // Function to trigger right-click event
            function triggerRightClick(element) {
                // Generate a MouseEvent
                const event = new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 2,
                    buttons: 2,
                    clientX: element.getBoundingClientRect().left,
                    clientY: element.getBoundingClientRect().top
                });
                // Dispatch an event to the specified element
                element.dispatchEvent(event);
            }
            // Example: Trigger a right-click event on the element with the id "myElement"
            const elem = document.querySelector(".video-ads.ytp-ad-module");
            triggerRightClick(elem);

            // Wait for the click event response
            setTimeout(() => {
                try {
                    // Open right-click menu
                    document.querySelectorAll('.ytp-panel-menu .ytp-menuitem')[1].click();
                    setTimeout(() => {
                        const contextmenu = document.querySelector('.ytp-popup.ytp-contextmenu');
                        const splitted = contextmenu.innerText.split('\n');
                        // console.log(contextmenu.innerText);
                        if (splitted[splitted.length - 1].startsWith('https://')) {
                            // If the link is successfully obtained, add a new element
                            adsHistory.push({
                                date: new Date().toLocaleString(),
                                href: splitted[splitted.length - 1],
                                title: document.querySelector('.ytp-title-link')?.innerText
                            });
                        } else {
                            // If the link cannot be connected properly, add the video ID.
                            // adsHistory.push({
                            //     date: new Date().toLocaleString(),
                            // adVideoId: Get the href attribute of the element with class 'ytp-title-link', split it by 'watch?v=' and return the second element.
                            // Get the inner text of the element with class 'ytp-title-link' if it exists.
                            // });
                        }
                        try {
                            chrome.storage.sync.set({ config: adsConfig, data: { adsHistory } }, function () {
                                // console.log('Value is set to ' + JSON.stringify(result.data));
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    }, 0);
                } catch (e) {
                    console.log(e);
                }
            }, 0);
        } else {
            // At the end of the advertisement
            // Restore the state
            setState(currState, normalState);
        }
    } else {
        // No change in status
    }

    // Update the state
    Object.assign(state, currState);

    // const interval = 100;
    // setTimeout(pollSkip, interval);
}
// pollSkip();

// Setting up the observer
const observerConfig = {
    attributes: true,        // Monitor changes to properties
    childList: true,         // Monitor changes to child nodes
    characterData: true,     // Monitor changes in text content
    subtree: true            // Also monitor descendant nodes
};

// Define a callback function
const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // console.log('A child node has been added or removed.');
            pollSkip();
        } else if (mutation.type === 'attributes') {
            // console.log(`Attribute: ${mutation.attributeName} has been changed.`);
        }
        // console.log(mutation);
    }
};

// Function to check if the target node exists
const checkForNode = function () {
    const targetNode = document.querySelector('.video-ads.ytp-ad-module');
    if (targetNode && chrome.storage && chrome.storage.sync) {

        // Apply settings in real-time
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace === 'sync') {
                for (let key in changes) {
                    const change = changes[key];
                    // console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
                    // console.log(`Old value was "${JSON.stringify(change.oldValue)}", new value is "${JSON.stringify(change.newValue)}".`);

                    if (key === 'config') { // Update settings
                        Object.assign(adsConfig, changes.config.newValue);
                        if (state.isAds) {
                            setState(state, adsConfig);
                            const currState = getState();
                            Object.assign(state, currState);
                        }
                    } else if (key === 'data') { // Update advertising history
                        // Update the contents of adsHistory
                        adsHistory.length = 0;
                        adsHistory.push(...changes.data.newValue.adsHistory);
                    } else {
                        // ;
                    }
                }
            } else { }
        });

        // console.log('Target node found.');

        const start = () => {
            // Instantiate MutationObserver and pass a callback
            const observer = new MutationObserver(callback);

            pollSkip();

            // Start the observer and apply the settings
            observer.observe(targetNode, observerConfig);
        }

        // Read the settings
        chrome.storage.sync.get(['config', 'data'], function (result) {
            // Read the saved information. If it doesn't exist, set default values.
            const reset = {
                config: {},
                data: {},
            };

            if (result) {
                if (result.config) {
                    const key = ['mute', 'skip', 'volume', 'brightness', 'adsHistorySize',];
                    for (let i = 0; i < key.length; i++) {
                        const k = key[i];
                        if (result.config[k] === undefined) {
                            reset.config[k] = defaultConfig[k];
                        } else {
                            reset.config[k] = result.config[k];
                        }
                    }
                    reset.config.volume = Number(reset.config.volume);
                    reset.config.brightness = Number(reset.config.brightness);
                    reset.config.adsHistorySize = Number(reset.config.adsHistorySize);
                } else {
                    reset.config = defaultConfig;
                }
                if (result.data) {
                    reset.data = result.data;
                } else {
                    reset.data = { adsHistory: [], };
                }
                chrome.storage.sync.set(reset, function () {
                    // console.log('Value is set to ' + JSON.stringify(reset));
                    start();
                });
            } else {
                chrome.storage.sync.set({ config: defaultConfig }, function () {
                    // console.log('Value is set to ' + JSON.stringify(reset));
                    start();
                });
            }
        });
    } else {
        // console.log('Target node not found.');
        setTimeout(checkForNode, 1);
    }
};
checkForNode();

// document.addEventListener('DOMContentLoaded', function () {
//     checkForNode();
// });
// document.querySelector('.ytp-chrome-bottom').classList.add('ytp-volume-slider-active')

// console.log(chrome.runtime.id);
