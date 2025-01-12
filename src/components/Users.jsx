// src/components/Users.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'staff',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        setShowAddDialog(false);
        fetchUsers();
        setNewUser({
          username: '',
          password: '',
          full_name: '',
          role: 'staff'
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Users</CardTitle>
          <Button onClick={() => setShowAddDialog(true)}>Add User</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {users.map(user => (
              <div 
                key={user.user_id}
                className="flex justify-between items-center p-4 border rounded"
              >
                <div>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-gray-500">
                    {user.username} • {user.role}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={`px-2 py-1 rounded text-sm ${
                      user.is_active 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
  <label className="text-sm font-medium">Email</label>
  <Input
    type="email"
    value={newUser.email}
    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
    className="mt-1"
  />
</div>
<div>
  <label className="text-sm font-medium">Phone</label>
  <Input
    type="tel"
    value={newUser.phone}
    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
    className="mt-1"
  />
</div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full mt-1 border rounded p-2"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button className="w-full" onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;