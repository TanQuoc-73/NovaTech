import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  ChatConversationDto,
  ChatMessageDto,
} from './chat.types';

@Injectable()
export class ChatService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createConversation(
    customerId: string,
    subject: string | null,
    initialMessage: string | null,
  ): Promise<ChatConversationDto> {
    const { data: convo, error: convoError } = await this.supabaseService.client
      .from('chat_conversations')
      .insert({
        customer_id: customerId,
        subject: subject || null,
      })
      .select()
      .single();

    if (convoError) throw convoError;

    if (initialMessage?.trim()) {
      const { error: msgError } = await this.supabaseService.client
        .from('chat_messages')
        .insert({
          conversation_id: convo.id,
          sender_id: customerId,
          content: initialMessage.trim(),
        });

      if (msgError) throw msgError;
    }

    return this.toConversationDto(convo, 0);
  }

  async getMyConversations(userId: string): Promise<ChatConversationDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('chat_conversations')
      .select('*')
      .eq('customer_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return Promise.all(
      (data ?? []).map((row) => this.enrichConversation(row)),
    );
  }

  async getAllConversations(
    status?: string,
  ): Promise<ChatConversationDto[]> {
    let query = this.supabaseService.client
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (status === 'open' || status === 'closed') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    return Promise.all(
      (data ?? []).map((row) => this.enrichConversation(row)),
    );
  }

  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<ChatMessageDto[]> {
    await this.assertParticipant(conversationId, userId);

    const { data, error } = await this.supabaseService.client
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return Promise.all(
      (data ?? []).map((row) => this.toMessageDto(row)),
    );
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
  ): Promise<ChatMessageDto> {
    if (!content?.trim()) {
      throw new BadRequestException('Message content is required.');
    }

    await this.assertParticipant(conversationId, senderId);

    const convo = await this.getConversation(conversationId);

    if (convo.status === 'closed') {
      throw new BadRequestException('Conversation is closed.');
    }

    const { data, error } = await this.supabaseService.client
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    await this.supabaseService.client
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return this.toMessageDto(data);
  }

  async closeConversation(
    conversationId: string,
  ): Promise<ChatConversationDto> {
    const { data, error } = await this.supabaseService.client
      .from('chat_conversations')
      .update({ status: 'closed' })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundException();
      throw error;
    }

    return this.toConversationDto(data, 0);
  }

  async reopenConversation(
    conversationId: string,
    userId: string,
  ): Promise<ChatConversationDto> {
    await this.assertParticipant(conversationId, userId);

    const { data, error } = await this.supabaseService.client
      .from('chat_conversations')
      .update({ status: 'open' })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundException();
      throw error;
    }

    return this.toConversationDto(data, 0);
  }

  async assignStaff(
    conversationId: string,
    staffId: string,
  ): Promise<ChatConversationDto> {
    const { data, error } = await this.supabaseService.client
      .from('chat_conversations')
      .update({ staff_id: staffId })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundException();
      throw error;
    }

    return this.toConversationDto(data, 0);
  }

  private async assertParticipant(conversationId: string, userId: string) {
    const convo = await this.getConversation(conversationId);

    if (!convo) throw new NotFoundException('Conversation not found.');

    const { data: profile } = await this.supabaseService.client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isStaffOrAdmin = profile?.role === 'admin' || profile?.role === 'staff';

    if (convo.customer_id !== userId && !isStaffOrAdmin) {
      throw new ForbiddenException('You are not a participant in this conversation.');
    }
  }

  private async getConversation(id: string) {
    const { data } = await this.supabaseService.client
      .from('chat_conversations')
      .select('*')
      .eq('id', id)
      .single();

    return data;
  }

  private async enrichConversation(
    row: Record<string, unknown>,
  ): Promise<ChatConversationDto> {
    const lastMessage = await this.getLastMessage(String(row.id));

    const { data: profile } = await this.supabaseService.client
      .from('profiles')
      .select('full_name, email')
      .eq('id', String(row.customer_id))
      .single();

    let staffName: string | null = null;

    if (row.staff_id) {
      const { data: staff } = await this.supabaseService.client
        .from('profiles')
        .select('full_name')
        .eq('id', String(row.staff_id))
        .single();

      staffName = staff?.full_name ?? null;
    }

    const dto = this.toConversationDto(row, 0);
    dto.customerName = profile?.full_name ?? null;
    dto.customerEmail = profile?.email ?? '';
    dto.staffName = staffName;

    if (lastMessage) {
      dto.lastMessage = lastMessage.content;
      dto.lastMessageAt = lastMessage.created_at;
    }

    return dto;
  }

  private async getLastMessage(conversationId: string) {
    const { data } = await this.supabaseService.client
      .from('chat_messages')
      .select('content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  private toConversationDto(
    row: Record<string, unknown>,
    _unreadCount: number,
  ): ChatConversationDto {
    return {
      id: String(row.id ?? ''),
      customerId: String(row.customer_id ?? ''),
      customerName: null,
      customerEmail: '',
      staffId: row.staff_id ? String(row.staff_id) : null,
      staffName: null,
      subject: row.subject ? String(row.subject) : null,
      status: (row.status as 'open' | 'closed') ?? 'open',
      lastMessage: null,
      lastMessageAt: null,
      unreadCount: 0,
      createdAt: String(row.created_at ?? ''),
    };
  }

  private async toMessageDto(
    row: Record<string, unknown>,
  ): Promise<ChatMessageDto> {
    const senderRole = await this.getSenderRole(String(row.sender_id ?? ''));

    return {
      id: String(row.id ?? ''),
      conversationId: String(row.conversation_id ?? ''),
      senderId: String(row.sender_id ?? ''),
      senderRole,
      content: String(row.content ?? ''),
      createdAt: String(row.created_at ?? ''),
    };
  }

  private async getSenderRole(
    senderId: string,
  ): Promise<'customer' | 'admin' | 'staff'> {
    const { data } = await this.supabaseService.client
      .from('profiles')
      .select('role')
      .eq('id', senderId)
      .single();

    return (data?.role as 'customer' | 'admin' | 'staff') ?? 'customer';
  }
}
