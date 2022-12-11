export const description = {
  permission: {
    desc: '権限の設定',
    admin: '全ての検知から除外される権限',
    builder: 'クリエイティブの使用が許可される権限',
    ban: 'BANされます',
    encrypt: 'タグを難読化して不正に権限を取られにくくする',
    tag: '使用するタグ名 (encryptが有効な場合は使われない)',
    players: '名前でプレイヤーを指定',
    ids: 'ID(Form上で見られます)でプレイヤーを指定',
    xuids: 'xuidでプレイヤーを指定'
  },
  command: {
    desc: 'コマンド関係の設定',
    prefix: 'prefix(コマンドの先頭につける文字)'
  },
  itemList: {
    desc: 'アイテム系のモジュールで使用する禁止アイテムの設定',
    ban: 'このアイテムを使用/所持したプレイヤーはBANされます',
    kick: 'このアイテムを使用/所持したプレイヤーはKICKされます',
    notify: 'このアイテムを使用/所持したプレイヤーは通知されます'
  },
  crasher: {
    desc: 'Crasherを検知 (仕様上PC限定)',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応'
  },
  nuker: {
    desc: 'Nukerを検知',
    state: '有効/無効の設定',
    limit: '1tickに何ブロックの破壊で検知するかの設定(ラグも考慮)',
    place: '壊されたブロックを再設置する',
    punishment: '検知された場合の対応'
  },
  namespoof: {
    desc: '不正な名前を検知します',
    state: '有効/無効の設定',
    maxLength: '名前の長さの最大値',
    punishment: '検知された場合の対応'
  },
  spammerA: {
    desc: '長文すぎるチャットを制限',
    state: '有効/無効の設定',
    maxLength: '最大文字数'
  },
  spammerB: {
    desc: '重複するチャットを制限',
    state: '有効/無効の設定'
  },
  spammerC: {
    desc: '速すぎるチャットを制限',
    state: '有効/無効の設定',
    minInterval: '最小の間隔 (ミリ秒で指定)'
  },
  instaBreak: {
    desc: '壊せないブロックの破壊を検知',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応',
    place: '壊されたブロックを再設置する',
    detect: '検知するブロックのID'
  },
  itemCheckA: {
    desc: '禁止アイテムを持っていたら検知',
    state: '有効/無効の設定',
    notifyCreative: 'true -> クリエの人は削除だけしてbanやkickはしない'
  },
  itemCheckB: {
    desc: 'スポーンエッグを持っていたら検知',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応'
  },
  itemCheckC: {
    desc: '1スタックに値より大きい数を持っていたら検知',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応',
    maxAmount: '最大スタック数'
  },
  itemCheckD: {
    desc: '不正なエンチャントを検知',
    state: '有効/無効の設定',
    mode: '検知レベルの設定',
    punishment: '検知された場合の対応'
  },
  placeCheckA: {
    desc: '禁止アイテムを置いたら検知',
    state: '有効/無効の設定',
    notifyCreative: 'true -> クリエの人はキャンセルだけしてbanやkickはしない',
    antiShulker: 'シュルカーボックスの設置をキャンセルするかどうか'
  },
  placeCheckB: {
    desc: '設置した時にインベントリをチェック (一部ブロックは非対応)',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応',
    spawnEgg: 'スポーンエッグを含めるかどうか',
    detect: '検知するインベントリ付きブロックのID'
  },
  placeCheckC: {
    desc: '設置時にブロックのデータをリセットします (ディスペンサーNBT対策)',
    state: '有効/無効の設定',
    excludeCreative: 'クリエの人は除外する',
    detect: '検知するブロックのID'
  },
  entityCheckA: {
    desc: '指定されたエンティティのスポーンを検知',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応',
    detect: '検知するエンティティ'
  },
  entityCheckB: {
    desc: 'ドロップ状態の禁止アイテムを検知',
    state: '有効/無効の設定',
    spawnEgg: 'スポーンエッグを含めるかどうか',
    punishment: '検知された場合の対応'
  },
  entityCheckC: {
    desc: '大量のエンティティのスポーンを検知',
    state: '有効/無効の設定',
    maxArrowSpawns: '1tickにスポーンできる矢の数',
    maxItemSpawns: '1tickにスポーンできるアイテムの数',
    maxCmdMinecartSpawns: '1tickにスポーンできるコマブロ付きトロッコの数'
  },
  entityCheckD: {
    desc: 'エンティティのインベントリの中をチェック',
    state: '有効/無効の設定',
    spawnEgg: 'スポーンエッグを含めるかどうか',
    detect: '検知するエンティティ'
  },
  reach: {
    desc: 'ブロックの設置/破壊 攻撃の長すぎるリーチを検知 (ベータ)',
    state: '有効/無効の設定',
    blockReach: '設置/破壊時の最大リーチ',
    attackReach: '攻撃時の最大リーチ',
    cancel: 'ブロックの設置破壊をキャンセルする',
    punishment: '検知された場合の対応',
    excludeCustomEntities: 'バニラ以外のmobの検知を除外',
    excludeEntities: '除外するエンティティ'
  },
  autoClicker: {
    desc: '速すぎるクリックを検知 (ベータ)',
    state: '有効/無効の設定',
    maxCPS: '1秒あたりの最大クリック数',
    punishment: '検知された場合の対応'
  },
  creative: {
    desc: 'クリエイティブになったら検知',
    state: '有効/無効の設定',
    punishment: '検知された場合の対応',
    defaultGamemode: '検知した時に設定するGamemode'
  },
  others: {
    adminPanel: '管理者用パネルを呼び出すためのアイテム',
    sendws: 'メッセージをsayで出力します (discord-mcbe用)',
    shortName: 'チャットに出てくる"TN-AntiCheat"の表示を"TN-AC"にして圧迫感を無くします',
    debug: 'ログを表示 デバッグ用'
  }
}