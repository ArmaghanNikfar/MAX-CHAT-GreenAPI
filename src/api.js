export const DEFAULT_API_URL = "https://api.green-api.com";

const url = (c, method, extra = "") =>
  `${c.apiUrl.replace(/\/$/, "")}/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}${extra}`;

async function request(u, options) {
  const res = await fetch(u, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}

export const getStateInstance = (c) => request(url(c, "getStateInstance"));

export const sendMessage = (c, chatId, message) =>
  request(url(c, "sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, message }),
  });

export const receiveNotification = (c, signal) =>
  request(url(c, "receiveNotification", "?receiveTimeout=5"), { signal });

export const deleteNotification = (c, receiptId, signal) =>
  request(url(c, "deleteNotification", `/${receiptId}`), {
    method: "DELETE",
    signal,
  });

export const phoneToChatId = (phone) => `${phone.replace(/\D/g, "")}@c.us`;
