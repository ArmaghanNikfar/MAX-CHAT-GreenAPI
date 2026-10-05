import { useEffect, useRef, useState } from 'react';

const fmt = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ChatWindow({ chat, onSend, onBack }) {
  const [text, setText] = useState('');
  const bottom = useRef(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' });
  }, [chat?.messages.length, chat?.id]);

  if (!chat) {
    return (
      <main className="chat placeholder">
        <p>Выберите чат или создайте новый</p>
      </main>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) submit(e);
  };

  return (
    <main className="chat">
      <header>
        <button className="back" onClick={onBack} aria-label="Назад">←</button>
        <div className="avatar">{chat.title[0]}</div>
        <b>{chat.title}</b>
      </header>

      <div className="messages">
        {chat.messages.map((m) => (
          <div key={m.id} className={`msg ${m.out ? 'out' : 'in'} ${m.status === 'error' ? 'failed' : ''}`}>
            <span className="text">{m.text}</span>
            <span className="time">
              {fmt(m.ts)}
              {m.out && m.status === 'sending' && ' …'}
              {m.out && m.status === 'sent' && ' ✓'}
              {m.status === 'error' && ' · не отправлено'}
            </span>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form className="composer" onSubmit={submit}>
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Сообщение"
          maxLength={4000}
        />
        <button className="send" disabled={!text.trim()} aria-label="Отправить">➤</button>
      </form>
    </main>
  );
}
