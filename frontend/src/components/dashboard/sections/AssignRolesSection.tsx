"use client";

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShieldAlert, ShieldCheck, User as UserIcon, Trash2, Building, LayoutTemplate, Users } from 'lucide-react';
import { UserRoleManager } from './UserRoleManager';
import { PolicyManagerTab } from './PolicyManagerTab';

interface UserDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  roles: string[];
}

export function AssignRolesSection() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [activeTab, setActiveTab] = useState<'assign' | 'manage'>('assign');

  const isSuperAdmin = currentUser?.roles?.includes('ROLE_SUPER_ADMIN');
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/users`);
      setUsers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeRole = async (userId: string, roleType: 'admin' | 'superadmin') => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}/${roleType}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke role');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(''), 5000);
    }
  };

  const filteredUsers = users.filter(u => {
    return (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
           u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (selectedUser) {
    return (
      <UserRoleManager 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)} 
        onUpdate={() => {
          fetchUsers();
          // Find updated user in list and update selected state
          const updated = users.find(u => u.id === selectedUser.id);
          if (updated) setSelectedUser(updated);
        }} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Role Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage user roles and administrative privileges.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg w-fit border border-border/40">
        <button
          onClick={() => setActiveTab('assign')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'assign' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4" /> Assign Roles
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'manage' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" /> Manage Policies
          </button>
        )}
      </div>

      {activeTab === 'manage' && isSuperAdmin ? (
        <PolicyManagerTab />
      ) : (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..." 
                className="pl-9 bg-background/50 border-border/50"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm">
              {error}
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-xl border border-border/40 liquid-glass">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/40">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Roles</th>
                    <th className="px-6 py-4 font-semibold text-right">Assign Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img 
                              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.username)}&background=3b82f6&color=fff&size=256`} 
                              alt={user.firstName}
                              className="w-10 h-10 rounded-xl object-cover border border-border/50 flex-shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate">{user.firstName} {user.lastName}</span>
                              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                              <span className="text-[10px] text-muted-foreground/80 truncate">@{user.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.includes('ROLE_SUPER_ADMIN') && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 flex items-center gap-1 w-fit"><ShieldAlert className="w-3 h-3"/> Superadmin</span>
                            )}
                            {user.roles.includes('ROLE_ADMIN') && !user.roles.includes('ROLE_SUPER_ADMIN') && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3"/> Admin</span>
                            )}
                            {user.roles.includes('ROLE_ORGANIZATION') && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 flex items-center gap-1 w-fit"><Building className="w-3 h-3"/> Org</span>
                            )}
                            {!user.roles.includes('ROLE_ADMIN') && !user.roles.includes('ROLE_SUPER_ADMIN') && !user.roles.includes('ROLE_ORGANIZATION') && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 flex items-center gap-1 w-fit"><UserIcon className="w-3 h-3"/> Member</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="text-xs h-8"
                              onClick={() => setSelectedUser(user)}
                            >
                              Assign
                            </Button>
          
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="h-8 w-8 flex-shrink-0"
                              title="Delete User"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
