import config from '../config.js';
import { Util } from '../util/util';
import chatFilterData from '../chat_filter.js';

export function spammerA(ev) {
  const { message, sender } = ev;
  if (!config.spammerA.state || Util.isOP(sender)) return;
  if (message.length > config.spammerA.maxLength) {
    Util.notify(`チャットが長すぎます (${message.length}>${config.spammerA.maxLength})`, sender);
    return ev.cancel = true; // flag -> return true
  }
}

export function spammerB(ev) {
  const { message, sender } = ev;
  if (!config.spammerB.state || Util.isOP(sender)) return;
  if (message === sender.lastMsg) {
    Util.notify('重複したチャットは送信できません', sender);
    return ev.cancel = true; // flag -> return true
  }
  sender.lastMsg = message;
}

export function spammerC(ev) {
  const { message, sender } = ev;
  if (!config.spammerC.state || Util.isOP(sender)) return;
  const interval = Date.now() - sender.lastMsgSentAt;
  if (sender.lastMsgSentAt && interval < config.spammerC.minInterval) {
    const wait = (config.spammerC.minInterval - interval) / 1000;
    Util.notify(`チャットの送信間隔が速すぎます。 ${wait.toFixed(1)}秒待ってください`, sender);
    return ev.cancel = true; // flag -> return true
  }
  sender.lastMsgSentAt = Date.now();
}

export function chatFilter(ev) {
  let { sender } = ev;
  if (!chatFilterData.state || Util.isOP(sender)) return;
  for (const word of chatFilterData.filter) {
    ev.message = ev.message.replace(new RegExp(word, 'g'), '*'.repeat(word.length)); // replace bad characters into *
  }
}