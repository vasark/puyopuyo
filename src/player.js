class Player {
    static centerPuyoColor = 0;
    static rotatingPuyoColor = 0;
    static playerPuyoStatus = null;
    static centerPuyoElement = null;
    static rotatingPuyoElement = null;
    static groundedFrame = 0;
    static keyStatus = null;
    static actionStartFrame = 0;
    static moveSource = 0;
    static moveDestination = 0;
    static rotateBeforeLeft = 0;
    static rotateAfterLeft = 0;
    static rotateFromRotation = 0;

    static initialize() {
        // キーボードの入力を確認する
        Player.keyStatus = {
            right: false,
            left: false,
            up: false,
            down: false,
        };
        // ブラウザのキーボードの入力を取得するイベントリスナを登録する
        document.addEventListener('keydown', (event) => {
            // キーボードが押された場合
            switch (event.key) {
                case 'ArrowLeft':   // 左向きキー
                    Player.keyStatus.left = true;
                    event.preventDefault();
                    return;
                case 'ArrowUp':     // 上向きキー
                    Player.keyStatus.up = true;
                    event.preventDefault();
                    return;
                case 'ArrowRight':  // 右向きキー
                    Player.keyStatus.right = true;
                    event.preventDefault();
                    return;
                case 'ArrowDown':   // 下向きキー
                    Player.keyStatus.down = true;
                    event.preventDefault();
                    return;
            }
        });
        document.addEventListener('keyup', (event) => {
            // キーボードが押された場合
            switch (event.key) {
                case 'ArrowLeft':   // 左向きキー
                    Player.keyStatus.left = false;
                    event.preventDefault();
                    return;
                case 'ArrowUp':     // 上向きキー
                    Player.keyStatus.up = false;
                    event.preventDefault();
                    return;
                case 'ArrowRight':  // 右向きキー
                    Player.keyStatus.right = false;
                    event.preventDefault();
                    return;
                case 'ArrowDown':   // 下向きキー
                    Player.keyStatus.down = false;
                    event.preventDefault();
                    return;
            }
        });
        // タッチ入力でキー入力をエミュレートする
        let pageX = 0 ,pageY = 0;
        // タッチ入力が始まった
        document.addEventListener("touchstart", (event) => {
            // 最初にタッチされた位置を覚えておく
            const touch = event.touches[0];
            pageX = touch.pageX;
            pageY = touch.pageY;
        });
        // タッチ入力しながら指を動かした
        document.addEventListener("touchmove", (event) => {
            // 現在のキー入力情報を取得する
            let {left, right, up, down} = Player.keyStatus;
            // もしすでにどれかのキーが押されていたら, そのままにしておく
            if (left || right || up || down) {
                return;
            }
            // まだキー入力がされていなければ, スワイプを検知する
            const touch = event.touches[0];
            const dx = touch.pageX - pageX;
            const dy = touch.pageY - pageY;
            if (dx ** 2 + dy ** 2 < 5 ** 2) {
                // 移動量が小さすぎる場合, まだ入力を受け付けない
                return;
            }
            // どの方向にスワイプされたかを判定する
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    right = true;
                } else {
                    left = true;
                }
            } else {
                if (dy > 0) {
                    down = true;
                } else {
                    up = true;
                }
            }
            Player.keyStatus = {left, right, up , down};
        });
        // 指を離した
        document.addEventListener("touchend", (event) => {
            Player.keyStatus = {
                left: false,
                right: false,
                up: false,
                down: false,
            };
        });
    }

    // プレイヤーが操作するぷよを作る
    static createPlayerPuyo() {
        // ぷよぷよが置けるかどうか, 1番上の段の左から3つ目を確認する
        if (Stage.getPuyoInfo(2, 0)) {
            // 空白でない場合は新しいぷよを置けない(ゲームオーバー)
            return false;
        }

        // 新しいぷよの色をネクストぷよから取得する
        const nextPuyoColors = Stage.getNextPuyoColors();
        Player.centerPuyoColor = nextPuyoColors[0];
        Player.rotatingPuyoColor = nextPuyoColors[1];

        //新しいぷよ画像を作成する
        Player.centerPuyoElement = GameImage.getPuyoImage(Player.centerPuyoColor);
        Player.rotatingPuyoElement = GameImage.getPuyoImage(Player.rotatingPuyoColor);
        Stage.stageElement.appendChild(Player.centerPuyoElement);
        Stage.stageElement.appendChild(Player.rotatingPuyoElement);

        // ぷよの初期情報を定める
        Player.playerPuyoStatus = {
            x: 2,   // 中心ぷよの位置: 左から2列目
            y: -1,  // 画面上部ギリギリから出てくる
            left: 2 * Config.puyoImageWidth,
            top: -1 * Config.puyoImageHeight,
            dx: 0,  // 中心ぷよから見た回転するぷよの相対位置: 回転するぷよは上方向にある(0, -1)
            dy: -1,
            rotation: 90,   // 画面上の回転するぷよの角度: 90度(上向き)
        };
        // 接地時間はゼロ
        Player.groundedFrame = 0;
        // ぷよを描画
        Player.setPlayerPuyoPosition();
        return true;
    }

    // playerPuyoStatusに従って, 画面上のぷよの位置を更新する
    static setPlayerPuyoPosition() {
        // まず中心ぷよの位置を確定させる
        Player.centerPuyoElement.style.left = Player.playerPuyoStatus.left + 'px';
        Player.centerPuyoElement.style.top = Player.playerPuyoStatus.top + 'px';

        // 次に回転するぷよの位置を計算する
        const x = Player.playerPuyoStatus.left + Math.cos(Player.playerPuyoStatus.rotation * Math.PI / 180) * Config.puyoImageWidth;
        const y = Player.playerPuyoStatus.top - Math.sin(Player.playerPuyoStatus.rotation * Math.PI / 180) * Config.puyoImageHeight;
        Player.rotatingPuyoElement.style.left = x + 'px';
        Player.rotatingPuyoElement.style.top = y + 'px';
    }

    // プレイヤーの操作ぷよを落下させる
    static dropPlayerPuyo(isPressingDown) {
        let { x, y, dx, dy } = Player.playerPuyoStatus;

        // 現状のプレイヤーの操作ぷよの下にぷよがあるか確認する
        if (!Stage.getPuyoInfo(x, y + 1) && !Stage.getPuyoInfo(x + dx, y + dy + 1)) {
            // 中心ぷよ・回転するぷよ両方の下にぷよがないので, 自由落下してよい
            Player.playerPuyoStatus.top += Config.playerFallingSpeed;
            if (isPressingDown) {
                Player.playerPuyoStatus.top += Config.playerDownSpeed;
            }
            // 自由落下した際, マス目の境界を超えていないか確認する
            if (Math.floor(Player.playerPuyoStatus.top / Config.puyoImageHeight) != y) {
                // ブロックの境を超えたので, 自分の位置を1つ下にずらす
                y += 1;
                Player.playerPuyoStatus.y = y;
                // 下キーが押されていた場合, スコアを加算する
                if (Player.keyStatus.down) {
                    Score.addScore(1);
                }
                // 下にブロックがないか再度チェックする
                if (!Stage.getPuyoInfo(x, y + 1) && !Stage.getPuyoInfo(x + dx, y + dy + 1)) {
                    // 境を変えたが, 下にぷよはなかった。接地していないよう設定して, 自由落下を続ける
                    Player.groundedFrame = 0;
                    return false;
                } else {
                    // 境を超えたらぷよにぶつかった。位置を調節して, 接地を開始する
                    Player.playerPuyoStatus.top = y * Config.puyoImageHeight;
                    Player.groundedFrame = 1;
                    return false;
                }
            } else {
                // 自由落下でマス目を超えていなかった。接地していないよう設定して, 自由落下を続ける
                Player.groundedFrame = 0;
                return false;
            }
        } else {
            // プレイヤーの操作ぷよの下にぷよがあるので, 必ず接地している
            if (Player.groundedFrame === 0) {
                // 初接地である。接地を開始する
                Player.groundedFrame = 1;
                return false;
            } else {
                // 接地中である。接地の時間を増加させる
                Player.groundedFrame++;
                if (Player.groundedFrame > Config.playerLockDelayFrames) {
                    // 接地で一定時間が経過した。この位置で固定する
                    return true;
                } else {
                    return false;
                }
            }
        }
    }

    // イベントループで現在の状況を更新する
    static update(frame) {
        // まずプレイヤーの操作ぷよを落下させる
        if (Player.dropPlayerPuyo(Player.keyStatus.down)) {
            // 接地が終わったら, ぷよを固定する
            return "fix";
        }
        // ぷよの位置を更新する
        Player.setPlayerPuyoPosition();

        // 左右キーの押下を確認する
        if (Player.keyStatus.right || Player.keyStatus.left) {
            // 左右の確認をする
            const mx = (Player.keyStatus.right) ? 1 : -1;
            const cx = Player.playerPuyoStatus.x;
            const cy = Player.playerPuyoStatus.y;
            const rx = cx + Player.playerPuyoStatus.dx;
            const ry = cy + Player.playerPuyoStatus.dy;

            // 動かしたい方向にブロックがないことを確認する
            let canMove = true;

            // まずはプレイヤーの操作ぷよのうち中心ぷよの左右を確認
            if (Stage.getPuyoInfo(cx + mx, cy)) {
                // ぷよが存在するので動かせない
                canMove = false;
            }
            // 次に, 回転するぷよの左右を確認
            if (Stage.getPuyoInfo(rx + mx, ry)) {
                // ぷよが存在するので動かせない
                canMove = false;
            }
            // 接地していない場合は, さらに1個下のブロックの左右も確認する
            if (Player.groundedFrame === 0) {
                // 中心ぷよの左右を確認
                if (Stage.getPuyoInfo(cx + mx, cy + 1)) {
                    // ぷよが存在するので動かせない
                    canMove = false;
                }
                // 回転するぷよの左右を確認
                if (Stage.getPuyoInfo(rx + mx, ry + 1)) {
                    // ぷよが存在するので動かせない
                    canMove = false;
                }
            }

            if (canMove) {
                // 動かしたい方向に動かすことができるので, 移動先情報をセットして移動状態にする
                Player.actionStartFrame = frame;
                Player.moveSource = cx * Config.puyoImageWidth;
                Player.moveDestination = (cx + mx) * Config.puyoImageWidth;
                Player.playerPuyoStatus.x += mx;
                return 'moving'
            }
        } else if  (Player.keyStatus.up) {
            // 回転を確認する
            // 本当に回せるかどうかは後で確認して, とりあえず仮想的に回してみる
            const x = Player.playerPuyoStatus.x;
            // プレイヤー操作ぷよが接地しておらず落下している場合は, 現在の座標よりも1つ下の座標を基準にする
            const y = Player.playerPuyoStatus.y + (Player.groundedFrame === 0 ? 1 : 0);
            const rotation = Player.playerPuyoStatus.rotation;
            let canRotate = true;

            let cx = 0;
            let cy = 0;
            if (rotation === 0) {
                // 右から上には 100% 確実に回せる。何もしない
            } else if (rotation === 90) {
                // 上から左に回すときに, 左にぷよがあれば右に移動する必要がある
                // まず左側を確認する
                if (Stage.getPuyoInfo(x - 1, y)) {
                    // 左側にぷよがある。右に1個ずれる必要がある
                    cx = 1;
                    // ずれる必要があるときに, 右側にもぷよああれば, そのときは回転できない
                    if (Stage.getPuyoInfo(x + 1, y)) {
                        canRotate = false;
                    }
                }
            } else if (rotation === 180) {
                // 左から下に回すときには, 自分の下か左下にぷよがあれば1個上に引き上げる
                // まず下を確認する
                if (Stage.getPuyoInfo(x, y + 1)) {
                    // 左側にぷよがあるので引き上げる
                    cy -= 1;
                }
                // 左下も確認する
                if (Stage.getPuyoInfo(x - 1, y + 1)) {
                    // 左下にぷよがあるので引き上げる
                    cy -= 1;
                }
            } else if (rotation === 270) {
                // 下から右に回すときは, 右にもぷよがあれば左に移動する必要がある
                // まず右側を確認する
                if (Stage.getPuyoInfo(x + 1, y)) {
                    // 右側にぷよがあるので, 左に1個ずれる必要がある
                    cx = -1;
                    // ずれる必要があるときに, 左側にもぷよがあれば, そのときは回転できない
                    if (Stage.getPuyoInfo(x - 1, y)) {
                        // ぷよがあるので回転できなかった
                        canRotate = false;
                    }
                }
            }

            if (canRotate) {
                // 上に移動する必要があるときは, アニメーションせずに一気にあげてしまう
                if (cy === -1) {
                    if (Player.groundedFrame > 0) {
                        // 接地しているなら1段引き上げる
                        Player.playerPuyoStatus.y -= 1;
                        Player.groundedFrame = 0;
                    }
                    Player.playerPuyoStatus.top = Player.playerPuyoStatus.y * Config.puyoImageHeight;
                }
                // 回すことができるので, 回転後の情報をセットして回転状態にする
                Player.actionStartFrame = frame;
                Player.rotateBeforeLeft = x * Config.puyoImageHeight;
                Player.rotateAfterLeft = (x + cx) * Config.puyoImageHeight;
                Player.rotateFromRotation = Player.playerPuyoStatus.rotation;
                // 次の状態を先に設定しておく
                Player.playerPuyoStatus.x += cx;
                const nextRotation = (Player.playerPuyoStatus.rotation + 90) % 360;
                const dCombi = [[1, 0], [0, -1], [-1, 0], [0, 1]][nextRotation / 90];
                Player.playerPuyoStatus.dx = dCombi[0];
                Player.playerPuyoStatus.dy = dCombi[1];
                return 'rotating';
            }
        }
        return "playing";
    }

    // ぷよを左右に移動させる
    static movePlayerPuyo(frame) {
        // 左右の移動中も自然落下はさせる
        Player.dropPlayerPuyo(false);

        // 移動割合を計算する
        let ratio = (frame - Player.actionStartFrame) / Config.playMoveFrames;
        if (ratio > 1) {
            // 1を超えた場合は1にする
            ratio = 1;
        }
        Player.playerPuyoStatus.left = (Player.moveDestination - Player.moveSource) * ratio + Player.moveSource;
        // ぷよの表示位置を変化させる
        Player.setPlayerPuyoPosition();

        if (ratio === 1) {
            // アニメーションが終了していたらtrue
            return true;
        }
        return false;
    }

    // ぷよを回転させる
    static rotatePlayerPuyo(frame) {
        // 回転中も自然落下はさせる
        Player.dropPlayerPuyo(false);

        // 移動・回転割合を計算する
        let ratio = (frame - Player.actionStartFrame) / Config.playerRotateFrames;
        if (ratio > 1) {
            // 1を超えた場合は1にする
            ratio = 1;
        }
        Player.playerPuyoStatus.left = (Player.rotateAfterLeft - Player.rotateBeforeLeft) * ratio + Player.rotateBeforeLeft;
        Player.playerPuyoStatus.rotation = (Player.rotateFromRotation + ratio * 90) % 360;
        // ぷよの表示位置を変化させる
        Player.setPlayerPuyoPosition();

        if (ratio === 1) {
            // アニメーションが終了したらtrue
            return true;
        }
        return false;
    }

    // 現在のプレイヤーの操作ぷよを, ぷよぷよ盤の上に配置する
    static fixPlayerPuyo() {
        const { x, y, dx, dy } = Player.playerPuyoStatus;
        if (y >= 0) {
            // 中心ぷよが画面内にあった場合のみ配置する。画面外ならば配置しない
            Stage.createPuyo(x, y, Player.centerPuyoColor);
        }
        if (y +dy >= 0) {
            // 回転するぷよが画面内にあった場合のみ配置する。画面外ならば配置しない
            Stage.createPuyo(x + dx, y + dy, Player.rotatingPuyoColor);
        }
        // 操作用に作成したプレイヤー操作ぷよ画像を画面上から消す
        Player.centerPuyoElement.remove();
        Player.centerPuyoElement = null;
        Player.rotatingPuyoElement.remove();
        Player.rotatingPuyoElement = null;
    }
}