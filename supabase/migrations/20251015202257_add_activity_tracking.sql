-- Add activity tracking columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN last_activity_at timestamptz DEFAULT NOW(),
  ADD COLUMN last_notification_sent_at timestamptz;

-- Add index for efficient querying of inactive users with unread messages
CREATE INDEX idx_profiles_last_activity_at ON profiles(last_activity_at);
CREATE INDEX idx_profiles_last_notification_sent_at ON profiles(last_notification_sent_at);

-- Comment the columns for documentation
COMMENT ON COLUMN profiles.last_activity_at IS 'Timestamp of the user''s last activity in the app, updated every 5 minutes when active';
COMMENT ON COLUMN profiles.last_notification_sent_at IS 'Timestamp of when we last sent an unread messages email notification to this user';

