import { useCallback, useEffect, useRef, useState } from "react";
import Login from "./components/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import {
  deleteNotification,
  receiveNotification,
  sendMessage,
  phoneToChatId,
} from "./api.js";

const CREDS_KEY = "max-chat:creds";
const chatsKey = (c) => `max-chat:chats:${c.idInstance}`;

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractText(body) {
  const m = body?.messageData;
  if (!m) return null;
  if (m.typeMessage === "textMessage")
    return m.textMessageData?.textMessage ?? null;
  if (m.typeMessage === "extendedTextMessage")
    return m.extendedTextMessageData?.text ?? null;
  return null;
}

export default function App() {
  const [creds, setCreds] = useState(() => load(CREDS_KEY, null));
  const [chats, setChats] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [online, setOnline] = useState(true);
  const loadedFor = useRef(null);

  useEffect(() => {
    if (!creds) return;
    setChats(load(chatsKey(creds), {}));
    setActiveId(null);
    loadedFor.current = creds.idInstance;
  }, [creds]);

  useEffect(() => {
    if (creds && loadedFor.current === creds.idInstance) {
      localStorage.setItem(chatsKey(creds), JSON.stringify(chats));
    }
  }, [chats, creds]);

  const addMessage = useCallback((chatId, msg, title) => {
    setChats((prev) => {
      const chat = prev[chatId] ?? {
        id: chatId,
        title: title || `+${chatId.split("@")[0]}`,
        messages: [],
        unread: 0,
      };
      if (chat.messages.some((x) => x.id === msg.id)) return prev;
      const isNamed = title && chat.title.startsWith("+");
      return {
        ...prev,
        [chatId]: {
          ...chat,
          title: isNamed ? title : chat.title,
          messages: [...chat.messages, msg],
          unread: msg.out ? chat.unread : chat.unread + 1,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (!creds) return;
    const ctrl = new AbortController();
    let stopped = false;

    (async () => {
      while (!stopped) {
        try {
          const n = await receiveNotification(creds, ctrl.signal);
          setOnline(true);
          if (!n) continue;

          const { body } = n;
          const text = extractText(body);
          if (body?.typeWebhook === "incomingMessageReceived" && text) {
            addMessage(
              body.senderData.chatId,
              {
                id: body.idMessage,
                text,
                out: false,
                ts: body.timestamp * 1000,
              },
              body.senderData.senderName || body.senderData.chatName,
            );
          } else if (body?.typeWebhook === "outgoingMessageReceived" && text) {
            addMessage(body.senderData.chatId, {
              id: body.idMessage,
              text,
              out: true,
              ts: body.timestamp * 1000,
            });
          }
          await deleteNotification(creds, n.receiptId, ctrl.signal);
        } catch (e) {
          if (stopped) return;
          setOnline(false);
          await sleep(3000);
        }
      }
    })();

    return () => {
      stopped = true;
      ctrl.abort();
    };
  }, [creds, addMessage]);

  const handleLogin = (c) => {
    localStorage.setItem(CREDS_KEY, JSON.stringify(c));
    setCreds(c);
  };

  const handleLogout = () => {
    localStorage.removeItem(CREDS_KEY);
    loadedFor.current = null;
    setCreds(null);
    setChats({});
    setActiveId(null);
  };

  const handleCreateChat = (phone) => {
    const chatId = phoneToChatId(phone);
    setChats((prev) =>
      prev[chatId]
        ? prev
        : {
            ...prev,
            [chatId]: {
              id: chatId,
              title: `+${chatId.split("@")[0]}`,
              messages: [],
              unread: 0,
            },
          },
    );
    setActiveId(chatId);
  };

  const handleSelect = (id) => {
    setActiveId(id);
    setChats((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], unread: 0 } } : prev,
    );
  };

  const handleSend = async (text) => {
    const tmpId = `tmp-${Date.now()}`;
    const chatId = activeId;
    addMessage(chatId, {
      id: tmpId,
      text,
      out: true,
      ts: Date.now(),
      status: "sending",
    });
    const patch = (fn) =>
      setChats((prev) => ({
        ...prev,
        [chatId]: { ...prev[chatId], messages: prev[chatId].messages.map(fn) },
      }));
    try {
      const { idMessage } = await sendMessage(creds, chatId, text);
      patch((m) =>
        m.id === tmpId ? { ...m, id: idMessage, status: "sent" } : m,
      );
    } catch (e) {
      patch((m) =>
        m.id === tmpId ? { ...m, status: "error", error: e.message } : m,
      );
    }
  };

  if (!creds) return <Login onLogin={handleLogin} />;

  const list = Object.values(chats).sort(
    (a, b) => (b.messages.at(-1)?.ts ?? 0) - (a.messages.at(-1)?.ts ?? 0),
  );
  const active = activeId ? chats[activeId] : null;

  return (
    <div className={`app ${active ? "has-chat" : ""}`}>
      <Sidebar
        chats={list}
        activeId={activeId}
        online={online}
        onSelect={handleSelect}
        onCreate={handleCreateChat}
        onLogout={handleLogout}
      />
      <ChatWindow
        chat={active}
        onSend={handleSend}
        onBack={() => setActiveId(null)}
      />
    </div>
  );
}
