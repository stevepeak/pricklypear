import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getConnections } from "@/services/users/userService.js";
import { useAuth } from "@/contexts/AuthContext";
import type { Connection } from "@/types/connection";

interface ConnectionsContextType {
  connections: Connection[];
  isLoading: boolean;
  refreshConnections: () => Promise<void>;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(
  undefined,
);

export const ConnectionsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshConnections = async () => {
    if (!user) {
      setConnections([]);
      return;
    }
    setIsLoading(true);
    try {
      const allConnections = await getConnections();
      setConnections(allConnections);
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ConnectionsContext.Provider
      value={{ connections, isLoading, refreshConnections }}
    >
      {children}
    </ConnectionsContext.Provider>
  );
};

export const useConnectionsContext = () => {
  const ctx = useContext(ConnectionsContext);
  if (!ctx)
    throw new Error(
      "useConnectionsContext must be used within a ConnectionsProvider",
    );
  return ctx;
};
