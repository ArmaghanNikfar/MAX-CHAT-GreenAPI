import { useState } from 'react';

const initials = (t) => (t.replace(/\D/g, '') === t.replace('+', '') ? '#' : t[0]?.toUpperCase() ?? '?');
const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Sidebar({ chats, activeId, online, onSelect, onCreate, onLogout }) {
  const [phone, setPhone] = useState('');
  const valid = phone.replace(/\D/g, '').length >= 8;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onCreate(phone);
    setPhone('');
  };

  return (
    <aside className="sidebar">
      <header>
        <h2>Чаты</h2>
        <span className={`dot ${online ? 'on' : 'off'}`} title={online ? 'Подключено' : 'Нет связи с GREEN-API'} />
        <button className="link" onClick={onLogout}>Выйти</button>
      </header>

      <form className="new-chat" onSubmit={submit}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Номер получателя, 79991234567"
          inputMode="tel"
        />
        <button className="primary" disabled={!valid}>Создать чат</button>
      </form>

      <ul className="chat-list">
        {chats.length === 0 && <li className="empty">Введите номер телефона, чтобы начать чат</li>}
        {chats.map((c) => {
          const last = c.messages.at(-1);
          return (
            <li key={c.id} className={c.id === activeId ? 'active' : ''} onClick={() => onSelect(c.id)}>
              <div className="avatar">{initials(c.title)}</div>
              <div className="meta">
                <div className="row">
                  <b>{c.title}</b>
                  {last && <time>{fmt(last.ts)}</time>}
                </div>
                <div className="row">
                  <span className="preview">{last ? `${last.out ? 'Вы: ' : ''}${last.text}` : 'Нет сообщений'}</span>
                  {c.unread > 0 && <span className="badge">{c.unread}</span>}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
