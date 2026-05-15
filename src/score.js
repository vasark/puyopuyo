class Score {
    static scoreElement;
    static digitCount;
    static score = 0;

    static initialize() {
        // HTML からスコアを表示する元となる要素を取得し, 大きさを設定する
        Score.scoreElement = document.getElementById("score");
        Score.scoreElement.style.width = Config.puyoImageWidth * Config.stageCols + 'px';
        Score.scoreElement.style.height = Config.puyoImageHeight  + 'px';
        Score.scoreElement.style.backgroundColor = Config.scoreBackgroundColor;

        // スコア欄に数字をいくつ並べられるか, 計算で求める
        Score.digitCount = Math.trunc(Config.stageCols * Config.puyoImageWidth / GameImage.getDigitImageWidth());
        Score.score = 0;

        // とりあえず表示する
        Score.updateScore();
    }

    // スコアの画面表示を更新する
    static updateScore() {
        let score = Score.score;
        const scoreElement = Score.scoreElement;
        // まず最初に, scoreElementの中身を空っぽにする
        while (scoreElement.firstChild) {
            scoreElement.firstChild.remove();
        }
        // スコアを下の桁から埋めていく
        for (let i = 0; i < Score.digitCount; i++) {
            // 10で割ったあまりを求めて, 一番下の桁を取り出す
            const digit = score % 10;
            // 一番うしろに追加するのではなく, 一番前に追加することで, 一番下の桁から表示されるようにする
            scoreElement.insertBefore(GameImage.getDigitImage(digit), scoreElement.firstChild);
            // 10 で割って次の桁の準備をしておく
            score = Math.trunc(score / 10);
        }
    }

    // 連鎖時のスコアを追加する
    static addComboScore(combo, piece, color) {
        // テーブルの上限を超えた場合に, テーブルの一番上最後の値を使うように調整する
        combo = Math.min(combo, Config.comboBonusTable.length - 1);
        piece = Math.min(piece, Config.comboBonusTable.length - 1);
        color = Math.min(color, Config.comboBonusTable.length - 1);

        // 倍率を計算する。倍率の計算式は, 連鎖ボーナス + 個数ボーナス + 色数ボーナス
        let scale = Config.comboBonusTable[combo] + Config.comboBonusTable[piece] + Config.comboBonusTable[color];
        if (scale === 0) {
            scale = 1;
        }
        // 消した数に倍率をかけて, さらに10倍にして加算する
        Score.addScore(scale * piece * 10);
    }

    // スコアを加算する
    static addScore(score) {
        Score.score += score;
        Score.updateScore();
    }
}