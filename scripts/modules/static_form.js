import { GameMode } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { ICONS, VERSION, DISCORD_URL } from '../util/constants';

export const FORMS = {
  main: new UI.ActionFormData()
    .title('TN-AntiCheat AdminPanel')
    .button('§lプレイヤーリスト / Player List', ICONS.playerList)
    .button('§lエンティティ数を表示 / Show entities', ICONS.entities)
    .button('§l設定 / Config', ICONS.config)
    .button('§lチャットフィルター / Chat filter', ICONS.mute)
    .button('§lこのアドオンについて / About', ICONS.about),
  playerInfo: new UI.ActionFormData()
    .title('PlayerInfo')
    .button('§lインベントリを表示 / Show inventory', ICONS.inventory)
    .button('§lミュートする / Mute', ICONS.mute)
    .button('§lkickする / Kick', ICONS.kick)
    .button('§lbanする / Ban', ICONS.ban)
    .button('§lテレポート / Teleport', ICONS.teleport)
    .button('§l自分にテレポート / Teleport here', ICONS.teleportHere)
    .button('§lタグ一覧を表示 / Show tags', ICONS.tags)
    .button('§lスコア一覧を表示 / Show scores', ICONS.scores)
    .button('戻る / Return', ICONS.returnBtn),
  itemInfo: new UI.ActionFormData()
    .title('ItemInfo')
    .button('§l削除 / Clear\n§r§8インベントリからアイテムを削除します', ICONS.clear)
    .button('§l複製 / Duplicate\n§r§8アイテムを複製して受け取ります', ICONS.duplicate)
    .button('§l移動 / Move\n§r§8アイテムを自分のインベントリに移動させます', ICONS.move)
    .button('戻る / Return', ICONS.returnBtn),
  about: new UI.ActionFormData()
    .title('About')
    .body([
      ` §l§aTN-AntiCheat v${VERSION}§r \n`,
      'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
      '- §eダウンロード:§r https://github.com/tutinoko2048/TNAntiCheat',
      `- §9Discordサポートサーバー:§r ${DISCORD_URL}`,
      '  §7(バグやbypassの報告・機能の提案などはこちらからどうぞ)§r',
      '- 開発者: tutinoko2048 / RetoRuto9900K',
      '- Twitter: @tutinoko_kusaa\n '
    ].join('\n'))
    .button('戻る / Return', ICONS.returnBtn),
  chatFilter: new UI.ActionFormData()
    .title('Chat Filter')
    .body('チャットフィルターの設定をします')
    .button('編集 / Edit', ICONS.edit)
    .button('戻る / Return', ICONS.returnBtn)
}

export const DROPDOWNS = {
  punishment: [
    { value: 'ban', desc: 'プレイヤーをBANします' },
    { value: 'kick', desc: 'プレイヤーをKickします' },
    { value: 'tempkick', desc: 'プレイヤーをKickします(再参加可能)' },
    { value: 'notify', desc: 'チャット欄に通知します' },
    { value: 'none', desc: '何もしません' }
  ],
  mode: [
    { value: 'hand', desc: '手持ちアイテムのオーバーエンチャントを検知' },
    { value: 'inventory', desc: 'インベントリ内全てのアイテムを検知' }
  ],
  defaultGamemode: Object.values(GameMode).map(value => {
    return { value }
  })
}