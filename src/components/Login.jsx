import { useState } from "react";
import { DEFAULT_API_URL, getStateInstance } from "../api.js";

export default function Login({ onLogin }) {
  const [idInstance, setId] = useState("310022756735");
  const [apiTokenInstance, setToken] = useState("");
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const creds = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim(),
    };
    setBusy(true);
    setError("");
    try {
      const { stateInstance } = await getStateInstance(creds);
      if (stateInstance !== "authorized") {
        throw new Error(
          `Инстанс не авторизован (статус: ${stateInstance}). Авторизуйте его в личном кабинете GREEN-API.`,
        );
      }
      onLogin(creds);
    } catch (err) {
      setError(
        err.message.startsWith("HTTP")
          ? `Не удалось войти. Проверьте данные. (${err.message})`
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="logo">M</div>
        <h1>Вход в чат</h1>
        <p className="hint">
          Введите данные инстанса из{" "}
          <a
            href="https://console.green-api.com"
            target="_blank"
            rel="noreferrer"
          >
            личного кабинета GREEN-API
          </a>
        </p>
        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(e) => setId(e.target.value)}
            placeholder="310022756735"
            inputMode="numeric"
            required
          />
        </label>
        <label>
          apiTokenInstance
          <input
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </label>
        <label>
          apiUrl
          <input
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={busy}>
          {busy ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
