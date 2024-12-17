import React, { createContext, useState, useContext, ReactNode } from "react";

type UserContextType = {
  user: { name: string; id: string; role: string } | null;
  setUser: (user: { name: string; id: string; role: string } | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ name: string; id: string; role: string } | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser harus digunakan di dalam UserProvider");
  }
  return context;
};
