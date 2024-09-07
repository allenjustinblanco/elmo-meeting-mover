import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirebase } from "@/hooks/useFirebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Smile } from "lucide-react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  timestamp: Date;
}

interface ChatProps {
  roomId: string;
  userId: string;
}

export function Chat({ roomId, userId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { sendMessage } = useFirebase(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messagesRef = collection(db, "rooms", roomId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(userId, newMessage);
      setNewMessage("");
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupMessagesByUser = (messages: ChatMessage[]) => {
    return messages.reduce((groups, message) => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup[0].userId === message.userId) {
        lastGroup.push(message);
      } else {
        groups.push([message]);
      }
      return groups;
    }, [] as ChatMessage[][]);
  };

  const messageGroups = groupMessagesByUser(messages);

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-grow overflow-y-auto space-y-4 p-4">
        {messageGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={`flex ${group[0].userId === userId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex ${group[0].userId === userId ? "flex-row-reverse" : "flex-row"} items-start space-x-2`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/initials/svg?seed=${group[0].userId}`}
                />
                <AvatarFallback>
                  {group[0].userId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col ${group[0].userId === userId ? "items-end" : "items-start"} space-y-1`}
              >
                {group.map((message, messageIndex) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg ${
                      message.userId === userId
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    } ${messageIndex === 0 ? "rounded-t-lg" : ""} ${messageIndex === group.length - 1 ? "rounded-b-lg" : ""}`}
                  >
                    <p className="text-sm">{message.message}</p>
                    {messageIndex === group.length - 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Smile className="h-5 w-5" />
                <span className="sr-only">Open emoji picker</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
              <Picker
                data={data}
                onEmojiSelect={handleEmojiSelect}
                theme="light"
              />
            </PopoverContent>
          </Popover>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}
