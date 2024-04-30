import { ja_JP } from '@/lang/ja_JP';
import { en_US } from '@/lang/en_US';
import { config } from '@config';

const languages = {
  ja_JP,
  en_US
}
export type LanguageTypes = keyof typeof languages;

const defaultFallbackLanguage = 'ja_JP';

function translate(key: keyof typeof languages[typeof defaultFallbackLanguage], ...args: string[]): string {
  let str = languages[config.general.language][key] ?? languages[defaultFallbackLanguage][key];
  if (!str) return key;
  for (const i in args) {
    str = str.replace(new RegExp(`$${i}`, 'g'), String(args[i])) as any;
  }
  return str;
}
export { translate as _t }
