'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { axiosInstance } from '@/lib/axios';
import { BarChart3, TrendingUp, Users, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';

interface ClassPerformance {
  classId: string;
  className: string;
  studentCount: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  averageGrade?: string;
}

interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

interface OrgReportData {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: string;
  activeStudents: number;
  creditsUsed: number;
  classPerformance: ClassPerformance[];
  recentActivity: RecentActivity[];
}

export function OrganizationReportsView() {
  const { activeOrganization } = useAuthStore();

  const { data: report, isLoading, isError, refetch } = useQuery<OrgReportData>({
    queryKey: ['org-reports', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) return null;
      const res = await axiosInstance.get(`/organizations/${activeOrganization.id}/reports`);
      return res.data;
    },
    enabled: !!activeOrganization?.id,
  });

  const stats = [
    {
      name: 'Total Interviews',
      value: report?.totalInterviews?.toLocaleString() ?? '0',
      subtext: `${report?.completedInterviews ?? 0} completed`,
      icon: BarChart3,
    },
    {
      name: 'Average Score',
      value: report?.averageScore ?? 'N/A',
      subtext: 'Performance benchmark',
      icon: TrendingUp,
    },
    {
      name: 'Active Students',
      value: report?.activeStudents?.toLocaleString() ?? '0',
      subtext: 'Enrolled in classes',
      icon: Users,
    },
    {
      name: 'Credits Consumed',
      value: report?.creditsUsed?.toLocaleString() ?? '0',
      subtext: 'Interview sessions',
      icon: CheckCircle2,
    },
  ];

  const formatActivityTime = (timestamp?: string) => {
    if (!timestamp) return 'Recently';
    try {
      const date = new Date(timestamp);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Organization Analytics & Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time assessment data and performance metrics for {activeOrganization?.name}.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="text-xs px-3 py-1.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors text-muted-foreground hover:text-foreground"
        >
          Refresh Data
        </button>
      </div>

      {isError && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load reports. Please verify your permissions and try refreshing.</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border border-border/50 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  {isLoading ? (
                    <div className="h-7 w-16 bg-secondary/40 animate-pulse rounded" />
                  ) : (
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.subtext}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Class Performance */}
        <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Class Performance Comparison</h4>
            <span className="text-xs text-muted-foreground">
              {report?.classPerformance?.length ?? 0} classes
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4 flex-1">
              <div className="h-14 bg-secondary/30 animate-pulse rounded-lg" />
              <div className="h-14 bg-secondary/30 animate-pulse rounded-lg" />
            </div>
          ) : !report?.classPerformance || report.classPerformance.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 min-h-[220px]">
              <BarChart3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-sm text-foreground">No class performance data yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                As students are enrolled into classes and complete their interviews, completion stats will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {report.classPerformance.map((cls) => {
                const completionPct = cls.interviewsScheduled > 0
                  ? Math.round((cls.interviewsCompleted / cls.interviewsScheduled) * 100)
                  : 0;

                return (
                  <div
                    key={cls.classId}
                    className="p-3.5 bg-secondary/15 hover:bg-secondary/25 border border-border/50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium text-sm text-foreground">{cls.className}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {cls.studentCount} {cls.studentCount === 1 ? 'student' : 'students'}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Grade: {cls.averageGrade || 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completed: {cls.interviewsCompleted} / {cls.interviewsScheduled}</span>
                        <span>{completionPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, completionPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Recent Activity</h4>
            <span className="text-xs text-muted-foreground">Live feed</span>
          </div>

          {isLoading ? (
            <div className="space-y-3 py-4 flex-1">
              <div className="h-12 bg-secondary/30 animate-pulse rounded-lg" />
              <div className="h-12 bg-secondary/30 animate-pulse rounded-lg" />
              <div className="h-12 bg-secondary/30 animate-pulse rounded-lg" />
            </div>
          ) : !report?.recentActivity || report.recentActivity.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 min-h-[220px]">
              <Clock className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-sm text-foreground">No recent activity</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Scheduled interviews and completed assessments will be logged in this feed.
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {report.recentActivity.map((activity) => {
                const isCompleted = activity.type === 'COMPLETED';

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors border border-border/30"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        isCompleted ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-blue-500 shadow-sm shadow-blue-500/50'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatActivityTime(activity.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
