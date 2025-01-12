import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const getDashboardMetrics = async () => {
    try {
        const [totalSales, productCount, lowStock] = await Promise.all([
            axios.get(`${BASE_URL}/sales/total`),
            axios.get(`${BASE_URL}/products/count`),
            axios.get(`${BASE_URL}/products/low-stock`)
        ]);

        return {
            totalSales: totalSales.data.total,
            productCount: productCount.data.count,
            lowStockItems: lowStock.data.items
        };
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        throw new Error('Failed to fetch dashboard metrics');
    }
};

export const getSalesTrend = async (period = '30d') => {
    try {
        const response = await axios.get(`${BASE_URL}/sales/trend`, {
            params: { period }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching sales trend:', error);
        throw new Error('Failed to fetch sales trend');
    }
};

export const getStockMovement = async (period = '30d') => {
    try {
        const response = await axios.get(`${BASE_URL}/products/stock-movement`, {
            params: { period }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching stock movement:', error);
        throw new Error('Failed to fetch stock movement');
    }
};

// Helper function to format currency
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};