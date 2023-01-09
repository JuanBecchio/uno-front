import React, { useCallback, useContext, useMemo, useState } from "react";
import "./styles.scss";

export type ModalElementProps = {
  close: <T>(data?: T) => void;
};

type ModalsContextValues = {
  showModal: <T>(
    Element: React.FC<ModalElementProps>,
    autoClose?: boolean
  ) => Promise<T>;
};

export const ModalsContext = React.createContext<ModalsContextValues>({
  showModal: <T extends unknown>() => new Promise(() => null as T),
});

export const useModalsContext = () => useContext(ModalsContext);

const ModalsContextProvider: React.FC<{ children: React.ReactElement }> = ({
  children,
}) => {
  const [modals, setModals] = useState<
    { render: JSX.Element; autoClose: boolean }[]
  >([]);

  const handleClose = useCallback(
    (index: number) => () =>
      setModals((prev) => {
        prev.splice(index, 1);
        return [...prev];
      }),
    []
  );

  const showModal = useCallback(
    <T extends unknown>(
      Element: React.FC<ModalElementProps>,
      autoClose = true
    ) =>
      new Promise((resolve: (data: T) => void) => {
        setModals((prev) => {
          const index = prev.length;

          const modal = {
            render: (
              <div
                className="modal"
                key={index}
                onClick={(e) => e.stopPropagation()}
              >
                {autoClose && (
                  <button
                    className="autoclose-button"
                    onClick={handleClose(index)}
                  />
                )}
                <Element
                  close={(data) => {
                    resolve(data as T);
                    handleClose(index)();
                  }}
                />
              </div>
            ),
            autoClose,
          };
          return [...prev, modal];
        });
      }),
    []
  );

  const value = useMemo(() => ({ showModal }), [showModal]);

  return (
    <ModalsContext.Provider value={value}>
      {children}
      {modals.length > 0 && (
        <div
          className="modals-wrapper"
          onClick={() => {
            if (!modals[modals.length - 1].autoClose) return;
            modals.pop();
            setModals([...modals]);
          }}
        >
          {modals.map((m) => m.render)}
        </div>
      )}
    </ModalsContext.Provider>
  );
};

export default ModalsContextProvider;
