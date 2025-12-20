import { useEffect, useRef } from "react";
import { API_BASE_URL } from "../../api/httpClient";
import useAuthStore from "../../store/authStore";
import useNotificationsStore from "../../store/notificationsStore";

const toWebSocketUrl = (httpUrl) => {
  try {
    const url = new URL(httpUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws/notifications";
    url.search = "";
    return url.toString();
  } catch (error) {
    const fallback = (httpUrl || "").replace(/^http/i, "ws");
    return `${fallback.replace(/\/$/, "")}/ws/notifications`;
  }
};

const NotificationsProvider = ({ children }) => {
  const { accessToken, isLoggedIn } = useAuthStore();
  const { pushRealtime, refreshUnreadCount, setWsConnected, reset } = useNotificationsStore();

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const pollIntervalRef = useRef(null);
  const stoppedRef = useRef(false);

  const cleanupSocket = () => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
    }
    wsRef.current = null;
  };

  const stopReconnectTimer = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) return;
    pollIntervalRef.current = setInterval(() => {
      refreshUnreadCount();
    }, 55000);
  };

  useEffect(() => {
    stoppedRef.current = false;

    if (!isLoggedIn || !accessToken) {
      stopReconnectTimer();
      stopPolling();
      cleanupSocket();
      setWsConnected(false);
      reset();
      return undefined;
    }

    const connect = () => {
      if (stoppedRef.current) return;

      cleanupSocket();
      const baseWsUrl = toWebSocketUrl(API_BASE_URL);
      const wsUrl = `${baseWsUrl}?token=${encodeURIComponent(accessToken)}`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectAttemptRef.current = 0;
          setWsConnected(true);
          stopPolling();
          refreshUnreadCount();
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload?.type === "notification" && payload?.notification) {
              pushRealtime(payload.notification);
            }
          } catch (error) {
            // ignore malformed payloads
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        ws.onclose = () => {
          setWsConnected(false);
          startPolling();
          reconnectAttemptRef.current += 1;
          const delay = Math.min(30000, 2000 * reconnectAttemptRef.current);
          stopReconnectTimer();
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        };
      } catch (error) {
        setWsConnected(false);
        startPolling();
        reconnectAttemptRef.current += 1;
        const delay = Math.min(30000, 2000 * reconnectAttemptRef.current);
        stopReconnectTimer();
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      }
    };

    refreshUnreadCount();
    connect();

    return () => {
      stoppedRef.current = true;
      stopReconnectTimer();
      stopPolling();
      cleanupSocket();
      setWsConnected(false);
    };
  }, [accessToken, isLoggedIn, pushRealtime, refreshUnreadCount, reset, setWsConnected]);

  return children;
};

export default NotificationsProvider;
