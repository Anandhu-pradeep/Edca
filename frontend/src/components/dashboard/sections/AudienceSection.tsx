"use client";

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShieldAlert, ShieldCheck, User as UserIcon, Trash2, Building, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  roles: string[];
  credits?: number;
}

export function AudienceSection() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Members' | 'Organisation' | 'Admins' | 'Superadmin'>('All');

  const [organizations, setOrganizations] = useState<any[]>([]);

  // const API_URL = "http://localhost:8080/api/v1";
  const API_URL = "https://api.anandhupradeep.com/api/v1";

  const isSuperAdmin = currentUser?.roles?.includes('ROLE_SUPER_ADMIN');
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');
  const hasDeleteAccess = isSuperAdmin || isAdmin || currentUser?.permissions?.includes('user_delete');

  useEffect(() => {
    fetchUsers();
    if (isSuperAdmin) {
      fetchOrganizations();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/admin/users`);
      setUsers(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch audience');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await axiosInstance.get(`/admin/organizations`);
      setOrganizations(response.data);
    } catch (err: any) {
      console.error('Failed to fetch organizations', err);
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

  const handleDeleteOrganization = async (orgId: string) => {
    if (!window.confirm("Are you sure you want to delete this organization? The policyholder will be downgraded to a normal user.")) return;
    try {
      await axiosInstance.delete(`/admin/organizations/${orgId}`);
      fetchOrganizations();
      fetchUsers(); // Refresh users to reflect downgraded roles
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete organization');
      setTimeout(() => setError(''), 5000);
    }
  };

  const superAdminCount = users.filter(u => u.roles.includes('ROLE_SUPER_ADMIN')).length;

  const hasCustomPolicy = (roles: string[]) => {
    return roles.some(r => !['ROLE_USER', 'ROLE_ORGANIZATION', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(r));
  };

  const isNormalAdmin = (roles: string[]) => {
    return (roles.includes('ROLE_ADMIN') || hasCustomPolicy(roles)) && !roles.includes('ROLE_SUPER_ADMIN');
  };

  const isMember = (roles: string[]) => {
    return roles.includes('ROLE_USER') && !roles.includes('ROLE_SUPER_ADMIN') && !roles.includes('ROLE_ORGANIZATION') && !isNormalAdmin(roles);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.firstName + ' ' + u.lastName).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'Members':
        return isMember(u.roles);
      case 'Organisation':
        return u.roles.includes('ROLE_ORGANIZATION');
      case 'Admins':
        return isNormalAdmin(u.roles);
      case 'Superadmin':
        return u.roles.includes('ROLE_SUPER_ADMIN');
      case 'All':
      default:
        return !u.roles.includes('ROLE_SUPER_ADMIN');
    }
  });

  const filteredOrganizations = organizations.filter(org => 
    org.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.officialEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'All', label: 'All' },
    { id: 'Members', label: 'Members' },
    { id: 'Organisation', label: 'Organisation' },
    { id: 'Admins', label: 'Admins' },
  ];

  if (superAdminCount >= 2) {
    tabs.push({ id: 'Superadmin', label: 'Superadmin' });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Audience</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage users, admins, and organizations across the platform.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'Organisation' ? "Search organizations..." : "Search users..."}
            className="pl-9 bg-background/50 border-border/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-border/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-primary text-primary bg-primary/5" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm">
          {error}
        </div>
      ) : activeTab === 'Organisation' ? (
        <div className="w-full overflow-x-auto rounded-xl border border-border/40 liquid-glass">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-semibold">Organization Name</th>
                <th className="px-6 py-4 font-semibold text-center">Type</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredOrganizations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                    No organizations found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-secondary/20 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 font-bold uppercase overflow-hidden">
                           <Building className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground truncate">{org.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{org.officialEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500">{org.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isSuperAdmin && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8 ml-auto flex-shrink-0"
                          title="Delete Organization & Downgrade User"
                          onClick={() => handleDeleteOrganization(org.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-border/40 liquid-glass">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Roles</th>
                <th className="px-6 py-4 font-semibold text-center">Credits</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
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
                        {isNormalAdmin(user.roles) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3"/> Admin</span>
                        )}
                        {user.roles.includes('ROLE_ORGANIZATION') && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-500 flex items-center gap-1 w-fit"><Building className="w-3 h-3"/> Org</span>
                        )}
                        {isMember(user.roles) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 flex items-center gap-1 w-fit"><UserIcon className="w-3 h-3"/> Member</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 font-bold text-xs border border-yellow-500/20">
                        <Coins className="w-3.5 h-3.5" />
                        {user.credits ?? 10}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {hasDeleteAccess && (
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8 ml-auto flex-shrink-0"
                          title="Delete User"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
