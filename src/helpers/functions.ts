export const Send =
  (ws: WebSocket) => (data: { type: string; [key: string]: any }) => {
    ws.send(JSON.stringify(data));
  };
