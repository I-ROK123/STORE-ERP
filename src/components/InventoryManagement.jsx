import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Plus, Search, Filter, Download, Edit, Trash2 } from 'lucide-react';
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

  if (loading) return <div className="flex items-center justify-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
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
                  className="bg-blue-600 hover:bg-blue-700 text-black"
                >
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                className="w-full p-2 border rounded"
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                className="w-full p-2 border rounded"
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
        <Card>
          <CardContent className="p-4">
            <Button 
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Barcode</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sub-Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Brand</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Threshold</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Price (KSH)</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
  {filteredInventory.map((item) => (
    <tr key={item.product_id} className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{item.barcode}</td>
      <td className="px-4 py-3 text-sm">{item.category}</td>
      <td className="px-4 py-3 text-sm">{item.name}</td>
      <td className="px-4 py-3 text-sm">{item.brand}</td>
      <td className={`px-4 py-3 text-sm ${
        item.stock_quantity <= item.reorder_level ? 'text-red-600' : ''
      }`}>
        {item.stock_quantity}
      </td>
      <td className="px-4 py-3 text-sm">{item.reorder_level}</td>
      <td className="px-4 py-3 text-sm">{item.unit_price}</td>
      <td className="px-4 py-3 text-sm">
        <span className={`px-2 py-1 rounded text-sm ${
          item.stock_quantity <= item.reorder_level ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
        }`}>
          {item.stock_quantity <= item.reorder_level ? 'Low Stock' : 'In Stock'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
  <div className="flex gap-2">
    <Button 
      variant="ghost" 
      size="sm"
      onClick={() => handleEdit(item)}
    >
      <Edit className="w-4 h-4" />
    </Button>
    <Button 
      variant="ghost" 
      size="sm" 
      className="text-red-600"
      onClick={() => handleDelete(item.product_id)}
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