/*
  punishment: ban | kick | tempkick | notify | none
*/

export default
{
  permission: {
    admin: { // 全ての検知から除外される権限
      encrypt: true, // タグを難読化して不正に権限を取られにくくする
      tag: "ac:admin", // encryptがtrueの場合は使わない
      players: [],
      ids: []
    },
    builder: { // クリエイティブが許可される権限
      encrypt: true,
      tag: "ac:builder",
      players: [],
      ids: []
    },
    ban: {
      encrypt: false,
      tag: "ac:kick", // banするタグです
      players: [], // banするプレイヤーの名前
      ids: [], // banするプレイヤーのuniqueID
      xuids: [] // banするプレイヤーのxuid
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
    minInterval: 1500 // ミリ秒で指定 1000ms = 1s
  },
  instaBreak: { // 壊せないブロックの破壊を検知
    state: true,
    punishment: "kick",
    place: true,
    detect: [
      "minecraft:bedrock",
      "minecraft:barrier",
      "minecraft:command_block",
      "minecraft:repeating_command_block",
      "minecraft:chain_command_block",
      "minecraft:deny",
      "minecraft:allow",
      "minecraft:border_block",
      "minecraft:light_block",
      "minecraft:end_portal",
      "minecraft:end_gateway",
      "minecraft:portal",
      "minecraft:end_portal_frame"
    ]
  },
  itemCheckA: { // 持っていたら検知 アイテムはitemList参照
    state: true,
    notifyCreative: true // クリエの人は削除だけしてbanやkickはしない
  },
  itemCheckB: { // スポーンエッグを持っていたら検知
    state: true,
    punishment: "notify"
  },
  itemCheckC: { // 1スタックに値より大きい数を持っていたら検知
    state: true,
    punishment: "notify",
    maxAmount: 64
  },
  itemCheckD: { // 不正なエンチャントを検知
    state: true,
    mode: "hand", // inventory: 全インベントリをチェックするから負荷大きめ, hand: 手持ちだけ検知だからまだまし
    punishment: "notify",
    clearItem: false
  },
  placeCheckA: { // 置いたら検知 アイテムはitemList参照
    state: true,
    notifyCreative: true, // クリエの人は削除だけしてbanやkickはしない
    antiShulker: false, // シュルカーボックスの設置をキャンセル
    shulkerExcludes: [] // シュルカー禁止を除外するタグ
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
  placeCheckC: { // 設置時に指定したブロックのデータをクリア
    state: true,
    excludeCreative: false,
    detect: [
      "minecraft:hopper",
      "minecraft:dropper",
      "minecraft:dispenser",
      "minecraft:barrel",
      "minecraft:frame",
      "minecraft:glow_frame",
      "minecraft:jukebox",
      "minecraft:smoker",
      "minecraft:lit_smoker",
      "minecraft:furnace",
      "minecraft:lit_furnace",
      "minecraft:blast_furnace",
      "minecraft:lit_blast_furnace",
      "minecraft:brewing_stand",
      "minecraft:campfire",
      "minecraft:soul_campfire",
      "minecraft:flower_pot",
      "minecraft:mob_spawner"
    ]
  },
  placeCheckD: { // 設置時に指定したエンティティのデータをクリア
    state: true,
    excludeCreative: false,
    minecarts: [ // レールの上限定
      "minecraft:hopper_minecart",
      "minecraft:chest_minecart"
    ],
    boats: [
      "minecraft:chest_boat",
      "minecraft:acacia_chest_boat",
      "minecraft:birch_chest_boat",
      "minecraft:dark_oak_chest_boat",
      "minecraft:jungle_chest_boat",
      "minecraft:mangrove_chest_boat",
      "minecraft:oak_chest_boat",
      "minecraft:spruce_chest_boat"
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
    maxItemSpawns: 100, // アイテムの数
    maxCmdMinecartSpawns: 3
  },
  entityCheckD: { // エンティティのインベントリの中をチェック
    state: true,
    spawnEgg: true,
    detect: [
      "minecraft:chest_minecart",
      "minecraft:hopper_minecart",
      "minecraft:chest_boat",
      "minecraft:mule"
    ]
  },
  reachA: { // 攻撃の長すぎるリーチを検知 (ベータ)
    state: true,
    punishment: "notify",
    maxReach: 8,
    excludeCustomEntities: true, // バニラ以外のmobの検知を除外する
    excludeEntities: [ // 除外するエンティティ
      "minecraft:ender_dragon",
      "minecraft:enderman",
      "minecraft:ghast",
      "minecraft:fireball"
    ]
  },
  reachB: { // ブロック設置の長すぎるリーチを検知 (ベータ)
    state: true,
    punishment: "notify",
    maxReach: 8,
    cancel: true, // ブロックの設置をキャンセル
  },
  reachC: { // ブロック破壊の長すぎるリーチを検知 (ベータ)
    state: true,
    punishment: "notify",
    maxReach: 8,
    cancel: true, // ブロックの破壊をキャンセル
  },
  autoClicker: { // れんつを検知 (ベータ)
    state: true,
    maxCPS: 22,
    punishment: "notify"
  },
  creative: { // クリエイティブになったら検知
    state: true,
    punishment: "notify",
    defaultGamemode: "adventure" // クリエを検知した時に設定するGamemode
  },
  speedA: { // 速すぎる移動を検知 (ベータ)
    state: true,
    punishment: "tempkick",
    flagCount: 20, // 20回以上検知されるとFlag (-1で無制限)
    maxVelocity: 2.0,
    rollback: true
  },
  others: {
    adminPanel: 'minecraft:stick', // 管理者用パネルを呼び出すためのアイテム
    sendws: false, // For discord-mcbe | メッセージをsayで出力します
    shortName: false, // チャットに出てくる"TN-AntiCheat"の表示を"TN-AC"にして圧迫感を無くします
    debug: false
  }
}