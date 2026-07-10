export type ChatConversationDto = {
  id: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string;
  staffId: string | null;
  staffName: string | null;
  subject: string | null;
  status: 'open' | 'closed';
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  createdAt: string;
};

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'customer' | 'admin' | 'staff';
  content: string;
  createdAt: string;
};

export type CreateConversationPayload = {
  subject?: unknown;
  message?: unknown;
};

export type SendMessagePayload = {
  content?: unknown;
};

export type AssignStaffPayload = {
  staffId?: unknown;
};
