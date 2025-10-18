import { track as vercelTrack } from '@vercel/analytics';
import * as Sentry from '@sentry/react';
import { Thread } from '@/types/thread';
import { User } from '@supabase/supabase-js';

type TrackingEvent =
  | { name: 'signup' }
  | { name: 'create_thread'; user: User; thread: Thread }
  | { name: 'upload_document'; user: User };

function track(
  name: string,
  props?: Record<string, string | number | boolean>
) {
  vercelTrack(name, props);
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, props);
  }
}

export function trackEvent(event: TrackingEvent) {
  // Track with Vercel Analytics
  switch (event.name) {
    case 'signup':
      track('Signup');
      break;
    case 'create_thread':
      track('Create Thread', {
        threadType: event.thread.type,
        threadTopic: event.thread.topic,
        nParticipants: event.thread.participants.length,
      });
      break;
    case 'upload_document':
      track('Upload Document');
      break;
  }

  // Track with Sentry (only in production)
  if (import.meta.env?.VERCEL_ENV !== 'development') {
    switch (event.name) {
      case 'signup':
        Sentry.captureMessage('User signed up', 'info');
        break;
      case 'create_thread':
        Sentry.captureMessage('Thread created', {
          level: 'info',
          user: event.user,
          extra: {
            threadType: event.thread.type,
            threadTopic: event.thread.topic,
            nParticipants: event.thread.participants.length,
          },
        });
        break;
      case 'upload_document':
        Sentry.captureMessage('Document uploaded', {
          level: 'info',
          user: event.user,
        });
        break;
    }
  }
}
