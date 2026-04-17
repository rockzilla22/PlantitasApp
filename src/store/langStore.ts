import { atom } from 'nanostores';

export type Lang = 'es' | 'en';

export const $lang = atom<Lang>(
  (typeof document !== 'undefined' && 
   document.cookie.match(/(?:^|;\s*)lang=([^;]*)/)?.[1] as Lang) || 'es'
);