import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users as UsersIcon, 
  Settings, 
  LogOut 
} from 'lucide-react';
import InventoryManagement from './components/InventoryManagement';
import SalesManagement from './components/SalesManagement';
import Dashboard from './components/Dashboard';
import UsersManagement from './components/Users';
import Login from './components/Login';
import Setting from './components/Settings'; // Import matches the file name

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return <InventoryManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'users':
        return <UsersManagement />;
      case 'settings':          // Changed from 'Settings' to 'settings' to match navItems
        return <Setting />;     // Component name matches the import
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: Receipt },
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'Users', icon: UsersIcon }] : []),
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold mb-6">Store ERP</h1>
          {/* User info */}
          <div className="mb-6 p-3 bg-gray-50 rounded">
            <p className="font-medium">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 w-full p-2 rounded transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full p-2 rounded text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;