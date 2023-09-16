import config from '../config.js';
import { Util } from '../util/util';

/** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
export function spammerA(ev) {
  const { message, sender } = ev;
  if (!config.spammerA.state || Util.isOP(sender)) return;
  if (message.length > config.spammerA.maxLength) {
    Util.notify(`チャットが長すぎます (${message.length}>${config.spammerA.maxLength})`, sender);
    return ev.cancel = true; // flag -> return true
  }
}

/** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
export function spammerB(ev) {
  const { message, sender } = ev;
  if (!config.spammerB.state || Util.isOP(sender)) return;
  if (message === sender.lastMsg) {
    Util.notify('重複したチャットは送信できません', sender);
    return ev.cancel = true; // flag -> return true
  }
  sender.lastMsg = message;
}

/** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
export function spammerC(ev) {
  const { sender } = ev;
  if (!config.spammerC.state || Util.isOP(sender)) return;
  const interval = Date.now() - sender.lastMsgSentAt;
  if (sender.lastMsgSentAt && interval < config.spammerC.minInterval) {
    const wait = (config.spammerC.minInterval - interval) / 1000;
    Util.notify(`チャットの送信間隔が速すぎます。 ${wait.toFixed(1)}秒待ってください`, sender);
    if (interval < 150) sender.lastMsgSentAt = Date.now(); // 特に速すぎる時は完全にブロックする
    return ev.cancel = true; // flag -> return true
  }
  sender.lastMsgSentAt = Date.now();
}