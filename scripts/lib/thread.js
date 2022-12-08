// Thread for runCommandAsync
// Thanks: https://discord.com/channels/950040604186931351/969011166443626506/1036153419133636688
// author: Potchie @HotchPotchie_ch

import { system } from "@minecraft/server";

// スレッドを回す際の上限となる秒数（ミリ秒）
// watchdogが6msまでの遅延を許容するので6msより小さい値にすれば番犬は吠えない。
// watchdogを無効化するコードを入れている場合、32msくらいまで大きくできるけど
// setblockとか負荷の高い系のコマンドの場合はせいぜい10msくらいにしておかないと
// エラーが発生するので、カリカリにチューニングしたい場合以外は0.1～5.5msが無難
const THRESHOLD = 12.0;

/** @type Generator[] 疑似スレッドで実行するタスク（ジェネレータ）の配列 */
let tasks = [];
/** 疑似スレッド稼働状況 */
export let isRunning = false;
// ジェネレータの実行結果を格納
export let results = [];

/**
 * 疑似スレッド.
 * ジェネレータ関数を受け取ります。
 * @param {Generator} task 
 */
export function thread(task) {
  tasks.push(task());
  if (!isRunning) {
    isRunning = true;
  }
}

system.run(function tick(ev) {
  try {
    system.run(tick);
    if (isRunning === true) {
      const ms = Date.now();
      //現在時刻から保存した時刻を減算して閾値より小さい間はGenerator関数を回す
      while (Date.now() - ms < THRESHOLD) {
        // queueの先頭からタスクを取り出す
        const task = tasks.shift();
        const current = task.next();
        if (current.done) {
          // キューに積んだタスクがなくなったら実行停止
          if (isRunning && tasks.length === 0) {
            isRunning = false;
            results.push(current.value);
            return;
          }
          continue;
        }
        // 閾値ms以内に実行できなかったタスクは再びqueueに戻す
        tasks.push(task);
        results.push(current.value);
      }
    }
  } catch (error) {
    // 何かしらのエラーが発生した場合にqueueを空にしてスレッドを止める
    // エラーの９割はマイクラ側のコマンドキューの枯渇時に発生する
    console.warn(error);
    tasks = [];
    results = [];
    isRunning = false;
  }
});
