import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const NotificationContext = createContext(null);

export function useNotification() {
  const notify = useContext(NotificationContext);
  if (!notify) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return notify;
}

export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const nextId = useRef(0);

  const notify = useCallback((message, type = "success") => {
    nextId.current += 1;
    setNotification({ id: nextId.current, message, type });
  }, []);

  useEffect(() => {
    if (!notification) return undefined;
    const timeoutId = window.setTimeout(() => setNotification(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notification && (
        <div
          key={notification.id}
          role={notification.type === "error" ? "alert" : "status"}
          aria-live={notification.type === "error" ? "assertive" : "polite"}
          style={{
            position: "fixed",
            top: "18px",
            right: "18px",
            zIndex: 2000,
            maxWidth: "min(360px, calc(100vw - 36px))",
            padding: "10px 14px",
            borderRadius: "8px",
            background:
              notification.type === "error" ? "#8f3525" : "#398c6b",
            color: "white",
            boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}
