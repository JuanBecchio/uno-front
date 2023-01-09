import React, { useCallback, useEffect, useRef, useState } from "react";

import "./style.scss";
import { useWebSocketContext } from "src/contexts/WebSocketContext";
import { useNavigate } from "react-router-dom";
import { Send } from "src/helpers/functions";

const Lobby: React.FC = () => {
  const navigate = useNavigate();

  const { ws, connected } = useWebSocketContext();

  const [errors, setErrors] = useState({ name: "", roomCode: "" });

  const nameRef = useRef<HTMLInputElement | null>(null);
  const roomCodeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!connected) return;
    ws.addEventListener("message", OnMessage);
    return () => ws.removeEventListener("message", OnMessage);
  }, [connected]);

  const OnMessage = useCallback((e: MessageEvent<any>) => {
    const msg = JSON.parse(e.data);

    switch (msg.type) {
      case "RoomCreated":
      case "JoiningRoom":
        navigate(`/${msg.roomId}`);
        break;
      case "RoomError":
        setErrors((prev) => ({ ...prev, roomCode: msg.error }));
        break;
      default:
        console.log(msg);
        break;
    }
  }, []);

  const handleCreateRoom = useCallback(() => {
    if (!validateName()) return;
    Send(ws)({ type: "CreateRoom", userName: nameRef.current!.value });
  }, []);

  const handleJoinRoom = useCallback(() => {
    if (!validateName()) return;
    if (
      !roomCodeRef.current?.value ||
      roomCodeRef.current.value.trim() === "" ||
      roomCodeRef.current.value.trim().length < 5
    ) {
      setErrors((prev) => ({ ...prev, roomCode: "Codigo no valido" }));
      return;
    }

    Send(ws)({
      type: "JoinRoom",
      userName: nameRef.current!.value,
      code: roomCodeRef.current.value,
    });
  }, []);

  const validateName = useCallback(() => {
    if (
      !nameRef.current?.value ||
      nameRef.current.value.trim() === "" ||
      nameRef.current.value.trim().length <= 4
    ) {
      setErrors((prev) => ({ ...prev, name: "Nombre no valido" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, name: "" }));
    ws.userName = nameRef.current.value;

    return true;
  }, []);

  return (
    <div className="lobby-container">
      <h1 className="title">Lobby</h1>
      <div className="connection-pannel">
        <p className={`status ${connected ? "connected" : "disconnected"}`}>
          {connected ? "Conectado" : "Desconectado"}
        </p>
        <label>Nombre:*</label>
        <input
          type="text"
          placeholder="Nombre de Usuario"
          required
          ref={nameRef}
        />
        <label className="error">{errors.name}</label>
        <div className="join-room">
          <h3>Unirse</h3>
          <input type="text" placeholder="Codigo de sala" ref={roomCodeRef} />
          <label className="error">{errors.roomCode}</label>
          <button onClick={handleJoinRoom}>Entrar</button>
        </div>
        <div className="create-room">
          <h3>Crear Sala</h3>
          <button onClick={handleCreateRoom}>Crear</button>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
