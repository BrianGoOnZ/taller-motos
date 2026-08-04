import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    set({ user: response.data.user, isLoading: false });
    return response.data.user;
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null });
  },

  fetchMe: async () => {
    try {
      const response = await api.get("/auth/me");
      set({ user: response.data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));

export default useAuthStore;
