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

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Daily Sales Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Sales</p>
                <h3 className="text-2xl font-bold">
                  Ksh {metrics.dailySales.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Products Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold">{metrics.totalProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Items</p>
                <h3 className="text-2xl font-bold">{metrics.lowStock}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Growth Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${parseFloat(metrics.growth) >= 0 ? 'bg-purple-100' : 'bg-red-100'}`}>
                <TrendingUp className={`h-6 w-6 ${parseFloat(metrics.growth) >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Growth</p>
                <h3 className={`text-2xl font-bold ${parseFloat(metrics.growth) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  {metrics.growth}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Sales Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`Ksh ${value.toLocaleString()}`, 'Sales']}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Stock Alerts</h3>
            <div className="space-y-4">
              {inventoryAlerts.map((alert) => (
                <Alert key={alert.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Low Stock Warning</AlertTitle>
                  <AlertDescription>
                    {alert.product} is running low (Current stock: {alert.currentStock})
                  </AlertDescription>
                </Alert>
              ))}
              {inventoryAlerts.length === 0 && (
                <Alert variant="success">
                  <AlertDescription>
                    No low stock alerts at the moment.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;