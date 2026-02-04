import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  // Get list of conversations (users chatted with)
  async getConversations(userId: number) {
    // Find all distinct users where current user is sender or receiver
    const sentMessages = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const contactIds = Array.from(new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId),
    ]));

    // Fetch user details and last message
    const contacts = await Promise.all(contactIds.map(async (contactId) => {
      const user = await this.prisma.user.findUnique({
        where: { id: contactId },
        select: { id: true, name: true, email: true, userRoles: { include: { role: true } } }
      });

      const lastMessage = await this.prisma.message.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: contactId },
            { senderId: contactId, receiverId: userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });

      const unreadCount = await this.prisma.message.count({
        where: {
          senderId: contactId,
          receiverId: userId,
          isRead: false
        }
      });

      return {
        ...user,
        role: user?.userRoles[0]?.role?.roleName || 'User',
        lastMessage: lastMessage?.content || '',
        lastMessageTime: lastMessage?.createdAt || null,
        unreadCount
      };
    }));

    return contacts.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });
  }

  // Get messages with specific user
  async getMessages(userId: number, contactId: number) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    });
  }

  // Send message
  async sendMessage(senderId: number, receiverId: number, content: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    });
  }

  // Mark messages as read
  async markAsRead(userId: number, contactId: number) {
    return this.prisma.message.updateMany({
      where: {
        senderId: contactId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });
  }

  // Delete a conversation
  async deleteConversation(userId: number, contactId: number) {
    return this.prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      }
    });
  }
}
