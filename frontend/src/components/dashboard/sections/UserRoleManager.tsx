"use client";

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, ShieldCheck, ShieldAlert, Trash2, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PolicyDto {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

interface PermissionDto {
  id: number;
  name: string;
  description: string;
}

interface UserRoleManagerProps {
  user: any;
  onBack: () => void;
  onUpdate: () => void;
}

export function UserRoleManager({ user, onBack, onUpdate }: UserRoleManagerProps) {
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = currentUser?.roles?.includes('ROLE_SUPER_ADMIN');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [polRes] = await Promise.all([
        axiosInstance.get('/admin/policies')
      ]);
      setPolicies(polRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch policy data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (roleName: string, isCustom = true) => {
    try {
      if (isCustom) {
        await axiosInstance.post(`/admin/users/${user.id}/policies/${roleName}`);
      } else {
        await axiosInstance.post(`/admin/users/${user.id}/${roleName}`);
      }
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign role');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRevokeRole = async (roleName: string, isCustom = true) => {
    try {
      if (isCustom) {
        await axiosInstance.delete(`/admin/users/${user.id}/policies/${roleName}`);
      } else {
        await axiosInstance.delete(`/admin/users/${user.id}/${roleName}`);
      }
      onUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to revoke role');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Filter out the base roles from the user's current roles to find custom policies
  const currentCustomPolicies = user.roles.filter((r: string) => !r.startsWith('ROLE_'));
  const hasSuperAdmin = user.roles.includes('ROLE_SUPER_ADMIN');

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 w-full">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <img 
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.username)}&background=3b82f6&color=fff&size=256`} 
            alt={user.firstName}
            className="w-12 h-12 rounded-xl object-cover border border-border/50"
          />
          <div>
            <h2 className="text-xl font-bold text-foreground leading-none">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-muted-foreground mt-1">@{user.username} • {user.email}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Manage Roles */}
          <div className="space-y-6">
            
            {/* Demote (Revoke) Section */}
            <div className="liquid-glass p-5 rounded-xl border border-border/40 h-full">
              <h3 className="text-lg font-semibold mb-1">Currently Assigned Policies</h3>
              <p className="text-xs text-muted-foreground mb-4">Roles and policies this user currently holds.</p>
              
              <div className="space-y-3">
                {hasSuperAdmin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Super Administrator</p>
                        <p className="text-xs text-muted-foreground">Full platform access</p>
                      </div>
                    </div>
                    {isSuperAdmin && user.id !== currentUser?.id && (
                      <Button variant="outline" size="sm" onClick={() => handleRevokeRole('superadmin', false)} className="text-orange-500 border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-600">
                        Revoke
                      </Button>
                    )}
                  </div>
                )}

                {currentCustomPolicies.length === 0 && !hasSuperAdmin ? (
                  <p className="text-sm text-muted-foreground py-2">No custom policies assigned.</p>
                ) : (
                  currentCustomPolicies.map((roleName: string) => (
                    <div key={roleName} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{roleName}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRevokeRole(roleName, true)} className="text-orange-500 border-orange-500/20 hover:bg-orange-500/10 hover:text-orange-600">
                        Revoke
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Promote (Assign) Section */}
            <div className="liquid-glass p-5 rounded-xl border border-border/40 h-full">
              <h3 className="text-lg font-semibold mb-1">Assign New Policy</h3>
              <p className="text-xs text-muted-foreground mb-4">Grant additional permissions to this user.</p>
              
              <div className="space-y-3">
                {isSuperAdmin && !hasSuperAdmin && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <div>
                      <p className="text-sm font-medium text-foreground flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-purple-500" /> Super Administrator</p>
                      <p className="text-xs text-muted-foreground mt-1">Grants all permissions unconditionally.</p>
                    </div>
                    <Button size="sm" onClick={() => handleAssignRole('superadmin', false)}>
                      Make Superadmin
                    </Button>
                  </div>
                )}

                {policies.filter(p => !user.roles.includes(p.name)).length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No available custom policies to assign.</p>
                ) : (
                  policies.filter(p => !user.roles.includes(p.name)).map(policy => (
                    <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div>
                        <p className="text-sm font-medium text-foreground">{policy.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{policy.description}</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => handleAssignRole(policy.name, true)}>
                        Assign
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
