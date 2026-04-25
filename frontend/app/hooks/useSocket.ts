'use client';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface RoomUser {
  socketId: string;
  username: string;
  color: string;
}

export interface ChatMsg {
  socketId: string;
  username: string;
  message: string;
  time: number;
}

interface UseSocketOptions {
  slug: string;
  username: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
}

export function useSocket({ slug, username, onCodeChange, onLanguageChange }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);

  useEffect(() => {
    if (!slug || !username) return;

    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-room', { slug, username });
    });

    // Receive current user list on join
    socket.on('room-users', (roomUsers: RoomUser[]) => {
      setUsers(roomUsers);
    });

    // Someone joined
    socket.on('user-joined', (user: RoomUser) => {
      setUsers(prev => [...prev.filter(u => u.socketId !== user.socketId), user]);
    });

    // Someone left
    socket.on('user-left', ({ socketId }: { socketId: string }) => {
      setUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    // Code broadcast from another user
    socket.on('code-change', ({ code }: { code: string }) => {
      onCodeChange(code);
    });

    // Language change from another user
    socket.on('language-change', ({ language }: { language: string }) => {
      onLanguageChange(language);
    });

    // Chat messages
    socket.on('chat-message', (msg: ChatMsg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [slug, username]); // eslint-disable-line react-hooks/exhaustive-deps

  const emitCodeChange = (code: string) => {
    socketRef.current?.emit('code-change', { slug, code });
  };

  const emitLanguageChange = (language: string) => {
    socketRef.current?.emit('language-change', { slug, language });
  };

  const emitCursorMove = (line: number, column: number) => {
    socketRef.current?.emit('cursor-move', { slug, line, column });
  };

  const sendChatMessage = (message: string) => {
    socketRef.current?.emit('chat-message', { slug, message, username });
  };

  return { users, chatMessages, emitCodeChange, emitLanguageChange, emitCursorMove, sendChatMessage, socket: socketRef };
}
