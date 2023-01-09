import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./main.scss";

import Lobby from "src/pages/Lobby";
import Game from "src/pages/Game";
import WebSocketProvider from "./contexts/WebSocketContext";
import ModalsContextProvider from "./contexts/ModalsContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ModalsContextProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/:roomId" element={<Game />} />
          </Routes>
        </BrowserRouter>
      </WebSocketProvider>
    </ModalsContextProvider>
  </React.StrictMode>
);
