# TNAntiCheat
アドオンで適当にチート対策してみる
  
https://youtu.be/SZq9z7Lt2bc  
  
## 実装済み
- 禁止アイテム,エンティティの所持,設置検知 
アイテム一覧(追加/削除可能) 詳しくは[config](#config)を参照  
  - movingBlock
  - beehive
  - bee_nest
  - mob_spawner
  - invisiblebedrock
  - npc
  - command_block_minecart
  - tnt
  - lava
  - water
  - flowing_lava
  - flowing_water
  - lava_bucket
  - axolotl_bucket
  - cod_bucket
  - pufferfish_bucket
  - salmon_bucket
  - tropical_bucket
  - respawn_anchor
  - spawn_egg

- Crasher
- 長すぎる名前の検知
- tagKick  
"ban"のタグがついた人を自動でkickします
- チェスト設置時に中身をチェック
- 重複した内容のチャットをブロック
- 100文字以上の長いチャットをブロック

## やりたいやつ
- オバエン検知(preview only
- リーチ?(preview only
- れんつ?(preview only

## config
config.jsを編集することで禁止アイテムの追加/削除, 各種機能の有効化/無効化をすることができます  
タグのついたプレイヤー(デフォルトではadmin)は検知から除外されます
