import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function getInitial(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name[0].toUpperCase();
}

export default function Messages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const withId = searchParams.get('with');
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api.get('/messages/conversations')
      .then((r) => setConversations(Array.isArray(r.data) ? r.data : []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [messages.length]);

  useEffect(() => {
    if (!withId) {
      setSelected(null);
      setMessages([]);
      return;
    }
    const peer = conversations.find((c) => c.user?.id === withId);
    if (peer) setSelected(peer);
    else setSelected({ user: { id: withId, name: 'Buddy', city: null } });
    api.get(`/messages/with/${withId}`)
      .then((r) => setMessages(Array.isArray(r.data) ? r.data : []))
      .catch(() => setMessages([]));
  }, [withId, conversations]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selected || sending) return;
    setSending(true);
    try {
      const { data } = await api.post('/messages', { receiverId: selected.user.id, content: content.trim() });
      setMessages((m) => [...m, data]);
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-inbox">
      <h1 className="inbox-title">Messages</h1>
      <div className="inbox-layout">
        <aside className="messages-sidebar">
          <div className="sidebar-label">Conversations</div>
          {loading ? (
            <p style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="empty-sidebar">
              No conversations yet. Find <Link to="/nearby">buddies nearby</Link> or message someone from a meetup.
            </div>
          ) : (
            <ul className="conversation-list">
              {conversations.map((c) => (
                <li key={c.user.id}>
                  <button
                    type="button"
                    className={`conversation-item ${selected?.user?.id === c.user.id ? 'is-selected' : ''}`}
                    onClick={() => { setSelected(c); navigate(`/messages?with=${c.user.id}`); }}
                  >
                    <span className="conversation-avatar" aria-hidden>{getInitial(c.user.name)}</span>
                    <div className="conversation-body">
                      <div className="conversation-name">{c.user.name || 'Buddy'}</div>
                      <div className="conversation-meta">{c.user.city || 'No location'}</div>
                      {c.lastMessage && (
                        <div className="conversation-preview">
                          {c.lastMessage.fromMe && 'You: '}{c.lastMessage.content?.slice(0, 45)}{(c.lastMessage.content?.length || 0) > 45 ? '…' : ''}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="messages-thread">
          {selected ? (
            <>
              <header className="messages-thread-header">
                <p className="thread-name">{selected.user.name || 'Buddy'}</p>
                {selected.user.city && <p className="thread-meta">{selected.user.city}</p>}
              </header>
              <div className="messages-thread-messages">
                {messages.length === 0 && !loading && (
                  <p style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages yet. Say hello!</p>
                )}
                {messages.map((m) => {
                  const isSent = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`messages-bubble ${isSent ? 'sent' : 'received'}`}
                    >
                      {!isSent && <div className="bubble-sender">{m.sender?.name || 'Buddy'}</div>}
                      {m.content}
                    </div>
                  );
                })}
              </div>
              <div className="messages-composer">
                <form onSubmit={sendMessage}>
                  <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message…"
                    aria-label="Message"
                  />
                  <button type="submit" className="btn btn-primary btn-send" disabled={sending || !content.trim()}>
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="messages-empty-state">
              <div className="empty-icon" aria-hidden>💬</div>
              <p className="empty-title">Select a conversation</p>
              <p className="empty-text">
                Choose someone from the list, or start a chat from <Link to="/nearby">Nearby</Link> or a meetup.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
