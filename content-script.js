console.log('contetscript');

const state = { isMute: "init", isAds: false, volume: null, brightness: null };

const normalState = { isMute: false, volume: null, brightness: null };
const adsState = { isMute: true, volume: "0", brightness: "10" };

// 状態を取得する
function getState() {
    const state = {
        isMute: false,
        isAds: false,
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
            state.isMute = false;
        } else if (muteTitle === 'ミュート解除') {
            // ミュート中だったらそのまま
            state.isMute = true;
        } else {
            // どちらでもない場合は何もしない
        }
    } else {
        // ミュートボタンが見つからなかった場合は何もしない
    }

    // 音量を取得する
    // TODO ここは上手く行ってないけどvideoが再作成されてるっぽくて結果上手くいっているので一旦放置
    const vol = document.querySelector(`ytp-volume-panel`);
    if (vol) {
        state.volume = vol.attributes[`aria-valuenow`];
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
    if (currState.isMute !== newState.isMute) {
        // ミュート状態が指定されたものと異なる場合のみ処理する
        console.log(`${new Date().toLocaleString()} setMute=${newState.isMute}, curr=${currState.isMute}`,);
        const mute = document.querySelector('.ytp-mute-button.ytp-button');
        if (mute) {
            // ミュート状態を反転する
            mute.click();
        } else {
            // ミュートボタンが見つからなかった場合は何もしない
        }
    } else {
        // ミュート状態が変化しなかった場合は何もしない
    }
    // 音量を設定する
    const videoElem = document.querySelector('.video-stream.html5-main-video');
    if (videoElem) {
        if (newState.volume === null) {
        } else {
            videoElem.volume = Number(newState.volume) / 100;
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
        chrome.storage.sync.get(['config'], function (result) {
            let skip = false;
            if (result) {
                if (result.config.skip) {
                    // スキップする設定だった場合
                    skip = true;
                } else {
                    // スキップしない設定だった場合
                }
            } else {
                // 設定が読み込めなかったらデフォルト値で設定する
                skip = true;
            }
            if (skip) {
                // スキップボタンを押す
                const btn = document.querySelector('.ytp-ad-skip-button-container,[id="ad-text:m"]');
                btn.click();
                // 広告終了時
                // 状態を元に戻す
                setState(currState, normalState);
            } else {
                // スキップボタンが表示されたが、スキップしない設定だった
            }
        });
    }
    // ステータス変化あり
    if (state.isAds !== currState.isAds) {
        // ステータス変化あり
        if (currState.isAds) {
            // 広告表示開始時
            // 広告開始時の状態を取得
            normalState.volume = currState.volume;
            normalState.isMute = currState.isMute;

            // 設定を読み込む
            chrome.storage.sync.get(['config'], function (result) {
                if (result) {
                    // 音量を設定する
                    setState(currState, {
                        isMute: Number(result.config.volume) === 0,
                        volume: result.config.volume,
                        brightness: result.config.brightness,
                    });
                } else {
                    // 設定が読み込めなかったらデフォルト値で設定する
                    setState(currState, adsState);
                }
            });
        } else {
            // 広告終了時
            // 状態を元に戻す
            setState(currState, normalState);
        }
    } else {
        // ステータス変化なし
    }

    // 状態を更新する
    Object.assign(state, currState);

    // const interval = 100;
    // setTimeout(pollSkip, interval);
}
// pollSkip();

// オブザーバの設定
const config = {
    attributes: false,        // 属性の変更を監視
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
            console.log(`属性: ${mutation.attributeName} が変更されました。`);
        }
    }
};

// ターゲットノードが存在するか確認する関数
const checkForNode = function () {
    const targetNode = document.querySelector('.video-ads.ytp-ad-module');
    if (targetNode) {
        // console.log('ターゲットノードが見つかりました。');

        // MutationObserverをインスタンス化し、コールバックを渡す
        const observer = new MutationObserver(callback);

        pollSkip();

        // オブザーバを開始し、設定を適用
        observer.observe(targetNode, config);
    } else {
        // console.log('ターゲットノードが見つかりません。');
        setTimeout(checkForNode, 10);
    }
};
checkForNode();
// document.querySelector('.ytp-chrome-bottom').classList.add('ytp-volume-slider-active')

console.log(chrome.runtime.id);
console.log(chrome.storage);