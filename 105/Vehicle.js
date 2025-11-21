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


const { Scene, FreeCamera, Vector3, Quaternion, MeshBuilder, KeyboardEventTypes, Color3, TransformNode, FollowCamera, HemisphericLight, Animation, SceneLoader, HavokPlugin, Axis, Space } = BABYLON
const { PhysicsShapeMesh, PhysicsMotionType, PhysicsBody, PhysicsShapeConvexHull, PhysicsRaycastResult } = BABYLON
const { GridMaterial } = BABYLON

const raycastResult = new PhysicsRaycastResult();

export class RaycastVehicle{
    tmp1 = new Vector3()
    tmpq1 = new Quaternion()
    tmp2 = new Vector3()
    constructor(body, scene){
        this.body = body
        this.scene = scene
        this.physicsEngine = body._physicsEngine
        this.wheels = []
        this.numberOfFramesToPredict = 60
        this.predictionRatio = 0.6
        this.nWheelsOnGround = 0
        this.speed = 0
        this.antiRollAxles = []
    }

    addWheel(wheel){
        this.wheels.push(wheel)
    }
    
    removeWheel(wheel, index){
        if(index) this.wheels.splice(index, 1)
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
        Vector3.TransformCoordinatesToRef(wheel.positionLocal, this.body.transformNode.getWorldMatrix(), wheel.positionWorld)
        Vector3.TransformNormalToRef(wheel.suspensionAxisLocal, this.body.transformNode.getWorldMatrix(), wheel.suspensionAxisWorld)
    }
    
    updateVehicleSpeed(){
        Vector3.TransformNormalToRef(this.body.getLinearVelocity(), this.body.transformNode.getWorldMatrix().clone().invert(), this.tmp1)
        this.speed = this.tmp1.z
    }
    
    updateWheelSteering(wheel){
        Quaternion.RotationAxisToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), wheel.steering, this.tmpq1)
        this.body.transformNode.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
        wheel.transform.rotationQuaternion.normalize()
        wheel.transform.computeWorldMatrix(true)
    }
    
    updateWheelRaycast(wheel){
        this.tmp1.copyFrom(wheel.suspensionAxisWorld).scaleInPlace(wheel.suspensionRestLength).addInPlace(wheel.positionWorld)
        const rayStart = wheel.positionWorld
        const rayEnd = this.tmp1
        this.physicsEngine.raycastToRef(rayStart, rayEnd, raycastResult)
        if(!raycastResult.hasHit){
            wheel.inContact = false
            return
        }
        wheel.hitBody = raycastResult.body
        wheel.hitPoint.copyFrom(raycastResult.hitPointWorld)
        wheel.hitNormal.copyFrom(raycastResult.hitNormalWorld)
        wheel.hitDistance = raycastResult.hitDistance
        wheel.inContact = true
        this.nWheelsOnGround++
    }
    
    updateWheelSuspension(wheel){
        if(!wheel.inContact){
            wheel.prevSuspensionLength = wheel.suspensionLength
            wheel.hitDistance = wheel.suspensionRestLength
            return
        }
        
        let force = 0.0
        wheel.suspensionLength = wheel.suspensionRestLength - wheel.hitDistance
        wheel.suspensionLength = clampNumber(wheel.suspensionLength, 0, wheel.suspensionRestLength);
        const compressionRatio = wheel.suspensionLength / wheel.suspensionRestLength;

        const compressionForce = wheel.suspensionForce * compressionRatio;
        force += compressionForce;

        const rate = (wheel.prevSuspensionLength - wheel.suspensionLength) / this.scene.getPhysicsEngine().getTimeStep()
        wheel.prevSuspensionLength = wheel.suspensionLength;

        const dampingForce = rate * wheel.suspensionForce * wheel.suspensionDamping
        force -= dampingForce;

        const suspensionForce = Vector3.TransformNormalToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), this.body.transformNode.getWorldMatrix(), this.tmp1).scaleInPlace(force)

        this.body.applyForce(suspensionForce, wheel.hitPoint)
    }
    
    updateWheelSideForce(wheel){
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
        if(!wheel.inContact) return
        if(wheel.force !== 0){
            const forwardDirectionWorld = Vector3.TransformNormalToRef(wheel.forwardAxisLocal, wheel.transform.getWorldMatrix(), this.tmp1).scaleInPlace(wheel.force)
            this.body.applyForce(forwardDirectionWorld, this.tmp2.copyFrom(wheel.hitPoint))
        }
    }
    
    updateWheelRotation(wheel){
        wheel.rotation += this.speed*wheel.rotationMultiplier*wheel.radius
        Quaternion.RotationAxisToRef(wheel.axleAxisLocal, wheel.rotation, this.tmpq1)
        wheel.transform.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
        wheel.transform.rotationQuaternion.normalize()
    }
    
    updateWheelTransformPosition(wheel){
        wheel.transform.position.copyFrom(wheel.positionWorld)
        wheel.transform.position.addInPlace(wheel.suspensionAxisWorld.scale(wheel.hitDistance-wheel.radius))
    }
    
    updateVehiclePredictiveLanding(){
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


    update(){
        this.body.transformNode.computeWorldMatrix(true)
        this.nWheelsOnGround = 0
        this.updateVehicleSpeed()
        
        this.wheels.forEach((wheel, index) => {
            this.updateWheelTransform(wheel)
            this.updateWheelSteering(wheel)
            this.updateWheelRaycast(wheel)
            this.updateWheelSuspension(wheel)
            this.updateWheelForce(wheel)
            this.updateWheelSideForce(wheel)
            this.updateWheelTransformPosition(wheel)
            this.updateWheelRotation(wheel)
        })
        
        this.updateVehiclePredictiveLanding()
        
        this.antiRollAxles.forEach(axle => {
            const wheelA = this.wheels[axle.wheelA]
            const wheelB = this.wheels[axle.wheelB]
            if(!wheelA || !wheelB) return
            if(!wheelA.inContact && !wheelB.inContact) return
            const wheelOrder = wheelA.suspensionLength <= wheelB.suspensionLength ? [wheelA, wheelB] : [wheelB, wheelA]
            const maxCompressionRestLength = (wheelA.suspensionRestLength+wheelB.suspensionRestLength)/2
            const compressionDifference = wheelOrder[1].suspensionLength-wheelOrder[0].suspensionLength
            const compressionRatio = Math.min(compressionDifference,maxCompressionRestLength)/maxCompressionRestLength
            
            const antiRollForce = this.tmp1.copyFrom(wheelOrder[0].suspensionAxisWorld).scaleInPlace(axle.force*compressionRatio)
            this.body.applyForce(
                antiRollForce, 
                wheelOrder[0].positionWorld
            )
            antiRollForce.copyFrom(wheelOrder[1].suspensionAxisWorld).negateInPlace().scaleInPlace(axle.force*compressionRatio)
            this.body.applyForce(
                antiRollForce, 
                wheelOrder[1].positionWorld
            )
        })
        
    }
}


export class RaycastWheel{
    upAxisLocal = new Vector3(0,1,0)
    rightAxisLocal = new Vector3(1,0,0)

    forwardAxisLocal = Vector3.Cross(this.upAxisLocal, this.rightAxisLocal);


    constructor(options){
        this.forwardAxisLocal.normalize();
        this.rightAxisLocal.normalize();
        this.positionLocal = options.positionLocal.clone()
        this.positionWorld = options.positionLocal.clone()
        this.suspensionAxisLocal = options.suspensionAxisLocal.clone()
        this.suspensionAxisWorld = this.suspensionAxisLocal.clone()
        this.axleAxisLocal = options.axleAxisLocal.clone()
        this.forwardAxisLocal = options.forwardAxisLocal.clone()
        this.sideForce = options.sideForce || 40
        this.sideForcePositionRatio = options.sideForcePositionRatio || 0.1
        this.radius = options.radius || 0.2
        this.suspensionRestLength = options.suspensionRestLength || 0.5
        this.prevSuspensionLength = this.suspensionRestLength
        this.suspensionLength = this.suspensionRestLength
        this.suspensionForce = options.suspensionForce || 15000
        this.suspensionDamping = options.suspensionDamping || 0.1
        this.rotationMultiplier = options.rotationMultiplier || 0.1
        this.hitDistance = 0
        this.hitNormal = new Vector3()
        this.hitPoint = new Vector3()
        this.inContact = false
        
        this.steering = 0
        this.rotation = 0
        this.force = 0

        this.transform = new TransformNode("WheelTransform")
        this.transform.rotationQuaternion = new Quaternion()
    }
}

const getBodyVelocityAtPoint = (body, point) => {
    const r = point.subtract(body.transformNode.position)
    const angularVelocity = body.getAngularVelocity()
    Vector3.Cross(angularVelocity, r)
    const res = Vector3.Cross(angularVelocity, r)
    const velocity = body.getLinearVelocity()
    res.addInPlace(velocity)
    return res;
}

const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));
const lerp = (x, y, a) => x * (1 - a) + y * a;


/*

chatGPT

下記のソースコードはbabylonjs で書かれたプログラムです。
raycast を使った vehicle の示しています。
こちらのプログラムについて各処理の説明を詳細におこなってください。

--------------------------------------------------


## 概要

提示されたコードは Babylon.js（＋物理プラグインを想定）で「レイキャストによる車両（Raycast Vehicle）」を自前で実装したものです。
物理ボディ（this.body、シャーシ）に対して、各ホイールごとにレイキャストで路面接触判定を行い、サスペンション力・横（スリップ）力・駆動力・アンチロール力などを物理ボディに applyForce して車両挙動を再現します。RaycastVehicle が全体制御、RaycastWheel がホイール単位のデータと可視 Transform を持ちます。

以下、メソッド／処理ごとに順を追って詳細に説明します。

----------------------------------------

## 共通フィールド（重要変数）の説明

- this.body
  - 車両の物理ボディ（シャーシ）。transformNode を持ち、getLinearVelocity() / getAngularVelocity() / applyForce() 等の物理 API を呼ぶ対象。

- this.scene / this.physicsEngine
  - Babylon の Scene と物理エンジンの参照（body._physicsEngine）。

- this.wheels
  - 登録された RaycastWheel オブジェクトの配列。

- this.numberOfFramesToPredict / this.predictionRatio
  - 「着地予測（predictive landing）」に使うフレーム数と、予測角速度へ補間する割合。

- this.nWheelsOnGround / this.speed
  - フレーム毎に計算される接地ホイール数と車体の速度（ローカルZ成分らしい）。

- this.antiRollAxles
  - アンチロール用の軸情報（左右ホイールインデックスと力の係数などを格納すると想定）。

- tmp1, tmp2, tmpq1（テンポラリ）
  - ベクトル／クォータニオンの再利用用。毎フレーム多数の一時計算で new を避けるために保持している。

- raycastResult（モジュールスコープ）
  - PhysicsRaycastResult を一つ作って再利用している。複数の並列レイを同時に扱わない前提。

----------------------------------------


## 主要メソッドの詳細

addWheel(wheel) / removeWheel(wheel, index) / anti-roll の add/remove

- 単純に配列を編集。remove は指定 index が渡された場合にその index を優先で削除し、なければ indexOf で一致を探して削除しています（少し冗長な実装）。

```
Vector3.TransformCoordinatesToRef(wheel.positionLocal, this.body.transformNode.getWorldMatrix(), wheel.positionWorld)
Vector3.TransformNormalToRef(wheel.suspensionAxisLocal, this.body.transformNode.getWorldMatrix(), wheel.suspensionAxisWorld)
```

- ホイールのローカル座標（positionLocal）とサスペンション軸（suspensionAxisLocal）を車体（シャーシ）のワールドマトリクスで変換して、ワールド空間でのホイール位置（positionWorld） と サスペンション方向（suspensionAxisWorld） を得ます。

- TransformCoordinatesToRef は位置変換（平行移動含む）、TransformNormalToRef は回転のみ（平行移動は無視）です。

------------------------------

updateVehicleSpeed()

```
Vector3.TransformNormalToRef(this.body.getLinearVelocity(), this.body.transformNode.getWorldMatrix().clone().invert(), this.tmp1)
this.speed = this.tmp1.z
```

- シャーシの 線形速度をワールド→ローカル座標系 に変換して、そのローカルZ成分を speed にセットしています。
  - ここでの仮定：ローカルZ が前後（進行方向）であるため z を速度として採用。
  - 注意点：getWorldMatrix().clone().invert() を毎回 clone＋invert している点はコスト的に重い（最適化余地あり）。

------------------------------

updateWheelSteering(wheel)

```
Quaternion.RotationAxisToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), wheel.steering, this.tmpq1)
this.body.transformNode.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
wheel.transform.rotationQuaternion.normalize()
wheel.transform.computeWorldMatrix(true)
```

- ホイールの見た目（wheel.transform）に ステアリング角度（wheel.steering：ラジアン） を反映する処理。
  - wheel.suspensionAxisLocal.negate() を回転軸としてクォータニオンを作り（RotationAxisToRef）、シャーシ回転（this.body.transformNode.rotationQuaternion）と掛け合わせてホイールの最終回転を作る。
  - つまりホイールの回転基準は「シャーシ回転 × ステアリング回転」。

- computeWorldMatrix(true) で wheel.transform のワールドマトリクスを更新（後続の TransformNormalToRef 等で使うため）。


------------------------------
updateWheelRaycast(wheel)

```
this.tmp1.copyFrom(wheel.suspensionAxisWorld).scaleInPlace(wheel.suspensionRestLength).addInPlace(wheel.positionWorld)
const rayStart = wheel.positionWorld
const rayEnd = this.tmp1
this.physicsEngine.raycastToRef(rayStart, rayEnd, raycastResult)
```

- レイキャストで路面接触を調べる。レイの始点はホイール位置、終点は「サスペンションが伸び切った先」（position + suspensionAxis * restLength）。

- raycastResult を参照してヒットしているか hasHit を見て分岐：

  - ヒットしなければ inContact=false。
  - ヒットしたら hitBody, hitPoint, hitNormal, hitDistance を更新し inContact=true、さらに this.nWheelsOnGround++。（フレーム内で接地本数をカウント）

- 重要：raycastResult を 使い回し しているため、同一フレーム内で別処理が同じオブジェクトを参照しないことが前提。並列レイやマルチヒットを扱う場合は注意。

------------------------------

updateWheelSuspension(wheel)

```
if(!wheel.inContact){ ... }

wheel.suspensionLength = wheel.suspensionRestLength - wheel.hitDistance
wheel.suspensionLength = clampNumber(...)
const compressionRatio = wheel.suspensionLength / wheel.suspensionRestLength

const compressionForce = wheel.suspensionForce * compressionRatio

const rate = (wheel.prevSuspensionLength - wheel.suspensionLength) / timestep
const dampingForce = rate * wheel.suspensionForce * wheel.suspensionDamping

force = compressionForce - dampingForce

const suspensionForce = TransformNormalToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), this.body.worldMatrix, this.tmp1).scaleInPlace(force)
this.body.applyForce(suspensionForce, wheel.hitPoint)
```

- レイがヒットしている場合にサスペンション力を計算し applyForce するメソッド。
  - suspensionLength = ばねの現在の圧縮量（rest - hitDistance）。
  - compressionForce = suspensionForce * compressionRatio（ばねの剛性に相当、線形モデル）。
  - rate（変位速度）を計算してから dampingForce を算出（ダンパー）。force -= dampingForce として減衰を引く。
  - 最終的に力ベクトルはサスペンション軸（ワールド化して逆向き）に沿ったスケールとなり、力の作用点はヒットポイント（wheel.hitPoint）に適用される。

- 物理的意味：ホイールが路面に押し付けられる力をシャーシに返す（等価にシャーシを上向きに押す）。

------------------------------

updateWheelSideForce(wheel)

```
if(!wheel.inContact) return
const tireWorldVel = getBodyVelocityAtPoint(this.body, wheel.positionWorld)
const steeringDir = TransformNormalToRef(wheel.axleAxisLocal, wheel.transform.getWorldMatrix(), this.tmp1)
const steeringVel = Vector3.Dot(steeringDir, tireWorldVel)
const desiredVelChange = -steeringVel
const desiredAccel = desiredVelChange / timestep
this.body.applyForce(steeringDir.scaleInPlace(wheel.sideForce * desiredAccel), Vec3.LerpToRef(wheel.hitPoint, wheel.positionWorld, wheel.sideForcePositionRatio, this.tmp2))
```

- ホイール横方向（アクスル軸方向、横滑りを抑える方向）で ホイール接地点の速度を減らすための力 を計算して適用しています。目的はタイヤが地面に対して滑るのを抑え、横向きの速度（横滑り）を減速させること。
  - getBodyVelocityAtPoint(body, wheel.positionWorld) はその点の線速度（並進 + 回転による速度）を返す。
  - steeringDir（ホイールの横向き方向）に沿った速度成分 steeringVel を計算し、それをゼロにしようとするための所望の加速度 desiredAccel = -steeringVel / dt を得る。
  - wheel.sideForce * desiredAccel をその方向に掛け、回転中心から少し引いた位置（Lerp(hitPoint, positionWorld, sideForcePositionRatio)）に力を加えることでトルクも発生させて横滑りを抑える設計。

- 実用面：
  - sideForce が高いほど横滑りに強い。
  - 作用点がヒットポイント寄りか車体寄りかでロールやヨのトルク挙動が変わる。

------------------------------

updateWheelForce(wheel)

```
if(!wheel.inContact) return
if(wheel.force !== 0){
  const forwardDirectionWorld = TransformNormalToRef(wheel.forwardAxisLocal, wheel.transform.getWorldMatrix(), this.tmp1).scaleInPlace(wheel.force)
  this.body.applyForce(forwardDirectionWorld, this.tmp2.copyFrom(wheel.hitPoint))
}
```

- 駆動力（アクセル）／制動力をホイールの前方向に沿って直接シャーシに力として加える処理。
  - wheel.force は正なら前進、負ならブレーキ逆向き（実装次第）。

- 実際の車輪摩擦モデル（トラクション限界・スリップ比）を再現していない簡易実装。

------------------------------

updateWheelRotation(wheel)

```
wheel.rotation += this.speed*wheel.rotationMultiplier*wheel.radius
Quaternion.RotationAxisToRef(wheel.axleAxisLocal, wheel.rotation, this.tmpq1)
wheel.transform.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
wheel.transform.rotationQuaternion.normalize()
```

- ホイールの視覚的回転（タイヤが回る）を更新する処理。
  - wheel.rotation += this.speed * wheel.rotationMultiplier * wheel.radius：speed（ローカルZ）に比例して回転量を増やす。rotationMultiplier は調整係数、radius を掛けている点は実装上の選択（本来は速度/半径に比例する角速度に integrate するのが自然）。
  - 軸（wheel.axleAxisLocal）回りにクォータニオンを作り wheel.transform.rotationQuaternion に掛け合わせて回転を反映。

- 視覚用なので物理には直接影響しない（ただし wheel.transform を用いて forward/axle 方向を算出している箇所があるため、見た目の回転が後続のベクトル計算に影響する可能性あり）。


------------------------------

updateWheelTransformPosition(wheel)

```
wheel.transform.position.copyFrom(wheel.positionWorld)
wheel.transform.position.addInPlace(wheel.suspensionAxisWorld.scale(wheel.hitDistance-wheel.radius))
```

- wheel.transform の位置（視覚表示位置）を更新：
  - ホイール中心 = ホイール取り付け位置（positionWorld） + サスペンション軸方向に hitDistance - radius だけ移動。
  - hitDistance が路面までの距離。hitDistance - radius によって タイヤの表面が路面に触れている位置を補正してタイヤが道路面にぴったり乗るように見せる。

------------------------------

updateVehiclePredictiveLanding()

目的：空中にいる間に次フレーム（複数フレーム先）でどこに着地するか予測し、着地時の角速度をあらかじめ補正して「滑らかに着地できるよう」車体の姿勢を調整する処理。

処理の流れ：

1. if(this.nWheelsOnGround > 0) return — いずれかのホイールが接地しているなら実行しない（空中時のみ）。

2. 基本物理式で 予測位置 を算出：
  - predictTime = numberOfFramesToPredict * timestep
  - predictedPosition = position + velocity * predictTime + 0.5 * gravity * predictTime^2

3. this.physicsEngine.raycastToRef(position, predictedPosition, raycastResult) で移動中に地面と当たるか調べる。

4. ヒットした場合：
  - 車体の線速度（正規化）を velocity；
  - direction = hitPoint - position を計算し、各軸ごとに displacement.axis = direction.axis / velocity.axis（速度が0のときは0）として「その速度成分で到達するまでのフレーム数相当」を推定（※この部分の実装はやや粗い）。
  - nFrames = displacement.length() としてフレーム数を長さでとる（ベクトル長を使うのは経験的な手法）。
  - R1 = 現在の車体の上向き（ローカルY をワールド化したもの）、R2 = 路面法線（ヒット法線）。
rotationDifference = cross(R1, R2)（回転軸ベクトル）を算出。
  - timeStepDuration = frameTime * nFrames → その期間に必要な角速度 predictedAngularVelocity = rotationDifference / timeStepDuration を作る。
  - 現在の角速度と predictedAngularVelocity の間を Vector3.Lerp（predictionRatio）で補間して this.body.setAngularVelocity(...) をセットする。

5. 効果：空中で「自動的に着地姿勢を整える」よう角速度を付与し、ガクッと横転するような激しい衝突を緩和する。

注意点（実装上）：

- displacement の求め方は軸ごとの比を取り、それを length() して nFrames としているため、物理的に正確、というより経験則的な近似。

- velocity.normalize() しているが、その後で direction.x / velocity.x をしている — 速度が正規化されていることで値は意味が変わる（ゼロ除算対策も必要）。実装は誤差を生みやすいので注意。

------------------------------

update()（1フレームの更新）

1. this.body.transformNode.computeWorldMatrix(true) — シャーシのワールド行列を更新。

2. this.nWheelsOnGround = 0 にリセット。

3. updateVehicleSpeed() を呼ぶ。

4. 各ホイールに対して順に：
  - updateWheelTransform
  - updateWheelSteering
  - updateWheelRaycast
  - updateWheelSuspension
  - updateWheelForce
  - updateWheelSideForce
  - updateWheelTransformPosition
  - updateWheelRotation

5. updateVehiclePredictiveLanding()（空中時の着地予測）

6. アンチロール軸（this.antiRollAxles）をループして左右のホイールの圧縮差から左右に等反対の力を加えることで転倒（ロール）を抑える。

アンチロールの計算詳細：

- 2輪（wheelA, wheelB）を取り、圧縮差 compressionDifference = wheelOrder[1].suspensionLength - wheelOrder[0].suspensionLength を計算。

- 圧縮差の割合（compressionRatio = min(compressionDifference, maxCompressionRestLength) / maxCompressionRestLength）に axle.force を掛けて反対方向の力を左右に適用。

- これにより片側が強く沈むと反対側に上向きの力がかかりロールを抑制する簡易アンチロール効果を出しています。

##################################################

RaycastWheel クラス（ホイール定義）

主なプロパティ：

- positionLocal / positionWorld：取り付け位置（ローカルおよびワールド）
- suspensionAxisLocal / suspensionAxisWorld：サスペンション軸（上方向）
- axleAxisLocal：ホイールのヨー軸（左右に回転する軸）
- forwardAxisLocal：ホイールの前方向（駆動方向）
- radius, suspensionRestLength, suspensionForce, suspensionDamping：物理パラメータ
- sideForce, sideForcePositionRatio：横力関連パラメータ
- steering, rotation, force：時系列で変化する入力
- hitDistance, hitNormal, hitPoint, inContact：レイキャストの結果を持つ
- transform：視覚用の TransformNode（回転クォータニオンを保持）

constructor(options) で options から必要値をコピーして初期化します。

------------------------------

ヘルパー関数

getBodyVelocityAtPoint(body, point)

```
const r = point.subtract(body.transformNode.position)
const angularVelocity = body.getAngularVelocity()
Vector3.Cross(angularVelocity, r)
const res = Vector3.Cross(angularVelocity, r)
const velocity = body.getLinearVelocity()
res.addInPlace(velocity)
return res;
```

- その点における速度 = 並進速度 + 回転による線速度（ω × r）。ただしコード内に冗長な Vector3.Cross(angularVelocity, r) の呼び出しがあり、１回目の呼び出しは結果が使われていない（不要）。2回目で res に代入し並進速度を加えて返している。

clampNumber(num, a, b) / lerp

- 単純ユーティリティ。clampNumber は num を [min(a,b), max(a,b)] の範囲にクリップする。

============================================================

## 実装上の注意点・潜在的なバグ（改善提案）

1. raycastResult の共有
  - グローバルな1インスタンスを使い回している。単一スレッド環境なら問題ないが、将来的に同時に複数レイを扱うなら別インスタンス化が必要。

2. getBodyVelocityAtPoint の冗長な Vector3.Cross 呼び出し
  - 一度目の Vector3.Cross(angularVelocity, r) の戻り値を捨てている。不要なので削るべき。

3. ワールド→ローカル変換のコスト
  - updateVehicleSpeed() で getWorldMatrix().clone().invert() を毎回行っている。computeWorldMatrix() の直後に一度だけ逆行列を計算して使い回す方が速い。

4. updateVehiclePredictiveLanding() の velocity 正規化の矛盾
  - const velocity = this.body.getLinearVelocity().normalize() としているが、その後 direction.x / velocity.x をやる設計は数学的に破綻しやすい（速度が 0 だと厳しい、正規化すると大幅に値域が変わる）。正確さを求めるなら正規化しない元の速度ベクトルを使うべき。

5. updateWheelRotation の物理的不整合
  - 見た目の回転を this.speed * rotationMultiplier * radius としているが、正しくは 角速度 = linearSpeed / radius（半径で除算）で、時間積分（+= angularVelocity * dt）するのが物理的。ここでは簡易に見た目の回転を合わせるための調整であると推測される。

6. suspensionForce のモデルが単純
  - ばね力は線形モデル（k * x）で、ダンピングも単純比例。実用上は suspensionForce のスケーリングやサチュレーション、摩擦係数などを追加すると安定性向上。

7. 数値安定性
  - 非接地時の hitDistance を suspensionRestLength に設定しているが、極端な値や dt の変化で振動・発散する可能性あり。制限（上限下限）や maxForce をクリップする改善が有効。

8. 力の作用点
  - ほとんどの applyForce は hitPoint（路面上の点）に作用させているが、実際のタイヤ力の掛かる点や摩擦円の考慮などによりさらに細かいモデルが可能。

--------------------------------------------------

## チューニングのコツ（実用アドバイス）

- suspensionForce と suspensionDamping を同時に調整。ばね定数が高ければ減衰も高くする（オーバーシュート防止）。
- sideForce はコーナリング時の粘りに直結。リア・フロントで値を変えるとアンダー／オーバーステア傾向を作れる。
- rotationMultiplier は見た目の回転合わせなので speed の単位（m/s）や dt を考慮して微調整。
- numberOfFramesToPredict と predictionRatio を調整して空中姿勢補正の強さと滑らかさを変える。

## まとめ（仕組みを一文で）

この実装は「各ホイールから車体方向へレイを飛ばし、ヒット距離からサスペンションの圧縮量を計算し、ばね力＋ダンピングで車体に力を返す」ことで、物理エンジンの剛体（シャーシ）に対してレイキャストベースの車両挙動を模擬しています。横力（タイヤのスリップ抑制）や駆動力、アンチロール、空中での着地予測なども独自に実装されており、比較的シンプルかつ拡張しやすい構造になっています。

######################################################################
######################################################################
######################################################################

Babylonさん（仮）@chatGPT

下記のソースコードはbabylonjs で書かれたプログラムです。
raycast を使った vehicle の示しています。
こちらのプログラムについて各処理の説明を詳細におこなってください。


----------------------------------------------------------------------

いいよ～！とってもよく書かれたレイキャスト車両（raycast vehicle）のコードね。
これを小さな子に説明するように、でも技術的に正確に、各処理（メソッド・関数・主要な変数）を順に詳しく説明するよ。必要なら最後に気づいた改善点や注意点も書くね。

## 概観（ざっくり）

このコードは「車のボディ（body）」に対して、タイヤごとにレイキャストを飛ばして路面判定し、サスペンション力・横力（タイヤの横滑り抑制）・駆動力・回転・位置補正・アンチロールなどを物理エンジンに適用して“見かけ上”ホイールを動かし、かつ車体の角速度を着地点に合わせて予測補正する仕組みになっているよ。Babylon の物理（Havok や他）を使って、レイキャストで接地を判定するタイプの車両制御だね。

## グローバル・初期オブジェクト

- const raycastResult = new PhysicsRaycastResult();
  - レイキャスト結果を受け取るオブジェクト。毎回 new しないで再利用している（パフォーマンス向上）。

## クラス RaycastVehicle（車両本体を管理）

コンストラクタで受け取る主要要素:

- body：車両の物理ボディ（PhysicsBody 想定）。body.transformNode 経由で transform 情報を得る。
- scene：Babylon の Scene。物理のタイムステップなどを参照する。

内部で保持する主なプロパティ:

- this.physicsEngine：body._physicsEngine（物理エンジン本体）
- this.wheels：RaycastWheel の配列
- this.antiRollAxles：アンチロール用の軸情報配列
- this.numberOfFramesToPredict, this.predictionRatio：着地予測ロジックのパラメータ
- this.nWheelsOnGround：現在接地しているホイール数（フレームごとにリセット）
- this.speed：車両前進速度（ローカルZ成分として扱う）
- 複数の一時オブジェクト（tmp1, tmp2, tmpq1）を持ち、GC を減らしている

----------------------------------------

### メソッド一覧と詳しい説明

addWheel(wheel) / removeWheel(wheel, index)

^ 単純に this.wheels に RaycastWheel を追加・削除する。
- removeWheel は index が与えられていたらその index を直接削除し、なければオブジェクト一致で削除する（ただしロジックは if(index) this.wheels.splice(index, 1) の条件に注意、index が 0 のとき削除されないという落とし穴がある — 後述）。

----------------------------------------

addAntiRollAxle(axle) / removeAntiRollAxle(axle, index)

- アンチロール軸（左右のホイールインデックスと力の強さなどを持つ想定）を追加・削除する。

updateWheelTransform(wheel)

目的：ローカル座標（車体基準）のホイール位置やサスペンション軸をワールド座標に変換して wheel.positionWorld / wheel.suspensionAxisWorld に格納する。

処理：

- Vector3.TransformCoordinatesToRef(wheel.positionLocal, this.body.transformNode.getWorldMatrix(), wheel.positionWorld)
  - → ホイールの局所位置をワールド位置に変換。

- Vector3.TransformNormalToRef(wheel.suspensionAxisLocal, this.body.transformNode.getWorldMatrix(), wheel.suspensionAxisWorld)
  - → サスペンション軸（方向ベクトル）をワールド方向に変換。

注意：

- getWorldMatrix() を毎回生成しているが、update() の先頭で this.body.transformNode.computeWorldMatrix(true) を呼んでいても、getWorldMatrix() は参照で取得されるだけなので大丈夫。ただし複数回呼すなら一旦変数に入れると効率的。

----------------------------------------

updateVehicleSpeed()

目的：車体の線形速度（ローカル座標での前進速度）を this.speed にセットする。

処理の流れ：

- this.body.getLinearVelocity()（ワールド空間の速度ベクトル）を this.body.transformNode.getWorldMatrix().clone().invert() を使ってローカル空間に変換（TransformNormalToRef を使用）。

- ローカル空間での z 成分を this.speed に格納（前後進の符号付き速度）。

注意点：

- getWorldMatrix().clone().invert() は毎フレーム clone しているのでコスト高。可能なら transform の逆行列をキャッシュするか、TransformNode あるいは physics が提供するローカル変換関数を使うと良い。

----------------------------------------

updateWheelSteering(wheel)

目的：ホイールの steering（操舵角度）に基づいて、wheel.transform.rotationQuaternion を更新する（ホイールの向きを回転 quaternion で定義する）。

処理：

1. Quaternion.RotationAxisToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), wheel.steering, this.tmpq1)
  - → サスペンション軸の逆方向（局所）を回転軸として、操舵角 wheel.steering の回転 quaternion を作成して tmpq1 に入れる。

2. this.body.transformNode.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
  - → 車体の回転（ワールド）と上の操舵回転を掛け合わせてホイールの回転 quaternion を決定。

3. wheel.transform.rotationQuaternion.normalize() と wheel.transform.computeWorldMatrix(true) で正規化とワールド行列計算。

ポイント：

- ここで操舵は「サスペンション軸に対して回る」ことを想定している（一般的には上下軸＝Y軸回転を操舵に使うが、サスペンション軸設定に依存する）。

- wheel.suspensionAxisLocal.negateToRef(this.tmp1) を使っている点に注意（回転軸の向き整合のため）。

----------------------------------------

updateWheelRaycast(wheel)

目的：ホイールから下方向にレイを飛ばして路面との衝突（当たり）を検出し、接地情報（hitPoint, hitNormal, hitDistance, hitBody）を更新する。

処理：

1. this.tmp1.copyFrom(wheel.suspensionAxisWorld).scaleInPlace(wheel.suspensionRestLength).addInPlace(wheel.positionWorld)
  - → レイの終点（rayEnd）を計算：ホイール位置からサスペンション長さ分伸ばした位置。

2. rayStart = wheel.positionWorld, rayEnd = tmp1。

3. this.physicsEngine.raycastToRef(rayStart, rayEnd, raycastResult) を呼ぶ（raycastResult は再利用）：
  - ヒットしなければ wheel.inContact = false にして終了。
  - ヒットしたら wheel.hitBody, wheel.hitPoint, wheel.hitNormal, wheel.hitDistance を raycastResult からコピーして wheel.inContact = true にする。

4, this.nWheelsOnGround++ をインクリメント（接地カウント）。

ポイント：

- hitDistance はレイのスタートからヒット点までの距離（これは suspensionRestLength 内での圧縮量計算に使う）。
- レイはホイール中心（positionWorld）から下向き（suspensionAxisWorld）に飛ばしている。

----------------------------------------

updateWheelSuspension(wheel)

目的：接地時にサスペンションの圧縮量を計算し、サスペンション力（反発とダンピング）を求めて車体に力を与える。

処理：

1. 接地していない場合：

  - wheel.prevSuspensionLength を現在値で更新、
  - wheel.hitDistance = wheel.suspensionRestLength（完全に伸びきっている想定）して終了。

2. 接地している場合：

  - wheel.suspensionLength = wheel.suspensionRestLength - wheel.hitDistance（サスペンションの「圧縮長」）。
  - clamp して範囲 [0, restLength] に制限。
  - compressionRatio = suspensionLength / restLength
  - compressionForce = wheel.suspensionForce * compressionRatio（圧縮に応じたバネ力）
  - rate = (wheel.prevSuspensionLength - wheel.suspensionLength) / timeStep（サスペンションの収縮速度＝ダンピング計算に使う）
  - dampingForce = rate * wheel.suspensionForce * wheel.suspensionDamping（速度に比例するダンピング）
  - 合計 force += compressionForce - dampingForce
  - サスペンション軸をワールドに変換したベクトルをスケールして suspensionForce を作る：

Vector3.TransformNormalToRef(wheel.suspensionAxisLocal.negateToRef(this.tmp1), this.body.transformNode.getWorldMatrix(), this.tmp1).scaleInPlace(force)

  - this.body.applyForce(suspensionForce, wheel.hitPoint) で車体に力を適用（作用点はヒット点）。
  - wheel.prevSuspensionLength = wheel.suspensionLength（次フレーム用）。

解説：

- バネ力 = サスペンション剛性 × 変位（ここは suspensionForce * compressionRatio と簡易表現している）。
- ダンピングは速度に比例してバネ力を減ずる仕組み。
- 力をワールドベクトルとして与えるので、車体はジャンプ・着地・傾き反映される。

----------------------------------------

updateWheelSideForce(wheel)（横力）

目的：タイヤの横滑りを抑えるため、タイヤが路面に対して持つ横方向の相対速度を打ち消すような力（横力）を車体に与える。

処理：

1. 接地していなければ即終了。

2. tireWorldVel = getBodyVelocityAtPoint(this.body, wheel.positionWorld)
  - → 指定位置（タイヤ接触位置）における車体の瞬時速度（線形 + 回転に由来する速度）を取得。
3. steeringDir = Vector3.TransformNormalToRef(wheel.axleAxisLocal, wheel.transform.getWorldMatrix(), this.tmp1)
  - → ホイールの“横方向”（アクスル軸）をワールドで表現。ここを横ベクトルとして見る。
4. steeringVel = Vector3.Dot(steeringDir, tireWorldVel)
  - → 横方向の速度成分（つまりタイヤが横に滑っている速さ）。
5. desiredVelChange = -steeringVel → 横速度を打ち消す（0 にする）ための望ましい速度変化。
6. desiredAccel = desiredVelChange / timeStep（加速度）
7. this.body.applyForce(steeringDir.scaleInPlace(wheel.sideForce * desiredAccel), Vector3.LerpToRef(wheel.hitPoint, wheel.positionWorld, wheel.sideForcePositionRatio, this.tmp2))
  - → 横力を applyForce。力の作用点は hitPoint と positionWorld の線形補間（sideForcePositionRatio）で調整。

解説：

-. 横力は「速度を瞬時に打ち消すために必要な加速度 × 質量（ここでは sideForce でスケール）」と解釈できる。実装は単純化されているが実務では 摩擦円 などで扱う。
- 力の作用点を接地点寄りに持たせることでモーメント（回転）も発生させられる（挙動調整）。

---------------------------------------- 

updateWheelForce(wheel)（駆動力／ブレーキ）

目的：ホイールに対して前後方向（forwardAxisLocal）の力を与える（アクセルやブレーキ）。

処理：

- 接地していれば、wheel.force（外部からセットされる：アクセルやブレーキの値）が 0 でない場合に、
  - forwardDirectionWorld = TransformNormal(forwardAxisLocal) * wheel.force を計算して applyForce を wheel.hitPoint に適用。

解説：

- シンプルに Forward ベクトルにスカラー force を掛けた力を与えるだけ。実際の車両ではトルク→タイヤトルク→路面力の変換や摩擦特性を入れるが、ここでは簡易。

----------------------------------------

updateWheelRotation(wheel)

目的：タイヤの見た目回転（視覚用）を更新する。

処理：

1. wheel.rotation += this.speed*wheel.rotationMultiplier*wheel.radius
  - → 現在の速度（this.speed）から回転角を積分（ただし係数の意味合いは後述）。
2. Quaternion.RotationAxisToRef(wheel.axleAxisLocal, wheel.rotation, this.tmpq1)
  - → 軸（アクスル）周りの回転 quaternion を作成。
3. wheel.transform.rotationQuaternion.multiplyToRef(this.tmpq1, wheel.transform.rotationQuaternion)
  - → 既存の transform 回転に掛け合わせてホイールの回転を更新。
4. 正規化。

注意点：

- rotationMultiplier * radius の掛け方が直感的ではない（通常は角速度 = 速度 / 半径）。ここでは視覚的スケール調整用の係数になっていると考えた方が良い。

----------------------------------------

updateWheelTransformPosition(wheel)

目的：ホイールの transform（見た目）を物理の位置に合わせる。

処理：

- wheel.transform.position = wheel.positionWorld + wheel.suspensionAxisWorld * (wheel.hitDistance - wheel.radius)
  - → ホイール中心を「接地点からタイヤ半径分上に持ってくる」ことで、タイヤが地面に触れているように見せる。

解説：

- ここで hitDistance - wheel.radius が負だとタイヤが埋まって見えるので、hitDistance の定義（ray のヒット距離）が想定どおりであることが重要。

----------------------------------------

updateVehiclePredictiveLanding()

目的：全輪が空中にあるときに、将来（予測時間）落下先をレイキャストで調べ、車体の角速度をその着地姿勢に近づけるよう角速度を補正してオリエンテーションを整える（空中姿勢の “着地合わせ”）。

条件：

- if(this.nWheelsOnGround > 0) return → 少なくとも一輪でも接地していると予測処理は行わない（接地していれば地面との力で姿勢は変わるため）。

計算手順（ざっくり）：

1. 重力、フレーム時間、予測時間（this.numberOfFramesToPredict * frameTime）を得る。

2. 速度と重力から「予測位置」を計算（等加速度運動）：
  - predictedPosition = position + linearVelocity * predictTime + 0.5 * gravity * predictTime^2

3. this.physicsEngine.raycastToRef(position, predictedPosition, raycastResult)
  - → 現在位置から予測先までの線に対してレイを投げ、途中にヒットするか調べる。

4. ヒットしたら：
  - velocity = this.body.getLinearVelocity().normalize()（速度方向）
    - → 注意: 速度の大きさは落として 1 にしているので、以降の処理は方向ベースの扱いになっている。
  - direction = hitPointWorld - position
  - 各成分ごとに displacement.x = direction.x / velocity.x などを計算（速度方向への割り算）。
  - nFrames = displacement.length()（ここはやや直感的でないが「到達に必要なフレーム数」を推定している）
  - R1 = Axis.Y を車体ワールドで変換したベクトル（車体の上方向ワールド）
    R2 = hitNormalWorld（衝突面の法線）
  - rotationDifference = cross(R1,R2)（上方向ベクトルの差分をベクトルとして得る。小さな角度差ならこれで近似できる）
  - timeStepDuration = frameTime * nFrames（到達までの時間）
  - predictedAngularVelocity = rotationDifference / timeStepDuration
  - this.body.setAngularVelocity( Lerp(currentAngVel, predictedAngularVelocity, predictionRatio) )
    → 現在の角速度と予測角速度の間を predictionRatio だけ補間してセット。

効果：
- 中で姿勢を素早く滑らかに着地姿勢に寄せることができる（不自然な回転を抑える）。着地時のバウンスや回転をコントロールするための改善だよ。

注意点：
- displacement の算出や nFrames の使い方は近似的で、速度の成分がゼロの場合がある（コードでは三項演算子でゼロ避けしている）。数値の安定性はケースによる。

----------------------------------------

update()（メイン更新関数 — 毎フレーム呼ぶ想定）

呼ばれる順序：

1. this.body.transformNode.computeWorldMatrix(true)：transform を確実に最新化。
2. this.nWheelsOnGround = 0、this.updateVehicleSpeed()。
3. 各ホイールに対して順に：
  - updateWheelTransform
  - updateWheelSteering
  - updateWheelRaycast
  - updateWheelSuspension
  - updateWheelForce
  - updateWheelSideForce
  - updateWheelTransformPosition
  - updateWheelRotation
4. updateVehiclePredictiveLanding() を呼ぶ（接地していない時のみ有効）。
5. アンチロール軸 (antiRollAxles) をループして、左右の圧縮差に応じた補正力を左右にかける：
  - compressionDifference = wheelB.suspensionLength - wheelA.suspensionLength
  - compressionRatio = Math.min(compressionDifference, maxCompressionRestLength) / maxCompressionRestLength
  - antiRollForce = wheelOrder[0].suspensionAxisWorld * (axle.force * compressionRatio) をそれぞれに applyForce（反対向きで右側にも適用）

意味：

- サスペンション挙動 → 駆動 → 横力 → 見た目位置 → 回転 を順序よく行っている。アンチロールは左右差によってボディのロールを抑える。

----------------------------------------

## クラス RaycastWheel（ホイール情報）

コンストラクタで受け取る options（想定フィールド）に基づいて内部状態を初期化する。主なフィールド：

- positionLocal, positionWorld：ホイールの車体ローカル位置 / ワールド位置
- suspensionAxisLocal, suspensionAxisWorld：サスペンションの局所軸 / ワールド軸
- axleAxisLocal, forwardAxisLocal：アクスル（横軸）と前方向ベクトル（局所）
- sideForce：横力の係数（デフォルト40）
- sideForcePositionRatio：横力の作用点補間率（0～1）
- radius：タイヤ半径
- suspensionRestLength, prevSuspensionLength, suspensionLength：サスペンション関連
- suspensionForce, suspensionDamping：バネ強さ・ダンピング
- rotationMultiplier：回転見た目の調整係数
- hitDistance, hitNormal, hitPoint：レイキャスト結果保存用
- inContact：接地フラグ
- steering：操舵角
- rotation：見た目回転角
- force：前後の駆動力
- transform：TransformNode("WheelTransform")（視覚的なホイールノード。rotationQuaternion を利用）

注記：

- クラス定義の冒頭で forwardAxisLocal = Vector3.Cross(this.upAxisLocal, this.rightAxisLocal); としているが、その後コンストラクタ内で this.forwardAxisLocal = options.forwardAxisLocal.clone() と上書きしているため、最初の計算は実質的に無効になっている（冗長）。

----------------------------------------

## 補助関数

getBodyVelocityAtPoint(body, point)

目的：point（ワールド座標）における物体表面の瞬時速度を返す（線形速度 + 回転による速度成分）。

処理：

- r = point - body.transformNode.position（回転中心からのベクトル）
- angularVelocity = body.getAngularVelocity()
- res = Vector3.Cross(angularVelocity, r)（回転による速度）
- velocity = body.getLinearVelocity()
- res.addInPlace(velocity) → 線形速度を加算して返す

注意点：

- 実装中に Vector3.Cross(angularVelocity, r) が2回書かれている（1回目の呼び出しの戻り値を使っていない）。1回で十分。
- 戻り値 res は新しい Vector3 ではなく、Vector3.Cross が返すオブジェクトなので、外部で変更されうる点に注意（ただしここは安全）。

clampNumber(num, a, b)

- num を a と b の間にクランプ（上下を入れ替えても動くように Math.max(a,b) を使っている）。

lerp(x,y,a)

- 線形補間。コード内で lerp はあまり使われていないが、Vector3.LerpToRef の代替関数として置かれている。

--------------------------------------------------

## 実行フロー（update() が呼ばれるたび）

1. 車体の world matrix を最新化
2. 速度を計算（ローカルZ成分）
3. 各ホイールについて、ワールド座標変換 → 操舵反映 → レイで接地検出 → サスペンション力算出 & apply → 駆動力 apply → 横力 apply → 見た目位置と回転更新
4. 全輪空中なら着地予測して角速度を補正
5. アンチロール処理

----------------------------------------

## 注意点・改善提案（気づいたこと）

1. removeWheel の index 判定

  if(index) this.wheels.splice(index, 1)
  this.wheels.splice(this.wheels.indexOf(wheel), 1)


  - if(index) は index === 0 の場合に false になってしまう（第1ホイールを削除できない）。if(index !== undefined) の方が安全。
  - また現在の実装だと index 指定時にも後続の splice(this.wheels.indexOf(wheel), 1) が実行されるため、2 回削除してしまう場合がある（バグ）。else を付けるか、早期 return すべき。

2. getBodyVelocityAtPoint 内の冗長呼び出し
   Vector3.Cross(angularVelocity, r) が2回呼ばれている。1回にして res に代入するだけでよい。

3. updateVehicleSpeed での matrix clone/invert のコスト
  毎フレーム clone して invert しているので高コスト。できれば this.body.transformNode.getWorldMatrix().getRotationMatrix() など軽い API を使うか、transformNode の absolutePosition/absoluteRotationQuaternion を使って速度のローカル成分を求める方法に変える。

4. updateWheelRotation の回転スケール
  回転更新は rotation += speed * rotationMultiplier * radius となっているが、物理的には角速度 ω = v / r（v: 傾向速度）だから、回転角の更新は rotation += v / r * dt が自然。ここは視覚目的の調整係数として rotationMultiplier を置いていると理解しておくべき。

5. updateVehiclePredictiveLanding の時間推定ロジック
displacement の作り方や nFrames の計算は近似的であり、速度成分が 0 のときの扱い、や負の値の扱いを厳密にする必要がある。大きな角差があると rotationDifference の単純なクロス積での近似が崩れる（スモールアングル近似になっている）。

6. RaycastWheel の forwardAxisLocal の初期化の矛盾
クラスヘッダで一度 forwardAxisLocal を Cross(up, right) で計算しているが、コンストラクタで options.forwardAxisLocal に上書きしているので、最初の計算は不要（削除可）。

7. 力の作用点に対する注意
applyForce の作用点は wheel.hitPoint（接地点）または positionWorld で与えている。物理的にトルクや転がり摩擦を正確に扱うには適切だが、engine によっては applyImpulse の方が瞬時の運動変化を期待できる場合がある。

8. パフォーマンス

  - getWorldMatrix() や computeWorldMatrix(true)、clone() の多用はパフォーマンスに響く。必要最小限にまとめると良い。
  - raycastToRef をホイール数分毎フレーム行うのは重いので、ホイールごとの頻度を下げる・複数フレームで更新分散する等の工夫も検討。

----------------------------------------

## 全体のまとめ（短く）

- このコードは「レイキャストを使ったサスペンション＆タイヤ力学のシミュレーション」を実装している。
  各ホイールでレイを飛ばし接地判定 → サスペンション（バネ＋ダンパ）力を適用 → 駆動力・横力を適用 → 見た目のホイール transform を更新、という一連の流れを update() で行う。

- 空中時の着地予測で角速度を補正する高度な処理も含まれていて、着地時の姿勢制御を試みている。
- 小さなバグ（removeWheel の index チェック等）と最適化ポイント（行列 clone の削減など）があるので、それらを直すとより堅牢で高速になるよ。

----------------------------------------

もしよければ次にやると良いことを提案するね：

1. removeWheel を修正して安全に削除できるようにする。
2. getBodyVelocityAtPoint の冗長削除と、updateVehicleSpeed の行列 clone 削除（代替実装例を出すよ）。
3. 視覚用ホイール（TransformNode）にメッシュを接続するサンプルを追加して、Playground で動かせるデモを作ることもできるよ。

どれを先に見たい？コード修正の差分（具体的な修正版）もすぐ書けるよ～！


*/
