"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  MessageCircle,
  Plus,
  Send,
  X,
} from "lucide-react";

import { getSupabaseClient } from "@/shared/lib/supabase/client";
import type { Dictionary } from "@/shared/i18n";

import {
  createConversation,
  getConversationMessages,
  getMyConversations,
  reopenConversation,
  sendMessage,
  type ChatConversation,
  type ChatMessage,
} from "../api/chat-api";

type ViewState =
  | { screen: "list" }
  | { screen: "messages"; conversationId: string }
  | { screen: "new" };

export function ChatWidget({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.ui.chat;
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [view, setView] = useState<ViewState>({ screen: "list" });
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConvo, setActiveConvo] = useState<ChatConversation | null>(null);
  const [input, setInput] = useState("");
  const [subject, setSubject] = useState("");
  const [initialMsg, setInitialMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestMsg, setGuestMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSupabaseClient().auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser({ id: data.session.user.id });
      }
    });
  }, []);

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50);
  }

  async function loadConversations() {
    setLoading(true);
    try {
      const list = await getMyConversations();
      setConversations(list);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    setLoading(true);
    try {
      const msgs = await getConversationMessages(conversationId);
      setMessages(msgs);
      scrollToBottom();
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    setOpen(true);
    setView({ screen: "list" });
    if (user) loadConversations();
  }

  function handleClose() {
    setOpen(false);
    setView({ screen: "list" });
    setMessages([]);
    setActiveConvo(null);
  }

  function openConversation(convo: ChatConversation) {
    setActiveConvo(convo);
    setView({ screen: "messages", conversationId: convo.id });
    loadMessages(convo.id);
  }

  async function handleSend(conversationId: string) {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    try {
      const msg = await sendMessage(conversationId, text);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    } catch {
      /* ignore */
    }
  }

  async function handleCreateConversation() {
    if (!initialMsg.trim() && !subject.trim()) return;

    setLoading(true);
    try {
      const convo = await createConversation({
        subject: subject.trim() || undefined,
        message: initialMsg.trim() || undefined,
      });
      setConversations((prev) => [convo, ...prev]);
      setSubject("");
      setInitialMsg("");
      openConversation(convo);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function handleReopen(conversationId: string) {
    try {
      const updated = await reopenConversation(conversationId);
      setActiveConvo(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="mb-4 flex h-[560px] w-[380px] flex-col overflow-hidden rounded-2xl border border-cyan-950/10 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-950/10 bg-cyan-500 px-4 py-3">
            <div className="flex items-center gap-2">
              {user && view.screen === "messages" ? (
                <button
                  type="button"
                  onClick={() => {
                    setView({ screen: "list" });
                    loadConversations();
                  }}
                  className="grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : null}
              <span className="text-sm font-semibold text-white">
                {!user
                  ? t.title
                  : view.screen === "new"
                    ? t.newConversation
                    : view.screen === "messages"
                      ? activeConvo?.subject || t.title
                      : t.title}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {user ? (
              view.screen === "list" ? (
                <ConversationList
                  t={t}
                  conversations={conversations}
                  loading={loading}
                  onSelect={openConversation}
                  onNew={() => setView({ screen: "new" })}
                />
              ) : view.screen === "new" ? (
                <NewConversationForm
                  t={t}
                  subject={subject}
                  initialMsg={initialMsg}
                  loading={loading}
                  onSubjectChange={setSubject}
                  onMessageChange={setInitialMsg}
                  onSubmit={handleCreateConversation}
                  onBack={() => setView({ screen: "list" })}
                />
              ) : (
                <MessageList
                  t={t}
                  messages={messages}
                  loading={loading}
                  conversation={activeConvo}
                  onReopen={handleReopen}
                  messagesEndRef={messagesEndRef}
                />
              )
            ) : submitted ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <MessageCircle className="mb-4 h-12 w-12 text-cyan-500" />
                <h3 className="mb-1 text-lg font-semibold text-slate-900">
                  {t.guestThankYou}
                </h3>
                <p className="text-sm text-slate-500">
                  {t.guestThankYouDesc}
                </p>
              </div>
            ) : (
              <GuestContactForm
                t={t}
                name={guestName}
                email={guestEmail}
                message={guestMsg}
                loading={loading}
                onNameChange={setGuestName}
                onEmailChange={setGuestEmail}
                onMessageChange={setGuestMsg}
                onSubmit={() => {
                  if (!guestName.trim() || !guestEmail.trim() || !guestMsg.trim()) return;
                  setLoading(true);
                  setTimeout(() => {
                    setSubmitted(true);
                    setLoading(false);
                  }, 500);
                }}
              />
            )}
          </div>

          {/* Input */}
          {user && view.screen === "messages" && activeConvo?.status === "open" ? (
            <div className="flex items-center gap-2 border-t border-cyan-950/10 px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(view.conversationId);
                  }
                }}
                placeholder={t.inputPlaceholder}
                className="h-10 flex-1 rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
              <button
                type="button"
                disabled={!input.trim()}
                onClick={() => handleSend(view.conversationId)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-500 text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="grid h-14 w-14 place-items-center rounded-full bg-cyan-500 text-white shadow-lg transition hover:bg-cyan-600 hover:shadow-xl active:scale-95"
          aria-label={t.ariaOpen}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}

function ConversationList({
  conversations,
  loading,
  onSelect,
  onNew,
  t,
}: {
  conversations: ChatConversation[];
  loading: boolean;
  onSelect: (convo: ChatConversation) => void;
  onNew: () => void;
  t: Dictionary["ui"]["chat"];
}) {
  return (
    <div className="divide-y divide-cyan-950/10">
      <button
        type="button"
        onClick={onNew}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-cyan-600 transition hover:bg-cyan-50"
      >
        <Plus className="h-4 w-4" />
        {t.newConversation}
      </button>

      {loading ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          {t.loading}
        </div>
      ) : conversations.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-500">
          {t.noConversations}
          <br />
          {t.startNew}
        </div>
      ) : (
        conversations.map((convo) => (
          <button
            key={convo.id}
            type="button"
            onClick={() => onSelect(convo)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-cyan-50"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
              {convo.subject?.slice(0, 2).toUpperCase() || "HT"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {convo.subject || t.title}
                </span>
                <span
                  className={`inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[10px] font-semibold ${
                    convo.status === "open"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {convo.status === "open" ? t.statusOpen : t.statusClosed}
                </span>
              </div>
              {convo.lastMessage ? (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {convo.lastMessage}
                </p>
              ) : null}
            </div>
            <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400" />
          </button>
        ))
      )}
    </div>
  );
}

function NewConversationForm({
  subject,
  initialMsg,
  loading,
  onSubjectChange,
  onMessageChange,
  onSubmit,
  onBack,
  t,
}: {
  subject: string;
  initialMsg: string;
  loading: boolean;
  onSubjectChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  t: Dictionary["ui"]["chat"];
}) {
  return (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          {t.subject}
        </label>
        <input
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder={t.subjectPlaceholder}
          className="mt-1.5 h-10 w-full rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700">
          {t.content}
        </label>
        <textarea
          value={initialMsg}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t.contentPlaceholder}
          rows={4}
          className="mt-1.5 w-full resize-none rounded-lg border border-cyan-950/10 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-cyan-950/10 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50"
        >
          {t.back}
        </button>
        <button
          type="button"
          disabled={loading || (!initialMsg.trim() && !subject.trim())}
          onClick={onSubmit}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-cyan-500 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t.sending : t.send}
        </button>
      </div>
    </div>
  );
}

function MessageList({
  messages,
  loading,
  conversation,
  onReopen,
  messagesEndRef,
  t,
}: {
  messages: ChatMessage[];
  loading: boolean;
  conversation: ChatConversation | null;
  onReopen: (conversationId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  t: Dictionary["ui"]["chat"];
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {t.loading}
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            {t.noMessages}
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderRole === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.senderRole === "customer"
                    ? "rounded-br-md bg-cyan-500 text-white"
                    : "rounded-bl-md bg-slate-100 text-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`mt-1 text-[10px] font-medium ${
                    msg.senderRole === "customer"
                      ? "text-cyan-200"
                      : "text-slate-400"
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {conversation?.status === "closed" ? (
        <div className="border-t border-cyan-950/10 px-4 py-3 text-center">
          <p className="text-xs font-medium text-slate-500">
            {t.closed}
          </p>
          <button
            type="button"
            onClick={() => onReopen(conversation.id)}
            className="mt-1 text-xs font-semibold text-cyan-600 hover:underline"
          >
            {t.reopen}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function GuestContactForm({
  name,
  email,
  message,
  loading,
  onNameChange,
  onEmailChange,
  onMessageChange,
  onSubmit,
  t,
}: {
  name: string;
  email: string;
  message: string;
  loading: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onMessageChange: (v: string) => void;
  onSubmit: () => void;
  t: Dictionary["ui"]["chat"];
}) {
  const valid = name.trim() && email.trim() && message.trim();

  return (
    <div className="space-y-4 p-4">
      <p className="text-xs text-slate-500">
        {t.guestTitle}
      </p>
      <div>
        <label className="block text-sm font-semibold text-slate-700">{t.guestName}</label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t.guestNamePlaceholder}
          className="mt-1.5 h-10 w-full rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700">{t.guestEmail}</label>
        <input
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder={t.guestEmailPlaceholder}
          type="email"
          className="mt-1.5 h-10 w-full rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700">{t.guestContent}</label>
        <textarea
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={t.guestContentPlaceholder}
          rows={4}
          className="mt-1.5 w-full resize-none rounded-lg border border-cyan-950/10 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
        />
      </div>
      <button
        type="button"
        disabled={loading || !valid}
        onClick={onSubmit}
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-cyan-500 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? t.sending : t.send}
      </button>
    </div>
  );
}

function formatMessageTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
