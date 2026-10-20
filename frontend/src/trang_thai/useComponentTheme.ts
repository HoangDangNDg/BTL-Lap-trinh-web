import { create } from 'zustand';

export type ThemeColorMode = 'LIGHT' | 'DARK';

export interface ComponentThemeConfig {
  mode: ThemeColorMode;
  applyToBackground: boolean;
  applyToCards: boolean;
  applyToHeader: boolean;
  applyToSidebar: boolean;
  applyToPills: boolean;
}

interface ComponentThemeStore extends ComponentThemeConfig {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setMode: (mode: ThemeColorMode) => void;
  toggleTarget: (key: 'applyToBackground' | 'applyToCards' | 'applyToHeader' | 'applyToSidebar' | 'applyToPills') => void;
  setApplyAll: (apply: boolean) => void;
  resetToDefault: () => void;
}

const STORAGE_KEY = 'educenter_component_theme';

const DEFAULT_CONFIG: ComponentThemeConfig = {
  mode: 'LIGHT',
  applyToBackground: true,
  applyToCards: true,
  applyToHeader: true,
  applyToSidebar: true,
  applyToPills: true,
};

// Đọc cấu hình đã lưu từ localStorage
const loadInitialConfig = (): ComponentThemeConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        mode: parsed.mode === 'DARK' ? 'DARK' : 'LIGHT',
        applyToBackground: parsed.applyToBackground ?? true,
        applyToCards: parsed.applyToCards ?? true,
        applyToHeader: parsed.applyToHeader ?? true,
        applyToSidebar: parsed.applyToSidebar ?? true,
        applyToPills: parsed.applyToPills ?? true,
      };
    }
  } catch (e) {
    console.error('Không thể đọc theme từ localStorage:', e);
  }
  return DEFAULT_CONFIG;
};

// Cập nhật các class trên thẻ document.body để CSS tác động đúng từng loại thẻ
export const applyThemeToDOM = (config: ComponentThemeConfig) => {
  if (typeof document === 'undefined') return;

  const isDark = config.mode === 'DARK';
  const body = document.body;
  const root = document.documentElement;

  root.setAttribute('data-card-theme', isDark ? 'dark' : 'light');

  // Nền toàn trang (Background)
  if (isDark && (config.applyToBackground ?? true)) {
    body.classList.add('theme-bg-dark');
    root.classList.add('theme-bg-dark');
  } else {
    body.classList.remove('theme-bg-dark');
    root.classList.remove('theme-bg-dark');
  }

  // Thẻ nội dung chính (.droplet-card)
  if (isDark && config.applyToCards) {
    body.classList.add('theme-cards-dark');
  } else {
    body.classList.remove('theme-cards-dark');
  }

  // Thanh điều hướng trên (Header)
  if (isDark && config.applyToHeader) {
    body.classList.add('theme-header-dark');
  } else {
    body.classList.remove('theme-header-dark');
  }

  // Thanh menu bên (Sidebar)
  if (isDark && config.applyToSidebar) {
    body.classList.add('theme-sidebar-dark');
  } else {
    body.classList.remove('theme-sidebar-dark');
  }

  // Nút bấm & Nút tròn (.droplet-pill, .droplet-circle)
  if (isDark && config.applyToPills) {
    body.classList.add('theme-pills-dark');
  } else {
    body.classList.remove('theme-pills-dark');
  }
};

const initial = loadInitialConfig();
applyThemeToDOM(initial);

export const useComponentTheme = create<ComponentThemeStore>((set, get) => ({
  ...initial,
  isDrawerOpen: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  setMode: (mode: ThemeColorMode) => {
    set({ mode });
    const current = get();
    const updated: ComponentThemeConfig = {
      mode,
      applyToBackground: current.applyToBackground,
      applyToCards: current.applyToCards,
      applyToHeader: current.applyToHeader,
      applyToSidebar: current.applyToSidebar,
      applyToPills: current.applyToPills,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    applyThemeToDOM(updated);
  },

  toggleTarget: (key) => {
    set((state) => {
      const nextVal = !state[key];
      const updated: ComponentThemeConfig = {
        mode: state.mode,
        applyToBackground: key === 'applyToBackground' ? nextVal : state.applyToBackground,
        applyToCards: key === 'applyToCards' ? nextVal : state.applyToCards,
        applyToHeader: key === 'applyToHeader' ? nextVal : state.applyToHeader,
        applyToSidebar: key === 'applyToSidebar' ? nextVal : state.applyToSidebar,
        applyToPills: key === 'applyToPills' ? nextVal : state.applyToPills,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      applyThemeToDOM(updated);
      return { [key]: nextVal };
    });
  },

  setApplyAll: (apply: boolean) => {
    set((state) => {
      const updated: ComponentThemeConfig = {
        mode: state.mode,
        applyToBackground: apply,
        applyToCards: apply,
        applyToHeader: apply,
        applyToSidebar: apply,
        applyToPills: apply,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      applyThemeToDOM(updated);
      return {
        applyToBackground: apply,
        applyToCards: apply,
        applyToHeader: apply,
        applyToSidebar: apply,
        applyToPills: apply,
      };
    });
  },

  resetToDefault: () => {
    set({ ...DEFAULT_CONFIG });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
    } catch {}
    applyThemeToDOM(DEFAULT_CONFIG);
  },
}));
