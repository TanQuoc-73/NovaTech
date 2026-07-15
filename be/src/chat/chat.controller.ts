import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import type {
  AssignStaffPayload,
  CreateConversationPayload,
  SendMessagePayload,
} from './chat.types';

@ApiTags('Chat')
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // ── Customer endpoints ──

  @Post('chat/conversations')
  @UseGuards(SupabaseAuthGuard)
  createConversation(
    @CurrentUser() user: { id: string },
    @Body() payload: CreateConversationPayload,
  ) {
    const subject =
      typeof payload.subject === 'string' ? payload.subject : null;
    const message =
      typeof payload.message === 'string' ? payload.message : null;

    return this.chatService.createConversation(user.id, subject, message);
  }

  @Get('chat/conversations')
  @UseGuards(SupabaseAuthGuard)
  getMyConversations(@CurrentUser() user: { id: string }) {
    return this.chatService.getMyConversations(user.id);
  }

  @Get('chat/conversations/:id/messages')
  @UseGuards(SupabaseAuthGuard)
  getConversationMessages(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.getMessages(id, user.id);
  }

  @Post('chat/conversations/:id/messages')
  @UseGuards(SupabaseAuthGuard)
  sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() payload: SendMessagePayload,
  ) {
    const content =
      typeof payload.content === 'string' ? payload.content : '';

    return this.chatService.sendMessage(id, user.id, content);
  }

  @Patch('chat/conversations/:id/reopen')
  @UseGuards(SupabaseAuthGuard)
  reopenConversation(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.chatService.reopenConversation(id, user.id);
  }

  // ── Admin endpoints ──

  @Get('admin/chat/conversations')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  getAllConversations(@Query('status') status?: string) {
    return this.chatService.getAllConversations(status);
  }

  @Post('admin/chat/conversations/:id/messages')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  sendStaffMessage(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() payload: SendMessagePayload,
  ) {
    const content =
      typeof payload.content === 'string' ? payload.content : '';

    return this.chatService.sendMessage(id, user.id, content);
  }

  @Patch('admin/chat/conversations/:id/close')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  closeConversation(@Param('id') id: string) {
    return this.chatService.closeConversation(id);
  }

  @Patch('admin/chat/conversations/:id/assign')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('admin', 'staff')
  assignStaff(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
    @Body() payload: AssignStaffPayload,
  ) {
    const staffId =
      typeof payload.staffId === 'string' && payload.staffId !== 'self'
        ? payload.staffId
        : user.id;

    return this.chatService.assignStaff(id, staffId);
  }
}
