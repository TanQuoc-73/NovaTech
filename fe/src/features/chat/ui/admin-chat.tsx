"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

import { PageSkeleton } from "@/shared/ui/loading-skeleton";

import {
  assignStaff,
  closeConversation,
  getAllConversations,
  getConversationMessages,
  sendStaffMessage,
  type ChatConversation,
  type ChatMessage,
} from "../api/chat-api";

export function AdminChat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConvo, setActiveConvo] = useState<ChatConversation | null>(null);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("open");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50);
  }

  async function loadConversations() {
    setLoading(true);
    try {
      const status = filter === "all" ? undefined : filter;
      const list = await getAllConversations(status);
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

  useEffect(() => {
    loadConversations();
  }, [filter]);

  function openConversation(convo: ChatConversation) {
    setActiveConvo(convo);
    setMessages([]);
    loadMessages(convo.id);

    if (!convo.staffId) {
      assignStaff(convo.id).then((updated) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
        setActiveConvo(updated);
      });
    }
  }

  async function handleSend(conversationId: string) {
    if (!input.trim()) return;

    const text = input.trim();
    setInput("");

    try {
      const msg = await sendStaffMessage(conversationId, text);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    } catch {
      /* ignore */
    }
  }

  async function handleClose(conversationId: string) {
    try {
      const updated = await closeConversation(conversationId);
      setActiveConvo(updated);
      setConversations((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } catch {
      /* ignore */
    }
  }

  const filteredConversations = conversations.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  return (
    <div className="flex h-[calc(100vh-12rem)] overflow-hidden rounded-xl border border-cyan-950/10 bg-white shadow-sm">
      {/* Conversation list */}
      <aside className="flex w-80 shrink-0 flex-col border-r border-cyan-950/10">
        <div className="border-b border-cyan-950/10 px-4 py-3">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
            {(["open", "all", "closed"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  filter === f
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f === "open" ? "Đang mở" : f === "all" ? "Tất cả" : "Đã đóng"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 divide-y divide-cyan-950/10 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              {loading ? "Đang tải..." : "Không có hội thoại."}
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const isActive = activeConvo?.id === convo.id;

              return (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => openConversation(convo)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-cyan-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">
                    {(convo.customerName ?? convo.customerEmail)
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {convo.customerName || convo.customerEmail}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {convo.subject || "Không có chủ đề"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex h-5 shrink-0 items-center rounded px-1.5 text-[10px] font-semibold ${
                      convo.status === "open"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {convo.status === "open" ? "Mở" : "Đã đóng"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Messages panel */}
      <main className="flex flex-1 flex-col">
        {activeConvo ? (
          <>
            <div className="flex items-center justify-between border-b border-cyan-950/10 px-6 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {activeConvo.customerName || activeConvo.customerEmail}
                </p>
                <p className="text-xs text-slate-500">
                  {activeConvo.subject || "Không có chủ đề"}
                  {activeConvo.staffName
                    ? ` — ${activeConvo.staffName} đang phụ trách`
                    : ""}
                </p>
              </div>
              {activeConvo.status === "open" ? (
                <button
                  type="button"
                  onClick={() => handleClose(activeConvo.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Kết thúc
                </button>
              ) : (
                <span className="inline-flex h-7 items-center rounded-md bg-slate-100 px-3 text-xs font-semibold text-slate-500">
                  Đã kết thúc
                </span>
              )}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {loading && messages.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Đang tải tin nhắn...
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  Chưa có tin nhắn nào.
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderRole === "customer"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.senderRole === "customer"
                          ? "rounded-bl-md bg-slate-100 text-slate-800"
                          : "rounded-br-md bg-cyan-500 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-1 text-[10px] font-medium ${
                          msg.senderRole === "customer"
                            ? "text-slate-400"
                            : "text-cyan-200"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {activeConvo.status === "open" ? (
              <div className="flex items-center gap-2 border-t border-cyan-950/10 px-6 py-4">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(activeConvo.id);
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="h-10 flex-1 rounded-lg border border-cyan-950/10 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
                <button
                  type="button"
                  disabled={!input.trim()}
                  onClick={() => handleSend(activeConvo.id)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-cyan-500 text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Chọn một hội thoại để bắt đầu
          </div>
        )}
      </main>
    </div>
  );
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
