# Contributing
このプロジェクトへの貢献をお考えいただきありがとうございます！  
変更を加えたりPRを出したりする時は以下のことを守ってください  
バグ報告はIssueを立てるかDiscordサーバーでお願いします

## ブランチ
編集する時やプルリクエストを送る時は`dev`ブランチを使います。**基本的に`main`には直接コミットしないでください。**  

## 編集するとき
アプデ対応やらバグ発見やらが超楽になるのでJSDocはつけてほしいです  

1. `npm i`でマイクラの型定義などをインストール  
バージョンに合った型定義を入れてください [バージョン一覧](https://www.npmjs.com/package/@minecraft/server?activeTab=versions)  
2. 編集できたら`npm run lint`でeslintとtscが通るか確認。だめだったら直してください。

## マージするとき
- devからmain  
`git switch main`でmainに移動
`git pull`で最新の変更を取得(一応)  
`git merge dev`でマージ  
`git push`で変更内容をプッシュします  
`git switch dev`でdevに戻っておきます(mainにpush誤爆防止)

## 新バージョンのリリース
- 開発ブランチ`dev`から`main`に変更内容をマージ(上参照)
- GithubでReleaseを作成  
書き方は前のバージョンのものに従ってください。  
Assetsのmcpackは自動でアップロードされるので触らなくて大丈夫です

## バージョンの付け方
`x.y.z`  
x: 大きな変更がある(コード丸ごと書き直しなど)の時に上げます。基本そのままです  
y: マイクラのバージョンが上がったら(=アプデ対応の時)上げます  
z: 小さな変更やバグ修正がある時上げます

## その他注意点やメモ
- バージョンを上げる時はmanifestを4箇所, package.jsonを1箇所, util/constantsを1箇所編集します
- クラスに新しくプロパティ生やす時は`scripts/types.d.ts`に定義を追加してください
- コマンドの追加は`commands/index.js`でしてます
- イベントのsubscribeは基本`ac.js`内で行います
- Configに変更があるリリースの場合は1番上のConfigVersionを1上げておきます(変更があったことを分かりやすくする)
- Configに値を追加したら`util/config_description`に値の説明を書きます(ConfigPanelで表示する用)
