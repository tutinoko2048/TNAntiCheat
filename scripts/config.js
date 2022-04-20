export default
{
  opTag: 'admin',
  detectItem: true,
  detect: [ // ここに書いたブロック,アイテム,エンティティを所持したり設置したり出したりすると検知されるよ
    'minecraft:movingBlock',
    'minecraft:movingblock',
    'minecraft:moving_block',
    'minecraft:beehive',
    'minecraft:bee_nest',
    'minecraft:mob_spawner',
    'minecraft:invisiblebedrock',
    'minecraft:npc',
    'minecraft:command_block_minecart',
    'minecraft:tnt',
    'minecraft:lava',
    'minecraft:water',
    'minecraft:flowing_lava',
    'minecraft:flowing_water',
    'minecraft:lava_bucket',
    'minecraft:axolotl_bucket',
    'minecraft:cod_bucket',
    'minecraft:pufferfish_bucket',
    'minecraft:salmon_bucket',
    'minecraft:tropical_fish_bucket',
    'minecraft:respawn_anchor'
  ],
  crasher: true,
  checkName: true,
  tagKick: 'ban', // タグがついてる人にkickコマンドを実行。何も書かなければ無効化
  chatLength: 100,
  chatDuplicate: true
}
