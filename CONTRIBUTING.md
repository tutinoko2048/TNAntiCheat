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
`git switch main`でmainに移動して  
`git merge dev`でマージ  
`git push`で変更内容をプッシュします

## その他注意点やメモ
- バージョンを上げる時はmanifestを4箇所, package.jsonを1箇所, util/constantsを1箇所編集します
- クラスに新しくプロパティ生やす時は`scripts/types.d.ts`に定義を追加してください
- コマンドの追加は`commands/index.js`でしてます
- イベントのsubscribeは基本`ac.js`内で行います
- Configに変更を加えたら1番上のConfigVersionを上げます(変更があったことを分かりやすくする)
- Configに値を追加したら`util/config_description`に値の説明を書きます(ConfigPanelで表示する用)
