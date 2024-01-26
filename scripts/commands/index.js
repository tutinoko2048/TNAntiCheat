import helpCommand from "./data/help";
import opCommand from "./data/op";
import deopCommand from "./data/deop";
import versionCommand from "./data/version";
import settingCommand from "./data/setting";
import settingitemCommand from "./data/settingitem";
import kickCommand from "./data/kick";
import tempkickCommand from "./data/tempkick";
import banCommand from "./data/ban";
import muteCommand from "./data/mute";
import aboutCommand from "./data/about";
import tpsCommand from "./data/tps";
import permissionCommand from "./data/permission";
import unbanCommand from "./data/unban";
import moduleCommand from "./data/module";
import configCommand from "./data/config";
import freezeCommand from "./data/freeze";
import statusCommand from "./data/status";
// import runjsCommand from "./data/runjs";

/** @type {import('./Command').Command[]} */
export const COMMANDS = [
  helpCommand,
  opCommand,
  deopCommand,
  versionCommand,
  settingCommand,
  settingitemCommand,
  kickCommand,
  tempkickCommand,
  banCommand,
  muteCommand,
  aboutCommand,
  tpsCommand,
  permissionCommand,
  unbanCommand,
  moduleCommand,
  configCommand,
  freezeCommand,
  statusCommand,
  // runjsCommand, // for debug
];
