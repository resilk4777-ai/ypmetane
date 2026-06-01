export interface Settings {
  soundEnabled: boolean;
  effectsEnabled: boolean;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: 'normal' | 'relaxed' | 'loose';
}

export const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  effectsEnabled: true,
  fontSize: 'large',
  lineHeight: 'relaxed',
};
