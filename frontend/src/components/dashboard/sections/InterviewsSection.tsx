"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Keyboard, Plus, X, Users, Search, Link as LinkIcon, Play, Briefcase, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function InterviewsSection() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  // Generate a 6-character alphanumeric code
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleNewMeeting = () => {
    setGeneratedCode(generateCode());
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-10 max-w-3xl px-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-heading mb-3 sm:mb-4 text-foreground tracking-tight">
          Video calls and meetings for everyone
        </h1>
        <p className="text-sm sm:text-lg md:text-xl text-muted-foreground">
          Connect, collaborate and celebrate from anywhere with EDCA Meet
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-2xl justify-center">
        <Button 
          onClick={handleNewMeeting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all w-full sm:w-auto h-14"
        >
          <Video className="w-5 h-5" />
          <span>New meeting</span>
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md relative">
          <div className="relative flex-1">
            <Keyboard className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Enter a code or link"
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              className="pl-12 py-6 rounded-xl h-14 border-border/50 liquid-glass-subtle focus-visible:ring-blue-500 bg-background/50 text-base"
            />
          </div>
          <Button 
            onClick={() => {
              const code = meetingCode.trim();
              if (code && /^[a-zA-Z0-9]{6}$/.test(code)) {
                router.push(`/interview/${code}`);
              } else {
                alert('Please enter a valid 6-digit alphanumeric code.');
              }
            }}
            disabled={!meetingCode.trim()}
            variant="ghost" 
            className={cn(
              "font-medium h-14 px-6 rounded-xl transition-all",
              meetingCode.trim() ? "text-blue-500 hover:bg-blue-500/10 hover:text-blue-600" : "text-muted-foreground"
            )}
          >
            Join
          </Button>
        </div>
      </div>

      {/* Hero Illustration Placeholder (Mimicking Google Meet layout) */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/5 blur-3xl animate-pulse" />
        <div className="w-64 h-64 rounded-full liquid-glass border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20 z-10 animate-bounce-slow">
             <LinkIcon className="w-10 h-10" />
           </div>
           
           {/* Decorative elements representing users/collaboration */}
           <div className="absolute bottom-10 left-10 w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30 backdrop-blur-md">
             <UserDecorativeIcon color="text-yellow-500" />
           </div>
           <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 backdrop-blur-md">
             <UserDecorativeIcon color="text-green-500" />
           </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <NewMeetingModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          generatedCode={generatedCode} 
        />
      )}
    </div>
  );
}

function UserDecorativeIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("w-6 h-6", color)}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

// Sub-component for the Modal
function NewMeetingModal({ isOpen, onClose, generatedCode }: { isOpen: boolean; onClose: () => void; generatedCode: string }) {
  const router = useRouter();
  const [meetingName, setMeetingName] = useState('');
  const [allowOthers, setAllowOthers] = useState(true);
  const [field, setField] = useState('Ask from your CV');
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);

  const fieldOptions = [
    'Ask from your CV',
    'Software Engineering',
    'Finance & Accounting',
    'Healthcare',
    'Marketing & Sales',
    'Design & UX',
    'Human Resources',
    'Data Science',
    'Other working fields in economy'
  ];

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md liquid-glass border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between bg-secondary/30">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-500" />
            New Meeting details
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Locked Video ID */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Video ID (Locked)</label>
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/30 font-mono text-lg font-bold text-foreground tracking-widest">
              {generatedCode}
            </div>
          </div>

          {/* Meeting Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meeting Name (Optional)</label>
            <Input 
              placeholder="e.g. Weekly Sync, Technical Interview" 
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              className="bg-background/50 border-border/50"
            />
          </div>

          {/* Field Selection */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interview Field</label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFieldDropdownOpen(!isFieldDropdownOpen)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 text-sm font-medium text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-2 truncate">
                  {field === 'Ask from your CV' ? <FileText className="w-4 h-4 text-blue-500" /> : <Briefcase className="w-4 h-4 text-purple-500" />}
                  <span className="truncate">{field}</span>
                </div>
                <Search className="w-4 h-4 text-muted-foreground" />
              </button>

              {isFieldDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg bg-card border border-border/50 shadow-xl z-50 p-1">
                  {fieldOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setField(opt);
                        setIsFieldDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                        field === opt 
                          ? "bg-blue-500/10 text-blue-500 font-medium" 
                          : "text-foreground hover:bg-secondary/80"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allow Others Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Allow other users</p>
                <p className="text-xs text-muted-foreground">Let others join this meeting</p>
              </div>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setAllowOthers(!allowOthers)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                allowOthers ? "bg-blue-500" : "bg-muted"
              )}
            >
              <span 
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                  allowOthers ? "translate-x-6" : "translate-x-1"
                )} 
              />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/30 bg-secondary/30 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="hover:bg-background/50">
            Cancel
          </Button>
          <Button 
            onClick={() => router.push(`/interview/${generatedCode}?action=create`)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            Start Meeting
          </Button>
        </div>
      </div>
    </div>
  );
}
