'use client';
import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ✅ Wrapper component that ensures children only render on client
 * 
 * WHY THIS WORKS:
 * - Sets `mounted` state in useEffect (client-side only)
 * - First render is null/fallback (server + client match)
 * - Second render shows children only on client
 * - Prevents React hydration mismatch errors
 * 
 * PRODUCTION PATTERN:
 * - Standard pattern for client-only features in Next.js App Router
 * - Safe with Turbopack and streaming SSR
 * - No performance impact if fallback is lightweight
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? children : fallback;
}
