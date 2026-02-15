
export enum JavaneseLevel {
  NGOKO = 'Ngoko',
  KRAMA_MADYA = 'Krama Madya',
  KRAMA_ALUS = 'Krama Alus'
}

export type Context = string;

export const DEFAULT_CONTEXTS: Context[] = [
  'Teman Sebaya',
  'Orang Tua/Simbah'
];

export interface TranslationResult {
  translatedText: string;
  level: JavaneseLevel;
  explanation: string;
}

export interface Situation {
  id: string;
  label: string;
  prompt: string;
}

export const SITUATIONS: Situation[] = [
  { id: 'sungkem', label: 'Sungkeman', prompt: 'Saya ingin melakukan sungkeman kepada orang tua untuk memohon maaf atas kesalahan saya.' },
  { id: 'mertua', label: 'Kenalan Mertua', prompt: 'Saya ingin memperkenalkan diri secara sopan kepada calon mertua.' },
  { id: 'izin', label: 'Minta Izin', prompt: 'Saya ingin meminta izin untuk pergi keluar sebentar.' },
  { id: 'syukur', label: 'Ucapan Syukur', prompt: 'Saya ingin mengucapkan terima kasih yang sangat dalam atas bantuan yang diberikan.' },
  { id: 'tamu', label: 'Menyambut Tamu', prompt: 'Saya ingin menyambut tamu agung yang datang ke rumah.' }
];
