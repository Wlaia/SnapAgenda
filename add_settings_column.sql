-- Add settings column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Comment on column
COMMENT ON COLUMN profiles.settings IS 'Stores business configuration like operating hours, cancellation policy, etc.';

-- Example usage of settings structure:
/*
{
  "hours": {
    "monday": { "open": "09:00", "close": "18:00", "active": true },
    "tuesday": { "open": "09:00", "close": "18:00", "active": true },
    ...
  },
  "rules": {
    "cancellation_window_hours": 24,
    "buffer_time_minutes": 15
  }
}
*/
