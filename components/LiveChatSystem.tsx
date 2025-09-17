import { useState, useEffect, useRef, useCallback } from 'react';
import { realtimeService, ChatMessage, Room } from '../services/realtimeService';
import { adminService } from '../services/adminService';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'organizer' | 'admin';
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
}

interface Reaction {
  emoji: string;
  users: string[];
  count: number;
}

interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  isActive: boolean;
  totalVotes: number;
  createdBy: string;
  expiresAt?: number;
}

interface ChatSettings {
  allowFileSharing: boolean;
  allowImages: boolean;
  allowPolls: boolean;
  allowReactions: boolean;
  moderationEnabled: boolean;
  slowMode: number; // seconds between messages
  maxParticipants?: number;
  requireApproval: boolean;
}

export function LiveChatSystem({ 
  eventId, 
  userId, 
  userRole = 'user',
  onParticipantUpdate 
}: {
  eventId: string;
  userId: string;
  userRole?: 'user' | 'moderator' | 'organizer' | 'admin';
  onParticipantUpdate?: (count: number) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    allowFileSharing: true,
    allowImages: true,
    allowPolls: true,
    allowReactions: true,
    moderationEnabled: true,
    slowMode: 0,
    requireApproval: false
  });
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeChat();
    
    return () => {
      cleanup();
    };
  }, [eventId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Handle visibility change for unread counts
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden) {
        setUnreadCount(0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const initializeChat = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Initialize real-time service
      await realtimeService.initialize(userId);
      
      // Join event room
      const roomId = `event_${eventId}`;
      await realtimeService.joinRoom(roomId);
      
      // Load message history
      const history = await realtimeService.getMessageHistory(roomId, 50);
      setMessages(history);
      
      // Set up event listeners
      setupEventListeners();
      
      // Simulate room data
      const room: Room = {
        id: roomId,
        name: `Event ${eventId} Chat`,
        type: 'event',
        eventId,
        participants: [],
        moderators: userRole === 'moderator' || userRole === 'admin' ? [userId] : [],
        settings: {
          allowFileSharing: true,
          allowImages: true,
          moderationEnabled: true,
          slowMode: 0
        },
        createdAt: Date.now(),
        lastActivity: Date.now()
      };
      
      setCurrentRoom(room);
      setConnectionStatus('connected');
      
      // Load initial participants
      loadParticipants();
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setConnectionStatus('disconnected');
    }
  };

  const setupEventListeners = () => {
    realtimeService.on('connected', () => {
      setConnectionStatus('connected');
    });

    realtimeService.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });

    realtimeService.on('message:chat', (message) => {
      handleIncomingMessage(message.data);
    });

    realtimeService.on('message:user_action', (message) => {
      handleUserAction(message.data);
    });

    realtimeService.on('message:poll', (message) => {
      handlePollUpdate(message.data);
    });
  };

  const handleIncomingMessage = (messageData: ChatMessage) => {
    setMessages(prev => [...prev, messageData]);
    
    // Update unread count if window is not visible
    if (!isVisible) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Play notification sound (in real app)
    // playNotificationSound();
  };

  const handleUserAction = (actionData: any) => {
    switch (actionData.action) {
      case 'join_room':
        addParticipant(actionData.userId);
        break;
      case 'leave_room':
        removeParticipant(actionData.userId);
        break;
      case 'typing_start':
        setIsTyping(prev => [...prev.filter(id => id !== actionData.userId), actionData.userId]);
        break;
      case 'typing_stop':
        setIsTyping(prev => prev.filter(id => id !== actionData.userId));
        break;
    }
  };

  const handlePollUpdate = (pollData: any) => {
    if (pollData.action === 'create') {
      setActivePoll(pollData);
    } else if (pollData.action === 'vote') {
      setActivePoll(prev => {
        if (!prev) return prev;
        
        const updatedOptions = prev.options.map(option => 
          option.id === pollData.optionId 
            ? { ...option, votes: option.votes + 1 }
            : option
        );
        
        return {
          ...prev,
          options: updatedOptions,
          totalVotes: prev.totalVotes + 1
        };
      });
    } else if (pollData.action === 'close') {
      setActivePoll(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;
    
    // Check slow mode
    const now = Date.now();
    if (chatSettings.slowMode > 0 && now - lastMessageTime < chatSettings.slowMode * 1000) {
      showToast(`Please wait ${chatSettings.slowMode} seconds between messages`, 'warning');
      return;
    }
    
    try {
      // Content moderation
      if (chatSettings.moderationEnabled) {
        const moderation = await adminService.moderateContent(newMessage, 'comment');
        
        if (!moderation.approved) {
          showToast('Message flagged by content filter and requires approval', 'warning');
          if (chatSettings.requireApproval) {
            // Queue message for approval
            return;
          }
        }
      }
      
      // Send message
      realtimeService.sendChatMessage(currentRoom.id, newMessage);
      
      setNewMessage('');
      setLastMessageTime(now);
      stopTyping();
      
    } catch (error) {
      showToast('Failed to send message', 'error');
    }
  };

  const sendReaction = async (messageId: string, emoji: string) => {
    if (!chatSettings.allowReactions) return;
    
    const reactionMessage = {
      id: `reaction_${Date.now()}`,
      type: 'reaction' as const,
      data: {
        messageId,
        emoji,
        userId,
        action: 'add'
      },
      timestamp: Date.now()
    };
    
    realtimeService.sendMessage(reactionMessage);
    
    // Update local state
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (existingReaction.users.includes(userId)) {
            // Remove reaction
            existingReaction.users = existingReaction.users.filter(id => id !== userId);
            if (existingReaction.users.length === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            // Add reaction
            existingReaction.users.push(userId);
          }
        } else {
          // New reaction
          reactions.push({ emoji, users: [userId] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const handleTyping = () => {
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Send typing start
    realtimeService.sendMessage({
      id: `typing_${Date.now()}`,
      type: 'user_action',
      data: {
        action: 'typing_start',
        userId,
        roomId: currentRoom?.id
      },
      timestamp: Date.now()
    });
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(stopTyping, 3000);
  };

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    realtimeService.sendMessage({
      id: `typing_stop_${Date.now()}`,
      type: 'user_action',
      data: {
        action: 'typing_stop',
        userId,
        roomId: currentRoom?.id
      },
      timestamp: Date.now()
    });
  };

  const createPoll = async (question: string, options: string[]) => {
    if (!chatSettings.allowPolls || userRole === 'user') return;
    
    realtimeService.createPoll(eventId, question, options);
  };

  const votePoll = async (optionId: string) => {
    if (!activePoll) return;
    
    realtimeService.votePoll(activePoll.id, optionId);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!chatSettings.allowFileSharing) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }
    
    try {
      // In real app, upload to server and get URL
      const fileUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';
      
      realtimeService.sendChatMessage(currentRoom!.id, file.name, fileType as any);
      
    } catch (error) {
      showToast('Failed to upload file', 'error');
    }
  };

  const moderateMessage = async (messageId: string, action: 'approve' | 'reject' | 'delete') => {
    if (userRole !== 'moderator' && userRole !== 'admin') return;
    
    try {
      // In real app, call moderation API
      setMessages(prev => {
        if (action === 'delete') {
          return prev.filter(msg => msg.id !== messageId);
        } else {
          return prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, moderated: action === 'approve' }
              : msg
          );
        }
      });
      
      showToast(`Message ${action}ed`, 'success');
    } catch (error) {
      showToast(`Failed to ${action} message`, 'error');
    }
  };

  const loadParticipants = async () => {
    // Simulate loading participants
    const mockParticipants: Participant[] = [
      {
        id: '1',
        name: 'Ahmad Hassan',
        role: 'organizer',
        status: 'online',
        lastSeen: Date.now()
      },
      {
        id: '2',
        name: 'Sara Mohammed',
        role: 'user',
        status: 'online',
        lastSeen: Date.now()
      },
      {
        id: '3',
        name: 'John Smith',
        role: 'user',
        status: 'away',
        lastSeen: Date.now() - 300000
      }
    ];
    
    setParticipants(mockParticipants);
    onParticipantUpdate?.(mockParticipants.length);
  };

  const addParticipant = (userId: string) => {
    // In real app, fetch user details
    const newParticipant: Participant = {
      id: userId,
      name: `User ${userId}`,
      role: 'user',
      status: 'online',
      lastSeen: Date.now()
    };
    
    setParticipants(prev => {
      if (prev.find(p => p.id === userId)) return prev;
      const updated = [...prev, newParticipant];
      onParticipantUpdate?.(updated.length);
      return updated;
    });
  };

  const removeParticipant = (userId: string) => {
    setParticipants(prev => {
      const updated = prev.filter(p => p.id !== userId);
      onParticipantUpdate?.(updated.length);
      return updated;
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanup = () => {
    if (currentRoom) {
      realtimeService.leaveRoom(currentRoom.id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
    } text-white`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'away':
        return '🟡';
      case 'offline':
        return '⚫';
      default:
        return '⚫';
    }
  };

  return (
    <div className=\"flex flex-col h-full bg-white dark:bg-gray-900\">
      {/* Header */}
      <div className=\"border-b border-gray-200 dark:border-gray-700 p-4\">
        <div className=\"flex items-center justify-between\">
          <div className=\"flex items-center gap-2\">
            <h3 className=\"text-lg font-semibold text-gray-900 dark:text-white\">
              Live Chat
            </h3>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            {unreadCount > 0 && (
              <span className=\"bg-red-500 text-white text-xs px-2 py-1 rounded-full\">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className=\"flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400\">
            <span>{participants.length} participants</span>
            {chatSettings.slowMode > 0 && (
              <span className=\"text-yellow-600\">Slow mode: {chatSettings.slowMode}s</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className=\"flex-1 overflow-y-auto p-4 space-y-4\">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.userId === userId ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className=\"w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0\">
              <span className=\"text-xs font-medium text-gray-700 dark:text-gray-300\">
                {message.userName?.charAt(0) || 'U'}
              </span>
            </div>
            
            <div className={`max-w-xs lg:max-w-md ${
              message.userId === userId ? 'items-end' : 'items-start'
            }`}>
              <div className=\"flex items-center gap-2 mb-1\">
                <span className=\"text-sm font-medium text-gray-900 dark:text-white\">
                  {message.userName}
                </span>
                <span className=\"text-xs text-gray-500 dark:text-gray-400\">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              <div
                className={`px-3 py-2 rounded-lg ${
                  message.userId === userId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {message.type === 'system' ? (
                  <div className=\"text-xs italic opacity-75\">{message.message}</div>
                ) : (
                  <div>{message.message}</div>
                )}
                
                {message.reactions && message.reactions.length > 0 && (
                  <div className=\"flex gap-1 mt-2\">
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => sendReaction(message.id, reaction.emoji)}
                        className={`px-2 py-1 rounded-full text-xs ${
                          reaction.users.includes(userId)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {reaction.emoji} {reaction.users.length}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {(userRole === 'moderator' || userRole === 'admin') && message.userId !== userId && (
                <div className=\"flex gap-1 mt-1\">
                  <button
                    onClick={() => moderateMessage(message.id, 'delete')}
                    className=\"text-xs text-red-500 hover:text-red-600\"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping.length > 0 && (
          <div className=\"flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400\">
            <div className=\"typing-indicator\">
              <span></span>
              <span></span>
              <span></span>
            </div>
            {isTyping.length === 1 ? `${isTyping[0]} is typing...` : `${isTyping.length} people are typing...`}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Active Poll */}
      {activePoll && (
        <div className=\"border-t border-gray-200 dark:border-gray-700 p-4\">
          <div className=\"bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4\">
            <h4 className=\"font-medium text-gray-900 dark:text-white mb-3\">
              📊 {activePoll.question}
            </h4>
            <div className=\"space-y-2\">
              {activePoll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => votePoll(option.id)}
                  className=\"w-full text-left p-2 rounded bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center\"
                >
                  <span>{option.text}</span>
                  <span className=\"text-sm text-gray-500\">{option.votes} votes</span>
                </button>
              ))}
            </div>
            <div className=\"text-xs text-gray-500 dark:text-gray-400 mt-2\">
              Total votes: {activePoll.totalVotes}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className=\"border-t border-gray-200 dark:border-gray-700 p-4\">
        <div className=\"flex items-end gap-2\">
          <div className=\"flex-1\">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder=\"Type a message...\"
              rows={1}
              className=\"w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none\"
              disabled={connectionStatus !== 'connected'}
            />
          </div>
          
          <div className=\"flex gap-1\">
            {chatSettings.allowFileSharing && (
              <>
                <input
                  ref={fileInputRef}
                  type=\"file\"
                  onChange={handleFileUpload}
                  className=\"hidden\"
                  accept=\"image/*,.pdf,.doc,.docx,.txt\"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className=\"p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300\"
                  disabled={connectionStatus !== 'connected'}
                >
                  📎
                </button>
              </>
            )}
            
            {chatSettings.allowReactions && (
              <button
                onClick={() => setShowEmojis(!showEmojis)}
                className=\"p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300\"
              >
                😊
              </button>
            )}
            
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || connectionStatus !== 'connected'}
              className=\"px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed\"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      <div className=\"w-64 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800\">
        <div className=\"p-4\">
          <h4 className=\"text-sm font-medium text-gray-900 dark:text-white mb-3\">
            Participants ({participants.length})
          </h4>
          <div className=\"space-y-2\">
            {participants.map((participant) => (
              <div key={participant.id} className=\"flex items-center gap-2\">
                <span className=\"text-xs\">{getStatusIcon(participant.status)}</span>
                <div className=\"w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center\">
                  <span className=\"text-xs font-medium text-gray-700 dark:text-gray-300\">
                    {participant.name.charAt(0)}
                  </span>
                </div>
                <div className=\"flex-1 min-w-0\">
                  <div className=\"text-sm font-medium text-gray-900 dark:text-white truncate\">
                    {participant.name}
                  </div>
                  <div className=\"text-xs text-gray-500 dark:text-gray-400\">
                    {participant.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .typing-indicator {
          display: flex;
          gap: 2px;
        }
        
        .typing-indicator span {
          width: 4px;
          height: 4px;
          background-color: #9CA3AF;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.3;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}