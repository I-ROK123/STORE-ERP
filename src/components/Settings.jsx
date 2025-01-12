import React, { useState, useEffect } from 'react';
import { Building2, Receipt, Database, FileText, Download } from 'lucide-react';

const Setting = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [storeSettings, setStoreSettings] = useState({
    store_name: '',
    address: '',
    phone_number: '',
    email: '',
    tax_rate: 16.00,
    currency: 'KSH'
  });

  const [receiptSettings, setReceiptSettings] = useState({
    header_text: '',
    footer_text: '',
    show_tax: true,
    show_logo: true,
    font_size: 'normal',
    paper_size: 'default'
  });

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/settings');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setStoreSettings(data.storeSettings);
      setReceiptSettings(data.receiptSettings);
      setError(null);
    } catch (err) {
      setError('Failed to load settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (type) => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      let endpoint;
      let data;

      switch (type) {
        case 'store':
          endpoint = 'store-settings';
          data = storeSettings;
          break;
        case 'receipt':
          endpoint = 'receipt-settings';
          data = receiptSettings;
          break;
        default:
          throw new Error('Invalid settings type');
      }

      const response = await fetch(`http://localhost:5000/api/settings/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(null), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async (reportType) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/reports/${reportType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Report generated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to generate report: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('http://localhost:5000/api/settings/backup', {
        method: 'POST'
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);
      
      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to create backup: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="w-full bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'store' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          }`}
        >
          <Building2 className="w-5 h-5" />
          Store Information
        </button>
        <button
          onClick={() => setActiveTab('receipt')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'receipt' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          }`}
        >
          <Receipt className="w-5 h-5" />
          Receipt
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'reports' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          Reports
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 font-medium ${
            activeTab === 'backup' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          }`}
        >
          <Database className="w-5 h-5" />
          Backup
        </button>
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow">
        {/* ... other tabs content ... */}

        {activeTab === 'store' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Store Information</h2>
            <div className="space-y-4">
              {/* Store settings fields */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('store')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'receipt' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Receipt Settings</h2>
            <div className="space-y-4">
              {/* Receipt settings fields */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveSettings('receipt')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Backup and Restore</h2>
            <button
              onClick={handleCreateBackup}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              <Database className="w-4 h-4" />
              {saving ? 'Creating Backup...' : 'Create Backup'}
            </button>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Generate Reports</h2>
            <div className="space-y-4">
              {/* Sales Report */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Sales Report</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Generate a detailed report of all sales transactions.
                </p>
                <button
                  onClick={() => handleGenerateReport('sales')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  <Download className="w-4 h-4" />
                  {saving ? 'Generating...' : 'Generate Sales Report'}
                </button>
              </div>

              {/* Inventory Report */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Inventory Report</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Generate a complete inventory status report.
                </p>
                <button
                  onClick={() => handleGenerateReport('inventory')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  <Download className="w-4 h-4" />
                  {saving ? 'Generating...' : 'Generate Inventory Report'}
                </button>
              </div>

              {/* Financial Report */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Financial Report</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Generate a financial summary report.
                </p>
                <button
                  onClick={() => handleGenerateReport('financial')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                  <Download className="w-4 h-4" />
                  {saving ? 'Generating...' : 'Generate Financial Report'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default Setting;