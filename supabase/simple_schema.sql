-- Drop if exists
DROP TABLE IF EXISTS app_orders;

CREATE TABLE app_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_no TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  items JSONB,
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (we'll keep it open for now for fast dev)
ALTER TABLE app_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON app_orders FOR ALL USING (true) WITH CHECK (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE app_orders;
