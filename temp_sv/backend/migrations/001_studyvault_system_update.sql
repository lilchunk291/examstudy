-- StudyVault AI System Update - Schema Migrations
-- Section 4.1 - Create 5 new tables with RLS policies

-- 1. Session Logs Table
CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  subject TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  session_type TEXT CHECK (session_type IN (
    'reading','practice','retrieval','past_paper','review','deep_work'
  )),
  completed BOOLEAN DEFAULT false,
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Diagnostic Results Table
CREATE TABLE IF NOT EXISTS diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  self_reported_coverage FLOAT CHECK (self_reported_coverage BETWEEN 0 AND 1),
  actual_diagnostic_score FLOAT CHECK (actual_diagnostic_score BETWEEN 0 AND 1),
  calibration_gap FLOAT,
  dunning_kruger_flag BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Pattern Detections Table
CREATE TABLE IF NOT EXISTS pattern_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  detection_confidence FLOAT,
  intervention_delivered TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Safety Flags Table
CREATE TABLE IF NOT EXISTS safety_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_category TEXT NOT NULL,
  resources_shown BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Syllabi Table
CREATE TABLE IF NOT EXISTS syllabi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  exam_date DATE,
  raw_text TEXT,
  topics JSONB,
  dependencies JSONB,
  weights JSONB,
  difficulty_estimates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add processing_style to user_profiles if not exists
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS processing_style TEXT
CHECK (processing_style IN ('linear', 'relational', 'systemic'));

-- Enable Row Level Security
ALTER TABLE session_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabi ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can view own session logs" ON session_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session logs" ON session_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session logs" ON session_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own session logs" ON session_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own diagnostic results" ON diagnostic_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own diagnostic results" ON diagnostic_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own diagnostic results" ON diagnostic_results
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own diagnostic results" ON diagnostic_results
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own pattern detections" ON pattern_detections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pattern detections" ON pattern_detections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pattern detections" ON pattern_detections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pattern detections" ON pattern_detections
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own safety flags" ON safety_flags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own safety flags" ON safety_flags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own safety flags" ON safety_flags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own safety flags" ON safety_flags
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own syllabi" ON syllabi
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own syllabi" ON syllabi
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own syllabi" ON syllabi
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own syllabi" ON syllabi
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_subject ON session_logs(subject);
CREATE INDEX IF NOT EXISTS idx_session_logs_started_at ON session_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user_id ON diagnostic_results(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_subject ON diagnostic_results(subject);
CREATE INDEX IF NOT EXISTS idx_pattern_detections_user_id ON pattern_detections(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_flags_user_id ON safety_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_syllabi_user_id ON syllabi(user_id);
CREATE INDEX IF NOT EXISTS idx_syllabi_exam_date ON syllabi(exam_date);
