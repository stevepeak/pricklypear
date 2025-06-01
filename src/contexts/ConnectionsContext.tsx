import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { getConnections } from "@/services/users/userService.js";
import { useAuth } from "@/contexts/AuthContext";
import type { ConnectedUser } from "@/types/connection";

interface ConnectionsContextType {
  connections: ConnectedUser[];
  isLoading: boolean;
  refreshConnections: () => Promise<void>;
}

const ConnectionsContext = createContext<ConnectionsContextType | undefined>(
  undefined,
);

export const ConnectionsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<ConnectedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshConnections = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    if (!user) return;
    refreshConnections();
  }, [user, refreshConnections]);

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
