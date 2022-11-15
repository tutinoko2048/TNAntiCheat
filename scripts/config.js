/*
  punishment: ban | kick | tempkick | notify | none
*/

export default
{
  permission: {
    admin: { // 全ての検知から除外される権限
      tag: "ac:admin",
    },
    builder: { // クリエイティブが許可される権限
      tag: "ac:builder"
    },
    ban: {
      tag: "ac:kick", // banするタグです
      players: [], // banするプレイヤーを書く
      xuid: [] // xuidでbanするプレイヤーを指定できます
      // xuidでbanとは: https://twitter.com/tutinoko_kusaa/status/1587356291734773760
    }
  },
  command: {
    prefix: '!'
  },
  itemList: {
    ban: [
      "minecraft:movingBlock",
      "minecraft:movingblock",
      "minecraft:moving_block"
    ],
    kick: [
      "minecraft:beehive",
      "minecraft:bee_nest",
      "minecraft:mob_spawner",
      "minecraft:lava",
      "minecraft:water",
      "minecraft:flowing_lava",
      "minecraft:flowing_water",
      "minecraft:invisiblebedrock",
      "minecraft:invisible_bedrock"
    ],
    notify: [
      "minecraft:lava_bucket",
      "minecraft:axolotl_bucket",
      "minecraft:cod_bucket",
      "minecraft:pufferfish_bucket",
      "minecraft:salmon_bucket",
      "minecraft:tropical_fish_bucket",
      "minecraft:tadpole_bucket",
      "minecraft:respawn_anchor",
      "minecraft:tnt",
      "minecraft:bedrock",
      "minecraft:barrier"
    ]
  },
  crasher: {
    state: true, // crasher検知(pcのみ)
    punishment: "ban"
  },
  nuker: {
    state: true,
    limit: 8, // 1tickに何ブロックの破壊で検知するか(ラグも考慮)
    place: true, // 壊されたブロックを置き直す
    punishment: "kick"
  },
  namespoof: {
    state: true,
    maxLength: 20, // 指定した値より長い名前を検知
    punishment: "kick"
  },
  spammerA: { // チャットの長さをチェック
    state: true,
    maxLength: 100
  },
  spammerB: { // 重複するチャットを制限
    state: true
  },
  spammerC: { // チャットの速さをチェック
    state: true,
    minInterval: 2000 // ミリ秒で指定 1000ms = 1s
  },
  itemCheckA: { // 持っていたら検知 アイテムはitemList参照
    state: false,
    notifyCreative: true // クリエの人は削除だけしてbanやkickはしない
  },
  itemCheckB: { // スポーンエッグを持っていたら検知
    state: false,
    punishment: "notify"
  },
  itemCheckC: { // 1スタックに値より大きい数を持っていたら検知
    state: true,
    punishment: "notify",
    maxAmount: 64
  },
  itemCheckD: { // オーバーエンチャントを検知
    state: true,
    mode: "hand", // inventory: 全インベントリをチェックするから負荷大きめ, hand: 手持ちだけ検知だからまだまし
    punishment: "notify"
  },
  placeCheckA: { // 置いたら検知 アイテムはitemList参照
    state: true,
    notifyCreative: true, // クリエの人は削除だけしてbanやkickはしない
    antiShulker: false, // シュルカーボックスの設置をキャンセル
  },
  placeCheckB: { // 置いたときに中身をチェック 一部ブロックは非対応 アイテムはitemList参照
    state: true,
    punishment: "notify",
    spawnEgg: true,
    detect: [
      "minecraft:chest",
      "minecraft:trapped_chest"
    ]
  },
  entityCheckA: { // いたらkill
    state: true,
    punishment: 'notify',
    detect: [
      "minecraft:command_block_minecart",
      "minecraft:movingBlock",
      "minecraft:movingblock",
      "minecraft:moving_block",
      "minecraft:tnt",
      "minecraft:npc"
    ]
  },
  entityCheckB: { // ドロップ状態のアイテムを検知 アイテムはitemList参照
    state: true,
    spawnEgg: true, // スポーンエッグを含めるかどうか
    punishment: 'notify'
  },
  entityCheckC: { // 1tickにスポーンできるエンティティの数
    state: true,
    maxArrowSpawns: 10, // 矢の数
    maxItemSpawns: 20, // アイテムの数
    maxCmdMinecartSpawns: 3
  },
  reach: { // ブロックの設置/破壊 攻撃の長すぎるリーチを検知 (ベータ)
    state: true,
    blockReach: 8,
    attackReach: 6,
    cancel: true, // ブロックの設置破壊をキャンセル
    punishment: "notify",
    excludeCustomEntities: true, // バニラ以外のmobの検知を除外する
    excludeEntities: [ // 除外するエンティティ
      "minecraft:ender_dragon",
      "minecraft:enderman",
      "minecraft:ghast",
      "minecraft:fireball"
    ]
  },
  autoClicker: { // れんつを検知 (ベータ)
    state: true,
    maxCPS: 20,
    punishment: "notify"
  },
  creative: { // クリエイティブになったら検知
    state: true,
    punishment: "notify",
    defaultGamemode: "adventure" // クリエを検知した時に設定するGamemode
  },
  others: {
    adminPanel: 'minecraft:stick', // 管理者用パネルを呼び出すためのアイテム
    sendws: false, // For discord-mcbe | メッセージをsayで出力します
    shortName: false, // チャットに出てくる"TN-AntiCheat"の表示を"TN-AC"にして圧迫感を無くします
    debug: true
  }
}