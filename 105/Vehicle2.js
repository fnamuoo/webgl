// - Arcade Raycast Vehicle
//   https://forum.babylonjs.com/t/arcade-raycast-vehicle/45088
//     https://playground.babylonjs.com/#8WQIA8#10
//
//     https://github.com/RaggarDK/ArcadeRaycastVehicle
//
//     簡単な例
//     https://playground.babylonjs.com/#8WQIA8
//     fix
//     https://playground.babylonjs.com/#8WQIA8#1


// const { Scene, FreeCamera, Vector3, Quaternion, MeshBuilder, KeyboardEventTypes, Color3, TransformNode, FollowCamera, HemisphericLight, Animation, SceneLoader, HavokPlugin, Axis, Space } = BABYLON
const { Scene, FreeCamera, Vector3, Quaternion, MeshBuilder, KeyboardEventTypes, Color3, TransformNode, FollowCamera, HemisphericLight, Animation, SceneLoader, HavokPlugin, Axis, Space } = BABYLON
const { PhysicsShapeMesh, PhysicsMotionType, PhysicsBody, PhysicsShapeConvexHull, PhysicsRaycastResult } = BABYLON
const { GridMaterial } = BABYLON


// PhysicsRaycastResult を一つ作って再利用している。複数の並列レイを同時に扱わない前提。
const raycastResult = new PhysicsRaycastResult();

export class RaycastVehicle{
    // ベクトル／クォータニオンの再利用用。毎フレーム多数の一時計算で new を避けるために保持している。
    tmp1 = new Vector3()
    tmpq1 = new Quaternion()
    tmp2 = new Vector3()

    // 姿勢を正すときに上昇に加える力（implus)
    // resetApplyImp = 10000;
    resetApplyImp = 5000;

    constructor(body, scene){
        // 車両の物理ボディ（シャーシ）。transformNode を持ち、getLinearVelocity() / getAngularVelocity() / applyForce() 等の物理 API を呼ぶ対象。
        // PhysicsBody
        this.body = body
        // Babylon の Scene と物理エンジンの参照（body._physicsEngine）。
        this.scene = scene
        // ..
        this.physicsEngine = body._physicsEngine
        // 登録された RaycastWheel オブジェクトの配列
        this.wheels = []

        // 「着地予測（predictive landing）」に使うフレーム数と、予測角速度へ補間する割合。
        this.numberOfFramesToPredict = 60
        this.predictionRatio = 0.6

        this.nWheelsOnGround = 0
        this.speed = 0
        // アンチロール用の軸情報（左右ホイールインデックスと力の係数などを格納すると想定）
        this.antiRollAxles = []

        // ひっくり返った姿勢を正すフラグ
        this._resetPosture = 0
    }

    addWheel(wheel){
        this.wheels.push(wheel)
    }

    // 指定されている index もしくは wheel を削除する(indexを優先）
    removeWheel(wheel, index){
        if(index!==undefined) {
            this.wheels.splice(index, 1);
            return;
        }
        this.wheels.splice(this.wheels.indexOf(wheel), 1)
    }
    
    addAntiRollAxle(axle){
        this.antiRollAxles.push(axle)
    }
    
    removeAntiRollAxle(axle, index){
        if(index) this.antiRollAxles.splice(index, 1)
        this.antiRollAxles.splice(this.antiRollAxles.indexOf(axle), 1)
    }
    
    updateWheelTransform(wheel){
        // chatGPT
        // - ホイールのローカル座標（positionLocal）とサスペンション軸（suspensionAxisLocal）を
        //   車体（シャーシ）のワールドマトリクスで変換して、
        //   ワールド空間でのホイール位置（positionWorld） と サスペンション方向（suspensionAxisWorld） を得ます。
        // - TransformCoordinatesToRef は位置変換（平行移動含む）、TransformNormalToRef は回転のみ（平行移動は無視）です。

        // ホイールの位置（ローカル）を body の変換行列で、位置（世界）に射影する
        Vector3.TransformCoordinatesToRef(wheel.positionLocal, this.body.transformNode.getWorldMatrix(), wheel.positionWorld)
        // ホイールのサスペンションの向き（デフォ：ローカルで下向き）を body の変換行列で、向き（世界）に射影する
        Vector3.TransformNormalToRef(wheel.suspensionAxisLocal, this.body.transformNode.getWorldMatrix(), wheel.suspensionAxisWorld)
    }
    
    updateVehicleSpeed(){
        // chatGPt
        // - シャーシの 線形速度をワールド→ローカル座標系 に変換して、そのローカルZ成分を speed にセットしています。
        //   - ここでの仮定：ローカルZ が前後（進行方向）であるため z を速度として採用。
        //   - 注意点：getWorldMatrix().clone().invert() を毎回 clone＋invert している点はコスト的に重い（最適化余地あり）。
        
        // 車のスピード
        Vector3.TransformNormalToRef(this.body.getLinearVelocity(),
                                     this.body.transformNode.getWorldMatrix().clone().invert(),
                                     this.tmp1)
        this.speed = this.tmp1.z
    }
    
    updateWheelSteering(wheel){
        // chatGPT
        // - ホイールの見た目（wheel.transform）に ステアリング角度（wheel.steering：ラジアン） を反映する処理。
        //   - wheel.suspensionAxisLocal.negate() を回転軸としてクォータニオンを作り（RotationAxisToRef）、
        //     シャーシ回転（this.body.transformNode.rotationQuaternion）と掛け合わせてホイールの最終回転を作る。
        //   - つまりホイールの回転基準は「シャーシ回転 × ステアリング回転」。
        //
        // - computeWorldMatrix(true) で wheel.transform のワールドマトリクスを更新（後続の TransformNormalToRef 等で使うため）。

        // １つのホイールの姿勢(quat)と向きを更新
        Quaternion.RotationAxisToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), wheel.steering, this.tmpq1)
        this.body.transformNode.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
        wheel.transform.rotationQuaternion.normalize()
        wheel.transform.computeWorldMatrix(true)
    }
    
    updateWheelRaycast(wheel){
        // chatGPT
        // - レイキャストで路面接触を調べる。レイの始点はホイール位置、終点は「サスペンションが伸び切った先」
        //   （position + suspensionAxis * restLength）。
        //
        // - raycastResult を参照してヒットしているか hasHit を見て分岐：
        //
        //   - ヒットしなければ inContact=false。
        //   - ヒットしたら hitBody, hitPoint, hitNormal, hitDistance を更新し
        //     inContact=true、さらに this.nWheelsOnGround++。（フレーム内で接地本数をカウント）
        //
        // - 重要：raycastResult を 使い回し しているため、
        //   同一フレーム内で別処理が同じオブジェクトを参照しないことが前提。
        //   並列レイやマルチヒットを扱う場合は注意。

        // サスペンションの下端の位置をtmp1に
        this.tmp1.copyFrom(wheel.suspensionAxisWorld).scaleInPlace(wheel.suspensionRestLength).addInPlace(wheel.positionWorld)
        const rayStart = wheel.positionWorld
        const rayEnd = this.tmp1
        // レイキャストで地面メッシュとの接地を確認する
        this.physicsEngine.raycastToRef(rayStart, rayEnd, raycastResult)
        if(!raycastResult.hasHit){
            // ホイールが接地していない場合
            wheel.inContact = false
            return
        }
        // ホイールが接地している場合
        // .. 接地しているメッシュ
        wheel.hitBody = raycastResult.body
        // .. 接地している点座標
        wheel.hitPoint.copyFrom(raycastResult.hitPointWorld)
        // .. 接地している法線方向
        wheel.hitNormal.copyFrom(raycastResult.hitNormalWorld)
        // .. 接地している距離
        wheel.hitDistance = raycastResult.hitDistance
        // .. 接地フラグ
        wheel.inContact = true
        // .. ホイールの接地数
        this.nWheelsOnGround++
    }
    
    updateWheelSuspension(wheel){
        // chatGPT
        // - レイがヒットしている場合にサスペンション力を計算し applyForce するメソッド。
        //   - suspensionLength = ばねの現在の圧縮量（rest - hitDistance）。
        //   - compressionForce = suspensionForce * compressionRatio（ばねの剛性に相当、線形モデル）。
        //   - rate（変位速度）を計算してから dampingForce を算出（ダンパー）。force -= dampingForce として減衰を引く。
        //   - 最終的に力ベクトルはサスペンション軸（ワールド化して逆向き）に沿ったスケールとなり、
        //     力の作用点はヒットポイント（wheel.hitPoint）に適用される。
        //
        // - 物理的意味：ホイールが路面に押し付けられる力をシャーシに返す（等価にシャーシを上向きに押す）。

        if(!wheel.inContact){
            // 接地していないとき
            wheel.prevSuspensionLength = wheel.suspensionLength
            wheel.hitDistance = wheel.suspensionRestLength
            return
        }
        // 接地しているとき
        
        let force = 0.0
        // サスペンションの縮み具合（圧縮率）を算出
        wheel.suspensionLength = wheel.suspensionRestLength - wheel.hitDistance
        wheel.suspensionLength = clampNumber(wheel.suspensionLength, 0, wheel.suspensionRestLength);
        const compressionRatio = wheel.suspensionLength / wheel.suspensionRestLength;

        // サスペンションの圧縮率に応じた反発力を算出
        const compressionForce = wheel.suspensionForce * compressionRatio;
        force += compressionForce;

        const rate = (wheel.prevSuspensionLength - wheel.suspensionLength) / this.scene.getPhysicsEngine().getTimeStep()
        wheel.prevSuspensionLength = wheel.suspensionLength;

        const dampingForce = rate * wheel.suspensionForce * wheel.suspensionDamping
        force -= dampingForce;

        const suspensionForce = Vector3.TransformNormalToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1),
                                                             this.body.transformNode.getWorldMatrix(),
                                                             this.tmp1).scaleInPlace(force)

        this.body.applyForce(suspensionForce, wheel.hitPoint)
    }
    
    updateWheelSideForce(wheel){
        // chatGPT
        // - ホイール横方向（アクスル軸方向、横滑りを抑える方向）で ホイール接地点の速度を減らすための力 
        //   を計算して適用しています。目的はタイヤが地面に対して滑るのを抑え、横向きの速度（横滑り）を減速させること。
        //   - getBodyVelocityAtPoint(body, wheel.positionWorld) はその点の線速度（並進 + 回転による速度）を返す。
        //   - steeringDir（ホイールの横向き方向）に沿った速度成分 steeringVel を計算し、
        //     それをゼロにしようとするための所望の加速度 desiredAccel = -steeringVel / dt を得る。
        //   - wheel.sideForce * desiredAccel をその方向に掛け、回転中心から少し引いた位置
        //     （Lerp(hitPoint, positionWorld, sideForcePositionRatio)）に力を加えることでトルクも発生させて横滑りを抑える設計。
        //
        // - 実用面：
        //   - sideForce が高いほど横滑りに強い。
        //   - 作用点がヒットポイント寄りか車体寄りかでロールやヨのトルク挙動が変わる。

        // 接地していなければ関数を抜ける
        if(!wheel.inContact) return

        const tireWorldVel = getBodyVelocityAtPoint(this.body, wheel.positionWorld)
        const steeringDir = Vector3.TransformNormalToRef(wheel.axleAxisLocal, wheel.transform.getWorldMatrix(), this.tmp1)
        const steeringVel = Vector3.Dot(steeringDir, tireWorldVel)
        const desiredVelChange = -steeringVel
        const desiredAccel = desiredVelChange / this.scene.getPhysicsEngine().getTimeStep()
        this.body.applyForce(
            steeringDir.scaleInPlace(wheel.sideForce * desiredAccel), 
            Vector3.LerpToRef(wheel.hitPoint, wheel.positionWorld, wheel.sideForcePositionRatio, this.tmp2)
        )
    }
    
    updateWheelForce(wheel){
        // chatGPT
        // - 駆動力（アクセル）／制動力をホイールの前方向に沿って直接シャーシに力として加える処理。
        //   - wheel.force は正なら前進、負ならブレーキ逆向き（実装次第）。
        //   - ここではブレーキは別パラメータ wheel.brake があるが上のコードでは使われていない（force のみ使っている）。
        //
        // - 実際の車輪摩擦モデル（トラクション限界・スリップ比）を再現していない簡易実装。

        if(!wheel.inContact) return

        if(wheel.force !== 0){
            // const forwardDirectionWorld = Vector3.TransformNormalToRef(
            //     wheel.forwardAxisLocal,
            //     wheel.transform.getWorldMatrix(),
            //     this.tmp1).scaleInPlace(wheel.force-wheel.brakeForce*Math.sign(wheel.force))
            const forwardDirectionWorld = Vector3.TransformNormalToRef(
                wheel.forwardAxisLocal,
                wheel.transform.getWorldMatrix(),
                this.tmp1).scaleInPlace(wheel.force)
            this.body.applyForce(forwardDirectionWorld, this.tmp2.copyFrom(wheel.hitPoint))
        }
    }

    updateWheelBrake(wheel) {
        // Babylonさん（仮）@chatGPT
        // これは updateWheelForce() と同じように、ブレーキ用の反対方向の力を加える処理だよ。
        if(!wheel.inContact) return;
        if(wheel.brake !== 0) {
// console.log("brake!!")
            let vec = this.body.getLinearVelocity();
            // 質量(暫定で１)で割って、係数：ブレーキ（最大）をかけ、逆向き(-1)にする
            vec.scaleInPlace(-wheel.brakeForce)
// console.log("brake!!", [vec.x, vec.y, vec.z], wheel, wheel.brakeForce);
// console.log("brake!!", [vec.x, vec.y, vec.z]);

            // // // ホイールの前方向ベクトルをワールド空間に変換
            // // const forwardDirectionWorld = BABYLON.Vector3.TransformNormalToRef(
            // //     wheel.forwardAxisLocal,
            // //     wheel.transform.getWorldMatrix(),
            // //     this.tmp1
            // // ).scaleInPlace(-wheel.brakeForce); // ブレーキなので逆方向
            // 力を接地点に適用
            this.body.applyForce(vec, this.tmp2.copyFrom(wheel.hitPoint));
        }
    }

    
    updateWheelRotation(wheel){
        //chatGPT
        // - ホイールの視覚的回転（タイヤが回る）を更新する処理。
        //   - wheel.rotation += this.speed * wheel.rotationMultiplier * wheel.radius：speed（ローカルZ）に
        //     比例して回転量を増やす。
        //     rotationMultiplier は調整係数、radius を掛けている点は実装上の選択
        //     （本来は速度/半径に比例する角速度に integrate するのが自然）。
        //   - 軸（wheel.axleAxisLocal）回りにクォータニオンを作り
        //     wheel.transform.rotationQuaternion に掛け合わせて回転を反映。
        //
        // - 視覚用なので物理には直接影響しない
        //   （ただし wheel.transform を用いて forward/axle 方向を算出している箇所があるため、見た目の回転が後続のベクトル計算に影響する可能性あり）。

        wheel.rotation += this.speed*wheel.rotationMultiplier*wheel.radius
        Quaternion.RotationAxisToRef(wheel.axleAxisLocal, wheel.rotation, this.tmpq1)
        wheel.transform.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
        wheel.transform.rotationQuaternion.normalize()
    }
    
    updateWheelTransformPosition(wheel){
        // chatPGT
        // - wheel.transform の位置（視覚表示位置）を更新：
        //   - ホイール中心 = ホイール取り付け位置（positionWorld） + サスペンション軸方向に hitDistance - radius だけ移動。
        //   - hitDistance が路面までの距離。hitDistance - radius によって
        //     タイヤの表面が路面に触れている位置を補正してタイヤが道路面にぴったり乗るように見せる。

        wheel.transform.position.copyFrom(wheel.positionWorld)
        wheel.transform.position.addInPlace(wheel.suspensionAxisWorld.scale(wheel.hitDistance-wheel.radius))
    }
    
    // ひっくり返っても戻る挙動
    updateVehiclePredictiveLanding(){
        // chatGPT
        // 目的：空中にいる間に次フレーム（複数フレーム先）でどこに着地するか予測し、
        //       着地時の角速度をあらかじめ補正して「滑らかに着地できるよう」車体の姿勢を調整する処理。
        // 処理の流れ：
        // 1. if(this.nWheelsOnGround > 0) return — いずれかのホイールが接地しているなら実行しない（空中時のみ）。
        // 2. 基本物理式で 予測位置 を算出：
        //   - predictTime = numberOfFramesToPredict * timestep
        //   - predictedPosition = position + velocity * predictTime + 0.5 * gravity * predictTime^2
        // 3. this.physicsEngine.raycastToRef(position, predictedPosition, raycastResult) で移動中に地面と当たるか調べる。
        // 4. ヒットした場合：
        //   - 車体の線速度（正規化）を velocity；
        //   - direction = hitPoint - position を計算し、各軸ごとに displacement.axis = direction.axis / velocity.axis
        //     （速度が0のときは0）として「その速度成分で到達するまでのフレーム数相当」を推定（※この部分の実装はやや粗い）。
        //   - nFrames = displacement.length() としてフレーム数を長さでとる（ベクトル長を使うのは経験的な手法）。
        //   - R1 = 現在の車体の上向き（ローカルY をワールド化したもの）、R2 = 路面法線（ヒット法線）。
        // rotationDifference = cross(R1, R2)（回転軸ベクトル）を算出。
        //   - timeStepDuration = frameTime * nFrames → その期間に必要な角速度
        //     predictedAngularVelocity = rotationDifference / timeStepDuration を作る。
        //   - 現在の角速度と predictedAngularVelocity の間を Vector3.Lerp（predictionRatio）で補間して
        //     this.body.setAngularVelocity(...) をセットする。
        // 5. 効果：空中で「自動的に着地姿勢を整える」よう角速度を付与し、ガクッと横転するような激しい衝突を緩和する。
        //
        // 注意点（実装上）：
        // - displacement の求め方は軸ごとの比を取り、それを length() して nFrames としているため、物理的に正確、というより経験則的な近似。
        // - velocity.normalize() しているが、その後で direction.x / velocity.x をしている — 速度が正規化されていることで
        //   値は意味が変わる（ゼロ除算対策も必要）。実装は誤差を生みやすいので注意。

        if(this.nWheelsOnGround > 0) return
        const position = this.body.transformNode.position
        const gravity = this.tmp1.copyFrom(this.physicsEngine.gravity).scaleInPlace(this.body.getGravityFactor())
        const frameTime = this.scene.getPhysicsEngine().getTimeStep()
        const predictTime = this.numberOfFramesToPredict*frameTime
        
        const predictedPosition = this.tmp2
        predictedPosition.copyFrom(this.body.getLinearVelocity()).scaleInPlace(predictTime)
        predictedPosition.addInPlace(gravity.scaleInPlace(0.5*predictTime*predictTime))
        predictedPosition.addInPlace(this.body.transformNode.position)
        
        this.physicsEngine.raycastToRef(position, predictedPosition, raycastResult);
        
        if (raycastResult.hasHit) {
            const velocity = this.body.getLinearVelocity().normalize()
            const direction = raycastResult.hitPointWorld.subtractToRef(position, this.tmp1)
            const displacement = this.tmp2
            displacement.x = velocity.x==0?0:direction.x/velocity.x
            displacement.y = velocity.y==0?0:direction.y/velocity.y
            displacement.z = velocity.z==0?0:direction.z/velocity.z
            const nFrames = displacement.length()
            const R1 = Vector3.TransformNormalToRef(Axis.Y, this.body.transformNode.getWorldMatrix(), this.tmp1)
            const R2 = raycastResult.hitNormalWorld
            const rotationDifference = Vector3.CrossToRef(R1, R2, this.tmp2)
            const timeStepDuration = frameTime*nFrames
            const predictedAngularVelocity = rotationDifference.scaleToRef(1 / timeStepDuration, this.tmp2)

            this.body.setAngularVelocity(Vector3.LerpToRef(this.body.getAngularVelocity(),
                                                           predictedAngularVelocity,
                                                           this.predictionRatio,
                                                           this.tmp1))
        }
        
    }


    doResetPosture() {
        this._resetPosture = 1

        // 真上にジャンプさせる
        // this.body.applyForce( new BABYLON.Vector3(0, 4000, 0), this.body.transformNode.absolutePosition)
        this.body.applyImpulse( new BABYLON.Vector3(0, this.resetApplyImp, 0), this.body.transformNode.absolutePosition)

    }

    onResetPosture() {
        if (this.nWheelsOnGround == this.wheels.length) {
            // すべてが接地している
            this._resetPosture = 0
            return;
        }
        this.updateVehiclePredictiveLanding()
    }

    update(){
        // chatGPT
        // 1. this.body.transformNode.computeWorldMatrix(true) — シャーシのワールド行列を更新。
        // 2. this.nWheelsOnGround = 0 にリセット。
        // 3. updateVehicleSpeed() を呼ぶ。
        // 4. 各ホイールに対して順に：
        //   - updateWheelTransform
        //   - updateWheelSteering
        //   - updateWheelRaycast
        //   - updateWheelSuspension
        //   - updateWheelForce
        //   - updateWheelSideForce
        //   - updateWheelTransformPosition
        //   - updateWheelRotation
        // 5. updateVehiclePredictiveLanding()（空中時の着地予測）
        // 6. アンチロール軸（this.antiRollAxles）をループして左右のホイールの圧縮差から左右に等反対の力を加えることで転倒（ロール）を抑える。
        //
        // アンチロールの計算詳細：
        // - 2輪（wheelA, wheelB）を取り、圧縮差 compressionDifference = wheelOrder[1].suspensionLength - wheelOrder[0].suspensionLength を計算。
        // - 圧縮差の割合（compressionRatio = min(compressionDifference, maxCompressionRestLength) / maxCompressionRestLength）に axle.force を掛けて反対方向の力を左右に適用。
        // - これにより片側が強く沈むと反対側に上向きの力がかかりロールを抑制する簡易アンチロール効果を出しています。

        this.body.transformNode.computeWorldMatrix(true)
        this.nWheelsOnGround = 0
        this.updateVehicleSpeed()
        
        this.wheels.forEach((wheel, index) => {
            this.updateWheelTransform(wheel)
            this.updateWheelSteering(wheel)
            this.updateWheelRaycast(wheel)
            this.updateWheelSuspension(wheel)
            this.updateWheelForce(wheel)
            this.updateWheelBrake(wheel)
            this.updateWheelSideForce(wheel)
            this.updateWheelTransformPosition(wheel)
            this.updateWheelRotation(wheel)
        })

        // ひっくり返っても戻る挙動
        // this.updateVehiclePredictiveLanding()
        if (this._resetPosture) {
            this.onResetPosture()
        }
        
        // this.antiRollAxles.forEach(axle => {
        //     const wheelA = this.wheels[axle.wheelA]
        //     const wheelB = this.wheels[axle.wheelB]
        //     if(!wheelA || !wheelB) return
        //     if(!wheelA.inContact && !wheelB.inContact) return
        //     const wheelOrder = wheelA.suspensionLength <= wheelB.suspensionLength ? [wheelA, wheelB] : [wheelB, wheelA]
        //     const maxCompressionRestLength = (wheelA.suspensionRestLength+wheelB.suspensionRestLength)/2
        //     const compressionDifference = wheelOrder[1].suspensionLength-wheelOrder[0].suspensionLength
        //     const compressionRatio = Math.min(compressionDifference,maxCompressionRestLength)/maxCompressionRestLength
        //     const antiRollForce = this.tmp1.copyFrom(wheelOrder[0].suspensionAxisWorld).scaleInPlace(axle.force*compressionRatio)
        //     this.body.applyForce(
        //         antiRollForce, 
        //         wheelOrder[0].positionWorld
        //     )
        //     antiRollForce.copyFrom(wheelOrder[1].suspensionAxisWorld).negateInPlace().scaleInPlace(axle.force*compressionRatio)
        //     this.body.applyForce(
        //         antiRollForce, 
        //         wheelOrder[1].positionWorld
        //     )
        // })
        
    }
}


export class RaycastWheel{
    upAxisLocal = new Vector3(0,1,0)
    rightAxisLocal = new Vector3(1,0,0)

    forwardAxisLocal = Vector3.Cross(this.upAxisLocal, this.rightAxisLocal);


    constructor(options){
       
        this.forwardAxisLocal.normalize();
        this.rightAxisLocal.normalize();

        // - positionWorld：取り付け位置（ローカルおよびワールド）
        this.positionLocal = options.positionLocal.clone()
        this.positionWorld = options.positionLocal.clone()

        // - suspensionAxisWorld：サスペンション軸（上方向）
        this.suspensionAxisLocal = options.suspensionAxisLocal.clone()
        this.suspensionAxisWorld = this.suspensionAxisLocal.clone()

        // - ホイールのヨー軸（左右に回転する軸）
        this.axleAxisLocal = options.axleAxisLocal.clone()

        // - ホイールの前方向（駆動方向）
        this.forwardAxisLocal = options.forwardAxisLocal.clone()

        // - sideForce, sideForcePositionRatio：横力関連パラメータ
        this.sideForce = options.sideForce || 40
        this.sideForcePositionRatio = options.sideForcePositionRatio || 0.1

        // - radius, suspensionRestLength, suspensionForce, suspensionDamping：物理パラメータ
        this.radius = options.radius || 0.2
        this.suspensionRestLength = options.suspensionRestLength || 0.5
        this.prevSuspensionLength = this.suspensionRestLength
        this.suspensionLength = this.suspensionRestLength
        this.suspensionForce = options.suspensionForce || 15000
        this.suspensionDamping = options.suspensionDamping || 0.1
        this.rotationMultiplier = options.rotationMultiplier || 0.1

        // - hitDistance, hitNormal, hitPoint, inContact：レイキャストの結果を持つ
        this.hitDistance = 0
        this.hitNormal = new Vector3()
        this.hitPoint = new Vector3()
        this.inContact = false
        
        // - steering, rotation, force, brake：時系列で変化する入力
        this.steering = 0
        this.rotation = 0
        this.force = 0; // engineForce
        this.brake = 0;
        this.brakeForce = typeof(options.brakeForce)!=='undefined' ?  options.brakeForce : 500;
//console.log("this.brakeForce=", this.brakeForce, "  opt=", options.brakeForce);

        // - transform：視覚用の TransformNode（回転クォータニオンを保持）
        this.transform = new TransformNode("WheelTransform")
        this.transform.rotationQuaternion = new Quaternion()
    }
}

const getBodyVelocityAtPoint = (body, point) => {
    // chatGPT
    // - その点における速度 = 並進速度 + 回転による線速度（ω × r）。
    //   ただしコード内に冗長な Vector3.Cross(angularVelocity, r) の呼び出しがあり、
    //   １回目の呼び出しは結果が使われていない（不要）。2回目で res に代入し並進速度を加えて返している。
    //

    const r = point.subtract(body.transformNode.position)
    const angularVelocity = body.getAngularVelocity()
    const res = Vector3.Cross(angularVelocity, r)
    const velocity = body.getLinearVelocity()
    res.addInPlace(velocity)
    return res;
}

// clampNumber(num, a, b) / lerp
// - 単純ユーティリティ。
//   clampNumber は num を [min(a,b), max(a,b)] の範囲にクリップする。
const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

// (x,y)において yよりの比率aの値を返す
const lerp = (x, y, a) => x * (1 - a) + y * a;
