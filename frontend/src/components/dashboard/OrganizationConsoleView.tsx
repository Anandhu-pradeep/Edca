import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Building2, Check, X, Clock, Mail, Phone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrganizationConsoleView() {
  const { data: requests, refetch, isLoading } = useQuery({
    queryKey: ['adminOrganizationRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/organization-requests/pending');
      return res.data;
    }
  });

  const handleApprove = async (id: string) => {
    try {
      await axiosInstance.post(`/organization-requests/${id}/approve`);
      window.alert("Organization request approved successfully! The workspace has been created.");
      refetch();
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await axiosInstance.post(`/organization-requests/${id}/reject`);
      window.alert("Organization request rejected.");
      refetch();
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Failed to reject request.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Organization Console</h2>
        <p className="text-muted-foreground">
          Review and approve requests from institutions wanting to create an EDCA workspace.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/40 rounded-xl shadow-sm">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No pending requests</h3>
          <p className="text-muted-foreground mt-1">You're all caught up! There are no new organization requests to review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                <div className="space-y-4 flex-1">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{req.orgName}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {req.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {req.orgType}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 text-foreground/70" />
                      {req.officialEmail}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 text-foreground/70" />
                      {req.contactInfo}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-3">
                  <Button 
                    className="flex-1 md:flex-none gap-2 bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleApprove(req.id)}
                  >
                    <Check className="w-4 h-4" />
                    Approve & Create
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 md:flex-none gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                    onClick={() => handleReject(req.id)}
                  >
                    <X className="w-4 h-4" />
                    Reject Request
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
