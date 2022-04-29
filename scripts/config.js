export default
{
  "crasher": true,
  "nuker": {
    "state": true,
    "limit": 5 // 1tickに何ブロックの破壊で検知するか
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
    "duplicate": true
  },
  "itemCheck": { // 持つとkick, 落とすとkill
    "state": true,
    "spawnEgg": true, // trueならスポーンエッグを検知
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
      "minecraft:bedrock"
    ]
  },
  "entityCheck": { // あったらkill
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
  "containerCheck": { // 設置時に中身をチェック 一部ブロックは非対応
    "state": true,
    "detect": [
      "minecraft:chest"
    ]
  },
  "enchantCheck": { // オーバーエンチャントを検知
    "inventory": false, // インベントリ全てをチェックするので結構重いです
    "hand": true // 手持ち検知だからまだまし
  }
}