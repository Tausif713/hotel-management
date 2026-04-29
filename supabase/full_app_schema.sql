-- DROP EXISTING APP TABLES IF ANY
DROP TABLE IF EXISTS app_orders;
DROP TABLE IF EXISTS app_menu;
DROP TABLE IF EXISTS app_tables;
DROP TABLE IF EXISTS app_staff;

-- 1. APP ORDERS (Live Kitchen & Orders)
CREATE TABLE app_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_no TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  items JSONB,
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APP MENU (Dishes)
CREATE TABLE app_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  category TEXT,
  price DECIMAL(10,2),
  is_veg BOOLEAN,
  is_available BOOLEAN,
  spicy INTEGER,
  image TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APP TABLES (Table Management)
CREATE TABLE app_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT,
  capacity INTEGER,
  status TEXT,
  location TEXT,
  type TEXT,
  bill_amount TEXT,
  occupied_since TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APP STAFF (Staff Management)
CREATE TABLE app_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  role TEXT,
  department TEXT,
  status TEXT,
  shift TEXT,
  join_date TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE app_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_staff ENABLE ROW LEVEL SECURITY;

-- ALLOW ALL OPERATIONS (For Demo/Fast Setup)
CREATE POLICY "Allow all operations" ON app_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON app_menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON app_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON app_staff FOR ALL USING (true) WITH CHECK (true);

-- ENABLE REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE app_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE app_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE app_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE app_staff;
