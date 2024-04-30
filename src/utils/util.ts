export class Util {
 static randomValue<T>(array: T[]): T {
   return array[Math.floor(Math.random() * array.length)];
 }
}