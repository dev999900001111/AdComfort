console.log('popup');

// 新しいタブを開き、専用ページを表示する
function openPluginMainTab() {
    const target = `chrome-extension://${chrome.runtime.id}/index.html`;
    let existsTab = null;
    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.query({}, function (tabs) {
        // 現在のタブがプラグインのコントローラーページであるかどうかを確認する
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
        // 既存の場合は、そのタブをアクティブにする
        existsTab.active();
    } else {
        // 無かったら新規に開く
        new Promise((resolve) => {
            chrome.tabs.create({ url: `chrome-extension://${chrome.runtime.id}/controller/index.html` }, resolve);
        }).then((tab) => {
            // 新しいタブが正常に開かれた場合の処理
        }).catch((error) => {
            // エラーが発生した場合の処理
        });
    }
}

// 有効にする場合は、コメントを外す
// openPluginMainTab();

const defaultConfig = {
    skip: true,
    volume: 50,
    brightness: 50
};

// ----------------------------------------------------------------
function setConfig() {
    // console.log('setConfig--------------');
    // document.getElementById('config').innerHTML = `setConfig--------------`;
    // document.getElementById('setConfigButton').innerHTML = `setConfigButton`;
    const config = {
        skip: document.getElementById('skip').checked,
        volume: document.getElementById('volume').value,
        brightness: document.getElementById('brightness').value,
    };
    chrome.storage.sync.set({ config }, function () {
        // document.getElementById('config').innerHTML = `Save: ${JSON.stringify(config)}`;
        // console.log('Value is set to ' + JSON.stringify(config));
    });
}
function getConfig() {
    // console.log('getConfig--------------');
    // document.getElementById('config').innerHTML = `getConfig--------------`;
    // document.getElementById('getConfigButton').innerHTML = `getConfigButton`;
    chrome.storage.sync.get(['config'], function (result) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        } else { }
        if (result && result.config) {
            document.getElementById('volume').value = result.config.volume || defaultConfig.volume;
            document.getElementById('brightness').value = result.config.brightness || defaultConfig.brightness;
            document.getElementById('skip').checked = result.config.skip || defaultConfig.skip;
            // document.getElementById('config').innerHTML = `Load: ${JSON.stringify(result.config)}`;
            // console.log('Value currently is ' + result.key);
        } else {
            // console.log(`Value currently is not set`);
            // document.getElementById('volume').value = defaultConfig.volume;
            // document.getElementById('brightness').value = defaultConfig.brightness;
            // document.getElementById('skip').checked = defaultConfig.skip;
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('volume').addEventListener('change', setConfig);
    document.getElementById('brightness').addEventListener('change', setConfig);
    document.getElementById('skip').addEventListener('change', setConfig);
    // document.getElementById('setConfigButton').addEventListener('click', setConfig);
    // document.getElementById('getConfigButton').addEventListener('click', getConfig);
    getConfig();
});

// chrome.storage.sync.get(['enabled'], function (result) {
//     if (chrome.runtime.lastError) {
//         console.error(chrome.runtime.lastError);
//         return;
//     }
//     if (result) {
//         console.log('Value currently is ' + result.key);
//     } else { }
// });
// // 設定値を保存する
// chrome.storage.sync.set({ key: value }, function () {
//     console.log('Value is set to ' + value);
// });
