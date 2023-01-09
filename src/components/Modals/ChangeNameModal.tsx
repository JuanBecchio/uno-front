import { useCallback, useRef } from "react";
import { ModalElementProps } from "src/contexts/ModalsContext";

const ChangeNameModal: React.FC<ModalElementProps> = ({ close }) => {
  const nameRef = useRef("");

  const handleNameAccept = useCallback(() => {
    if (nameRef.current.trim().length < 3) return;
    close(nameRef.current);
  }, []);
  return (
    <div className="df-c j-center a-center">
      <input
        type="text"
        placeholder="Nombre de Usuario"
        onChange={(e) => (nameRef.current = e.target.value)}
      />
      <button onClick={handleNameAccept}>Aceptar</button>
    </div>
  );
};

export default ChangeNameModal;
