import { system } from '@minecraft/server';
import config from '../config.js';
import { ModerationManager } from '../util/ModerationManager.js';
import { Util } from '../util/util';

/** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
export function spammerA(ev) {
  const { message, sender } = ev;
  if (!config.spammerA.state || Util.isOP(sender)) return;
  if (message.length > config.spammerA.maxLength) {
    Util.notify(`チャットが長すぎます (${message.length}>${config.spammerA.maxLength})`, sender);

    sender.spammerACount ??= 0;
    sender.spammerACount++;
    if (config.spammerA.autoMuteCount !== -1 && sender.spammerACount % config.spammerA.autoMuteCount === 0) {
      system.run(() => {
        const res = ModerationManager.setMuted(sender, true, config.spammerA.tempMute);
        if (res) {
          Util.notify(`Spammer/A >> AutoMuted: §c${sender.name}§r §7[${sender.spammerACount}] (l: ${message.length})§r§　`);
          Util.writeLog({ type: 'Spammer/A', punishment: 'notify', message: `length: ${message.length}` }, sender);
        }
      });
    }

    return ev.cancel = true; // flag -> return true
  }
}

/** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
export function spammerB(ev) {
  const { message, sender } = ev;
  if (!config.spammerB.state || Util.isOP(sender)) return;
  if (message === sender.lastMsg) {
    Util.notify('重複したチャットは送信できません', sender);

    sender.spammerBCount ??= 0;
    sender.spammerBCount++;
    if (config.spammerB.autoMuteCount !== -1 && sender.spammerBCount % config.spammerB.autoMuteCount === 0) {
      system.run(() => {
        const res = ModerationManager.setMuted(sender, true, config.spammerB.tempMute);
        if (res) {
          Util.notify(`Spammer/B >> AutoMuted: §c${sender.name}§r §7[${sender.spammerBCount}]§r§　`);
          Util.writeLog({ type: 'Spammer/B', punishment: 'notify' }, sender);
        }
      });
    }

    return ev.cancel = true; // flag -> return true
  }
  sender.lastMsg = message;
}

/**
 * @param {import('@minecraft/server').ChatSendBeforeEvent} ev
 * @returns {boolean} Return true if flagged
 */
export function spammerC(ev) {
  const { sender } = ev;
  if (!config.spammerC.state || Util.isOP(sender)) return;
  const interval = Date.now() - sender.lastMsgSentAt;
  if (sender.lastMsgSentAt && interval < config.spammerC.minInterval) {
    const wait = (config.spammerC.minInterval - interval) / 1000;
    Util.notify(`チャットの送信間隔が速すぎます。 ${wait.toFixed(1)}秒待ってください`, sender);
    if (interval < 150) sender.lastMsgSentAt = Date.now(); // 特に速すぎる時は完全にブロックする

    sender.spammerCCount ??= 0;
    sender.spammerCCount++;
    if (config.spammerC.autoMuteCount !== -1 && sender.spammerCCount % config.spammerC.autoMuteCount === 0) {
      system.run(() => {
        const res = ModerationManager.setMuted(sender, true, config.spammerC.tempMute);
        if (res) {
          Util.notify(`Spammer/C >> AutoMuted: §c${sender.name}§r §7[${sender.spammerCCount}] (i: ${interval} ms)§r§　`);
          Util.writeLog({ type: 'Spammer/C', punishment: 'notify', message: `interval: ${interval} ms` }, sender);
        }
      });
    }

    return ev.cancel = true; // flag -> return true
  }
  sender.lastMsgSentAt = Date.now();
}
