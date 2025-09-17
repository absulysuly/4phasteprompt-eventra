export interface RealtimeMessage {
  id: string;
  type: 'chat' | 'event_update' | 'notification' | 'user_action' | 'system_alert' | 'poll' | 'qa';
  data: any;
  timestamp: number;
  userId?: string;
  eventId?: string;
  roomId?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  type: 'text' | 'image' | 'file' | 'system';
  mentions?: string[];
  reactions?: { emoji: string; users: string[] }[];
  edited?: boolean;
  replyTo?: string;
}

export interface EventUpdate {
  eventId: string;
  type: 'details_changed' | 'new_registration' | 'cancellation' | 'time_changed' | 'live_started' | 'live_ended';
  data: any;
  timestamp: number;
  affectedUsers: string[];
}

export interface LivePoll {
  id: string;
  eventId: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  isActive: boolean;
  createdBy: string;
  timestamp: number;
  totalVotes: number;
}

export interface QAQuestion {
  id: string;
  eventId: string;
  question: string;
  askedBy: string;
  userName: string;
  timestamp: number;
  upvotes: number;
  answered: boolean;
  answer?: string;
  answeredBy?: string;
  answerTimestamp?: number;
}

export interface Room {
  id: string;
  name: string;
  type: 'event' | 'general' | 'support' | 'private';
  eventId?: string;
  participants: string[];
  moderators: string[];
  settings: {
    allowFileSharing: boolean;
    allowImages: boolean;
    moderationEnabled: boolean;
    slowMode?: number; // seconds between messages
    maxParticipants?: number;
  };
  createdAt: number;
  lastActivity: number;
}

interface RealtimeConnection {
  id: string;
  userId: string;
  rooms: string[];
  lastSeen: number;
  status: 'connected' | 'disconnected' | 'away';
}

class RealtimeService {
  private static instance: RealtimeService;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageQueue: RealtimeMessage[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;
  private rooms: Set<string> = new Set();
  private connectionId: string | null = null;
  private isConnected = false;
  
  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  async initialize(userId: string): Promise<boolean> {
    this.userId = userId;
    
    try {
      await this.connect();
      console.log('Realtime service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize realtime service:', error);
      return false;
    }
  }

  private async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In a real implementation, this would connect to your WebSocket server
        // For now, we'll simulate WebSocket functionality
        this.simulateWebSocketConnection();
        
        // Simulate connection success
        setTimeout(() => {
          this.isConnected = true;
          this.onConnected();
          resolve();
        }, 1000);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private simulateWebSocketConnection(): void {
    // Simulate WebSocket events
    this.connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate periodic messages
    setInterval(() => {
      if (this.isConnected) {
        this.simulateIncomingMessages();
      }
    }, 5000);

    // Simulate heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendHeartbeat();
      }
    }, 30000);
  }

  private onConnected(): void {
    this.reconnectAttempts = 0;
    this.emit('connected', { connectionId: this.connectionId });
    
    // Send queued messages
    this.flushMessageQueue();
    
    // Join previously joined rooms
    this.rooms.forEach(roomId => {
      this.joinRoom(roomId);
    });
  }

  private onDisconnected(): void {
    this.isConnected = false;
    this.emit('disconnected');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // Attempt to reconnect
    this.attemptReconnect();
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('reconnection_failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch(() => {
        this.attemptReconnect();
      });
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  private simulateIncomingMessages(): void {
    // Simulate random incoming messages for demo purposes
    const messageTypes = ['chat', 'event_update', 'notification', 'user_action'];
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)] as RealtimeMessage['type'];
    
    let simulatedMessage: RealtimeMessage;
    
    switch (randomType) {
      case 'chat':
        simulatedMessage = {
          id: `msg_${Date.now()}`,
          type: 'chat',
          data: {
            roomId: 'general',
            userId: 'demo_user',
            userName: 'Demo User',
            message: this.getRandomChatMessage(),
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          roomId: 'general'
        };
        break;
        
      case 'event_update':
        simulatedMessage = {
          id: `upd_${Date.now()}`,
          type: 'event_update',
          data: {
            eventId: 'demo_event',
            type: 'new_registration',
            message: 'New user registered for Tech Conference 2024',
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          eventId: 'demo_event'
        };
        break;
        
      case 'notification':
        simulatedMessage = {
          id: `notif_${Date.now()}`,
          type: 'notification',
          data: {
            title: 'System Notification',
            message: 'Your event has been approved and is now live!',
            type: 'success',
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          userId: this.userId
        };
        break;
        
      default:
        return;
    }
    
    this.handleIncomingMessage(simulatedMessage);
  }

  private getRandomChatMessage(): string {
    const messages = [
      'Hello everyone!',
      'Looking forward to this event!',
      'Great presentation so far',
      'Anyone know when registration closes?',
      'Thanks for organizing this!',
      'The location is perfect',
      'See you all there!'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private handleIncomingMessage(message: RealtimeMessage): void {
    console.log('Received message:', message);
    this.emit(`message:${message.type}`, message);
    this.emit('message', message);
  }

  private sendHeartbeat(): void {
    const heartbeat: RealtimeMessage = {
      id: `hb_${Date.now()}`,
      type: 'system_alert',
      data: { type: 'heartbeat' },
      timestamp: Date.now(),
      userId: this.userId || undefined
    };
    
    this.sendMessage(heartbeat);
  }

  // Public API methods
  sendMessage(message: RealtimeMessage): void {
    if (!this.isConnected) {
      this.messageQueue.push(message);
      return;
    }

    // In a real implementation, this would send via WebSocket
    console.log('Sending message:', message);
    
    // Simulate message acknowledgment
    setTimeout(() => {
      this.emit('message_sent', { id: message.id, success: true });
    }, 100);
  }

  sendChatMessage(roomId: string, message: string, type: 'text' | 'image' | 'file' = 'text'): void {
    const chatMessage: RealtimeMessage = {
      id: `chat_${Date.now()}`,
      type: 'chat',
      data: {
        roomId,
        userId: this.userId,
        message,
        type,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      roomId,
      userId: this.userId || undefined
    };
    
    this.sendMessage(chatMessage);
  }

  joinRoom(roomId: string): void {
    this.rooms.add(roomId);
    
    const joinMessage: RealtimeMessage = {
      id: `join_${Date.now()}`,
      type: 'user_action',
      data: {
        action: 'join_room',
        roomId,
        userId: this.userId
      },
      timestamp: Date.now(),
      roomId,
      userId: this.userId || undefined
    };
    
    this.sendMessage(joinMessage);
    this.emit('room_joined', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.rooms.delete(roomId);
    
    const leaveMessage: RealtimeMessage = {
      id: `leave_${Date.now()}`,
      type: 'user_action',
      data: {
        action: 'leave_room',
        roomId,
        userId: this.userId
      },
      timestamp: Date.now(),
      roomId,
      userId: this.userId || undefined
    };
    
    this.sendMessage(leaveMessage);
    this.emit('room_left', { roomId });
  }

  createPoll(eventId: string, question: string, options: string[]): void {
    const pollMessage: RealtimeMessage = {
      id: `poll_${Date.now()}`,
      type: 'poll',
      data: {
        action: 'create',
        eventId,
        question,
        options: options.map((text, index) => ({ id: `opt_${index}`, text, votes: 0 })),
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      eventId,
      userId: this.userId || undefined
    };
    
    this.sendMessage(pollMessage);
  }

  votePoll(pollId: string, optionId: string): void {
    const voteMessage: RealtimeMessage = {
      id: `vote_${Date.now()}`,
      type: 'poll',
      data: {
        action: 'vote',
        pollId,
        optionId,
        userId: this.userId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      userId: this.userId || undefined
    };
    
    this.sendMessage(voteMessage);
  }

  askQuestion(eventId: string, question: string): void {
    const qaMessage: RealtimeMessage = {
      id: `qa_${Date.now()}`,
      type: 'qa',
      data: {
        action: 'ask',
        eventId,
        question,
        userId: this.userId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      eventId,
      userId: this.userId || undefined
    };
    
    this.sendMessage(qaMessage);
  }

  upvoteQuestion(questionId: string): void {
    const upvoteMessage: RealtimeMessage = {
      id: `upvote_${Date.now()}`,
      type: 'qa',
      data: {
        action: 'upvote',
        questionId,
        userId: this.userId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      userId: this.userId || undefined
    };
    
    this.sendMessage(upvoteMessage);
  }

  answerQuestion(questionId: string, answer: string): void {
    const answerMessage: RealtimeMessage = {
      id: `answer_${Date.now()}`,
      type: 'qa',
      data: {
        action: 'answer',
        questionId,
        answer,
        userId: this.userId,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      userId: this.userId || undefined
    };
    
    this.sendMessage(answerMessage);
  }

  sendEventUpdate(eventId: string, updateType: EventUpdate['type'], data: any): void {
    const updateMessage: RealtimeMessage = {
      id: `update_${Date.now()}`,
      type: 'event_update',
      data: {
        eventId,
        type: updateType,
        data,
        timestamp: Date.now()
      },
      timestamp: Date.now(),
      eventId,
      userId: this.userId || undefined
    };
    
    this.sendMessage(updateMessage);
  }

  // Event listener methods
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  // Utility methods
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number; rooms: string[] } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      rooms: Array.from(this.rooms)
    };
  }

  getRoomsJoined(): string[] {
    return Array.from(this.rooms);
  }

  isInRoom(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  // Message history and persistence
  async getMessageHistory(roomId: string, limit: number = 50, before?: string): Promise<ChatMessage[]> {
    // In a real implementation, this would fetch from server/database
    // For now, return mock data
    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_1',
        roomId,
        userId: 'user_1',
        userName: 'Ahmad Hassan',
        message: 'Welcome to the event chat!',
        timestamp: Date.now() - 3600000,
        type: 'text',
        reactions: [{ emoji: '👍', users: ['user_2', 'user_3'] }]
      },
      {
        id: 'msg_2',
        roomId,
        userId: 'user_2',
        userName: 'Sara Mohammed',
        message: 'Thanks for organizing this amazing event!',
        timestamp: Date.now() - 1800000,
        type: 'text',
        reactions: [{ emoji: '❤️', users: ['user_1'] }]
      },
      {
        id: 'msg_3',
        roomId,
        userId: 'system',
        userName: 'System',
        message: 'Event will start in 30 minutes',
        timestamp: Date.now() - 900000,
        type: 'system'
      }
    ];
    
    return mockMessages.slice(0, limit);
  }

  async getEventUpdates(eventId: string, limit: number = 20): Promise<EventUpdate[]> {
    // Mock event updates
    const mockUpdates: EventUpdate[] = [
      {
        eventId,
        type: 'new_registration',
        data: { userName: 'John Doe', registrationTime: Date.now() - 300000 },
        timestamp: Date.now() - 300000,
        affectedUsers: ['organizer_id']
      },
      {
        eventId,
        type: 'details_changed',
        data: { field: 'description', oldValue: 'Old description', newValue: 'Updated description' },
        timestamp: Date.now() - 600000,
        affectedUsers: ['all']
      }
    ];
    
    return mockUpdates.slice(0, limit);
  }

  // Cleanup
  disconnect(): void {
    this.isConnected = false;
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.rooms.clear();
    this.messageQueue = [];
    this.eventListeners.clear();
    
    console.log('Realtime service disconnected');
  }
}

export const realtimeService = RealtimeService.getInstance();