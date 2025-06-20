import { useConnectionsContext } from "@/contexts/ConnectionsContext";

export const useConnections = () => {
  const { connections, isLoading, refreshConnections } =
    useConnectionsContext();
  const acceptedConnections = connections.filter(
    (conn) => conn.status === "accepted",
  );

  return {
    connections,
    acceptedConnections,
    isLoading,
    refreshConnections,
    lookupById: (id: string) => connections.find((conn) => conn.id === id),
  };
};
