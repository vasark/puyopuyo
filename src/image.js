class GameImage {
    static puyoImageList = null;
    static digitImageList = null;
    static batankyuImage = null;
    static gameOverFrame = 0;

    static initialize() {
        // ぷよ画像を準備する
        GameImage.puyoImageList = [];
        for (let i = 0; i < Config.puyoColorMax; i++) {
            const image = document.getElementById("puyo_" + (i + 1));
            image.removeAttribute('id');
            image.width = Config.puyoImageWidth;
            image.height = Config.puyoImageHeight;
            image.style.position = 'absolute';
            GameImage.puyoImageList[i] = image;
        }

        // スコアの数字画像を準備する
        GameImage.digitImageList = [];
        for (let i = 0; i < 10; i++) {
            const image = document.getElementById("font_" + i);
            image.removeAttribute('id');

            // 数字画像の高さをあらかじめ揃えておく
            const width = image.width / image.height * Config.scoreHeight;
            image.width = width;
            image.height = Config.scoreHeight;

            GameImage.digitImageList[i] = image;
        }
        // ばたんきゅ〜画像を準備する
        GameImage.batankyuImage = document.getElementById("batankyu");
        GameImage.batankyuImage.width = Config.puyoImageWidth * Config.stageCols;
        GameImage.batankyuImage.style.position = "absolute";
    }

    // ぷよ画像を複製して返す
    static getPuyoImage(color) {
        const image = GameImage.puyoImageList[color - 1].cloneNode(true);
        return image;
    }

    // 数字画像を複製して返す
    static getDigitImage(digit) {
        const image = GameImage.digitImageList[digit].cloneNode(true);
        return image;
    }

    // 数字画像の横幅を返す
    static getDigitImageWidth() {
        return GameImage.digitImageList[0].width;
    }
    
    // ばたんきゅ〜の準備をする
    static prepareBatankyuAnimation(frame) {
        // ゲームオーバー時のフレーム数を記録しておく
        GameImage.gameOverFrame = frame;
        // ばたんきゅ〜画像を, ステージ要素の下に再配置する
        Stage.stageElement.appendChild(GameImage.batankyuImage);
        // ばたんきゅ〜の位置をセットする
        GameImage.updateBatankyu();
    }

    // ばたんきゅ〜のアニメーションをする
    static updateBatankyu(frame) {
        // アニメーションの進行割合を計算する
        const ratio = (frame - GameImage.gameOverFrame) / Config.batankyuAnimationFrames;
        // 三角関数を使って, なめらかなアニメーションに見えるような位置を計算する
        const height = Config.puyoImageHeight * Config.stageRows;
        const x = Math.sin(ratio * Math.PI * 2 * 5) * Config.puyoImageWidth;
        const y = -Math.cos(ratio * Math.PI * 2) * height / 4 + height / 2;
        // ばたんきゅ〜画像に計算した位置を指定する
        GameImage.batankyuImage.style.left = x + 'px';
        GameImage.batankyuImage.style.top = y + 'px';
    }
}