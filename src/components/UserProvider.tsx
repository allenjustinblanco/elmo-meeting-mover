"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  userId: string;
  userName: string;
  setUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
      setUserId(newUserId);
      localStorage.setItem("userId", newUserId);
    }

    const storedUserName = localStorage.getItem("userName");
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  const updateUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem("userName", name);
  };

  return (
    <UserContext.Provider
      value={{ userId, userName, setUserName: updateUserName }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
