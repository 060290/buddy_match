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

function formatTime(createdAt) {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function contextLabel(context, meetupTitle) {
  if (context === 'friend') return 'Friend';
  if (context === 'meetup') {
    if (!meetupTitle) return 'Meetup';
    return meetupTitle.length > 22 ? `Meetup: ${meetupTitle.slice(0, 20)}…` : `Meetup: ${meetupTitle}`;
  }
  return 'Match';
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
  const [myDogs, setMyDogs] = useState([]);
  const [myMeetups, setMyMeetups] = useState([]);
  const [quickActionOpen, setQuickActionOpen] = useState(null);

  useEffect(() => {
    api.get('/messages/conversations')
      .then((r) => setConversations(Array.isArray(r.data) ? r.data : []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [messages.length]);

  useEffect(() => {
    api.get('/users/me').then((r) => setMyDogs(r.data?.dogs || [])).catch(() => setMyDogs([]));
    api.get('/posts/mine').then((r) => setMyMeetups(Array.isArray(r.data) ? r.data : [])).catch(() => setMyMeetups([]));
  }, []);

  useEffect(() => {
    if (!withId) {
      setSelected(null);
      setMessages([]);
      return;
    }
    const fromList = conversations.find((c) => c.user?.id === withId);
    if (fromList) {
      setSelected(fromList);
    } else {
      setSelected({ user: { id: withId, name: '…', city: null }, peerDogs: [], context: 'match', meetupTitle: null, meetupId: null });
      api.get(`/users/${withId}`)
        .then((r) => {
          setSelected({
            user: { id: r.data.id, name: r.data.name || 'Buddy', city: r.data.city },
            peerDogs: r.data.dogs || [],
            context: r.data.isFriend ? 'friend' : 'match',
            meetupTitle: null,
            meetupId: null,
          });
        })
        .catch(() => setSelected((s) => (s ? { ...s, user: { ...s.user, name: 'Buddy' } } : s)));
    }
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

  const insertLink = (path) => {
    const base = window.location.origin;
    const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
    setContent((prev) => (prev ? `${prev} ${url}` : url));
    setQuickActionOpen(null);
  };

  return (
    <div className="messages-inbox app-page">
      <div className="messages-inbox-layout">
        <aside className="messages-pane messages-list-pane">
          <div className="messages-pane-head">
            <h1 className="messages-title">Messages</h1>
          </div>
          {loading ? (
            <p className="messages-list-loading">Loading…</p>
          ) : conversations.length === 0 ? (
            <div className="messages-list-empty">
              No conversations yet. Find <Link to="/nearby">buddies nearby</Link> or message someone from a meetup.
            </div>
          ) : (
            <ul className="messages-conversation-list">
              {conversations.map((c) => (
                <li key={c.user.id}>
                  <button
                    type="button"
                    className={`messages-conversation-item ${selected?.user?.id === c.user.id ? 'is-selected' : ''}`}
                    onClick={() => { setSelected(c); navigate(`/messages?with=${c.user.id}`); }}
                  >
                    <span className="messages-conv-avatar" aria-hidden>{getInitial(c.user.name)}</span>
                    <div className="messages-conv-body">
                      <div className="messages-conv-row">
                        <span className="messages-conv-name">{c.user.name || 'Buddy'}</span>
                        {c.lastMessage?.createdAt && (
                          <span className="messages-conv-time">{formatTime(c.lastMessage.createdAt)}</span>
                        )}
                      </div>
                      {(c.peerDogs?.length > 0) && (
                        <div className="messages-conv-dog">{c.peerDogs.map((d) => d.name).join(', ')}</div>
                      )}
                      {c.lastMessage && (
                        <div className="messages-conv-preview">
                          {c.lastMessage.fromMe && 'You: '}{c.lastMessage.content?.slice(0, 50)}{(c.lastMessage.content?.length || 0) > 50 ? '…' : ''}
                        </div>
                      )}
                      <span className={`messages-conv-context messages-conv-context--${c.context}`}>
                        {contextLabel(c.context, c.meetupTitle)}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="messages-pane messages-chat-pane">
          {selected ? (
            <>
              <header className="messages-chat-header">
                <div className="messages-chat-header-main">
                  <Link to={`/user/${selected.user.id}`} className="messages-chat-person">
                    {selected.user.name || 'Buddy'}
                  </Link>
                  {selected.user.city && <span className="messages-chat-meta">{selected.user.city}</span>}
                  <div className="messages-chat-dogs">
                    {(selected.peerDogs?.length > 0)
                      ? selected.peerDogs.map((d) => (
                          <Link key={d.id} to={`/dogs/${d.id}`} className="messages-chat-dog-tag">{d.name}</Link>
                        ))
                      : <span className="messages-chat-dog-none">No dogs listed</span>}
                  </div>
                  <span className={`messages-chat-context messages-chat-context--${selected.context}`}>
                    {contextLabel(selected.context, selected.meetupTitle)}
                  </span>
                </div>
                <div className="messages-chat-actions">
                  <div className="messages-quick-actions">
                    <div className="messages-quick-wrap">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm messages-quick-btn"
                        onClick={() => setQuickActionOpen(quickActionOpen === 'dog' ? null : 'dog')}
                        aria-expanded={quickActionOpen === 'dog'}
                      >
                        Share dog profile
                      </button>
                      {quickActionOpen === 'dog' && (
                        <div className="messages-quick-dropdown">
                          {myDogs.length === 0 ? (
                            <p className="messages-quick-empty">Add a dog in <Link to="/dogs">Dogs</Link> to share.</p>
                          ) : (
                            myDogs.map((d) => (
                              <button key={d.id} type="button" className="messages-quick-option" onClick={() => insertLink(`/dogs/${d.id}`)}>
                                {d.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <div className="messages-quick-wrap">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm messages-quick-btn"
                        onClick={() => setQuickActionOpen(quickActionOpen === 'meetup' ? null : 'meetup')}
                        aria-expanded={quickActionOpen === 'meetup'}
                      >
                        Share meetup
                      </button>
                      {quickActionOpen === 'meetup' && (
                        <div className="messages-quick-dropdown">
                          {myMeetups.length === 0 ? (
                            <p className="messages-quick-empty">Create a meetup to share.</p>
                          ) : (
                            myMeetups.slice(0, 10).map((p) => (
                              <button key={p.id} type="button" className="messages-quick-option" onClick={() => insertLink(`/meetups/${p.id}`)}>
                                {p.title}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </header>
              <div className="messages-thread-messages">
                {messages.length === 0 && !loading && (
                  <p className="messages-thread-empty">No messages yet. Say hello!</p>
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
