-- Run this in your Supabase SQL Editor to create the tables

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  completed BOOLEAN DEFAULT false,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
-- For now, we'll allow all access for easy development. 
-- IN PRODUCTION: You should restrict this to authenticated users.
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all access to events" ON events FOR ALL USING (true);

-- Vault Tables
CREATE TABLE vault_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vault_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id UUID REFERENCES vault_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  starred BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE vault_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to vault_folders" ON vault_folders FOR ALL USING (true);
CREATE POLICY "Allow all access to vault_files" ON vault_files FOR ALL USING (true);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to chat_messages" ON chat_messages FOR ALL USING (true);

-- Silent Rooms
CREATE TABLE silent_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  active_users INTEGER DEFAULT 0,
  max_users INTEGER DEFAULT 25,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE silent_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to silent_rooms" ON silent_rooms FOR ALL USING (true);

-- Analytics Metrics
CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to analytics_metrics" ON analytics_metrics FOR ALL USING (true);

-- Study Nodes
CREATE TABLE study_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  color TEXT NOT NULL,
  x FLOAT DEFAULT 0,
  y FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE study_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to study_nodes" ON study_nodes FOR ALL USING (true);

-- Crisis Sessions
CREATE TABLE crisis_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time TEXT NOT NULL,
  task TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE crisis_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to crisis_sessions" ON crisis_sessions FOR ALL USING (true);

-- Enable Realtime for these tables
alter publication supabase_realtime add table tasks;
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table vault_folders;
alter publication supabase_realtime add table vault_files;
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table silent_rooms;
alter publication supabase_realtime add table analytics_metrics;
alter publication supabase_realtime add table study_nodes;
alter publication supabase_realtime add table crisis_sessions;
