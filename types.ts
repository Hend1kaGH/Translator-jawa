
export enum JavaneseLevel {
  NGOKO = 'Ngoko',
  KRAMA_MADYA = 'Krama Madya',
  KRAMA_ALUS = 'Krama Alus'
}

export enum Context {
  PEER = 'Teman Sebaya',
  ELDER = 'Orang Tua/Simbah',
  CHILD = 'Anak Kecil'
}

export interface TranslationResult {
  translatedText: string;
  level: JavaneseLevel;
  explanation: string;
}

export interface QuickScenario {
  id: string;
  label: string;
  icon: string;
  text: string;
}
