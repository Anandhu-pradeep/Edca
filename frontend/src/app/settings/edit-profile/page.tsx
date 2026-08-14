"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EditProfileForm from '@/components/settings/EditProfileForm';

export default function EditProfilePage() {
  const router = useRouter();

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
          <h1 className="text-3xl font-bold font-heading">Settings</h1>
        </div>
        
        <div className="flex-1 pb-16">
          <EditProfileForm />
        </div>
      </div>
    </div>
  );
}
