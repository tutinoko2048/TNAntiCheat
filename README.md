# TNAntiCheat
MinecraftBE用のチート対策アドオンです。  
※ワールドの設定から "ゲームテスト フレームワーク" を必ず有効にしてください  
[ここ](https://github.com/tutinoko2048/TNAntiCheat/releases)から最新のものをダウンロードできます。  
  
https://youtu.be/SZq9z7Lt2bc  
  
![img1](docs/hasitem.jpeg)  
  
![img2](docs/kicked.jpeg)  
  
![img3](docs/enchant.jpeg)  
  
![img4](docs/container.jpeg)  

  
※一部のコードはMrDiamond64様の[Scythe-AntiCheat](https://github.com/MrDiamond64/Scythe-AntiCheat)を参考にしています。
  
## 実装済み
- 禁止アイテムやブロックの所持,設置検知  
アイテム一覧は`scripts/config.js`を参照  
- 禁止エンティティのkill
- Crasherの検知(pcだと動きます)
- 長すぎる名前の検知
- tagKick  
"ac:ban"のタグがついた人を自動でkickします
- チェスト設置時に中身をチェック
- 重複した内容のチャットをブロック
- 100文字以上の長いチャットをブロック
- ドロップ状態の禁止アイテムの検知
- オーバーエンチャントの検知
- Nukerの検知

## config
config.jsを編集することで禁止アイテムの追加/削除, 各種機能の有効化/無効化をすることができます  
タグのついたプレイヤー(デフォルトではadmin)は検知から除外されます  

![config](docs/config.png)
  
### crasher
`state: boolean;`

### nuker
`state: boolean;`  
  
`limit: number;`

### tag
`op: string;`  
  
`kick: string;`

### nameCheck
`state: boolean;`  
  
`maxLength: number;`  
  
### spamCheck
`maxLength: number;`  
  
`duplicate: boolean;`  
  
### itemCheck
`drop: boolean;`  
  
`state: boolean;`  
  
`spawnEgg: boolean;`  
  
`detect: string[];`  
  
### placeCheck
`state: boolean;`  
  
`detect: string[];`  
  
### entityCheck
`state: boolean;`  
  
`detect: string[];`  

### containerCheck
`state: boolean;`  
  
`detect: string[];`  
### enchantCheck
`state: boolean;`  
  
`mode: string;`
### sendws
`state: boolean;`

