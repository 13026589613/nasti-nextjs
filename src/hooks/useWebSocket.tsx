import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import useTokenStore from "@/store/useTokenStore";

type Props = {
  url: string;
  openPing: boolean;
  onOpen?: (data: WebSocket | null) => void;
  onMessage?: (message: MessageEvent) => void;
  onError?: (error: any) => void;
  onClose?: (close: any) => void;
  getReconnectUrl?: () => string;
  reconnectInterval?: number;
};

const useWebSocket = (props: Props) => {
  const {
    url,
    openPing,
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 3 * 1000,
  } = props;

  const router = useRouter();

  const ws = useRef<WebSocket | null>(null);

  const reconnecting = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const pingInterval = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);

  const clearReconnectTimer = () => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  };

  const clearPingInterval = () => {
    if (pingInterval.current) {
      clearInterval(pingInterval.current);
      pingInterval.current = null;
    }
  };

  const connect = () => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened", url);

      setIsConnected(true);
      reconnecting.current = false;
      clearReconnectTimer();

      if (pingInterval.current) {
        clearInterval(pingInterval.current);
      }

      if (openPing) {
        pingInterval.current = setInterval(() => {
          if (ws?.current?.readyState === WebSocket.OPEN) {
            ws.current.send("ping");
          }
        }, 30 * 1000);
      }

      onOpen?.(ws.current);
    };

    ws.current.onmessage = (e) => {
      onMessage?.(e);
    };

    ws.current.onerror = (e: any) => {
      console.log("onerror", e?.message);
      setIsConnected(false);

      clearReconnectTimer();

      attemptReconnect();

      onError?.(e);
    };

    ws.current.onclose = (e) => {
      console.log("onclose", e.code, e.reason);
      setIsConnected(false);

      clearPingInterval();

      // no token
      if (e.code === 1008) {
        router.push("/login");
        return;
      }

      // close by user
      if (e.code !== 1000) {
        // Abnormal closure
        attemptReconnect();
      }

      onClose?.(e);
    };
  };

  const attemptReconnect = async () => {
    if (reconnecting.current) return;

    reconnecting.current = true;

    console.log(`Attempting to reconnect...)`);

    setTimeout(() => {
      connect();

      reconnecting.current = false;
    }, reconnectInterval);
  };

  const onSend = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("WebSocket is open. Sending message:", message);

      ws.current.send(message);
    } else {
      console.log("WebSocket is not open. Message not sent:", message);
    }
  };

  const close = () => {
    let time = setInterval(() => {
      if (!useTokenStore.getState().accessToken) {
        clearInterval(time);
        return;
      }

      if (ws.current && ws.current.readyState === 1) {
        ws?.current?.close(1000, "User closed connection");
        ws.current = null;
        setIsConnected(false);
        clearInterval(time);
      }
    }, 50);
  };

  const open = () => {
    ws?.current?.close(1000, "User closed connection");
    ws.current = null;
    setIsConnected(false);
    connect();
  };

  return {
    ws: ws.current,
    wsStatus: ws.current?.readyState,
    isConnected,
    send: onSend,
    open: open,
    close: close,
  };
};

export default useWebSocket;
