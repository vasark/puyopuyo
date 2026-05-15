class Stage {
    static stageElement = null;
    static puyoBoard = null;
    static puyoCount = 0;
    static fallingPuyoInfoList = [];
    static erasingStartFrame = 0;
    static erasingInfoList = [];
    static zenkeshiImage = null;
    static nextElement = null;
    static nextPuyoColors = [];
    static nextPuyoElements = [];

    static initialize() {
        // HTMLからステージの元となる要素を取得し, 大きさを設定する
        Stage.stageElement = document.getElementById("stage");
        Stage.stageElement.style.width = Config.puyoImageWidth * Config.stageCols + 'px';
        Stage.stageElement.style.height = Config.puyoImageHeight * Config.stageRows + 'px';
        Stage.stageElement.style.backgroundColor = Config.stageBackgroundColor;

        // ネクストぷよを表示する要素を取得し, 大きさを設定する
        const nextContainerElement = document.getElementById("next");
        nextContainerElement.style.width = Config.puyoImageWidth * Config.stageCols + 'px';
        nextContainerElement.style.height = Config.puyoImageHeight * 2.2 + 'px';
        nextContainerElement.style.backgroundColor = Config.nextBackgroundColor;

        // 実際にネクストぷよを格納する要素を作成し, 画面に追加する
        const borderWidth = 2;
        Stage.nextElement = document.createElement("div");
        Stage.nextElement.style.position = "absolute";
        Stage.nextElement.style.left = (Config.puyoImageWidth * (Config.stageCols - 1)) / 2 - borderWidth + 'px';
        Stage.nextElement.style.top = (Config.puyoImageHeight * 0.1) - borderWidth + 'px';
        Stage.nextElement.style.width = Config.puyoImageWidth * 1 + "px";
        Stage.nextElement.style.height = Config.puyoImageHeight * 2 + "px";
        Stage.nextElement.style.border = borderWidth + "px solid #ff8";
        Stage.nextElement.style.borderRadius = Config.puyoImageWidth * 0.2 + "px";
        Stage.nextElement.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
        nextContainerElement.appendChild(Stage.nextElement);

        // 全消しの画像を用意する
        Stage.zenkeshiImage = document.getElementById("zenkeshi");
        Stage.zenkeshiImage.width = Config.puyoImageWidth * Config.stageCols;
        Stage.zenkeshiImage.style.position = 'absolute';
        Stage.zenkeshiImage.style.opacity = '0';
        Stage.stageElement.appendChild(Stage.zenkeshiImage);

        // ぷよぷよ盤を初期化する
        Stage.puyoCount = 0;
        Stage.puyoBoard = [];
        for (let y = 0; y < Config.stageRows; y++) {
            Stage.puyoBoard[y] = [];
            for (let x = 0; x < Config.stageCols; x++) {
                Stage.puyoBoard[y][x] = null;
            }
        }

        // もし初期化状態ステージの情報があれば, その情報を元にぷよを配置する
        for (let y = 0; y < Config.stageRows; y++) {
            for (let x = 0; x < Config.stageCols; x++) {
                let puyoColor = 0;
                if (Config.initialBoard && Config.initialBoard[y][x]) {
                    puyoColor = Config.initialBoard[y][x];
                }
                if (puyoColor >= 1 && puyoColor <= Config.puyoColorMax) {
                    Stage.createPuyo(x, y, puyoColor);
                }
            }
        }

        // 最初のネクストぷよを作成する
        Stage.nextPuyoColors = [];
        Stage.nextPuyoElements = [];
        Stage.getNextPuyoColors();
    }

    // 現在のネクストぷよを返し, 新しいネクストぷよを作成ならびに画面上に表示する
    static getNextPuyoColors() {
        // 現在のネクストぷよの色を返り値用に退避しておく
        const ret = Stage.nextPuyoColors;
        // 新しいネクストぷよの色を決める
        const nextCenterPuyoColor = Math.trunc(Math.random() * Config.puyoColorMax) + 1;
        const nextRotatingPuyoColor = Math.trunc(Math.random() * Config.puyoColorMax) + 1;
        Stage.nextPuyoColors = [nextCenterPuyoColor, nextRotatingPuyoColor];

        // もしネクストぷよの準備がなかったならば, 初回なので画面描画をする必要はない
        if (ret.length) {
            // ネクストぷよが存在したので, 新しいネクストぷよを画面に描画する必要がある
            // 現在のネクストぷよを画面上から削除する
            for (const element of Stage.nextPuyoElements) {
                element.remove();
            }
            // 新しくネクストぷよを画面上に配置する
            const nextCenterPuyoElement = GameImage.getPuyoImage(nextCenterPuyoColor);
            const nextRotatingPuyoElement = GameImage.getPuyoImage(nextRotatingPuyoColor);
            nextCenterPuyoElement.style.top = Config.puyoImageHeight + "px"
            Stage.nextElement.append(nextCenterPuyoElement, nextRotatingPuyoElement);
            Stage.nextPuyoElements = [nextCenterPuyoElement, nextRotatingPuyoElement];
        }
        return ret;
    }

    // ぷよを新しく作って, 画面上とぷよぷよ盤の両方にセットする
    static createPuyo(x, y, puyoColor) {
        // 画像を作成し, 画面上の適切な位置に配置する
        const puyoImage = GameImage.getPuyoImage(puyoColor);
        puyoImage.style.left = x * Config.puyoImageWidth + 'px';
        puyoImage.style.top = y * Config.puyoImageHeight + 'px';
        Stage.stageElement.appendChild(puyoImage);

        // ぷよぷよ盤に情報を追加する
        Stage.puyoBoard[y][x] = {
            puyoColor: puyoColor,
            element: puyoImage
        }

        // ぷよの総数を追加する
        Stage.puyoCount++;
    }

    // ぷよぷよ盤にぷよ情報をセットする
    static setPuyoInfo(x, y, info) {
        Stage.puyoBoard[y][x] = info;
    }

    // ぷよぷよ盤の情報を返す
    static getPuyoInfo(x, y) {
        // 左右, もしくは底の場合は, ダミーのぷよ情報を返す
        if (x < 0 || x >= Config.stageCols || y >= Config.stageRows) {
            return {
                puyoColor: -1
            };
        }
        // y座標がマイナスの場合は, そこは空白扱いする
        if (y < 0) {
            return null;
        }
        // それ以外の場合はぷよぷよ盤の情報をそのまま返す
        return Stage.puyoBoard[y][x];
    }

    // ぷよぷよ盤からぷよ情報を消す
    static removePuyoInfo(x, y) {
        Stage.puyoBoard[y][x] = null;
    }

    // 自由落下するぷよがあるかどうかをチェックする
    static checkFallingPuyo() {
        Stage.fallingPuyoInfoList = [];

        // 下の行から上の行を見ていく
        for (let y = Config.stageRows - 2; y >= 0; y--) {
            for(let x = 0; x < Config.stageCols; x++) {
                const currentPuyoInfo = Stage.getPuyoInfo(x, y);
                if (!currentPuyoInfo) {
                    // このマスにぷよがなければ, 次
                    continue;
                }
                const belowPuyoInfo = Stage.getPuyoInfo(x, y + 1);
                if (!belowPuyoInfo) {
                    // 下が空白なので, このぷよは落ちる

                    // まず, ぷよぷよ盤からそのぷよを取り去る
                    Stage.removePuyoInfo(x, y);

                    // 自由落下した場合にどこまで落ちるのか調べる
                    let destination = y;
                    while (!Stage.getPuyoInfo(x, destination + 1)) {
                        destination++;
                    }
                    // 最終目的地に着く
                    Stage.setPuyoInfo(x, destination, currentPuyoInfo);
                    // 「落ちるぷよ情報リスト」に「落ちるぷよ情報」を入れる
                    Stage.fallingPuyoInfoList.push({
                        element: currentPuyoInfo.element,                   // 画面上のぷよ要素
                        position: y * Config.puyoImageHeight,               // 画面上の現在のY座標の位置
                        destination: destination * Config.puyoImageHeight,  // 画面上の目的地のY座礁の位置
                        falling: true                                       // 今落ちているかどうか
                    });
                }
            }
        }
        return (Stage.fallingPuyoInfoList.length > 0);
    }

    // 自由落下させる
    static fallPuyo() {
        let isFalling = false;
        for (const fallingPuyoInfo of Stage.fallingPuyoInfoList) {
            if (!fallingPuyoInfo.falling) {
                // すでに自由落下が終わっている
                continue;
            }
            // 現在の画面上のY座標を取得して, それに自由落下文の追加する
            let position = fallingPuyoInfo.position;
            position += Config.fallingSpeed;

            if (position >= fallingPuyoInfo.destination) {
                // 自由落下終了
                position = fallingPuyoInfo.destination;
                fallingPuyoInfo.falling = false;
            } else {
                // まだ落下指定なるぷよがあることを記憶する
                isFalling = true;
            }
            // 新しい位置を保存する
            fallingPuyoInfo.position = position;
            // ぷよを動かす
            fallingPuyoInfo.element.style.top = position + 'px';
        }
        return isFalling;
    }

    //消せるかどうか判定する
    static checkPuyoErase(startFrame) {
        Stage.eraseStartFrame = startFrame;
        Stage.erasingInfoList = [];

        // 何色のぷよを消したか記録する
        const erasePuyoColorBin = {};

        // 隣接ぷよを確認する関数内関数を作成
        const checkConnectedPuyo = (x, y, connectedInfoList = []) => {
            // ぷよがあるか確認する
            const originalPuyoInfo = Stage.getPuyoInfo(x, y);
            if (!originalPuyoInfo) {
                // ないなら何もしない
                return connectedInfoList;
            }
            // あるなら一旦, ぷよぷよ盤の上から一時的に消す
            connectedInfoList.push({
                x: x,
                y: y,
                puyoInfo: originalPuyoInfo
            });
            Stage.removePuyoInfo(x, y);

            // 4方向(上下左右)の周囲ぷよを確認する
            const directionList = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const direction of directionList) {
                const dx = x + direction[0];
                const dy = y + direction[1];
                const puyoInfo = Stage.getPuyoInfo(dx, dy);
                if (!puyoInfo || puyoInfo.puyoColor !== originalPuyoInfo.puyoColor) {
                    // ぷよの色が違う
                    continue;
                }
                // 自分と同じ色のぷよだったら, そのぷよのまわりのぷよも消せるか確認する
                checkConnectedPuyo(dx, dy, connectedInfoList);
            }
            return connectedInfoList;
        };

        const remainingInfoList = [];
        // ひとつひとつぷよを確認し, そのぷよが消せるかどうか判断していく
        for (let y = 0; y < Config.stageRows; y++) {
            for (let x = 0; x < Config.stageCols; x++) {
                const puyoInfo = Stage.getPuyoInfo(x, y);
                const connectedInfoList = checkConnectedPuyo(x, y);
                if (connectedInfoList.length < Config.erasePuyoCount) {
                    // 連続していないか, 連続していても数が足りなかったので消さない
                    if (connectedInfoList.length) {
                        // 退避していたぷよを消さないで戻すリストに追加する
                        remainingInfoList.push(...connectedInfoList);
                    }
                } else {
                    if (connectedInfoList.length) {
                        // 消せるぷよだったので, 消すリストに追加する
                        Stage.erasingInfoList.push(...connectedInfoList);
                        erasePuyoColorBin[puyoInfo.puyoColor] = true;
                    }
                }
            }
        }

        // 全体のぷよぷよ個数から, 今回消した個数を引いておく
        Stage.puyoCount -= Stage.erasingInfoList.length;

        // 消さないで戻すリストに入っていたぷよをメモリに復帰させる
        for (const info of remainingInfoList) {
            Stage.setPuyoInfo(info.x, info.y, info.puyoInfo);
        }
        if (Stage.erasingInfoList.length) {
            // もし消せるならば, 消えるぷよの個数と色の情報をまとめて返す
            return {
                piece: Stage.erasingInfoList.length,
                color: Object.keys(erasePuyoColorBin).length
            };
        }
        return null;
    }

    // 消すアニメーションをする
    static erasePuyo(frame) {
        const elapsedFrame = frame - Stage.eraseStartFrame;
        const ratio = elapsedFrame / Config.eraseAnimationFrames;
        if (ratio >= 1) {
            // アニメーションを終了する
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                Stage.stageElement.removeChild(element);
            }
            return false;
        } else if (ratio >= 0.75) {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'block';
            }
            return true;
        } else if (ratio >= 0.50) {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'none';
            }
            return true;
        } else if (ratio >= 0.25) {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'block';
            }
            return true;
        } else {
            for (const info of Stage.erasingInfoList) {
                var element = info.puyoInfo.element;
                element.style.display = 'none';
            }
            return true;
        }
    }

    // 全消しの表示を開始する
    static showZenkeshi() {
        Stage.zenkeshiImage.style.transition = 'none';
        Stage.zenkeshiImage.style.opacity = '1';
        Stage.zenkeshiImage.style.top = Config.puyoImageHeight * Config.stageRows + "px";
        Stage.zenkeshiImage.offsetHeight;   // 一旦ここで表示を確定させる

        Stage.zenkeshiImage.style.transition = "top " + Config.zenkeshiDuration + "ms linear";
        Stage.zenkeshiImage.style.top = Config.puyoImageHeight * Config.stageRows / 3 + "px";
    }

    // 全消しの画像を画面上から消す
    static hideZenkeshi() {
        Stage.zenkeshiImage.style.transition = "opacity " + Config.zenkeshiDuration + "ms linear";
        Stage.zenkeshiImage.style.opacity = '0';
    }
}

