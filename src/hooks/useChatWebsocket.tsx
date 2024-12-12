import { useEffect, useRef } from "react";

import { getWebsocketUrl } from "@/api/chat";
import useTokenStore from "@/store/useTokenStore";

type UseChatWebsocketType = {
  messageDidReceive: (message: any) => void;
  messagePending?: (message: any) => void;
  messageReceivedFailed?: (message: any) => void;
  channelsChanged?: (message: any) => void;
  channelMembershipsChanged?: (message: any) => void;
};

const useChatWebsocket = (props: UseChatWebsocketType) => {
  const {
    messageDidReceive,
    messageReceivedFailed,
    messagePending,
    channelsChanged,
    channelMembershipsChanged,
  } = props;

  const reconnectInterval = 10 * 1000;

  const ws = useRef<WebSocket | null>(null);

  const connectWebsocket = () => {
    if (!useTokenStore.getState().accessToken) {
      return;
    }
    getWebsocketUrl().then((res) => {
      if (res.code === 200) {
        connect(res.data);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close(1000, "User logged out");
        ws.current = null;
      }
    };
  }, []);

  const isSessionEstablished = useRef(false);

  const messagesProcessor = async (message: any) => {
    const messageType = message?.headers["x-amz-chime-event-type"];
    const record = JSON.parse(message?.payload);
    switch (messageType) {
      // Channel Messages
      case "CREATE_CHANNEL_MESSAGE":
      case "REDACT_CHANNEL_MESSAGE":
      case "UPDATE_CHANNEL_MESSAGE":
      case "DELETE_CHANNEL_MESSAGE":
        messageDidReceive(record);
        break;

      case "DENIED_CREATE_CHANNEL_MESSAGE":
      case "FAILED_CREATE_CHANNEL_MESSAGE":
      case "DENIED_UPDATE_CHANNEL_MESSAGE":
      case "FAILED_UPDATE_CHANNEL_MESSAGE":
        messageReceivedFailed?.(record);
        break;
      case "PENDING_CREATE_CHANNEL_MESSAGE":
      case "PENDING_UPDATE_CHANNEL_MESSAGE":
        messagePending?.(record);
        break;
      // Channels actions
      case "CREATE_CHANNEL":
      case "UPDATE_CHANNEL":
      case "DELETE_CHANNEL":
        channelsChanged?.(record);
        break;
      // Channel Memberships
      case "CREATE_CHANNEL_MEMBERSHIP":
      case "UPDATE_CHANNEL_MEMBERSHIP":
      case "DELETE_CHANNEL_MEMBERSHIP":
        channelMembershipsChanged?.(record);
        break;
      default:
        console.log(`Unexpected message type! ${messageType}`);
    }
  };

  const receiveMessageHandler = (data: any) => {
    try {
      const jsonData = JSON.parse(data);
      const messageType = jsonData.Headers["x-amz-chime-event-type"];
      const message = {
        type: messageType,
        headers: jsonData.Headers,
        payload: jsonData.Payload || null,
      };
      if (
        !isSessionEstablished.current &&
        messageType === "SESSION_ESTABLISHED"
      ) {
        // Backend connects WebSocket and then either
        // (1) Closes with WebSocket error code to reflect failure to authorize or other connection error OR
        // (2) Sends SESSION_ESTABLISHED. SESSION_ESTABLISHED indicates that all messages and events on a channel
        // the app instance user is a member of is guaranteed to be delivered on this WebSocket as long as the WebSocket
        // connection stays opened.

        // Currently, this method is not used.

        isSessionEstablished.current = true;
      } else if (!isSessionEstablished.current) {
        // SESSION_ESTABLISHED is not guaranteed to be the first message, and in rare conditions a message or event from
        // a channel the member is a member of might arrive prior to SESSION_ESTABLISHED.  Because SESSION_ESTABLISHED indicates
        // it is safe to bootstrap the user application with out any race conditions in losing events we opt to drop messages prior
        // to SESSION_ESTABLISHED being received
        return;
      }

      messagesProcessor(message);
    } catch (error) {
      console.log(`Messaging parsing failed: ${error}`);
    }
  };

  const reconnecting = useRef(false);

  const connect = (url: string) => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log("WebSocket connection opened", url);
      reconnecting.current = false;
    };

    ws.current.onmessage = (e) => {
      receiveMessageHandler(e?.data);
    };

    ws.current.onerror = (e: any) => {
      console.log("onerror", e?.message);
      attemptReconnect();
    };

    ws.current.onclose = (e) => {
      console.log("onclose", e.code, e.reason);
      if (ws.current && e.code !== 1000) {
        attemptReconnect();
      }
    };
  };

  const attemptReconnectTime = useRef<any>(null);

  const attemptReconnect = async () => {
    if (reconnecting.current) return;
    reconnecting.current = true;

    console.log(`Attempting to reconnect...)`);

    attemptReconnectTime.current = setTimeout(() => {
      connectWebsocket();
      reconnecting.current = false;
    }, reconnectInterval);
  };

  const close = () => {
    let time = setInterval(() => {
      if (!useTokenStore.getState().accessToken) {
        clearInterval(time);
        return;
      }

      if (ws.current && ws.current.readyState === 1) {
        ws.current.close(1000, "User logged out");

        ws.current = null;
        clearInterval(time);
      }
    }, 50);
  };

  return {
    close,
    connectWebsocket,
  };
};

export default useChatWebsocket;
