import { apiFetch } from "@/shared/lib/api/client";

export type ChatConversation = {
  id: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string;
  staffId: string | null;
  staffName: string | null;
  subject: string | null;
  status: "open" | "closed";
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "customer" | "admin" | "staff";
  content: string;
  createdAt: string;
};

// Customer endpoints

export function createConversation(payload: {
  subject?: string;
  message?: string;
}) {
  return apiFetch<ChatConversation>("/chat/conversations", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify(payload),
  });
}

export function getMyConversations() {
  return apiFetch<ChatConversation[]>("/chat/conversations", {
    authenticated: true,
  });
}

export function getConversationMessages(conversationId: string) {
  return apiFetch<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
    { authenticated: true },
  );
}

export function sendMessage(conversationId: string, content: string) {
  return apiFetch<ChatMessage>(`/chat/conversations/${conversationId}/messages`, {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({ content }),
  });
}

export function reopenConversation(conversationId: string) {
  return apiFetch<ChatConversation>(
    `/chat/conversations/${conversationId}/reopen`,
    { method: "PATCH", authenticated: true },
  );
}

// Admin endpoints

export function getAllConversations(status?: string) {
  const params = status ? `?status=${status}` : "";
  return apiFetch<ChatConversation[]>(`/admin/chat/conversations${params}`, {
    authenticated: true,
  });
}

export function sendStaffMessage(conversationId: string, content: string) {
  return apiFetch<ChatMessage>(
    `/admin/chat/conversations/${conversationId}/messages`,
    {
      method: "POST",
      authenticated: true,
      body: JSON.stringify({ content }),
    },
  );
}

export function closeConversation(conversationId: string) {
  return apiFetch<ChatConversation>(
    `/admin/chat/conversations/${conversationId}/close`,
    { method: "PATCH", authenticated: true },
  );
}

export function assignStaff(conversationId: string) {
  return apiFetch<ChatConversation>(
    `/admin/chat/conversations/${conversationId}/assign`,
    {
      method: "PATCH",
      authenticated: true,
      body: JSON.stringify({ staffId: "self" }),
    },
  );
}
