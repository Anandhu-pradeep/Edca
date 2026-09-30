"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { MapPin, Briefcase, GraduationCap, Edit, User as UserIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from 'next/dynamic';
import errorAnimation from '../../../public/404 Error.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // fetch(`http://localhost:8080/api/v1/users/public/${username}`)
    fetch(`https://api.anandhupradeep.com/api/v1/users/public/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then((data) => {
        setProfile(data.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <Button 
          onClick={() => router.push('/')} 
          variant="ghost" 
          size="icon"
          className="w-14 h-14 rounded-full hover:scale-105 transition-all duration-300 backdrop-blur-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/30 text-white shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)' }}
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        </div>

        {/* Content Container (Full Screen) */}
        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center">
          
          {/* Lottie Animation */}
          <div className="w-full max-w-lg md:max-w-xl mx-auto h-[40vh] md:h-[50vh] flex items-center justify-center mb-6">
            <Lottie 
              animationData={errorAnimation} 
              loop={true} 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>

          {/* Text Container */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-md tracking-tight">
              Oops! User Not Found
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-medium">
              We couldn't find the user you're looking for. They might have changed their username or deleted their account.
            </p>
          </div>
          
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === profile.username || currentUser?.email?.split('@')[0] === profile.username;

  return (
    <div className="min-h-screen bg-transparent relative animate-in fade-in duration-700" data-lenis-prevent>
      
      {/* Dynamic Background Glass Blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 p-6 md:p-10 relative z-10 liquid-glass my-8 md:my-12 rounded-[2.5rem] !bg-white/75 dark:!bg-black/75 border border-white/20 shadow-2xl">
        
        {/* Navigation */}
        <div className="styled-wrapper mb-6 scale-[0.6] md:scale-75 origin-left">
          <button className="button" onClick={() => router.back()}>
            <div className="button-box">
              <span className="button-elem">
                <ArrowLeft className="w-full h-full text-muted-foreground" />
              </span>
              <span className="button-elem">
                <ArrowLeft className="w-full h-full text-foreground" />
              </span>
            </div>
          </button>
        </div>

        {/* Header / Banner */}
        <div className="relative h-48 md:h-64 rounded-3xl bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-purple-700/90 overflow-hidden shadow-2xl group">
          {profile.banner && (
            <img 
              src={profile.banner} 
              alt="Profile Banner" 
              className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Profile Info */}
        <div className="relative z-20 px-6 md:px-12 pb-12 -mt-24 md:-mt-28">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 text-center md:text-left">
            <div className="relative group">
              <img 
                src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.username}&background=3b82f6&color=fff&size=256`} 
                alt={profile.username}
                className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-background shadow-2xl object-cover bg-card transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${profile.username}&background=3b82f6&color=fff&size=256`;
                }}
              />
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile.username}
              </h1>
              <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 mt-2 font-medium">
                <UserIcon className="w-4 h-4" /> @{profile.username}
              </p>
            </div>
            
            {isOwnProfile && (
              <div className="pb-4">
                <Button variant="outline" className="gap-2 backdrop-blur-xl bg-card/60 border-border/80 shadow-lg hover:bg-card/80 transition-all rounded-xl h-11 px-6 cursor-pointer">
                  <Edit className="w-4 h-4" /> Edit Profile
                </Button>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* About Card */}
            <div className="p-8 liquid-glass transition-all duration-500 group">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                   <UserIcon className="w-4 h-4" />
                </div>
                About Me
              </h3>
              <div className="space-y-5 text-sm md:text-base">
                <div className="flex items-center gap-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Role</span>
                    <span className="font-medium text-foreground">{profile.targetRole || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Experience Level</span>
                    <span className="font-medium text-foreground">{profile.experienceLevel || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-muted-foreground group-hover:text-foreground transition-colors">
                  <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">Location</span>
                    <span className="font-medium text-foreground">{profile.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack Card */}
            <div className="p-8 liquid-glass transition-all duration-500 group">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                   <Edit className="w-4 h-4" />
                </div>
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {profile.techStack && profile.techStack.length > 0 ? (
                  profile.techStack.map((tech: string, i: number) => (
                    <span 
                      key={i} 
                      className="px-4 py-2 rounded-xl bg-secondary/60 border border-border/40 text-sm font-semibold text-foreground shadow-sm hover:bg-secondary/90 transition-colors"
                    >
                      {tech}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">No tech stack specified yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
