import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // ШИНЭЭР НЭМСЭН

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_id: number; 
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; 
  login: (token: string, user: User) => void;
  logout: () => void;
}

// persist ашиглан state-ийг үүсгэх
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null, // persist автоматаар унших тул эндээс localStorage дуудах шаардлагагүй
      isAuthenticated: false,
      isLoading: false, 

      login: (token, user) => {
        // Таны хуучин кодууд (axios interceptor г.м) шууд token-оо нэхэж магадгүй тул
        // давхар localStorage дээр уламжлалт байдлаар нь хадгалж орхиё.
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage', // Баазад хадгалагдах нэр (Local Storage дотор)
    }
  )
);