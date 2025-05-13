import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paperclip, Send, X } from "lucide-react";
import { format } from 'date-fns';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isSystem?: boolean;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  };
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, attachment?: File) => void;
  onClose: () => void;
  currentUserId: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  onClose,
  currentUserId,
  participants,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim() || attachment) {
      onSendMessage(messageInput, attachment || undefined);
      setMessageInput('');
      setAttachment(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full border-l bg-white">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Chat</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="everyone" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-3 mt-2">
          <TabsTrigger value="everyone">Everyone</TabsTrigger>
          <TabsTrigger value="private">Private</TabsTrigger>
        </TabsList>

        <TabsContent value="everyone" className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === currentUserId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-3 border-t">
            {attachment && (
              <div className="mb-2 p-2 bg-gray-100 rounded-md flex items-center justify-between">
                <span className="text-sm truncate">{attachment.name}</span>
                <Button variant="ghost" size="icon" onClick={removeAttachment}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleAttachmentClick}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
          </div>
        </TabsContent>

        <TabsContent value="private" className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {participants
                .filter(p => p.id !== currentUserId)
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback>
                        {participant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{participant.name}</span>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isOwnMessage }) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
        {!isOwnMessage && !message.isSystem && (
          <div className="flex items-center mb-1">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={message.senderAvatar} alt={message.senderName} />
              <AvatarFallback className="text-xs">
                {message.senderName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium">{message.senderName}</span>
          </div>
        )}

        {message.isSystem ? (
          <div className="text-sm text-gray-500 italic">{message.content}</div>
        ) : (
          <div className="text-sm">{message.content}</div>
        )}

        {message.attachment && (
          <div className="mt-2">
            {message.attachment.type === 'image' ? (
              <img
                src={message.attachment.url}
                alt={message.attachment.name}
                className="max-w-full rounded-md"
              />
            ) : (
              <div className="bg-white bg-opacity-20 p-2 rounded-md flex items-center">
                <Paperclip className="h-4 w-4 mr-2" />
                <span className="text-xs truncate">{message.attachment.name}</span>
              </div>
            )}
          </div>
        )}

        <div className="text-xs mt-1 opacity-70">
          {format(message.timestamp, 'h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
