import React, { useContext, useEffect, useMemo, useState } from "react";

type WebSocketContextProps = {
  ws: WebSocket & { id?: string; userName?: string };
  connected: boolean;
};

const ws: WebSocket & { id?: string } = new WebSocket("ws://127.0.0.1:8080");
export const WebSocketContext = React.createContext<WebSocketContextProps>({
  ws,
  connected: false,
});

type WebSocketProviderProps = {
  children?: React.ReactElement;
};

const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected");
      setConnected(true);
    };
    ws.onclose = () => {
      console.log("Disconnected");
      setConnected(false);
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "ClientID") ws.id = msg.id;
    };
    ws.onerror = (e) => console.error(e);
  }, []);

  const values = useMemo(() => ({ ws, connected }), [ws, connected]);
  return (
    <WebSocketContext.Provider value={values}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;

export const useWebSocketContext = () => useContext(WebSocketContext);
