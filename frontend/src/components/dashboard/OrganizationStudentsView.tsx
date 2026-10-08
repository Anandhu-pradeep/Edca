'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { UserPlus, Search, GraduationCap } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OrganizationStudentsView() {
  const { activeOrganization } = useAuthStore();
  const isStudent = activeOrganization?.role === 'STUDENT';
  const isOrgAdmin = activeOrganization?.role === 'OWNER' || activeOrganization?.role === 'ADMIN';
  const canManage = isOrgAdmin || activeOrganization?.role === 'FACULTY';

  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState<any>(null);
  const [selectedClassIdForAssign, setSelectedClassIdForAssign] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch all organization members
  const { data: members = [], refetch: refetchMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['orgMembers', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/members`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  // Fetch all organization classes to show assigned class names and populate the dropdown
  const { data: classes = [], refetch: refetchClasses } = useQuery({
    queryKey: ['orgClasses', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/classes`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  // IMPORTANT: Filter ONLY members with role STUDENT per user specification
  const studentsOnly = (members || []).filter((m: any) => m.role === 'STUDENT');

  const filteredStudents = studentsOnly.filter((student: any) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (student.name || '').toLowerCase().includes(term);
    const emailMatch = (student.email || '').toLowerCase().includes(term);
    return nameMatch || emailMatch;
  });

  const handleInviteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !activeOrganization) return;

    setIsInviting(true);
    try {
      await axiosInstance.post(`/organizations/${activeOrganization.id}/members/invite`, {
        email: inviteEmail.trim(),
        role: 'STUDENT',
      });
      setInviteEmail('');
      setIsInviteModalOpen(false);
      refetchMembers();
      window.alert("Student invitation sent successfully!");
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Failed to invite student. Please ensure the user has registered an account.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveStudent = async (studentUserId: string) => {
    if (!activeOrganization) return;
    if (!confirm('Are you sure you want to remove this student from the organization?')) return;
    try {
      await axiosInstance.delete(`/organizations/${activeOrganization.id}/members/${studentUserId}`);
      refetchMembers();
      refetchClasses();
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to remove student.");
    }
  };

  const handleAssignClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentToAssign || !selectedClassIdForAssign || !activeOrganization) return;

    setIsAssigning(true);
    try {
      await axiosInstance.post(
        `/organizations/${activeOrganization.id}/classes/${selectedClassIdForAssign}/students/${studentToAssign.userId}`
      );
      setIsAssignClassModalOpen(false);
      setStudentToAssign(null);
      setSelectedClassIdForAssign('');
      refetchMembers();
      refetchClasses();
      window.alert("Student assigned to class successfully!");
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to assign student to class.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Students</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canManage ? 'View and manage all registered student profiles in your organization.' : 'Roster of students enrolled in this organization.'}
          </p>
        </div>

        {/* Action buttons strictly hidden for students */}
        {canManage && (
          <div className="flex items-center gap-2">
            <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer">
                  <UserPlus className="w-4 h-4" />
                  Invite Student
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite Student to Organization</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInviteStudent} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentEmail">Student Email or Username</Label>
                    <Input
                      id="studentEmail"
                      type="text"
                      placeholder="student@university.edu or username"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      The student must have an existing EDCA account to receive the invitation.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? 'Inviting...' : 'Send Invitation'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
        {/* Search Bar */}
        <div className="p-4 border-b border-border/40 bg-secondary/10">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border/50 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase border-b border-border/40">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Name</th>
                <th className="px-6 py-3.5 font-semibold">Email</th>
                <th className="px-6 py-3.5 font-semibold">Role</th>
                {canManage && <th className="px-6 py-3.5 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoadingMembers ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                    Loading student roster...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="px-6 py-10 text-center text-muted-foreground">
                    {searchTerm ? "No students matched your search criteria." : "No students currently in this organization."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student: any) => (
                  <tr key={student.membershipId} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {(student.name || 'S').charAt(0)}
                      </div>
                      <span>{student.name || 'Student'}</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        STUDENT
                      </span>
                    </td>
                    {/* Actions column ONLY rendered for Admin / Faculty */}
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setStudentToAssign(student);
                              setIsAssignClassModalOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors cursor-pointer"
                          >
                            Assign Class
                          </button>
                          <button
                            onClick={() => handleRemoveStudent(student.userId)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign to Class Modal */}
      {canManage && (
        <Dialog open={isAssignClassModalOpen} onOpenChange={setIsAssignClassModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Assign {studentToAssign?.name} to a Class</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAssignClassSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="assignClassSelect">Select Class</Label>
                <select
                  id="assignClassSelect"
                  value={selectedClassIdForAssign}
                  onChange={(e) => setSelectedClassIdForAssign(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">-- Choose Class --</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentCount || 0} students)
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsAssignClassModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAssigning || !selectedClassIdForAssign}>
                  {isAssigning ? 'Assigning...' : 'Assign to Class'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
