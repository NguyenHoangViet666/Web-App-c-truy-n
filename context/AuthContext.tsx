
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  toggleLike: (novelId: string) => Promise<boolean>;
  isAdmin: boolean;
  isMod: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Auth fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        setCurrentUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (res.ok) {
        return await login(email, password);
      }
      return false;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
      if (!currentUser) return false;
      try {
          const token = localStorage.getItem('token');
          const res = await fetch('/api/users/me', {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(data)
          });
          if (res.ok) {
              setCurrentUser({ ...currentUser, ...data });
              return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
  };

  const toggleLike = async (novelId: string): Promise<boolean> => {
      if (!currentUser) return false;
      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/users/like/${novelId}`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              let likes = currentUser.likedNovelIds || [];
              if (data.liked) {
                  likes = [...likes, novelId];
              } else {
                  likes = likes.filter(id => id !== novelId);
              }
              setCurrentUser({ ...currentUser, likedNovelIds: likes });
              return true;
          }
          return false;
      } catch (e) {
          console.error(e);
          return false;
      }
  };

  const isAdmin = currentUser?.roles?.includes(Role.ADMIN) ?? false;
  const isMod = (currentUser?.roles?.includes(Role.MOD) || currentUser?.roles?.includes(Role.ADMIN)) ?? false;

  return (
    <AuthContext.Provider value={{ 
        currentUser, loading, login, register, logout, 
        isAdmin, isMod, updateProfile, toggleLike 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};