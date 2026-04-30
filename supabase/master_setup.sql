-- ==========================================
-- GRAND HOTEL MANAGEMENT SYSTEM - MASTER SQL
-- ==========================================
-- This script sets up all necessary tables, security policies, 
-- and real-time subscriptions for the entire application.

-- DROP EXISTING TABLES (CLEAN SLATE)
DROP TABLE IF EXISTS app_invoices;
DROP TABLE IF EXISTS app_orders;
DROP TABLE IF EXISTS app_menu;
DROP TABLE IF EXISTS app_tables;
DROP TABLE IF EXISTS app_staff;
DROP TABLE IF EXISTS app_printers;
DROP TABLE IF EXISTS app_settings;



-- 1. APP TABLES (Restaurant Layout)
CREATE TABLE app_tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  capacity INTEGER DEFAULT 4,
  status TEXT DEFAULT 'free', -- free, occupied, reserved
  location TEXT DEFAULT 'Main Hall',
  type TEXT DEFAULT '-', -- Dine-in, Takeaway
  bill_amount TEXT DEFAULT '-',
  occupied_since TEXT DEFAULT '-',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. APP MENU (Food & Drinks)
CREATE TABLE app_menu (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  is_veg BOOLEAN DEFAULT true,
  is_available BOOLEAN DEFAULT true,
  spicy INTEGER DEFAULT 0, -- 0 to 3
  image TEXT,
  description TEXT,
  rating DECIMAL(2, 1) DEFAULT 4.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APP ORDERS (Kitchen & Live Tracking)
CREATE TABLE app_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_no TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, cooking, ready, served, completed, cancelled
  priority TEXT DEFAULT 'normal', -- normal, high
  items JSONB NOT NULL, -- Array of objects: {name, qty, price, note}
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APP STAFF (Employee Management)
CREATE TABLE app_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- Admin, Chef, Waiter, Cashier
  email TEXT UNIQUE,
  contact TEXT,
  image TEXT,
  pin TEXT, -- 4 Digit Security PIN
  department TEXT DEFAULT 'Service',
  status TEXT DEFAULT 'Active', -- Active, Inactive
  shift TEXT DEFAULT 'Morning', -- Morning, Evening, Night
  join_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APP INVOICES (Billing History)
CREATE TABLE app_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_no TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  payment_method TEXT DEFAULT 'Cash', -- Cash, Card, UPI
  status TEXT DEFAULT 'Paid',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APP PRINTERS (Device Configuration)
CREATE TABLE app_printers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- WiFi, Bluetooth, Wired
  role TEXT DEFAULT 'billing', -- billing, kitchen
  connection_details JSONB NOT NULL, -- {ip, port} or {mac} or {usb_id}

  status TEXT DEFAULT 'online', -- online, offline
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. APP SETTINGS (Global Configuration)
CREATE TABLE app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_name TEXT DEFAULT 'Grand Hotel',
  tagline TEXT DEFAULT 'Premium Dining Experience',
  email TEXT DEFAULT 'admin@grandhotel.com',
  phone TEXT DEFAULT '+91 98765 43210',
  address TEXT DEFAULT '123 Luxury Avenue, Food City',
  currency TEXT DEFAULT '₹',
  tax_percent DECIMAL(5, 2) DEFAULT 5.0,
  invoice_prefix TEXT DEFAULT 'INV-',
  auto_print BOOLEAN DEFAULT false,
  notifications_enabled BOOLEAN DEFAULT true,
  order_alerts BOOLEAN DEFAULT true,
  stock_alerts BOOLEAN DEFAULT false,
  theme TEXT DEFAULT 'light',
  compact_mode BOOLEAN DEFAULT false,
  admin_pin TEXT DEFAULT '1234',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);



-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE app_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;



-- CREATE ALL-ACCESS POLICIES (Simplified for this app)
CREATE POLICY "Public Full Access" ON app_tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON app_menu FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON app_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON app_staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON app_invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON app_printers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access" ON app_settings FOR ALL USING (true) WITH CHECK (true);



-- ENABLE REALTIME SUBSCRIPTIONS
-- Note: You must enable 'Realtime' for these tables in the Supabase Dashboard as well.
ALTER PUBLICATION supabase_realtime ADD TABLE app_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE app_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE app_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE app_staff;
ALTER PUBLICATION supabase_realtime ADD TABLE app_printers;
ALTER PUBLICATION supabase_realtime ADD TABLE app_settings;



-- INITIAL SAMPLE DATA: TABLES
INSERT INTO app_tables (number, capacity, status, location) VALUES 
('T01', 4, 'free', 'Main Hall'),
('T02', 2, 'free', 'Main Hall'),
('T03', 6, 'free', 'Rooftop'),
('T04', 4, 'free', 'Garden'),
('T05', 8, 'free', 'VIP Cabin');

-- INITIAL SAMPLE DATA: MENU
INSERT INTO app_menu (name, category, price, is_veg, spicy, description) VALUES 
('Paneer Tikka', 'Starters', 280, true, 2, 'Marinated cottage cheese cubes grilled to perfection'),
('Butter Chicken', 'Main Course', 450, false, 1, 'Rich creamy tomato based chicken curry'),
('Garlic Naan', 'Bread', 60, true, 0, 'Traditional Indian bread with garlic'),
('Mango Lassi', 'Beverages', 120, true, 0, 'Fresh mango yogurt drink');

-- INITIAL SAMPLE DATA: STAFF
INSERT INTO app_staff (name, role, email, pin, status) VALUES 
('Tausif', 'Admin', 'admin@hotel.com', '1234', 'Active'),
('Rahul Chef', 'Chef', 'chef@hotel.com', '2222', 'Active'),
('Simran Waiter', 'Waiter', 'waiter@hotel.com', '3333', 'Active');

-- INITIAL SAMPLE DATA: SETTINGS
INSERT INTO app_settings (id) VALUES (gen_random_uuid());

