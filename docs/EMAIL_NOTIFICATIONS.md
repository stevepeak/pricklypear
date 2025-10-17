# Email Notifications for Unread Messages

This document describes the email notification system for users with unread messages when they're inactive.

## Overview

The system sends email notifications to users who have unread messages and haven't been active in the app recently. It uses a simple activity-tracking approach that can be improved over time.

## Components

### 1. Database Schema

Two new columns were added to the `profiles` table:

- **`last_activity_at`** (timestamptz): Tracks when the user was last active. Updated every 5 minutes while the user is using the app.
- **`last_notification_sent_at`** (timestamptz): Tracks when we last sent an unread messages email to prevent spam.

Migration files:

- `supabase/migrations/20251015202257_add_activity_tracking.sql`
- `supabase/migrations/20251015202403_add_notification_cron.sql`

### 2. Frontend Activity Tracking

The `AuthContext` (`src/contexts/AuthContext.tsx`) now includes an effect that:

- Updates `last_activity_at` immediately when user logs in
- Updates it every 5 minutes while the user is active
- Automatically stops when the user logs out

### 3. Edge Function: send-unread-notifications

Location: `supabase/functions/send-unread-notifications/index.ts`

This function runs on a schedule (every 15 minutes) and:

1. Queries for users who:
   - Haven't been active in the last 15 minutes
   - Haven't received a notification in the last hour (or never)
   - Have email notifications enabled for new messages
   - Have a valid email address
2. For each eligible user:
   - Fetches unread messages grouped by thread
   - Gets thread details and participant names
   - Renders the email using the existing `PricklyPearUnreadMessagesEmail` template
   - Sends the email via Resend
   - Updates `last_notification_sent_at` to prevent duplicate notifications

### 4. Scheduled Job

A pg_cron job runs the Edge Function every 15 minutes:

```sql
SELECT cron.schedule(
  'send-unread-notifications',
  '*/15 * * * *',
  ...
);
```

## Testing

### Manual Testing

1. **Setup test users:**
   - Create two test users in your local Supabase instance
   - Enable email notifications for both users in their profile settings

2. **Simulate inactivity:**

   ```sql
   -- Set a user's last activity to 30 minutes ago
   UPDATE profiles
   SET last_activity_at = NOW() - INTERVAL '30 minutes',
       last_notification_sent_at = NULL
   WHERE email = 'test@example.com';
   ```

3. **Create unread messages:**
   - Log in as User A
   - Send a message to User B in a thread
   - User B should now have an unread message

4. **Trigger the notification function:**

   ```bash
   # Via Supabase CLI
   supabase functions serve send-unread-notifications

   # In another terminal, invoke it
   curl -i --location --request POST 'http://localhost:54321/functions/v1/send-unread-notifications' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json'
   ```

5. **Verify:**
   - Check the function logs for "Sent unread notification to..."
   - Check your email (if Resend is configured)
   - Verify `last_notification_sent_at` was updated in the database

### Viewing Cron Jobs

To see scheduled jobs:

```sql
SELECT * FROM cron.job;
```

To see job run history:

```sql
SELECT * FROM cron.job_run_details ORDER BY end_time DESC LIMIT 10;
```

## Configuration

### Local Development

The cron job is configured to call `http://host.docker.internal:54321/functions/v1/send-unread-notifications` for local development.

### Production

For production, you'll need to:

1. Update the cron job URL to your production Supabase project URL:

   ```sql
   -- Update the cron job
   SELECT cron.unschedule('send-unread-notifications');

   SELECT cron.schedule(
     'send-unread-notifications',
     '*/15 * * * *',
     $$
     SELECT extensions.http_post(
       url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-unread-notifications',
       headers := jsonb_build_object(
         'Content-Type', 'application/json',
         'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
       ),
       body := '{}'::jsonb
     );
     $$
   );
   ```

2. Ensure the service role key is configured as a secret in your Supabase project

3. Ensure Resend API key is configured in your Edge Function secrets

## User Preferences

Users can control email notifications in their Account settings:

- Navigate to Account → Notification Preferences
- Toggle "New messages" under the Email column

The notification system respects this setting and only sends emails to users who have opted in.

## Future Improvements

- Add real-time presence tracking with Supabase Realtime channels
- Allow users to configure notification frequency (immediate, hourly, daily digest)
- Add "quiet hours" based on user's timezone
- Track individual message notifications to avoid duplicates
- Add browser push notifications
- Add notification preferences per thread
- Include message previews (currently only shows thread and sender info)
