import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  getConversations(@Request() req) {
    return this.messagingService.getConversations(req.user.userId);
  }

  @Get(':contactId')
  getMessages(@Request() req, @Param('contactId', ParseIntPipe) contactId: number) {
    return this.messagingService.getMessages(req.user.userId, contactId);
  }

  @Post()
  sendMessage(@Request() req, @Body() body: { receiverId: number; content: string }) {
    return this.messagingService.sendMessage(req.user.userId, body.receiverId, body.content);
  }

  @Patch(':contactId/read')
  markAsRead(@Request() req, @Param('contactId', ParseIntPipe) contactId: number) {
    return this.messagingService.markAsRead(req.user.userId, contactId);
  }

  @Delete(':contactId')
  deleteConversation(@Request() req, @Param('contactId', ParseIntPipe) contactId: number) {
    return this.messagingService.deleteConversation(req.user.userId, contactId);
  }
}
