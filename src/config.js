class Config {
    static puyoImageWidth = 40;     // ぷよ画像の幅
    static puyoImageHeight = 40;    // ぷよ画像の高さ

    static stageCols = 6;   // ステージの横の個数
    static stageRows = 12;  // ステージの縦の個数
    static stageBackgroundColor = '#11213b';    // ステージの背景色
    static nextBackgroundColor = '#e2a9c8';     // ネクスト表示の背景色
    static scoreBackgroundColor = '#24c0bb';    // スコアの背景色

    // 初期化のステージ
    static initialBoard = [
        [0 ,0, 0, 0, 0, 0], 
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
    ];

    static puyoColorMax = 5;    // 何色分のぷよを使うか
    static fallingSpeed = 6;    // 自由落下のスピード
    static erasePuyoCount = 4;  // 何個以上揃ったら消えるか
    static eraseAnimationFrames = 30;   // 何フレームでぷよを消すか
    static zenkeshiDuration = 150;  // 全消し時のアニメーションメリセカンド

    static playerFallingSpeed = 0.9     // プレイ中の自然落下のスピード
    static playerLockDelayFrames = 20;  // 何フレーム接地したらぷよを固定するか
    static playerDownSpeed = 10;        // プレイ中の下キー押下時の落下スピード
    static playMoveFrames = 10;         // 左右移動に消費するフレーム数
    static playerRotateFrames = 10;     // 回転に消費するフレーム数

    static scoreHeight = 33;    // スコアフォントの高さ
    static comboBonusTable = [0 ,0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512, 544, 576, 608, 640, 672];
    static pieceBonusTable = [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10];
    static colorBonusTable = [0, 0, 3, 6, 12, 24];
    static zenkeshiBonus = 3600;

    static batankyuAnimationFrames = 1000;  // ばたんきゅ〜アニメーションのフレーム数
}