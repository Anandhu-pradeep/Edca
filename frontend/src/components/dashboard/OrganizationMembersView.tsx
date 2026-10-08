import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, UserPlus, FileUp, MoreVertical, Plus } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface OrganizationMembersViewProps {
  initialTab?: 'classes' | 'members';
  openScheduleModal?: boolean;
}

export function OrganizationMembersView({
  initialTab = 'classes',
  openScheduleModal = false,
}: OrganizationMembersViewProps) {
  const { activeOrganization } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'classes' | 'members'>(initialTab);
  
  const [viewingClass, setViewingClass] = useState<any | null>(null);
  
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassYear, setNewClassYear] = useState('');
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('STUDENT');
  const [isInviting, setIsInviting] = useState(false);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [scheduleRole, setScheduleRole] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
    setViewingClass(null);
  }, [initialTab]);

  useEffect(() => {
    if (openScheduleModal) {
      setIsScheduleModalOpen(true);
    }
  }, [openScheduleModal]);

  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
  const [memberToAssign, setMemberToAssign] = useState<any>(null);
  const [selectedClassIdForAssign, setSelectedClassIdForAssign] = useState('');

  const { data: classes, refetch: refetchClasses } = useQuery({
    queryKey: ['orgClasses', activeOrganization?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/organizations/${activeOrganization?.id}/classes`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  const { data: members, refetch: refetchMembers } = useQuery({
    queryKey: ['orgMembers', activeOrganization?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/organizations/${activeOrganization?.id}/members`);
      return res.data;
    },
    enabled: !!activeOrganization?.id && activeTab === 'members',
  });

  const { data: classStudents, refetch: refetchClassStudents } = useQuery({
    queryKey: ['orgClassStudents', activeOrganization?.id, viewingClass?.id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/organizations/${activeOrganization?.id}/classes/${viewingClass?.id}/students`);
      return res.data;
    },
    enabled: !!activeOrganization?.id && !!viewingClass?.id,
  });

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !activeOrganization) return;
    
    setIsSubmittingClass(true);
    try {
      await axiosInstance.post(`/organizations/${activeOrganization.id}/classes`, {
        name: newClassName,
        academicYear: newClassYear,
      });
      setNewClassName('');
      setNewClassYear('');
      setIsClassModalOpen(false);
      refetchClasses();
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Failed to create class.");
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeOrganization) return;

    setIsInviting(true);
    try {
      await axiosInstance.post(`/organizations/${activeOrganization.id}/members/invite`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setIsInviteModalOpen(false);
      refetchMembers();
      window.alert("Member invited successfully!");
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Failed to invite member. Make sure they have registered an account.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleScheduleInterviews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId || !scheduleRole.trim() || !activeOrganization) return;

    setIsScheduling(true);
    try {
      await axiosInstance.post(`/organizations/${activeOrganization.id}/interviews/schedule/class/${selectedClassId}`, {
        role: scheduleRole,
      });
      setIsScheduleModalOpen(false);
      setScheduleRole('');
      window.alert("Interviews scheduled successfully for the entire class! Credits have been deducted from the organization wallet.");
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Failed to schedule interviews. Please check the organization credit balance.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (!classes) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading members...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Overview Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1 p-1 bg-secondary/50 rounded-lg">
          <button 
            onClick={() => { setActiveTab('classes'); setViewingClass(null); }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'classes' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Classes
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'members' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All Members
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors">
            <FileUp className="w-4 h-4" />
            Import CSV
          </button>
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-purple-500 text-white text-sm font-bold rounded-lg hover:bg-purple-600 transition-colors shadow-sm">
                <UserPlus className="w-4 h-4" />
                Invite Members
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite Member to Organization</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInviteMember} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address or Username</Label>
                  <Input 
                    id="email"
                    type="text"
                    placeholder="student@university.edu or username"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The user must have already created an account on EDCA.
                  </p>
                </div>
                {/* Role selection removed per user request */}
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isInviting}>
                    {isInviting ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {activeTab === 'classes' && !viewingClass && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Classes</h3>
            <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-lg hover:bg-blue-500/20 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  New Class
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClass} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input 
                      id="className"
                      placeholder="e.g., CS101 Fall 2026"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year (Optional)</Label>
                    <Input 
                      id="academicYear"
                      placeholder="e.g., 2026-2027"
                      value={newClassYear}
                      onChange={(e) => setNewClassYear(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsClassModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmittingClass}>
                      {isSubmittingClass ? 'Creating...' : 'Create Class'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-card border border-border/40 rounded-xl">
                <p className="text-muted-foreground">No classes created yet.</p>
              </div>
            ) : (
              classes.map((cls: any) => (
                <div key={cls.id} className="p-5 bg-card border border-border/40 rounded-xl hover:border-border transition-colors cursor-pointer" onClick={() => setViewingClass(cls)}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-foreground">{cls.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{cls.academicYear || 'No Year Specified'}</p>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground p-1" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{cls.studentCount} Students</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 text-xs font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClassId(cls.id);
                        setIsScheduleModalOpen(true);
                      }}
                    >
                      Schedule AI Interview
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Schedule Interviews for Class</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleScheduleInterviews} className="space-y-4 py-4">
                {!selectedClassId && (
                  <div className="space-y-2">
                    <Label htmlFor="classSelect">Select Class</Label>
                    <select
                      id="classSelect"
                      value={selectedClassId || ''}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-background border border-border text-sm"
                      required
                    >
                      <option value="">-- Choose Class --</option>
                      {(classes || []).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.studentCount} students)</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input 
                    id="targetRole"
                    placeholder="e.g., Junior Frontend Developer"
                    value={scheduleRole}
                    onChange={(e) => setScheduleRole(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This action will schedule an AI interview for every student in this class and deduct credits from the organization wallet (5 credits per student).
                  </p>
                </div>
                <DialogFooter>
                  <Button type="button" variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isScheduling}>
                    {isScheduling ? 'Scheduling...' : 'Assign Interviews'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {activeTab === 'classes' && viewingClass && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewingClass(null)}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h3 className="text-lg font-bold">{viewingClass.name} Members</h3>
            </div>
            <button 
              onClick={() => {
                const link = `${window.location.origin}/invite?classId=${viewingClass.id}&orgId=${activeOrganization?.id}`;
                navigator.clipboard.writeText(link);
                alert("Share link copied to clipboard!");
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              Share Join Link
            </button>
          </div>
          <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Email</th>
                    <th className="px-6 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!classStudents || classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        No students in this class yet.
                      </td>
                    </tr>
                  ) : (
                    classStudents.map((student: any) => (
                      <tr key={student.studentId} className="border-b border-border/40 hover:bg-secondary/10">
                        <td className="px-6 py-4 font-medium">{student.studentName || 'Unknown'}</td>
                        <td className="px-6 py-4">{student.studentEmail}</td>
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={async () => {
                              if (!confirm('Remove this student from the class?')) return;
                              try {
                                await axiosInstance.delete(`/organizations/${activeOrganization?.id}/classes/${viewingClass.id}/students/${student.studentId}`);
                                refetchClassStudents();
                                refetchClasses();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="px-2 py-1 text-xs font-semibold rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border/40">
            <input 
              type="text" 
              placeholder="Search members..." 
              className="w-full max-w-sm px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Role</th>
                  <th className="px-6 py-3 font-semibold">Class</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!members || members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No members found. Invite some to get started.
                    </td>
                  </tr>
                ) : (
                  members.map((member: any) => (
                    <tr key={member.membershipId} className="border-b border-border/40 hover:bg-secondary/10">
                      <td className="px-6 py-4 font-medium">{member.name || 'Unknown'}</td>
                      <td className="px-6 py-4">{member.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          member.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' : 
                          member.role === 'FACULTY' ? 'bg-blue-500/10 text-blue-500' : 
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">-</td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setMemberToAssign(member);
                            setIsAssignClassModalOpen(true);
                          }}
                          className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                        >
                          Assign Class
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Are you sure you want to remove this member?')) return;
                            try {
                              await axiosInstance.delete(`/organizations/${activeOrganization?.id}/members/${member.userId}`);
                              refetchMembers();
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="px-2 py-1 text-xs font-semibold rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Class Modal */}
      <Dialog open={isAssignClassModalOpen} onOpenChange={setIsAssignClassModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign {memberToAssign?.name} to a Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!memberToAssign || !selectedClassIdForAssign) return;
            try {
              await axiosInstance.post(`/organizations/${activeOrganization?.id}/classes/${selectedClassIdForAssign}/students/${memberToAssign.userId}`);
              setIsAssignClassModalOpen(false);
              setMemberToAssign(null);
            } catch (err) {
              console.error(err);
            }
          }} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Class</Label>
              <select
                value={selectedClassIdForAssign}
                onChange={(e) => setSelectedClassIdForAssign(e.target.value)}
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">-- Choose a class --</option>
                {classes?.map((cls: any) => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsAssignClassModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
