"use client";

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import * as Y from 'yjs';
// Removed static import of MonacoBinding to prevent SSR error
import { Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface CollabEditorProps {
  roomSlug: string;
  username: string;
  language?: string;
  theme?: string;
}

export const CollabEditor = forwardRef(({ 
  roomSlug, 
  username, 
  language = 'javascript',
  theme = 'vs-dark' 
}: CollabEditorProps, ref) => {
  const [isReady, setIsReady] = useState(false);
  const editorRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const docRef = useRef<Y.Doc | null>(null);

  useImperativeHandle(ref, () => ({
    getContent: () => {
      return editorRef.current?.getValue() || '';
    }
  }));

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // 1. Initialize Yjs
    const doc = new Y.Doc();
    docRef.current = doc;
    const type = doc.getText('monaco');

    // 2. Initialize Socket.IO
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.emit('join-room', { slug: roomSlug, username });

    // 3. Yjs Sync Logic over Socket.IO
    doc.on('update', (update) => {
      socket.emit('yjs-update', { slug: roomSlug, update });
    });

    socket.on('yjs-update', (update: Uint8Array) => {
      Y.applyUpdate(doc, new Uint8Array(update));
    });

    // 4. Bind Yjs to Monaco (Client-side only)
    import('y-monaco').then(({ MonacoBinding }) => {
      const binding = new MonacoBinding(
        type,
        editor.getModel()!,
        new Set([editor])
      );
      setIsReady(true);
    });
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (docRef.current) {
        docRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-zinc-400 font-medium">Connecting to room...</p>
          </div>
        </div>
      )}
      <Editor
        height="100%"
        language={language}
        defaultValue="// Start collaborating..."
        theme={theme}
        onMount={handleEditorDidMount}
        options={{
          fontSize: 14,
          fontFamily: 'var(--font-mono)',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          lineNumbers: "on",
          roundedSelection: true,
        }}
      />
    </div>
  );
});

CollabEditor.displayName = 'CollabEditor';
