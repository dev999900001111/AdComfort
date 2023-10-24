// console.log('contetscript');
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


// 状態を取得する
function getState() {
    const state = {
        isAds: false,
        mute: null,
        volume: null,
        isSkipableButton: false,
        isUnskipableButton: false,
    };

    // ミュート状態を取得する
    const mute = document.querySelector('.ytp-mute-button.ytp-button');
    if (mute) {
        const muteTitle = mute.attributes['data-title-no-tooltip'].value;
        if (muteTitle === 'ミュート（消音）') {
            // ミュート解除中だったらミュートする
            state.mute = false;
        } else if (muteTitle === 'ミュート解除') {
            // ミュート中だったらそのまま
            state.mute = true;
        } else {
            // どちらでもない場合は何もしない
        }
    } else {
        // ミュートボタンが見つからなかった場合は何もしない
    }

    // 音量を取得する
    // TODO ここは上手く行ってないけどvideoが再作成されてるっぽくて結果上手くいっているので一旦放置
    const vol = document.querySelector(`.ytp-volume-panel`);
    if (vol && vol.attributes[`aria-valuenow`]) {
        state.volume = vol.attributes[`aria-valuenow`].value;
    } else {
        // 音量ボタンが見つからなかった場合は何もしない
    }

    // スキップボタン待ち版
    const btn = document.querySelector('.ytp-ad-skip-button-container,[id="ad-text:m"]');
    state.isSkipableButton = btn && btn.style.display !== 'none';
    // 強制待ち版
    const waitText = document.querySelector('.ytp-ad-preview-container>.ytp-ad-text,.ytp-ad-preview-container.countdown-next-to-thumbnail');
    state.isUnskipableButton = waitText && waitText.style.display !== 'none';

    // 広告表示中かどうか判定
    state.isAds = state.isSkipableButton || state.isUnskipableButton;

    return state;
}

function setState(currState, newState) {
    // ミュート状態を設定する
    if (currState.mute !== newState.mute) {
        // ミュート状態が指定されたものと異なる場合のみ処理する
        // console.log(`${new Date().toLocaleString()} setMute=${newState.mute}, curr=${currState.mute}`,);
        const mute = document.querySelector('.ytp-mute-button.ytp-button');
        if (mute) {
            // ミュート状態を反転する
            // mute.click();
        } else {
            // ミュートボタンが見つからなかった場合は何もしない
        }
    } else {
        // ミュート状態が変化しなかった場合は何もしない
    }
    // 音量を設定する
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

// const videoStream = document.querySelector('.video-stream');
// videoStream.style.display = 'block';
// const html5VideoContainer = document.querySelector('.html5-video-container');
// html5VideoContainer.style.display = 'block'

// 広告スキップボタンをポーリングする
function pollSkip() {
    const currState = getState();
    if (!state.isSkipableButton && currState.isSkipableButton) {
        // スキップボタンが表示された
        if (adsConfig.skip) {
            // スキップボタンを押す
            const btn = document.querySelector('.ytp-ad-skip-button-container,[id="ad-text:m"]');
            btn.click();
            // 広告終了時
            // 状態を元に戻す
            setState(currState, normalState);
        } else {
        }
        // adsHistory.push({
    }
    // ステータス変化あり
    if (state.isAds !== currState.isAds) {
        // ステータス変化あり
        if (currState.isAds) {
            // 広告表示開始時
            // 広告開始時の状態を取得
            normalState.volume = currState.volume;
            normalState.mute = currState.mute;

            // 音量を設定する
            setState(currState, {
                mute: Number(adsConfig.volume) === 0 || adsConfig.mute,
                volume: adsConfig.volume,
                brightness: adsConfig.brightness,
            });

            // 広告履歴を更新する
            while (adsHistory.length >= adsConfig.adsHistorySize) {
                adsHistory.shift(); // キューが最大サイズに達していれば、先頭の要素を削除
            }
            // 右クリックイベントを発火させる関数
            function triggerRightClick(element) {
                // MouseEventを生成
                const event = new MouseEvent('contextmenu', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 2,
                    buttons: 2,
                    clientX: element.getBoundingClientRect().left,
                    clientY: element.getBoundingClientRect().top
                });
                // イベントを指定した要素にディスパッチ
                element.dispatchEvent(event);
            }
            // 例: idが"myElement"の要素上で右クリックイベントを発火
            const elem = document.querySelector(".video-ads.ytp-ad-module");
            triggerRightClick(elem);

            // クリックイベントの反応を待つ
            setTimeout(() => {
                try {
                    // 右クリックメニューを開く
                    document.querySelectorAll('.ytp-panel-menu .ytp-menuitem')[1].click();
                    setTimeout(() => {
                        const contextmenu = document.querySelector('.ytp-popup.ytp-contextmenu');
                        const splitted = contextmenu.innerText.split('\n');
                        // console.log(contextmenu.innerText);
                        if (splitted[splitted.length - 1].startsWith('https://')) {
                            // 上手くリンクが取れたら新しい要素を追加
                            adsHistory.push({
                                date: new Date().toLocaleString(),
                                href: splitted[splitted.length - 1],
                                title: document.querySelector('.ytp-title-link')?.innerText
                            });
                        } else {
                            // // 上手くリンクが取れなかったら、動画IDを追加
                            // adsHistory.push({
                            //     date: new Date().toLocaleString(),
                            //     adVideoId: document.querySelector('.ytp-title-link')?.href?.split('watch?v=')[1],
                            //     title: document.querySelector('.ytp-title-link')?.innerText
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
            // 広告終了時
            // 状態を元に戻す
            setState(currState, normalState);
        }
    } else {
        // ステータス変化なし
    }

    // console.log(`${new Date().toLocaleString()} ${state.isAds} -> ${currState.isAds}`);
    // console.log(`${new Date().toLocaleString()} ${JSON.stringify(state)} -> ${JSON.stringify(currState)}`);
    // 状態を更新する
    Object.assign(state, currState);

    // const interval = 100;
    // setTimeout(pollSkip, interval);
}
// pollSkip();

// オブザーバの設定
const observerConfig = {
    attributes: true,        // 属性の変更を監視
    childList: true,         // 子ノードの変更を監視
    characterData: true,     // テキスト内容の変更を監視
    subtree: true            // 子孫ノードも監視
};

// コールバック関数を定義
const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // console.log('子ノードが追加または削除されました。');
            pollSkip();
        } else if (mutation.type === 'attributes') {
            // console.log(`属性: ${mutation.attributeName} が変更されました。`);
        }
        // console.log(mutation);
    }
};

// ターゲットノードが存在するか確認する関数
const checkForNode = function () {
    const targetNode = document.querySelector('.video-ads.ytp-ad-module');
    if (targetNode && chrome.storage && chrome.storage.sync) {

        // リアルタイムで設定を反映する
        chrome.storage.onChanged.addListener(function (changes, namespace) {
            if (namespace === 'sync') {
                for (let key in changes) {
                    const change = changes[key];
                    // console.log(`Storage key "${key}" in namespace "${namespace}" changed.`);
                    // console.log(`Old value was "${JSON.stringify(change.oldValue)}", new value is "${JSON.stringify(change.newValue)}".`);

                    if (key === 'config') { // 設定を更新する
                        Object.assign(adsConfig, changes.config.newValue);
                        if (state.isAds) {
                            setState(state, adsConfig);
                            const currState = getState();
                            Object.assign(state, currState);
                        }
                    } else if (key === 'data') { // 広告履歴を更新する
                        // adsHistoryの内容を更新する
                        adsHistory.length = 0;
                        adsHistory.push(...changes.data.newValue.adsHistory);
                    } else {
                        // ;
                    }
                }
            } else { }
        });

        // console.log('ターゲットノードが見つかりました。');

        const start = () => {
            // MutationObserverをインスタンス化し、コールバックを渡す
            const observer = new MutationObserver(callback);

            pollSkip();

            // オブザーバを開始し、設定を適用
            observer.observe(targetNode, observerConfig);
        }

        // 設定を読み込む
        chrome.storage.sync.get(['config', 'data'], function (result) {
            // 保存してある情報を読み込む。なければデフォルト値を設定する
            const reset = {
                config: {},
                data: {},
            };

            if (result) {
                if (result.config) {
                    if (result.config.mute === undefined) {
                        reset.config.mute = defaultConfig.mute;
                    } else {
                        reset.config.mute = result.config.mute;
                    }
                    if (result.config.skip === undefined) {
                        reset.config.skip = defaultConfig.skip;
                    } else {
                        reset.config.skip = result.config.skip;
                    }
                    if (result.config.volume === undefined) {
                        reset.config.volume = defaultConfig.volume;
                    } else {
                        reset.config.volume = Number(result.config.volume);
                    }
                    if (result.config.brightness === undefined) {
                        reset.config.brightness = defaultConfig.brightness;
                    } else {
                        reset.config.brightness = Number(result.config.brightness);
                    }
                    if (result.config.adsHistorySize === undefined) {
                        reset.config.adsHistorySize = defaultConfig.adsHistorySize;
                    } else {
                        reset.config.adsHistorySize = Number(result.config.adsHistorySize);
                    }
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
        // console.log('ターゲットノードが見つかりません。');
        setTimeout(checkForNode, 1);
    }
};
checkForNode();

// document.addEventListener('DOMContentLoaded', function () {
//     checkForNode();
// });
// document.querySelector('.ytp-chrome-bottom').classList.add('ytp-volume-slider-active')

// console.log(chrome.runtime.id);
// console.log(chrome.storage);