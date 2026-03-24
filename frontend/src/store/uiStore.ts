import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  bottomNavVisible: boolean;
  setSidebarOpen: (open: boolean) => void;
  setBottomNavVisible: (visible: boolean) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  bottomNavVisible: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setBottomNavVisible: (visible) => set({ bottomNavVisible: visible }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
