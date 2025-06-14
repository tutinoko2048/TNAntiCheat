// import helpCommand from "./data/help";
import OP from "./data/op";
import DEOP from "./data/deop";
import VERSION from "./data/version";
import SETTING from "./data/setting";
import SETTINGITEM from "./data/settingitem";
import KICK from "./data/kick";
import TEMPKICK from "./data/tempkick";
import BAN from "./data/ban";
import MUTE from "./data/mute";
import ABOUT from "./data/about";
import TPS from "./data/tps";
import PERMISSION_ADD from "./data/permission-add";
import PERMISSION_REMOVE from "./data/permission-remove";
import UNBAN from "./data/unban";
import MODULE from "./data/module";
import CONFIG from "./data/config";
import FREEZE from "./data/freeze";
import STATUS from "./data/status";
// import RUNJS from "./data/runjs";

/** @type {((ac?: import('../ac').TNAntiCheat) => void)[]} */
export const COMMANDS = [
  OP,
  DEOP,
  VERSION,
  SETTING,
  SETTINGITEM,
  KICK,
  TEMPKICK,
  BAN,
  MUTE,
  ABOUT,
  TPS,
  PERMISSION_ADD,
  PERMISSION_REMOVE,
  UNBAN,
  MODULE,
  CONFIG,
  FREEZE,
  STATUS,
  //RUNJS, // for debug
];
