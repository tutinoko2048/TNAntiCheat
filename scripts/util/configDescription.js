export const description = {
  permission: {
    desc: '権限の設定',
    admin: '全ての検知から除外されます',
    builder: 'クリエイティブの使用が許可されます',
    ban: 'BANされます',
    tag: '使用するタグ名',
    players: '名前からbanするプレイヤーを指定',
    xuid: 'xuidからbanするプレイヤーを指定'
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
    place: '壊されたブロックを置き直すかどうかの設定',
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
    desc: 'オーバーエンチャントを検知',
    state: '有効/無効の設定',
    mode: '検知する範囲の設定',
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