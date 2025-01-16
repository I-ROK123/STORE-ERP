import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Plus, Search, Download, Edit, Trash2, Package2, Tag, Loader2  } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription  
} from './ui/dialog';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  /* eslint-disable no-unused-vars */
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [newProduct, setNewProduct] = useState({
    barcode: '',
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    unit_price: '0',
    stock_quantity: '0',
    reorder_level: '0'
  });

  const [editProduct, setEditProduct] = useState(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

const handleEdit = (product) => {
  setEditProduct(product);
  setIsEditDialogOpen(true);
};

const handleSaveEdit = async (editedProduct) => {
  try {
    const response = await fetch(`http://localhost:5000/api/inventory/${editedProduct.product_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedProduct)
    });

    if (!response.ok) throw new Error('Failed to update product');
    await fetchInventory();
    setIsEditDialogOpen(false);
    setEditProduct(null);
  } catch (err) {
    setError(err.message);
  }
};

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/inventory/${productId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        await fetchInventory();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/brands');
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setInventory(data);
      setFilteredInventory(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = inventory.filter(item => {
      const matchesSearch = Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesBrand = selectedBrand === 'all' || item.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });
    setFilteredInventory(filtered);
  }, [searchQuery, selectedCategory, selectedBrand, inventory]);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.category_id || !newProduct.brand_id) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newProduct,
          unit_price: newProduct.unit_price || '0',
          stock_quantity: newProduct.stock_quantity || '0',
          reorder_level: newProduct.reorder_level || '0'
        })
      });
  
      if (!response.ok) throw new Error('Failed to add product');
      await fetchInventory();
      
      setNewProduct({
        barcode: '',
        name: '',
        description: '',
        category_id: '',
        brand_id: '',
        unit_price: '0',
        stock_quantity: '0',
        reorder_level: '0'
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Barcode', 'Category', 'Name', 'Brand', 'Quantity', 'Reorder Level', 'Unit Price'],
      ...filteredInventory.map(item => [
        item.barcode,
        item.category,
        item.name,
        item.brand,
        item.stock_quantity,
        item.reorder_level,
        item.unit_price
      ])
    ].map(row => row.join(',')).join('\n');
  
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueCategories = [...new Set(inventory.map(item => item.category))];
  const uniqueBrands = [...new Set(inventory.map(item => item.brand))];

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
        <p className="text-gray-600">Loading inventory...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
      <div className="text-center space-y-2 p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Manage your products and stock levels</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px] bg-white">
            <DialogHeader className="bg-blue-50 p-4 rounded-t-lg">
              <DialogTitle className="text-xl text-gray-700">Add New Product</DialogTitle>
              <DialogDescription className="text-gray-700">
                Fill in the details for your new product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProduct} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="barcode" className="text-sm font-medium text-gray-700">
                  Barcode
                </label>
                <Input
                  id="barcode"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Product Name
                </label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Input
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={newProduct.category_id}
                  onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="brand" className="text-sm font-medium text-gray-700">
                  Brand
                </label>
                <select
                  id="brand"
                  className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={newProduct.brand_id}
                  onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })}
                  required
                >
                  <option value="">Select Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.brand_id} value={brand.brand_id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="unit_price" className="text-sm font-medium text-gray-700">
                  Unit Price (KSH)
                </label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.unit_price}
                  onChange={(e) => setNewProduct({ ...newProduct, unit_price: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="stock_quantity" className="text-sm font-medium text-gray-700">
                  Initial Stock Quantity
                </label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  value={newProduct.stock_quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="reorder_level" className="text-sm font-medium text-gray-700">
                  Reorder Level
                </label>
                <Input
                  id="reorder_level"
                  type="number"
                  min="0"
                  value={newProduct.reorder_level}
                  onChange={(e) => setNewProduct({ ...newProduct, reorder_level: e.target.value })}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 border-t pt-4">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="hover:bg-gray-100"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>

          {/* Edit Product Dialog */}
<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="sm:max-w-[425px] bg-white">
    <DialogHeader className="bg-blue-50 p-4 rounded-t-lg border-b">
      <DialogTitle className="text-xl text-blue-700">Edit Product</DialogTitle>
      <DialogDescription className="text-blue-600">
        Make changes to your product here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    {editProduct && (
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSaveEdit(editProduct);
      }} 
      className="grid gap-4 p-4">
        <div className="grid gap-2">
          <label htmlFor="edit-barcode" className="text-sm font-medium text-gray-700">
            Barcode
          </label>
          <Input
            id="edit-barcode"
            value={editProduct.barcode}
            onChange={(e) => setEditProduct({...editProduct, barcode: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
            Product Name
          </label>
          <Input
            id="edit-name"
            value={editProduct.name}
            onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-description" className="text-sm font-medium text-gray-700">
            Description
          </label>
          <Input
            id="edit-description"
            value={editProduct.description}
            onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-category" className="text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="edit-category"
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={editProduct.category_id}
            onChange={(e) => setEditProduct({...editProduct, category_id: e.target.value})}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-brand" className="text-sm font-medium text-gray-700">
            Brand
          </label>
          <select
            id="edit-brand"
            className="w-full p-2 border rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={editProduct.brand_id}
            onChange={(e) => setEditProduct({...editProduct, brand_id: e.target.value})}
            required
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand.brand_id} value={brand.brand_id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-price" className="text-sm font-medium text-gray-700">
            Unit Price (KSH)
          </label>
          <Input
            id="edit-price"
            type="number"
            min="0"
            step="0.01"
            value={editProduct.unit_price}
            onChange={(e) => setEditProduct({...editProduct, unit_price: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-quantity" className="text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <Input
            id="edit-quantity"
            type="number"
            min="0"
            value={editProduct.stock_quantity}
            onChange={(e) => setEditProduct({...editProduct, stock_quantity: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="edit-reorder" className="text-sm font-medium text-gray-700">
            Reorder Level
          </label>
          <Input
            id="edit-reorder"
            type="number"
            min="0"
            value={editProduct.reorder_level}
            onChange={(e) => setEditProduct({...editProduct, reorder_level: e.target.value})}
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <DialogClose asChild>
            <Button 
              type="button" 
              variant="outline"
              className="hover:bg-gray-100"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-black px-4"
          >
            Save Changes
          </Button>
        </div>
      </form>
    )}
  </DialogContent>
</Dialog>

          {/* Success Dialog */}
          <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
            <DialogContent className="sm:max-w-[425px]">
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <DialogTitle className="text-lg font-medium text-gray-900 mb-2">
                  Product Added Successfully!
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  The product has been added to your inventory.
                </DialogDescription>
                <Button
                  className="mt-6 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowSuccess(false)}
                >
                  Continue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-full">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <Input 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-200 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-full">
                <Tag className="w-4 h-4 text-purple-600" />
              </div>
              <select 
                className="w-full p-2 border rounded-md border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-full">
                <Package2 className="w-4 h-4 text-green-600" />
              </div>
              <select 
                className="w-full p-2 border rounded-md border-gray-200 focus:ring-green-500 focus:border-green-500"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="all">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <Button 
              className="w-full bg-gray-800 hover:bg-gray-900 text-white shadow-sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-800">Current Stock</CardTitle>
            <div className="text-sm text-gray-500">
              {filteredInventory.length} items found
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Barcode</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Threshold</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (KSH)</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.product_id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.barcode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.brand}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      item.stock_quantity <= item.reorder_level ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.stock_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.reorder_level}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.stock_quantity <= item.reorder_level 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.stock_quantity <= item.reorder_level ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(item.product_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;