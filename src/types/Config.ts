import type { LanguageTypes } from '@/util/i18n';

export type Punishments = 'ban' | 'kick' | 'tempkick' | 'notify' | 'none';

export interface GeneralConfig {
  language: LanguageTypes;
  debug: boolean;
}

export interface ModuleConfig {
  nukerA: {
    enabled: boolean;
    punishment: Punishments;
    limit: number;
    cancel: boolean;
  }
}
  