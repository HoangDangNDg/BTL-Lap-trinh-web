import { create } from 'zustand';
import { LoginResponse } from '../kieu_du_lieu/xac_thuc';

interface AuthState {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  login: (userData: LoginResponse) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasRoleOrPermission: (roleOrPermission: string) => boolean;
}

const getInitialUser = (): LoginResponse | null => {
  try {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const initialUser = getInitialUser();

export const useTrangThaiXacThuc = create<AuthState>((set, get) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  
  login: (userData) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (e) {}
    set({ 
      user: userData, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    try {
      localStorage.removeItem('auth_user');
    } catch (e) {}
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },
  
  hasRole: (role) => {
    const { user } = get();
    if (!user) return false;
    return user.vaiTro === role;
  },
  
  hasPermission: (permission) => {
    const { user } = get();
    if (!user || !user.quyenHan) return false;
    return user.quyenHan.includes(permission) || user.quyenHan.includes("ALL_PERMISSIONS");
  },

  hasRoleOrPermission: (val) => {
    return get().hasRole(val) || get().hasPermission(val);
  }
}));



