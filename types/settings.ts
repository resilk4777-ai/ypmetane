export interface Settings {
  soundEnabled: boolean;
  effectsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  childName: string;
}

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  effectsEnabled: true,
  fontSize: 'large',
  lineHeight: 'relaxed',
  childName: '',
};
