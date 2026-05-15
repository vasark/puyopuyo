console.log("game.js が読み込まれました");

// 起動されたときに呼ばれる関数を登録する
window.addEventListener("load", () => {
    console.log("load イベントが実行されました");

    // まずステージを整える
    initialize();

    // 画面の高さに合わせて拡大する
    const scale = window.innerHeight / (Score.scoreElement.offsetTop + Score.scoreElement.offsetHeight);
    document.body.style.transform = "scale(" + scale + ")";

    // ゲームループを開始する
    gameloop();
});

let gameState;  // ゲームの現在の状況
let frame;      // ゲームの現在フレーム(1/60秒ごとに1追加される)

let comboCount = 0; // 現在何連鎖しているか

function initialize() {
    console.log("initialize 関数が実行されました");

    GameImage.initialize();

    // ステージを準備する
    Stage.initialize();

    // プレイヤー操作を準備する
    Player.initialize();

    // スコア表示を準備する
    Score.initialize();

    // シーンを初期状態にセットする
    gameState = 'start';
    // フレームを初期化する
    frame = 0;
}

function gameloop() {
    switch (gameState) {
        case 'start':
            // ゲーム開始直後の状態
            // 最初は, もしかしたら空中にあるかもしれないぷよを自由落下させるところからスタート
            gameState = 'checkFallingPuyo';
            break;
        case 'checkFallingPuyo':
            // 落ちるかどうか判定する状態
            if (Stage.checkFallingPuyo()) {
                gameState = 'fallingPuyo';
            } else {
                gameState = 'checkPuyoErase';
            }
            break;
        case 'fallingPuyo':
            // ぷよが自由落下しているアニメーション状態
            if (!Stage.fallPuyo()) {
                gameState = 'checkPuyoErase';
            }
            break;
        case 'checkPuyoErase':
            // 消せるかどうか判定する状態
            const eraseInfo = Stage.checkPuyoErase(frame);
            if (eraseInfo) {
                gameState = 'erasingPuyo';
                comboCount++;
                // スコアを加算する
                Score.addComboScore(comboCount, eraseInfo.piece, eraseInfo.color);
                Stage.hideZenkeshi();
                // ボーナススコアを加算する
                Score.addScore(Config.zenkeshiBonus);
            } else {
                if (Stage.puyoCount === 0 && comboCount > 0) {
                    // 全部消えたので, 全消しを表示する
                    Stage.showZenkeshi();
                }
                comboCount = 0;
                gameState = 'createPlayerPuyo';
            }
            break;
        case 'erasingPuyo':
            // ぷよが消えているアニメーション状態
            if (!Stage.erasePuyo(frame)) {
                // 消し終わったら, 再度落ちるかどうか判定する
                gameState = 'checkFallingPuyo';
            }
            break;
        case 'createPlayerPuyo':
            // 新しくプレイヤーの操作ぷよを作成する状態
            if (!Player.createPlayerPuyo()) {
                // 新しい操作用ぷよを作成する。作成できなかったら, ゲームオーバー
                gameState = 'gameOver';
            } else {
                // プレイヤーが操作する
                gameState = 'playing';
            }
            break;
        case 'playing':
            // プレイヤーが操作する状態
            const nextAction = Player.update(frame);
            gameState = nextAction; // 'playing' 'fix' 'rotating' のどれかが返ってくる
            break;
        case 'fix':
            // 現在の位置でぷよを固定する状態
            Player.fixPlayerPuyo();
            // 固定が完了したら, 自由落下できるぷよがあるかどうかを確認する
            gameState = 'checkFallingPuyo';
            break;
        case 'moving':
            // プレイヤーがの操作ぷよが左右に移動するアニメーション状態
            if (Player.movePlayerPuyo(frame)) {
                // 移動が終わったので操作可能にする
                gameState = 'playing';
            }
            break;
        case 'rotating':
            if (Player.rotatePlayerPuyo(frame)) {
                // 回転が終わったので操作可能にする
                gameState = 'playing';
            }
            break;
        case 'gameOver':
            GameImage.prepareBatankyuAnimation(frame);
            gameState = 'batankyu';
            break;
        case 'batankyu':
            GameImage.updateBatankyu(frame);
            break;
    }
    frame++;
    setTimeout(gameloop, 1000 / 60);    // 1/60秒後にもう一度呼び戻す
}

console.log("game.js の実行が最後まで到達しました");