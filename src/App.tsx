import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import KitchenPanel from './pages/KitchenPanel';
import CounterPanel from './pages/CounterPanel';
import MenuPage from './pages/MenuPage';
import StaffManagement from './pages/StaffManagement';
import AllOrders from './pages/AllOrders';
import TablesBilling from './pages/TablesBilling';
import CustomerMenu from './pages/CustomerMenu';
import TableManagement from './pages/TableManagement';
import QRCodePage from './pages/QRCodePage';
import LiveOrders from './pages/LiveOrders';
import BillingPage from './pages/BillingPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import { cn } from './lib/utils';

function AppContent() {
  const location = useLocation();
  const isCustomerView = location.pathname.startsWith('/customer');

  return (
    <div className={cn(
      "flex min-h-screen",
      isCustomerView ? "bg-white" : "bg-[#f8fafc]"
    )}>
      {!isCustomerView && <Sidebar />}
      <main className={cn(
        "flex-1 relative h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200",
        !isCustomerView && "px-8 py-6"
      )}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tables-grid" element={<TableManagement />} />
          <Route path="/qr" element={<QRCodePage />} />
          <Route path="/orders-live" element={<LiveOrders />} />
          <Route path="/kitchen" element={<KitchenPanel />} />
          <Route path="/counter" element={<CounterPanel />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/orders" element={<AllOrders />} />
          <Route path="/tables" element={<TablesBilling />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/customer/table/:id" element={<CustomerMenu />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
