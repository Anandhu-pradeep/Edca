import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { axiosInstance } from '@/lib/axios';
import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react';

export function OrganizationReportsView() {
  const { activeOrganization } = useAuthStore();
  
  // Using mock data for the UI since the backend endpoints for reports might not exist yet
  const stats = [
    { name: 'Total Interviews', value: '1,234', icon: BarChart3, trend: '+12%' },
    { name: 'Average Score', value: '84/100', icon: TrendingUp, trend: '+3%' },
    { name: 'Active Students', value: '432', icon: Users, trend: '+5%' },
    { name: 'Credits Used', value: '6,170', icon: PieChart, trend: 'This Month' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Organization Analytics & Reports</h2>
        <select className="bg-secondary/50 border border-border/50 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="p-6 bg-card border border-border rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <span className="text-xs font-medium text-green-500">{stat.trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h4 className="font-semibold">Class Performance Comparison</h4>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Detailed breakdown of average scores across all classes. Data will appear here once students complete their assigned AI interviews.
          </p>
        </div>
        
        <div className="p-6 bg-card border border-border rounded-xl shadow-sm">
          <h4 className="font-semibold mb-4">Recent Activity</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">CS101 Fall 2026 Interviews Scheduled</p>
                <p className="text-xs text-muted-foreground">Assigned to 45 students</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Jane Doe completed interview</p>
                <p className="text-xs text-muted-foreground">Scored 92/100 (Frontend Developer)</p>
              </div>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/20 transition-colors">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New member invited</p>
                <p className="text-xs text-muted-foreground">john.smith@university.edu</p>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
