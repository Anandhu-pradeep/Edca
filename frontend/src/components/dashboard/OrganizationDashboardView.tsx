import { useAuthStore } from '@/store/useAuthStore';
import { Building, Users, Calendar, Video } from 'lucide-react';

export function OrganizationDashboardView() {
  const { activeOrganization, user } = useAuthStore();
  const isOrgAdmin = activeOrganization?.role === 'ADMIN';

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
          <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:border-purple-500/50 transition-colors cursor-pointer group">
            <div className="p-3 bg-purple-500/10 text-purple-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Manage Students</h3>
            <p className="text-sm text-muted-foreground">Invite students, create classes, and organize your roster.</p>
          </div>
          
          <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:border-blue-500/50 transition-colors cursor-pointer group">
            <div className="p-3 bg-blue-500/10 text-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Assign Interviews</h3>
            <p className="text-sm text-muted-foreground">Schedule AI interviews for entire classes simultaneously.</p>
          </div>

          <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm hover:border-green-500/50 transition-colors cursor-pointer group">
            <div className="p-3 bg-green-500/10 text-green-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-lg mb-1">View Reports</h3>
            <p className="text-sm text-muted-foreground">Monitor performance analytics across all classes.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" />
                Upcoming Assigned Interviews
              </h3>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="font-medium text-foreground">No pending assignments</h4>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Your instructors haven't assigned any new AI interviews to your class yet. Check back later!
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-card border border-border/50 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4">My Classes</h3>
              <div className="space-y-3">
                <div className="p-3 bg-secondary/20 border border-border/50 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">Computer Science 101</p>
                    <p className="text-xs text-muted-foreground">Fall 2026</p>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
