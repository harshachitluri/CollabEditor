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

export interface RemoteCursor {
  socketId: string;
  username: string;
  color: string;
  line: number;
  column: number;
}

interface UseSocketOptions {
  slug: string;
  username: string;
  onCodeChange: (code: string) => void;
  onLanguageChange: (lang: string) => void;
  onCursorMove?: (cursor: RemoteCursor) => void;
  onUserLeft?: (socketId: string) => void;
}

export function useSocket({
  slug,
  username,
  onCodeChange,
  onLanguageChange,
  onCursorMove,
  onUserLeft,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !username) return;

    const socket = io(WS_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketId(socket.id ?? null);
      socket.emit('join-room', { slug, username });
    });

    socket.on('disconnect', () => {
      setSocketId(null);
    });

    // Receive current user list on join
    socket.on('room-users', (roomUsers: RoomUser[]) => {
      setUsers(roomUsers);
    });

    // Someone joined
    socket.on('user-joined', (user: RoomUser) => {
      setUsers((prev) => [...prev.filter((u) => u.socketId !== user.socketId), user]);
    });

    // Someone left
    socket.on('user-left', ({ socketId }: { socketId: string }) => {
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId));
      onUserLeft?.(socketId);
    });

    // Code broadcast from another user
    socket.on('code-change', ({ code }: { code: string }) => {
      onCodeChange(code);
    });

    // Language change from another user
    socket.on('language-change', ({ language }: { language: string }) => {
      onLanguageChange(language);
    });

    socket.on('cursor-move', (cursor: RemoteCursor) => {
      onCursorMove?.(cursor);
    });

    // Chat messages
    socket.on('chat-message', (msg: ChatMsg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketId(null);
    };
  }, [slug, username, onCursorMove, onLanguageChange, onCodeChange, onUserLeft]);

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

  return {
    users,
    chatMessages,
    emitCodeChange,
    emitLanguageChange,
    emitCursorMove,
    sendChatMessage,
    socket: socketRef,
    socketId,
  };
}
