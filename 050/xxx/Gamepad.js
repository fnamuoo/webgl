// mode:javascript

export class Gamepad {
  // ゲームパッド
  enable_;
  gpi_;
  stickGap_;
  para_;

  constructor() {
    this.init()

    addEventListener("gamepadconnected", (e) => {
      //処理
      this.enable_ = true;
      this.gpi_ = e.gamepad.index;
    });
  }

  init() {
    this.enable_ = false;
    this.gpi_ = -1;
    this.stickGap_ = 0.01;
    this.para_ = {
      stcLH:0,  // スティック左　左右
      stcLV:0,  // スティック左　上下
      stcRH:0,  // スティック右　左右
      stcRV:0,  // スティック右　上下
      btnA:false,
      btnB:false,
      btnX:false,
      btnY:false,
      btnLB:false,
      btnRB:false,
      btnLT:false,
      btnRT:false,
      btnBK:false,
      btnST:false,
      crsU:false, // 十字　上
      crsD:false, // 十字　下
      crsL:false, // 十字　左
      crsR:false, // 十字　右
    };
  }

  update() {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[this.gpi_];
    if (gp == undefined) {
      console.log("gp=", gp);
      return;
    }
    if (gp.buttons == undefined) {
      console.log("gp=", gp);
      return;
    }
    const gpbuttons = gp.buttons;
    const gpsticks = gp.axes;

    if (Math.abs(gpsticks[0]) > this.stickGap_) {
    // ステック左：左右
        this.para_.stcLH = gpsticks[0];
    } else {
      this.para_.stcLH = 0;
    }
    if (Math.abs(gpsticks[1]) > this.stickGap_) {
      // ステック左：上下
      this.para_.stcLV = -gpsticks[1];
    } else {
      this.para_.stcLV = 0;
    }

    if (Math.abs(gpsticks[2]) > this.stickGap_) {
      // ステック右：左右　左右移動
      this.para_.stcRH = -gpsticks[2];
    } else {
      this.para_.stcRH = 0;
    }
    if (Math.abs(gpsticks[3]) > this.stickGap_) {
      // ステック右：上下　上昇/下降
      this.para_.stcRV = -gpsticks[3];
    } else {
      this.para_.stcRV = 0;
    }

    this.para_.btnA = gpbuttons[0].pressed;
    this.para_.btnB = gpbuttons[1].pressed;
    this.para_.btnX = gpbuttons[2].pressed;
    this.para_.btnY = gpbuttons[3].pressed;

    this.para_.btnLB = gpbuttons[4].pressed;
    this.para_.btnRB = gpbuttons[5].pressed;
    this.para_.btnLT = gpbuttons[6].pressed;
    this.para_.btnRT = gpbuttons[7].pressed;

    this.para_.btnBK = gpbuttons[8].pressed;
    this.para_.btnST = gpbuttons[9].pressed;

    this.para_.crsU = gpbuttons[12].pressed;
    this.para_.crsD = gpbuttons[13].pressed;
    this.para_.crsL = gpbuttons[14].pressed;
    this.para_.crsR = gpbuttons[15].pressed;
  }
};


/*

https://sbfl.net/blog/2016/05/11/gamepad-api-on-browsers/

const BUTTON_A_INDEX     = 0;
const BUTTON_B_INDEX     = 1;
const BUTTON_X_INDEX     = 2;
const BUTTON_Y_INDEX     = 3;
const BUTTON_LB_INDEX    = 4;
const BUTTON_RB_INDEX    = 5;
const BUTTON_LT_INDEX    = 6;
const BUTTON_RT_INDEX    = 7;
const BUTTON_BACK_INDEX  = 8;
const BUTTON_START_INDEX = 9;
const BUTTON_L3_INDEX    = 10;
const BUTTON_R3_INDEX    = 11;
const BUTTON_UP_INDEX    = 12;
const BUTTON_DOWN_INDEX  = 13;
const BUTTON_LEFT_INDEX  = 14;
const BUTTON_RIGHT_INDEX = 15;
const BUTTON_HOME_INDEX  = 16;

const AXIS_L_HORIZONTAL_INDEX = 0;
const AXIS_L_VERTICAL_INDEX   = 1;
const AXIS_R_HORIZONTAL_INDEX = 2;
const AXIS_R_VERTICAL_INDEX   = 3;

*/

export class GamepadDrone extends Gamepad {
  // ゲームパッド　ドローン操作拡張
  constructor(mode) {
    super();
    this.setMode(mode);
  }
  init() {
    console.log("GamepadDrone::init()");
    super.init();
    this.droneMode_ = 0;
    this.para2_ = {
      frbk: 0,  // 前進/後進
      yaw:0,  // 左右旋回
      updn:0,    // 上昇/下降
      slide:0, // 左右移動(スライド)
    };
    this.droneParaFunc_ = null;
    this.setMode(this.droneMode_);
  };

  droneParaFuncNone() {
    //console.log("GamepadDrone::droneParaFuncNone()");
  };
  droneParaFuncMode1() {
    //console.log("GamepadDrone::droneParaFuncMode1()");
    // ドローン（モード１）左：前後移動・左右旋回　右スティック：上昇下降・左右移動
    this.para2_.frbk  = this.para_.stcLV;
    this.para2_.yaw   = -this.para_.stcLH;
    this.para2_.updn  = this.para_.stcRV;
    this.para2_.slide = -this.para_.stcRH;
};
  droneParaFuncMode2() {
    //console.log("GamepadDrone::droneParaFuncMode2()");
    // ドローン（モード２）左：上昇下降・左右旋回　右スティック：前後移動・左右移動
    this.para2_.updn  = this.para_.stcLV;
    this.para2_.yaw   = -this.para_.stcLH;
    this.para2_.frbk  = this.para_.stcRV;
    this.para2_.slide = -this.para_.stcRH;
  };

  setMode(imode) {
    this.droneMode_ = imode;
    if (imode == 1) {
      this.droneParaFunc_ = this.droneParaFuncMode1;
    } else if (imode == 2) {
      this.droneParaFunc_ = this.droneParaFuncMode2;
    } else {
      this.droneParaFunc_ = this.droneParaFuncNone;
    }
  }

  update() {
    super.update();
    this.droneParaFunc_();
  }

};
