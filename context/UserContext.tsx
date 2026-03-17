"use client";

import { createContext, useContext, useState } from "react";

type UserContextType = {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
};

const UserContext = createContext<UserContextType>({
  avatarUrl: null,
  setAvatarUrl: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ avatarUrl, setAvatarUrl }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);