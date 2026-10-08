'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { Users, Plus, ArrowLeft, MoreVertical, Calendar } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrganizationClassesViewProps {
  onScheduleInterview?: (classId: string) => void;
}

export function OrganizationClassesView({ onScheduleInterview }: OrganizationClassesViewProps) {
  const { activeOrganization } = useAuthStore();
  const isStudent = activeOrganization?.role === 'STUDENT';
  const isOrgAdmin = activeOrganization?.role === 'OWNER' || activeOrganization?.role === 'ADMIN';
  const canManage = isOrgAdmin || activeOrganization?.role === 'FACULTY';

  const [viewingClass, setViewingClass] = useState<any | null>(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassYear, setNewClassYear] = useState('');
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  const { data: classes = [], refetch: refetchClasses, isLoading } = useQuery({
    queryKey: ['orgClasses', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/classes`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  const { data: classStudents = [], refetch: refetchClassStudents, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['orgClassStudents', activeOrganization?.id, viewingClass?.id],
    queryFn: async () => {
      if (!activeOrganization?.id || !viewingClass?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/classes/${viewingClass.id}/students`);
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
        name: newClassName.trim(),
        academicYear: newClassYear.trim(),
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

  const handleRemoveStudent = async (studentId: string) => {
    if (!viewingClass || !activeOrganization) return;
    if (!confirm('Remove this student from the class?')) return;
    try {
      await axiosInstance.delete(`/organizations/${activeOrganization.id}/classes/${viewingClass.id}/students/${studentId}`);
      refetchClassStudents();
      refetchClasses();
    } catch (err: any) {
      window.alert(err.response?.data?.message || "Failed to remove student from class.");
    }
  };

  const handleCopyJoinLink = () => {
    if (!viewingClass || !activeOrganization) return;
    const link = `${window.location.origin}/invite?classId=${viewingClass.id}&orgId=${activeOrganization.id}`;
    navigator.clipboard.writeText(link);
    alert("Share join link copied to clipboard!");
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading classes...</div>;
  }

  // Viewing students inside a specific class
  if (viewingClass) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewingClass(null)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
              title="Back to Classes"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">{viewingClass.name} Students</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewingClass.academicYear || 'All enrolled members'}
              </p>
            </div>
          </div>

          {/* Only non-students (Admins/Faculty) can see and copy the Join Link */}
          {canManage && (
            <button
              onClick={handleCopyJoinLink}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              Share Join Link
            </button>
          )}
        </div>

        <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/20 text-muted-foreground text-xs uppercase border-b border-border/40">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Name</th>
                  <th className="px-6 py-3.5 font-semibold">Email</th>
                  {canManage && <th className="px-6 py-3.5 font-semibold text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {isLoadingStudents ? (
                  <tr>
                    <td colSpan={canManage ? 3 : 2} className="px-6 py-8 text-center text-muted-foreground animate-pulse">
                      Loading class students...
                    </td>
                  </tr>
                ) : classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={canManage ? 3 : 2} className="px-6 py-10 text-center text-muted-foreground">
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((student: any) => (
                    <tr key={student.studentId} className="border-b border-border/40 hover:bg-secondary/10 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{student.studentName || 'Student'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{student.studentEmail}</td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveStudent(student.studentId)}
                            className="px-2.5 py-1 text-xs font-semibold rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Classes Overview Grid
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Classes</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {canManage ? 'Organize students by classes, batches, or cohorts.' : 'View classes and enrolled student rosters.'}
          </p>
        </div>

        {canManage && (
          <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm cursor-pointer">
                <Plus className="w-4 h-4" />
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
                    placeholder="e.g., CS101 Batch 2026"
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
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-card border border-border/40 rounded-xl">
            <p className="text-muted-foreground">No classes created yet in this organization.</p>
          </div>
        ) : (
          classes.map((cls: any) => (
            <div
              key={cls.id}
              onClick={() => setViewingClass(cls)}
              className="p-5 bg-card border border-border/40 rounded-xl hover:border-border hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{cls.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{cls.academicYear || 'No Year Specified'}</p>
                </div>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                  Cohort
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 pt-3 border-t border-border/30">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{cls.studentCount || 0} Students</span>
                </div>
                {canManage && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onScheduleInterview) {
                        onScheduleInterview(cls.id);
                      }
                    }}
                  >
                    Schedule Interview
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
