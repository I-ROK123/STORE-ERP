import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    dailySales: 0,
    totalProducts: 0,
    lowStock: 0,
    growth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch metrics
        const metricsResponse = await fetch('http://localhost:5000/api/dashboard/metrics');
        const metricsData = await metricsResponse.json();
        
        if (!metricsResponse.ok) throw new Error(metricsData.error);
        setMetrics(metricsData);

        // Fetch sales chart data
        const salesResponse = await fetch('http://localhost:5000/api/dashboard/sales-chart');
        const salesData = await salesResponse.json();
        
        if (!salesResponse.ok) throw new Error(salesData.error);
        setSalesData(salesData);

        // Fetch stock alerts
        const alertsResponse = await fetch('http://localhost:5000/api/dashboard/stock-alerts');
        const alertsData = await alertsResponse.json();
        
        if (!alertsResponse.ok) throw new Error(alertsData.error);
        setInventoryAlerts(alertsData);

        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const MetricCard = ({ icon: Icon, title, value, color, percentage }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 ${color} rounded-lg`}>
              <Icon className={`h-6 w-6 ${color.includes('purple') ? 'text-purple-600' : color.includes('red') ? 'text-red-600' : color.includes('green') ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <h3 className={`text-2xl font-bold ${percentage ? (parseFloat(value) >= 0 ? 'text-purple-600' : 'text-red-600') : ''}`}>
                {typeof value === 'number' && !percentage
                  ? value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                      style: title === 'Daily Sales' ? 'currency' : 'decimal',
                      currency: 'KES'
                    })
                  : `${value}${percentage ? '%' : ''}`}
              </h3>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={DollarSign}
            title="Daily Sales"
            value={metrics.dailySales}
            color="bg-blue-100"
          />
          <MetricCard
            icon={Package}
            title="Total Products"
            value={metrics.totalProducts}
            color="bg-green-100"
          />
          <MetricCard
            icon={AlertTriangle}
            title="Low Stock Items"
            value={metrics.lowStock}
            color="bg-red-100"
          />
          <MetricCard
            icon={TrendingUp}
            title="Growth"
            value={metrics.growth}
            color={parseFloat(metrics.growth) >= 0 ? 'bg-purple-100' : 'bg-red-100'}
            percentage
          />
        </div>

        {/* Charts and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart - Takes up 2 columns on large screens */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Sales Overview</h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      className="text-sm"
                    />
                    <YAxis 
                      className="text-sm"
                      domain={[0, 10000]}
                      tickFormatter={(value) => `${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`KES ${value.toLocaleString()}`, 'Sales']}
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Stock Alerts</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {inventoryAlerts.length > 0 ? (
                  inventoryAlerts.map((alert) => (
                    <Alert key={alert.id} variant="destructive" className="bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="font-semibold">
                        {alert.product}
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        Current stock: {alert.currentStock} units
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <Alert className="bg-green-50 text-green-800">
                    <AlertDescription>
                      All stock levels are healthy
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;