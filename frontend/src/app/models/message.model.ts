export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  sender?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  receiver?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

export interface Conversation {
  id: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: Date;
  otherUser: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  unreadCount: number;
}

export interface CreateMessageDto {
  receiverId: string;
  content: string;
  mediaUrl?: string;
}

export interface MessagesResponse {
  data: Message[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
