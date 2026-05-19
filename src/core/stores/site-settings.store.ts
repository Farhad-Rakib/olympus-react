import { create } from 'zustand';

export interface SiteSettingEntry {
  id: number;
  key: string;
  value: string | null;
  description: string | null;
}

interface SiteSettingsState {
  sidebarColors: Record<string, string>;
  siteTitle: string;
  settings: SiteSettingEntry[];
  setSidebarColors: (colors: Record<string, string>) => void;
  setSiteTitle: (title: string) => void;
  setSettings: (settings: SiteSettingEntry[]) => void;
  getSettingValue: (key: string) => string | null;
}

export const useSiteSettingsStore = create<SiteSettingsState>()((set, get) => ({
  sidebarColors: {},
  siteTitle: '',
  settings: [],
  setSidebarColors: (colors) => {
    const current = get().sidebarColors;
    if (JSON.stringify(current) !== JSON.stringify(colors)) {
      set({ sidebarColors: colors });
    }
  },
  setSiteTitle: (title) => {
    if (get().siteTitle !== title) {
      set({ siteTitle: title });
      if (title) document.title = title;
    }
  },
  setSettings: (settings) => {
    if (get().settings.length === settings.length && get().settings === settings) return;
    const titleSetting = settings.find(s => s.key === 'site_title' || s.key === 'SiteTitle' || s.key === 'siteTitle');
    const newTitle = titleSetting?.value || '';
    const updates: Partial<SiteSettingsState> = { settings };
    if (newTitle && newTitle !== get().siteTitle) {
      updates.siteTitle = newTitle;
      document.title = newTitle;
    }
    set(updates);
  },
  getSettingValue: (key: string) => {
    const s = get().settings.find(s => s.key === key);
    return s?.value || null;
  },
}));
