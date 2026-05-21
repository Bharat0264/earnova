"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "@/services/api";
import { IUser } from "@/utils/types";

interface AuthContextType {
  user: IUser | null;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<IUser | null>(null);

  const [loading, setLoading] = useState(true);

  // Load current user
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("earnova_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const u = data.user;

        setUser({
          id: u._id || u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        });
      } catch (error) {
        localStorage.removeItem("earnova_token");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // LOGIN
  const login = async (
    email: string,
    password: string
  ) => {
    const { data } = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    localStorage.setItem(
      "earnova_token",
      data.token
    );

    setUser(data.user);
  };

  // SIGNUP
  const signup = async (
    name: string,
    email: string,
    password: string
  ) => {
    const { data } = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
      }
    );

    localStorage.setItem(
      "earnova_token",
      data.token
    );

    setUser(data.user);
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("earnova_token");

    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};