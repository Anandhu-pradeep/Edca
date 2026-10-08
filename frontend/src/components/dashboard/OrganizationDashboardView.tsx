'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { axiosInstance } from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Building, Users, Calendar, Video, BookOpen, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AssignedInterview {
  assignmentId: string;
  interviewId: string;
  roomId: string;
  role: string;
  className: string;
  status: string;
  scheduledAt: string;
  grade?: string;
  durationMinutes?: number;
}

interface EnrolledClass {
  id: string;
  name: string;
  description?: string;
  academicYear?: string;
  studentCount?: number;
}

interface OrganizationDashboardViewProps {
  onNavigate?: (tab: string) => void;
}

export function OrganizationDashboardView({ onNavigate }: OrganizationDashboardViewProps) {
  const { activeOrganization } = useAuthStore();
  const isOrgAdmin = activeOrganization?.role === 'ADMIN' || activeOrganization?.role === 'OWNER';

  // For students: fetch assigned interviews
  const { data: assignedInterviews = [], isLoading: isLoadingInterviews } = useQuery<AssignedInterview[]>({
    queryKey: ['my-assigned-interviews', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/interviews/my-assigned`);
      return res.data;
    },
    enabled: !!activeOrganization?.id && !isOrgAdmin,
  });

  // For students: fetch enrolled classes
  const { data: enrolledClasses = [], isLoading: isLoadingClasses } = useQuery<EnrolledClass[]>({
    queryKey: ['my-enrolled-classes', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return [];
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/classes/my-enrolled`);
      return res.data;
    },
    enabled: !!activeOrganization?.id && !isOrgAdmin,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to {activeOrganization?.name}</h2>
          <p className="text-muted-foreground mt-1">
            {isOrgAdmin ? 'Manage your institution, students, and class interviews.' : 'View your assigned class interviews and progress.'}
          </p>
        </div>
      </div>

      {isOrgAdmin ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => onNavigate?.('Students')}
            className="p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:border-purple-500/50 hover:bg-card/80 transition-all cursor-pointer group"
          >
            <div className="p-3 bg-purple-500/10 text-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-purple-400 transition-colors">Manage Students</h3>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-sm text-muted-foreground">Invite students, create classes, and organize your roster.</p>
          </div>
          
          <div 
            onClick={() => onNavigate?.('Schedule')}
            className="p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:border-blue-500/50 hover:bg-card/80 transition-all cursor-pointer group"
          >
            <div className="p-3 bg-blue-500/10 text-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">Assign Interviews</h3>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-sm text-muted-foreground">Schedule AI interviews for entire classes simultaneously.</p>
          </div>

          <div 
            onClick={() => onNavigate?.('Reports')}
            className="p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:border-green-500/50 hover:bg-card/80 transition-all cursor-pointer group"
          >
            <div className="p-3 bg-green-500/10 text-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-green-400 transition-colors">View Reports</h3>
              <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </div>
            <p className="text-sm text-muted-foreground">Monitor performance analytics across all classes.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Assigned AI Interviews
                </h3>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  {assignedInterviews.length} assigned
                </span>
              </div>

              {isLoadingInterviews ? (
                <div className="space-y-3 py-4">
                  <div className="h-20 bg-secondary/30 animate-pulse rounded-lg" />
                  <div className="h-20 bg-secondary/30 animate-pulse rounded-lg" />
                </div>
              ) : assignedInterviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h4 className="font-medium text-foreground">No pending assignments</h4>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    Your instructors haven't assigned any new AI interviews to your class yet. Check back later!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedInterviews.map((assignment) => {
                    const isCompleted = assignment.status?.toUpperCase() === 'COMPLETED';
                    const scheduledDate = assignment.scheduledAt
                      ? new Date(assignment.scheduledAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Flexible';

                    return (
                      <div
                        key={assignment.assignmentId}
                        className="p-4 bg-secondary/15 hover:bg-secondary/25 border border-border/50 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {assignment.role || 'Mock Technical Interview'}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                              {assignment.className || 'Class'}
                            </span>
                            {isCompleted ? (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/10 text-green-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-500">
                                {assignment.status || 'Scheduled'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {scheduledDate}
                            </span>
                            {assignment.durationMinutes && (
                              <span>{assignment.durationMinutes} mins</span>
                            )}
                            {assignment.grade && (
                              <span className="flex items-center gap-1 text-primary font-medium">
                                <Award className="w-3.5 h-3.5" />
                                Grade: {assignment.grade}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          {isCompleted ? (
                            <Link
                              href={`/interview/${assignment.roomId}`}
                              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
                            >
                              View Feedback
                            </Link>
                          ) : (
                            <Link
                              href={`/interview/${assignment.roomId}?action=create`}
                              className="inline-flex items-center gap-1 text-xs px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all hover:scale-105"
                            >
                              <Video className="w-3.5 h-3.5" />
                              Start Interview
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  My Classes
                </h3>
                <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md">
                  {enrolledClasses.length}
                </span>
              </div>

              {isLoadingClasses ? (
                <div className="space-y-3 py-2">
                  <div className="h-12 bg-secondary/30 animate-pulse rounded-lg" />
                  <div className="h-12 bg-secondary/30 animate-pulse rounded-lg" />
                </div>
              ) : enrolledClasses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">
                    You haven't been enrolled into any classes yet. Instructors can add you using your registered email.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrolledClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="p-3 bg-secondary/20 border border-border/50 rounded-lg flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium text-sm text-foreground">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">{cls.academicYear || cls.description || 'Active Course'}</p>
                      </div>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                        Enrolled
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
