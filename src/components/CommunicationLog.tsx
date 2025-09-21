import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Clock, Send, User, Bot } from 'lucide-react';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}

interface Message {
  id: string;
  sender: string;
  senderType: 'verifier' | 'ngo' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
}

interface CommunicationLogProps {
  projectId: string;
  auditTrail: AuditEvent[];
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const CommunicationLog: React.FC<CommunicationLogProps> = ({
  auditTrail,
  messages,
  onSendMessage,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'audit' | 'messages'>('audit');

  const unreadMessagesCount = useMemo(() => messages.filter(m => !m.read && m.senderType === 'ngo').length, [messages]);

  const getSenderIcon = useCallback((senderType: string) => {
    switch (senderType) {
      case 'verifier': return <User className="h-4 w-4 text-primary" />;
      case 'ngo': return <User className="h-4 w-4 text-success" />;
      case 'system': return <Bot className="h-4 w-4 text-muted-foreground" />;
      default: return <User className="h-4 w-4" />;
    }
  }, []);

  const getActionColor = useCallback((action: string) => {
    if (action.includes('Submitted') || action.includes('Complete')) return 'text-success';
    if (action.includes('Started') || action.includes('Viewed')) return 'text-primary';
    if (action.includes('Failed') || action.includes('Rejected')) return 'text-destructive';
    return 'text-muted-foreground';
  }, []);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, onSendMessage]);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'audit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('audit')}
          className="flex-1"
        >
          <Clock className="h-4 w-4 mr-2" />
          Audit Trail
        </Button>
        <Button
          variant={activeTab === 'messages' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('messages')}
          className="flex-1"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Messages
          {unreadMessagesCount > 0 && (
            <Badge className="ml-2 bg-destructive text-destructive-foreground">
              {unreadMessagesCount}
            </Badge>
          )}
        </Button>
      </div>

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Project Audit Trail</span>
              <Badge variant="outline">{auditTrail.length} Events</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {auditTrail.map((event, i) => (
                  <div key={event.id}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium ${getActionColor(event.action)}`}>{event.action}</p>
                          <span className="text-sm text-muted-foreground">{event.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">by {event.actor}</p>
                        {event.details && <p className="text-sm text-foreground mt-1">{event.details}</p>}
                      </div>
                    </div>
                    {i < auditTrail.length - 1 && <Separator className="my-4" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {activeTab === 'messages' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Communication with NGO</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-3 ${
                        message.senderType === 'verifier' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">{getSenderIcon(message.senderType)}</div>
                      <div
                        className={`flex-1 p-3 rounded-lg ${
                          message.senderType === 'verifier'
                            ? 'bg-primary text-primary-foreground ml-12'
                            : message.senderType === 'ngo'
                            ? 'bg-muted mr-12'
                            : 'bg-secondary/50 text-center'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{message.sender}</span>
                          <span className="text-xs opacity-70">{message.timestamp}</span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send Message to NGO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Type your message here..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{newMessage.length}/1000 characters</span>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunicationLog;
