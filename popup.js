console.log('popup');

// Open a new tab and display a dedicated page
function openPluginMainTab() {
    const target = `chrome-extension://${chrome.runtime.id}/index.html`;
    let existsTab = null;
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.query({}, function (tabs) {
        // Check if the current tab is the plugin's controller page
        for (var i = 0; i < tabs.length; i++) {
            console.log(tabs[i].url);
            if (tabs[i].url.includes(chrome.runtime.id)) {
                existsTab = tabs[i];
                break;
            } else {
                // skip
            }
        }
    });
    if (existsTab) {
        // If it already exists, activate that tab
        existsTab.active();
    } else {
        // Open a new one if it doesn't exist
        new Promise((resolve) => {
            chrome.tabs.create({ url: `chrome-extension://${chrome.runtime.id}/controller/index.html` }, resolve);
        }).then((tab) => {
            // Processing when a new tab is successfully opened
        }).catch((error) => {
            // Processing when an error occurs
        });
    }
}

// Uncomment to enable
// openPluginMainTab();

const defaultConfig = {
    mute: false,
    skip: true,
    volume: 50,
    brightness: 80,
    adsHistorySize: 5,
};

// ----------------------------------------------------------------
function setConfig() {
    // console.log('setConfig--------------');
    // document.getElementById('config').innerHTML = `setConfig--------------`;
    // document.getElementById('setConfigButton').innerHTML = `setConfigButton`;
    const config = {
        mute: document.getElementById('mute').checked,
        skip: document.getElementById('skip').checked,
        volume: Number(document.getElementById('volume').value),
        brightness: Number(document.getElementById('brightness').value),
        adsHistorySize: Number(document.getElementById('adsHistorySize').value),
    };
    chrome.storage.sync.set({ config }, function () {
        // document.getElementById('config').innerHTML = `Save: ${JSON.stringify(config)}`;
        console.log('Value is set to ' + JSON.stringify(config));
    });
}
function getConfig() {
    // console.log('getConfig--------------');
    // document.getElementById('config').innerHTML = `getConfig--------------`;
    // document.getElementById('getConfigButton').innerHTML = `getConfigButton`;
    chrome.storage.sync.get(['config', 'data'], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        } else { }
        if (result && result.config) {
            if (result.config.mute === undefined
                || result.config.skip === undefined
                || result.config.volume === undefined
                || result.config.brightness === undefined
                || result.config.adsHistorySize === undefined) {
                alert(`blank config ${JSON.stringify(result.config)}`);
            }
            if (result.config.mute === undefined) { result.config.mute = defaultConfig.mute; } else { }
            if (result.config.skip === undefined) { result.config.skip = defaultConfig.skip; } else { }
            if (result.config.volume === undefined) { result.config.volume = defaultConfig.volume; } else { }
            if (result.config.brightness === undefined) { result.config.brightness = defaultConfig.brightness; } else { }
            if (result.config.adsHistorySize === undefined) { result.config.adsHistorySize = defaultConfig.adsHistorySize; } else { }
            document.getElementById('mute').checked = result.config.mute;
            document.getElementById('skip').checked = result.config.skip;
            document.getElementById('volume').value = result.config.volume;
            document.getElementById('brightness').value = result.config.brightness;
            document.getElementById('adsHistorySize').value = result.config.adsHistorySize;

            // document.getElementById('config').innerHTML = `Load: ${JSON.stringify(result.config)}`;
            // console.log('Value currently is ' + result.key);
        } else {
            // alert('blank config');
            // console.log(`Value currently is not set`);
            // document.getElementById('volume').value = defaultConfig.volume;
            // document.getElementById('brightness').value = defaultConfig.brightness;
            // document.getElementById('skip').checked = defaultConfig.skip;
        }
        if (result && result.data) {
            result.data.adsHistory = result.data.adsHistory || [];
            const parent = document.getElementById('adsHistory')   // Get the parent node
            while (parent.firstChild) {    // Delete as long as there are child nodes
                parent.removeChild(parent.firstChild);
            }
            // Reverse loop
            for (let i = result.data.adsHistory.length - 1; i >= 0; i--) {
                const item = result.data.adsHistory[i];
                // Add child node as a link
                const child = document.createElement('div');
                const childLink = document.createElement('a');
                childLink.innerText = item.title;
                childLink.title = item.title;
                if (item.href) {
                    childLink.href = item.href;
                } else {
                    childLink.href = `https://www.youtube.com/watch?v=${item.adVideoId}`;
                    const splitted = item.adVideoId.split('\n');
                    childLink.href = splitted[splitted.length - 1];
                }
                childLink.target = '_blank';
                child.appendChild(childLink);
                parent.appendChild(child);
                // document.getElementById('data').innerHTML = `Load: ${JSON.stringify(result.data)}`;
            }
            if (result.data.adsHistory.length > 0) {
                document.getElementById('clearHistory').style.display = 'block';
            } else {
                document.getElementById('clearHistory').style.display = 'none';
                parent.appendChild(document.createTextNode('No history...'));
            }
        } else {
            // console.log(`Value currently is not set`);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('mute').addEventListener('change', setConfig);
    document.getElementById('volume').addEventListener('change', setConfig);
    document.getElementById('brightness').addEventListener('change', setConfig);
    document.getElementById('adsHistorySize').addEventListener('change', setConfig);
    document.getElementById('skip').addEventListener('change', setConfig);
    document.getElementById('clearHistory').addEventListener('click', function () {
        chrome.storage.sync.set({ data: { adsHistory: [] } }, function () {
            // document.getElementById('config').innerHTML = `Save: ${JSON.stringify(config)}`;
            console.log('Value is set to ' + JSON.stringify({ adsHistory: [] }));
        });
    });

    // document.getElementById('setConfigButton').addEventListener('click', setConfig);
    // document.getElementById('getConfigButton').addEventListener('click', getConfig);
    getConfig();
});
