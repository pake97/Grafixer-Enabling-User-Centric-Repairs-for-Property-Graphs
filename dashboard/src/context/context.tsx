// src/context/SessionContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode , useEffect} from 'react';

export type User = {
  username: string;
  link: string;
};

export type Session = {
  graph: any;
  constraints: string[];
  users: User[];
  constraintsFinished: boolean;
};

export interface SessionContextProps {
  propertyForm: Session | null;
  updatePropertyForm: (property: Partial<Session>) => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  
 
  
  const [propertyForm, setPropertyForm] = useState<Session | null>(null);

  
  const updatePropertyForm = (property: Partial<Session>) => {
    
    setPropertyForm((prev) => ({
      graph: prev?.graph ?? null,
      constraints: prev?.constraints ?? [],
      constraintsFinished: prev?.constraintsFinished ?? false,
      users: prev?.users ?? [],
      ...property,
    }));
  };

  return (
    <SessionContext.Provider value={{ propertyForm, updatePropertyForm }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
