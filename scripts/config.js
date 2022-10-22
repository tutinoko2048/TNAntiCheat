export default
{
  "crasher": {
    "state": true, // crasher検知(pcだと動きます
  },
  "nuker": {
    "state": true,
    "limit": 8 // 1tickに何ブロックの破壊で検知するか(ラグも考慮)
  },
  "tag": {
    "op": "ac:admin", // 検知から除外するタグです
    "kick": "ac:ban" // kickするタグです。何も書かなければ無効化
  },
  "nameCheck": {
    "state": true,
    "maxLength": 20, // 指定した値より大きければkick
  },
  "spamCheck": {
    "maxLength": 100, // -1指定で長さ制限なし
    "duplicate": true // 重複するチャットを制限
  },
  "itemCheck": { // 持つとkick
    "drop": true, // ドロップ状態のアイテムを検知
    "state": true,
    "spawnEgg": true, // trueならスポーンエッグ全てを検知
    "detect": [
      "minecraft:movingBlock",
      "minecraft:movingblock",
      "minecraft:moving_block",
      "minecraft:mob_spawner",
      "minecraft:invisiblebedrock",
      "minecraft:invisible_bedrock",
      "minecraft:bee_hive"
      "minecraft:water",
      "minecraft:flowing_lava",
      "minecraft:flowing_water",
      "minecraft:bedrock",
      "minecraft:barrier"
    ]
  },
  "placeCheck": { // 置くとkick
    "state": true,
    "detect": [
      "minecraft:movingBlock",
      "minecraft:movingblock",
      "minecraft:moving_block",
      "minecraft:beehive",
      "minecraft:bee_nest",
      "minecraft:mob_spawner",
      "minecraft:invisiblebedrock",
      "minecraft:tnt",
      "minecraft:lava",
      "minecraft:water",
      "minecraft:flowing_lava",
      "minecraft:flowing_water",
      "minecraft:lava_bucket",
      "minecraft:axolotl_bucket",
      "minecraft:cod_bucket",
      "minecraft:pufferfish_bucket",
      "minecraft:salmon_bucket",
      "minecraft:tropical_fish_bucket",
      "minecraft:respawn_anchor",
      "minecraft:bedrock",
      "minecraft:barrier"
    ]
  },
  "entityCheck": { // いたらkill
    "state": true,
    "detect": [
      "minecraft:command_block_minecart",
      "minecraft:movingBlock",
      "minecraft:movingblock",
      "minecraft:moving_block",
      "minecraft:tnt",
      "minecraft:npc"
    ]
  },
  "containerCheck": { // 置いたときに中身をチェック 一部ブロックは非対応
    "state": true,
    "detect": [
      "minecraft:chest",
      "minecraft:trapped_chest"
    ]
  },
  "enchantCheck": { // オーバーエンチャントを検知
    "state": true,
    "mode": "hand" // inventory: 全インベントリをチェックするから負荷大きめ, hand: 手持ちだけ検知だからまだまし
  },
  "others": {
    "sendws": false // For discord-mcbe | メッセージをsayで出力します
  }
}
