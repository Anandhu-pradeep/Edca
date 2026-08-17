"use client";

import { useState, useEffect } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, ShieldCheck, Search, X, Trash2 } from 'lucide-react';

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

export function PolicyManagerTab() {
  const [policies, setPolicies] = useState<PolicyDto[]>([]);
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPolicyId, setCurrentPolicyId] = useState<number | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [polRes, permRes] = await Promise.all([
        axiosInstance.get('/admin/policies'),
        axiosInstance.get('/admin/permissions')
      ]);
      setPolicies(polRes.data.data);
      setPermissions(permRes.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch policy data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setCurrentPolicyId(null);
    setFormName('');
    setFormDesc('');
    setSelectedPerms([]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (policy: PolicyDto) => {
    setIsEditing(true);
    setCurrentPolicyId(policy.id);
    setFormName(policy.name);
    setFormDesc(policy.description);
    setSelectedPerms(policy.permissions);
    setIsDialogOpen(true);
  };

  const handleTogglePermission = (permName: string) => {
    if (permName === 'user_read' && selectedPerms.includes('user_delete')) {
      return; // Locked, cannot toggle
    }

    setSelectedPerms(prev => {
      const isCurrentlyChecked = prev.includes(permName);
      let newPerms = isCurrentlyChecked ? prev.filter(p => p !== permName) : [...prev, permName];
      
      // Auto-enable user_read if user_delete is enabled
      if (!isCurrentlyChecked && permName === 'user_delete') {
        if (!newPerms.includes('user_read')) {
          newPerms.push('user_read');
        }
      }
      
      return newPerms;
    });
  };

  const handleSubmit = async () => {
    if (!formName.trim() || selectedPerms.length === 0) {
      setError('Policy name and at least one permission are required');
      return;
    }
    try {
      setSubmitting(true);
      if (isEditing && currentPolicyId) {
        await axiosInstance.put(`/admin/policies/${currentPolicyId}`, {
          name: formName.trim(),
          description: formDesc.trim(),
          permissions: selectedPerms
        });
      } else {
        await axiosInstance.post('/admin/policies', {
          name: formName.trim(),
          description: formDesc.trim(),
          permissions: selectedPerms
        });
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save policy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePolicy = async (policyId: number) => {
    if (!window.confirm("Are you sure you want to delete this policy? This action cannot be undone.")) return;
    try {
      setSubmitting(true);
      await axiosInstance.delete(`/admin/policies/${policyId}`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete policy');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input 
            placeholder="Search policies..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 w-full bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background transition-colors"
          />
        </div>
        
        <Button onClick={handleOpenCreate} className="h-10 w-full sm:w-auto shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPolicies.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No policies found.</p>
            </div>
          ) : (
            filteredPolicies.map(policy => (
              <div key={policy.id} className="liquid-glass group p-5 rounded-xl border border-border/40 hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg leading-none mb-1.5">{policy.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{policy.description}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => handleOpenEdit(policy)}
                      title="Edit Policy"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeletePolicy(policy.id)}
                      title="Delete Policy"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 flex flex-wrap gap-1.5">
                  {policy.permissions.slice(0, 3).map(perm => (
                    <span key={perm} className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-md font-medium whitespace-nowrap">
                      {perm.replace('_', ' ')}
                    </span>
                  ))}
                  {policy.permissions.length > 3 && (
                    <span className="px-2 py-1 bg-secondary/50 text-muted-foreground text-[10px] rounded-md font-medium">
                      +{policy.permissions.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Dialog Overlay */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border/30 bg-secondary/10 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Policy' : 'Create New Policy'}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEditing ? 'Modify the permissions assigned to this policy template.' : 'Define a new set of permissions to easily assign to users.'}
                </p>
              </div>
              <button onClick={() => setIsDialogOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium">Policy Name</label>
                <Input 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  placeholder="e.g. Support Staff" 
                  className="bg-background/50"
                  disabled={isEditing && formName.startsWith('ROLE_')}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  value={formDesc} 
                  onChange={e => setFormDesc(e.target.value)} 
                  placeholder="What does this policy do?" 
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium">Permissions</label>
                <div className="grid gap-2">
                  {permissions.map(perm => {
                    const isChecked = selectedPerms.includes(perm.name);
                    const isLocked = perm.name === 'user_read' && selectedPerms.includes('user_delete');
                    
                    return (
                      <div 
                        key={perm.id} 
                        onClick={() => { if (!isLocked) handleTogglePermission(perm.name); }}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          isLocked ? 'cursor-not-allowed opacity-60 bg-secondary/20 border-border/20' : 
                          isChecked ? 'border-primary/50 bg-primary/5 cursor-pointer' : 'border-border/40 bg-secondary/10 hover:bg-secondary/20 cursor-pointer'
                        }`}
                        title={isLocked ? "User read is required when user delete is enabled" : ""}
                      >
                        <div className="pr-4">
                          <p className="text-sm font-medium text-foreground">
                            {perm.name.replace('_', ' ')}
                            {isLocked && <span className="ml-2 text-[10px] text-muted-foreground italic">(Auto-enabled)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{perm.description}</p>
                        </div>
                        <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isChecked ? 'bg-primary' : 'bg-input'} ${isLocked ? 'opacity-70' : 'cursor-pointer'}`}>
                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border/30 bg-secondary/10 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="bg-background/50">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Policy')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
