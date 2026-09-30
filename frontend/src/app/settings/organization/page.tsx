"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, CheckCircle2, Loader2, Mail, Phone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { axiosInstance } from '@/lib/axios';

export default function OrganizationPage() {
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: myRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['myOrganizationRequests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/organization-requests/my-requests');
      return res.data;
    }
  });

  const hasPendingRequest = myRequests?.some((req: any) => req.status === 'PENDING');
  
  const [formData, setFormData] = useState({
    orgName: '',
    orgType: '',
    description: '',
    officialEmail: '',
    emailDomain: '',
    expectedStudents: '',
    contactInfo: '',
    reason: '',
    supportingInfo: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axiosInstance.post('/organization-requests', {
        ...formData,
        expectedStudents: parseInt(formData.expectedStudents)
      });
      
      setSubmitted(true);
    } catch (error: any) {
      window.alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRequests) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submitted || hasPendingRequest) {
    return (
      <div className="min-h-screen bg-transparent p-4 md:p-8">
        <div className="max-w-4xl mx-auto w-full flex flex-col">
          <div className="flex items-center gap-4 mb-8 shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="rounded-full liquid-glass-subtle shrink-0 hover:bg-secondary/80"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-bold font-heading">Organization Request</h1>
          </div>
          
          <div className="flex-1 pb-16 animate-in fade-in duration-300">
            <div className="liquid-glass p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">Request Received</h3>
              <p className="text-muted-foreground max-w-lg mx-auto mb-10 text-lg">
                Your request to create the organization has been sent to the administrators for review. You will be notified once it is approved.
              </p>
              <Button onClick={() => router.back()} size="lg" className="rounded-full px-10 py-6 text-lg shadow-xl">
                Return to Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full flex flex-col">
        <div className="flex items-center gap-4 mb-8 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full liquid-glass-subtle shrink-0 hover:bg-secondary/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold font-heading">Request Organization Access</h1>
        </div>
        
        <div className="flex-1 pb-16 animate-in fade-in duration-300">
          <div className="liquid-glass p-6 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">Organization Details</h2>
              <p className="text-muted-foreground">Submit a request to create a workspace for your institution.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="orgName" name="orgName" required 
                      value={formData.orgName} onChange={handleChange}
                      className="pl-9 bg-background/50 border-white/10 focus:border-primary/50" 
                      placeholder="e.g. ABC College" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="orgType">Organization Type *</Label>
                  <Select onValueChange={(val) => handleSelectChange('orgType', val)} required>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[100] shadow-lg">
                      <SelectItem value="UNIVERSITY">University</SelectItem>
                      <SelectItem value="COLLEGE">College</SelectItem>
                      <SelectItem value="TRAINING_INSTITUTE">Training Institute</SelectItem>
                      <SelectItem value="COMPANY">Company</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="officialEmail">Official Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="officialEmail" name="officialEmail" type="email" required 
                      value={formData.officialEmail} onChange={handleChange}
                      className="pl-9 bg-background/50 border-white/10" 
                      placeholder="admin@abccollege.edu" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailDomain">Authorized Email Domain *</Label>
                  <Input 
                    id="emailDomain" name="emailDomain" required 
                    value={formData.emailDomain} onChange={handleChange}
                    className="bg-background/50 border-white/10" 
                    placeholder="abccollege.edu" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedStudents">Expected Students *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="expectedStudents" name="expectedStudents" type="number" min="1" required 
                      value={formData.expectedStudents} onChange={handleChange}
                      className="pl-9 bg-background/50 border-white/10" 
                      placeholder="e.g. 500" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="contactInfo" name="contactInfo" required 
                      value={formData.contactInfo} onChange={handleChange}
                      className="pl-9 bg-background/50 border-white/10" 
                      placeholder="+1 234 567 8900" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" name="description"
                  value={formData.description} onChange={handleChange}
                  className="bg-background/50 border-white/10 min-h-[100px]" 
                  placeholder="Tell us a bit about your organization..." 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Request *</Label>
                <Textarea 
                  id="reason" name="reason" required
                  value={formData.reason} onChange={handleChange}
                  className="bg-background/50 border-white/10 min-h-[100px]" 
                  placeholder="Why are you requesting to use the EDCA Organization Platform?" 
                />
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.orgType}
                  className="rounded-full px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : "Submit Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
