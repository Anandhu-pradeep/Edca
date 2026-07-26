"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, User } from '@/store/useAuthStore';
import { axiosInstance } from '@/lib/axios';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Code, 
  Database, 
  Layers, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  ShieldCheck, 
  FileText, 
  Loader2, 
  Rocket, 
  Camera, 
  Calendar, 
  Building2, 
  Award, 
  Cpu,
  Target,
  Terminal,
  BrainCircuit,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SideRays from '@/components/ui/SideRays';
import Lottie from 'lottie-react';
import fresherAnim from './fresher.json';
import internshipAnim from './internship.json';
import oneTwoYearsAnim from './1-2 years.json';
import threePlusYearsAnim from './3+years.json';
import tickMarkAnim from './tick_mark.json';

// Available Degrees List
const AVAILABLE_DEGREES = [
  "Master of Computer Applications (MCA)",
  "B.Tech Computer Science & Engineering",
  "M.Tech Computer Science",
  "B.Sc Computer Science / IT",
  "M.Sc Data Science / AI",
  "Bachelor of Computer Applications (BCA)",
  "B.Tech Electrical & Electronics (EEE / ECE)",
  "B.Tech Mechanical / Civil / Chemical",
  "Bachelor of Commerce / Accounting (B.Com / M.Com)",
  "Chartered Accountant (CA / ACCA / CFA / CPA)",
  "Business Administration & Management (BBA / MBA)",
  "Bachelor / Master of Arts & Humanities (BA / MA)",
  "Bachelor / Master of Science (B.Sc / M.Sc - General)",
  "Medical / Pharmacy / Healthcare Degree",
  "Law / Legal Studies (LL.B / LL.M)",
  "Other Engineering / Tech Degree",
  "Other Degree / Diploma / Professional Course"
];

// Available Graduation Years List
const AVAILABLE_YEARS = [
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030"
];

// Available Tech Stack Chips
const AVAILABLE_SKILLS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Next.js', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Tailwind CSS', category: 'Frontend' },
  { name: 'Java', category: 'Backend' },
  { name: 'Spring Boot', category: 'Backend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'GraphQL', category: 'Backend' },
  { name: 'AWS', category: 'Cloud/DevOps' },
  { name: 'Docker', category: 'Cloud/DevOps' },
  { name: 'Kubernetes', category: 'Cloud/DevOps' },
  { name: 'System Design', category: 'Architecture' },
  { name: 'Microservices', category: 'Architecture' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'Machine Learning', category: 'AI/ML' },
  { name: 'Data Structures', category: 'Core' },
  { name: 'Financial Accounting', category: 'Finance/Acct' },
  { name: 'Auditing & Compliance', category: 'Finance/Acct' },
  { name: 'Taxation & GST', category: 'Finance/Acct' },
  { name: 'Financial Modeling', category: 'Finance/Acct' },
  { name: 'Excel & VBA', category: 'Finance/Acct' },
  { name: 'VLSI & Embedded C', category: 'Electrical/Core' },
  { name: 'Circuit & PCB Design', category: 'Electrical/Core' },
  { name: 'MATLAB & AutoCAD', category: 'Electrical/Core' },
  { name: 'Power Systems', category: 'Electrical/Core' },
  { name: 'Project Management', category: 'Business/Mgmt' },
  { name: 'Agile & Scrum', category: 'Business/Mgmt' },
  { name: 'Business Strategy', category: 'Business/Mgmt' },
  { name: 'Data Analysis', category: 'Business/Mgmt' }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isInitializing, setOnboarded } = useAuthStore();

  // Current Step (0 to 8)
  const [step, setStep] = useState<number>(0);
  const [introStage, setIntroStage] = useState<'fade-in' | 'zoom-out'>('fade-in');
  const [showValidationDetails, setShowValidationDetails] = useState<boolean>(false);

  useEffect(() => {
    setShowValidationDetails(false);
  }, [step]);

  // Automatic cinematic Netflix-style intro animation for Step 0
  useEffect(() => {
    if (step === 0) {
      setIntroStage('fade-in');
      const zoomTimer = setTimeout(() => {
        setIntroStage('zoom-out');
      }, 1500);

      const stepTimer = setTimeout(() => {
        setStep(1);
      }, 2100);

      return () => {
        clearTimeout(zoomTimer);
        clearTimeout(stepTimer);
      };
    }
  }, [step]);

  // Profile Form State
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const [username, setUsername] = useState<string>(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Prefer not to say'>('Male');

  const [college, setCollege] = useState<string>('');
  const [degree, setDegree] = useState<string>('');
  const [degreeDropdownOpen, setDegreeDropdownOpen] = useState<boolean>(false);
  const [gradYear, setGradYear] = useState<string>('');
  const [gradYearDropdownOpen, setGradYearDropdownOpen] = useState<boolean>(false);

  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [customRole, setCustomRole] = useState<string>('');
  
  const [experienceLevel, setExperienceLevel] = useState<string>('Fresher');
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Java', 'Spring Boot', 'System Design']);
  const [allSkills, setAllSkills] = useState<{ name: string; category: string }[]>(AVAILABLE_SKILLS);
  const [isAddingSkill, setIsAddingSkill] = useState<boolean>(false);
  const [newSkillName, setNewSkillName] = useState<string>('');
  
  // Resume Upload & Scanning State
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStepText, setScanStepText] = useState<string>('');
  const [scanComplete, setScanComplete] = useState<boolean>(false);

  // Authentication & Onboarding verification
  useEffect(() => {
    if (!isInitializing) {
      if (!user) {
        router.replace('/sign');
        return;
      }
      if (user.isOnboarded) {
        router.replace('/');
      }
    }
  }, [user, isInitializing, router]);

  // Sync profile data from auth store on initial mount/user load
  useEffect(() => {
    if (user?.avatar && !avatar) {
      setAvatar(user.avatar);
    }
    if (user?.username && !username) {
      setUsername(user.username);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.avatar, user?.username]);

  // Username validation debounced effect
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus(username ? 'taken' : 'idle');
      setSuggestedUsernames([]);
      return;
    }
    
    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      const sanitized = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (sanitized.length < 3) {
        setUsernameStatus('taken');
        return;
      }
      try {
        const response = await axiosInstance.get('/auth/check-username', {
          params: { username: sanitized }
        });
        const isTaken = response.data.data;
        if (isTaken) {
          setUsernameStatus('taken');
          const base = sanitized;
          const suggestions = [
            `${base}_dev`,
            `${base}_2026`,
            `${base}_ai`,
            `${base}_pro`
          ];
          setSuggestedUsernames(suggestions);
        } else {
          setUsernameStatus('available');
          setSuggestedUsernames([]);
        }
      } catch (err) {
        setUsernameStatus('available');
        setSuggestedUsernames([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  // Handle Username Input
  const handleUsernameChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
  };

  // Select alternative username
  const selectSuggestion = (sugg: string) => {
    setUsername(sugg);
  };

  // Toggle skill selection
  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  // Simulate AI Resume Scan
  const simulateResumeScan = (file?: File) => {
    if (file) setResumeFile(file);
    setIsScanning(true);
    setScanProgress(0);
    setScanComplete(false);
    
    const steps = [
      { progress: 20, text: 'Uploading resume to EDCA AI secure vault...' },
      { progress: 45, text: 'Scanning PDF layout, structure & keywords...' },
      { progress: 70, text: 'Extracting skills & experience with EDCA AI...' },
      { progress: 90, text: 'Cross-referencing competencies with job requirements...' },
      { progress: 100, text: 'Calibrating 100% Profile Match Score!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setScanProgress(steps[currentStep].progress);
        setScanStepText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanComplete(true);
        // Automatically add some skills if not already selected
        if (!selectedSkills.includes('AWS')) setSelectedSkills(prev => [...prev, 'AWS']);
        if (!selectedSkills.includes('TypeScript')) setSelectedSkills(prev => [...prev, 'TypeScript']);
      }
    }, 700);
  };

  // Handle File Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateResumeScan(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateResumeScan(e.target.files[0]);
    }
  };

  // Complete Onboarding & Launch Dashboard
  const handleLaunchDashboard = async () => {
    const finalRole = degree || 'Technology Specialist';
    const chosenUsername = username || (user?.email?.split('@')[0] || 'anandhu_dev');
    
    if (user?.email) {
      try {
        await axiosInstance.post('/auth/set-username', { email: user.email, username: chosenUsername });
      } catch (e) {}
    }

    const profileData: Partial<User> = {
      username: chosenUsername,
      avatar: avatar,
      phone: phone || '+91 9876543210',
      location: location || 'Bangalore, India',
      gender: gender,
      college: college || 'National Institute of Technology',
      degree: degree,
      gradYear: gradYear,
      targetRole: finalRole,
      experienceLevel: experienceLevel,
      techStack: selectedSkills,
      resumeName: resumeFile ? resumeFile.name : 'Anandhu_Pradeep_Resume_2026.pdf',
      isOnboarded: true
    };

    try {
      const resp = await axiosInstance.put('/users/onboarding', profileData);
      const updatedUser = resp.data.data;
      if (updatedUser) {
        setOnboarded(true, updatedUser);
      } else {
        setOnboarded(true, profileData);
      }
    } catch (err) {
      console.error("Failed to save onboarding to backend", err);
      setOnboarded(true, profileData);
    }
    router.push('/');
  };

  if (isInitializing || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing AI Calibration Engine...</p>
        </div>
      </div>
    );
  }

  // Add Custom Skill Handler
  const handleAddCustomSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (!allSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setAllSkills(prev => [...prev, { name: trimmed, category: 'Custom' }]);
    }
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
    }
    setNewSkillName('');
    setIsAddingSkill(false);
  };

  const getStepValidationError = () => {
    switch (step) {
      case 1:
        if (!username.trim()) return "Please enter a username to proceed.";
        if (usernameStatus === 'checking') return "Checking username availability...";
        if (usernameStatus === 'taken') return "Please choose an available username.";
        if (usernameStatus !== 'available') return "Username verification required.";
        return null;
      case 2:
        if (!phone.trim() || !location.trim()) return "Please fill in your phone number and location.";
        const digitCount = phone.replace(/\D/g, '').length;
        if (digitCount < 10 || digitCount > 15) return "Please enter a valid 10 to 15 digit mobile phone number.";
        return null;
      case 3:
        return null;
      case 5:
        if (selectedSkills.length === 0) return "Please select at least one skill.";
        return null;
      case 6:
        if (isScanning) return "AI scanning in progress...";
        if (!scanComplete) return "Please upload or simulate a resume scan to continue.";
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Background Ambient Glows & SideRays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-foreground/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-foreground/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <SideRays
          speed={2.0}
          rayColor1="#FACC15"
          rayColor2="#FBBF24"
          intensity={2.5}
          spread={3.5}
          origin="top-right"
          tilt={5}
          saturation={1.3}
          blend={0.7}
          falloff={1.15}
          opacity={0.85}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 0: INTRO - CINEMATIC NETFLIX STYLE WELCOME */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
              animate={
                introStage === 'fade-in'
                  ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
                  : { opacity: 0, scale: 3.5, filter: 'blur(10px)' }
              }
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ 
                duration: introStage === 'fade-in' ? 0.7 : 0.6,
                ease: introStage === 'fade-in' ? [0.16, 1, 0.3, 1] : [0.7, 0, 0.84, 0]
              }}
              className="py-16 text-center select-none max-w-2xl mx-auto space-y-6"
            >
              <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight bg-gradient-to-r from-amber-400 via-rose-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(244,63,94,0.4)]">
                EDCA
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
                This is a great opportunity, and you have earned it through your hard work. Best of luck!
              </p>
            </motion.div>
          )}

          {/* STEP 1: IDENTITY & VALIDATION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 max-w-4xl mx-auto w-full"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  01
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Identity & Validation</h2>
                  <p className="text-sm text-muted-foreground">Customize your profile appearance and reserve your EDCA username.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-6">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-border/50 pb-6 md:pb-0 md:pr-6">
                  <label className="relative group cursor-pointer mb-4 flex items-center justify-center select-none">
                    {avatar ? (
                      <div className="relative w-36 h-36 rounded-full p-[3px] overflow-hidden flex items-center justify-center shadow-2xl">
                        <div 
                          className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#3b82f6,#8b5cf6,#ec4899,#ef4444,#eab308,#22c55e,#3b82f6)] animate-spin" 
                          style={{ animationDuration: '3s' }} 
                        />
                        <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-background">
                          <img 
                            src={avatar} 
                            alt="Profile Avatar" 
                            className="w-full h-full object-cover" 
                            onError={() => setAvatar('')} 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl group-hover:border-primary transition-all bg-secondary/80 flex items-center justify-center text-3xl font-black tracking-wider text-foreground">
                        <span>
                          {(user?.firstName?.charAt(0) || 'A') + (user?.lastName?.charAt(0) || 'P')}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 z-20 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Camera className="w-5 h-5" />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  <span className="text-sm font-semibold text-foreground">Profile Picture</span>
                  <span className="text-xs text-muted-foreground mt-1">Click circle or camera icon to change</span>
                </div>

                {/* Username Selection & Suggestion Engine */}
                <div className="md:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
                      <span>EDCA Username <span className="text-primary">*</span></span>
                      <span className="text-xs text-muted-foreground font-normal">Lowercase alphanumeric & underscores</span>
                    </label>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-mono">
                        @
                      </div>
                      <input 
                        type="text"
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        placeholder="anandhu_dev"
                        className={cn(
                          "w-full pl-8 pr-11 py-3.5 rounded-xl bg-background/80 border text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all",
                          usernameStatus === 'idle' && "border-border focus:ring-primary/50",
                          usernameStatus === 'checking' && "border-border focus:ring-primary/50",
                          usernameStatus === 'available' && "!border-emerald-500 focus:!ring-emerald-500/50 bg-emerald-500/10 text-emerald-500",
                          usernameStatus === 'taken' && "!border-red-500 focus:!ring-red-500/50 bg-red-500/10 text-red-500"
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
                        {usernameStatus === 'checking' && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
                        {usernameStatus === 'available' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {usernameStatus === 'taken' && <AlertCircle className="w-5 h-5 text-red-500" />}
                      </div>
                    </div>

                    {/* Live Validation Feedback */}
                    <div className="mt-2.5 min-h-[20px] flex items-center justify-between text-xs font-medium">
                      {usernameStatus === 'checking' && (
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                          Checking username availability...
                        </span>
                      )}
                      {usernameStatus === 'available' && (
                        <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Username &apos;@{username}&apos; is available!
                        </span>
                      )}
                      {usernameStatus === 'taken' && (
                        <span className="text-red-500 font-semibold flex items-center gap-1.5">
                          <X className="w-3.5 h-3.5" />
                          Username already taken
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Suggested Usernames */}
                  {suggestedUsernames.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-secondary/60 border border-border/60"
                    >
                      <div className="text-xs font-semibold text-primary mb-2.5">
                        <span>Try these:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedUsernames.map((sugg) => (
                          <button
                            key={sugg}
                            type="button"
                            onClick={() => selectSuggestion(sugg)}
                            className="px-3 py-1.5 rounded-lg bg-background hover:bg-primary hover:text-primary-foreground border border-border/80 text-xs font-mono font-medium transition-all shadow-sm flex items-center gap-1 group"
                          >
                            <span>@{sugg}</span>
                            <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PERSONAL DETAILS */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 max-w-4xl mx-auto w-full space-y-6"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  02
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Personal Details</h2>
                  <p className="text-sm text-muted-foreground">Clean inputs for your contact info and gender calibration.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>Mobile Phone Number <span className="text-primary">*</span></span>
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">10-15 digits</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[0-9+\-() ]*$/.test(val)) {
                          setPhone(val);
                        }
                      }}
                      placeholder="+91 9876543210"
                      className={cn(
                        "w-full pl-4 pr-11 py-3.5 rounded-xl bg-background/80 border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all font-mono text-sm",
                        !phone.trim() && "border-border focus:ring-primary/50",
                        phone.trim() && phone.replace(/\D/g, '').length >= 10 && phone.replace(/\D/g, '').length <= 15 && "!border-emerald-500 focus:!ring-emerald-500/50 bg-emerald-500/10 text-emerald-500",
                        phone.trim() && (phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15) && "!border-red-500 focus:!ring-red-500/50 bg-red-500/10 text-red-500"
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                      {phone.trim() && phone.replace(/\D/g, '').length >= 10 && phone.replace(/\D/g, '').length <= 15 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {phone.trim() && (phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15) && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {phone.trim() && (phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15) && (
                    <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Please enter 10 to 15 digits (currently {phone.replace(/\D/g, '').length}).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Location / Address</span>
                  </label>
                  <input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bangalore, India"
                    className="w-full px-4 py-3.5 rounded-xl bg-background/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  <span>Intuitive Gender Selector</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Male', 'Female', 'Prefer not to say'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setGender(opt)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                        gender === opt 
                          ? "bg-primary border-primary text-primary-foreground shadow-sm" 
                          : "bg-background/60 border-border/80 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                      )}
                    >
                      <span className="text-base font-bold">
                        {opt === 'Male' && '♂'}
                        {opt === 'Female' && '♀'}
                        {opt === 'Prefer not to say' && '⚪'}
                      </span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ACADEMIC BACKGROUND */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 max-w-4xl mx-auto w-full space-y-6"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  03
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Academic Background</h2>
                  <p className="text-sm text-muted-foreground">Share your educational pedigree to benchmark your profile strength.</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>College / University Name (Optional)</span>
                  </label>
                  <input 
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g., University / College Name (Optional - skip if not applicable)"
                    className="w-full px-4 py-3.5 rounded-xl bg-background/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2 relative">
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>Current Degree / Qualification</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={degree}
                        onChange={(e) => {
                          setDegree(e.target.value);
                          setDegreeDropdownOpen(true);
                        }}
                        onFocus={() => setDegreeDropdownOpen(true)}
                        placeholder="Type to search or enter custom degree..."
                        className="w-full px-4 py-3.5 rounded-xl bg-background/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-medium"
                      />
                      {degreeDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-20" 
                            onClick={() => setDegreeDropdownOpen(false)} 
                          />
                          <div 
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            className="absolute left-0 right-0 top-full mt-2 z-30 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-y-auto max-h-[210px] overscroll-contain divide-y divide-border/30"
                          >
                            {AVAILABLE_DEGREES.filter(d => d.toLowerCase().includes(degree.toLowerCase())).length > 0 ? (
                              AVAILABLE_DEGREES.filter(d => d.toLowerCase().includes(degree.toLowerCase())).map((deg) => (
                                <div
                                  key={deg}
                                  onClick={() => {
                                    setDegree(deg);
                                    setDegreeDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "px-4 py-3 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-between",
                                    degree === deg && "bg-primary/10 font-bold text-primary hover:text-primary-foreground"
                                  )}
                                >
                                  <span>{deg}</span>
                                  {degree === deg && <Check className="w-4 h-4 flex-shrink-0" />}
                                </div>
                              ))
                            ) : (
                              <div 
                                onClick={() => setDegreeDropdownOpen(false)}
                                className="px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-secondary/50"
                              >
                                Use custom degree: "<span className="font-semibold text-foreground">{degree}</span>"
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Graduation Year</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={gradYear}
                        onChange={(e) => {
                          setGradYear(e.target.value);
                          setGradYearDropdownOpen(true);
                        }}
                        onFocus={() => setGradYearDropdownOpen(true)}
                        placeholder="e.g., 2026"
                        className="w-full px-4 py-3.5 rounded-xl bg-background/80 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-mono font-semibold"
                      />
                      {gradYearDropdownOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-20" 
                            onClick={() => setGradYearDropdownOpen(false)} 
                          />
                          <div 
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            className="absolute left-0 right-0 top-full mt-2 z-30 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-y-auto max-h-[180px] overscroll-contain divide-y divide-border/30"
                          >
                            {AVAILABLE_YEARS.filter(y => y.includes(gradYear)).length > 0 ? (
                              AVAILABLE_YEARS.filter(y => y.includes(gradYear)).map((yr) => (
                                <div
                                  key={yr}
                                  onClick={() => {
                                    setGradYear(yr);
                                    setGradYearDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "px-4 py-2.5 text-sm font-mono cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-between",
                                    gradYear === yr && "bg-primary/10 font-bold text-primary hover:text-primary-foreground"
                                  )}
                                >
                                  <span>{yr}</span>
                                  {gradYear === yr && <Check className="w-4 h-4 flex-shrink-0" />}
                                </div>
                              ))
                            ) : (
                              <div 
                                onClick={() => setGradYearDropdownOpen(false)}
                                className="px-4 py-2.5 text-sm text-muted-foreground cursor-pointer hover:bg-secondary/50"
                              >
                                Use custom year: "<span className="font-semibold text-foreground">{gradYear}</span>"
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: INTERACTIVE EXPERIENCE TIMELINE */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 max-w-4xl mx-auto w-full space-y-8"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  04
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Interactive Experience Timeline</h2>
                  <p className="text-sm text-muted-foreground">Select your current career stage on this dynamic segmented timeline.</p>
                </div>
              </div>

              {/* Segmented Timeline */}
              <div className="py-8 px-2">
                <div className="relative">
                  {/* Connecting Line Below JSON Files */}
                  <div className="absolute top-[108px] sm:top-[124px] left-[12.5%] right-[12.5%] h-1.5 bg-secondary -translate-y-1/2 rounded-full z-0" />
                  <div 
                    className="absolute top-[108px] sm:top-[124px] left-[12.5%] h-1.5 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                    style={{ 
                      width: experienceLevel === 'Fresher' ? '0%' : 
                             experienceLevel === 'Internship' ? '25%' : 
                             experienceLevel === '1–2 Years' ? '50%' : '75%' 
                    }}
                  />

                  {/* Nodes */}
                  <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                    {[
                      { level: 'Fresher', label: 'Fresher', sub: '0 Years / Student', anim: fresherAnim },
                      { level: 'Internship', label: 'Internship', sub: 'Completed 1+ Internships', anim: internshipAnim },
                      { level: '1–2 Years', label: '1–2 Years', sub: 'Junior Professional', anim: oneTwoYearsAnim },
                      { level: '3+ Years', label: '3+ Years', sub: 'Mid / Senior Level', anim: threePlusYearsAnim },
                    ].map((node) => {
                      const isActive = experienceLevel === node.level;
                      return (
                        <div 
                          key={node.level}
                          onClick={() => setExperienceLevel(node.level)}
                          className="flex flex-col items-center cursor-pointer group relative"
                        >
                          <div className={cn(
                            "w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg mb-6 border-2 overflow-hidden p-1 bg-background z-10",
                            isActive 
                              ? "bg-primary text-primary-foreground border-primary scale-110 ring-4 ring-primary/20 shadow-primary/20 shadow-xl" 
                              : "bg-background border-border/80 group-hover:border-primary/50 group-hover:scale-105"
                          )}>
                            <Lottie animationData={node.anim} loop={true} className="w-full h-full scale-125" />
                          </div>
                          <span className={cn(
                            "font-bold text-sm transition-colors block z-10",
                            isActive ? "text-primary scale-105" : "text-foreground group-hover:text-primary"
                          )}>
                            {node.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 hidden sm:block z-10">
                            {node.sub}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: CALIBRATED TECH STACK CHIPS */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 max-w-4xl mx-auto w-full space-y-6"
            >
              <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    05
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Calibrated Tech Stack Chips</h2>
                    <p className="text-sm text-muted-foreground">Click chips to toggle dynamically. EDCA AI will generate custom mock interviews.</p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
                  {selectedSkills.length} Skills Selected
                </div>
              </div>

              {/* Centered Tapering Skill Chips Grid */}
              <div className="flex flex-wrap justify-center gap-2.5 min-h-[200px] content-start py-6 max-w-3xl mx-auto">
                {allSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.name);
                  return (
                    <motion.button
                      key={skill.name}
                      type="button"
                      whileTap={{ scale: 0.94 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => toggleSkill(skill.name)}
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 border cursor-pointer select-none",
                        isSelected 
                          ? "bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary" 
                          : "bg-background/80 border-border/80 text-foreground hover:border-foreground/50 hover:bg-secondary/50"
                      )}
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        isSelected ? "bg-primary-foreground animate-pulse" : "bg-muted-foreground"
                      )} />
                      <span>{skill.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
                    </motion.button>
                  );
                })}

                {/* Add Custom Skill Button / Input */}
                {isAddingSkill ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200">
                    <input
                      type="text"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddCustomSkill();
                        if (e.key === 'Escape') setIsAddingSkill(false);
                      }}
                      placeholder="Type custom skill..."
                      autoFocus
                      className="px-4 py-2 rounded-2xl text-sm font-semibold bg-background border-2 border-primary text-foreground focus:outline-none shadow-md w-44"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustomSkill}
                      className="rounded-2xl px-3.5 py-2 h-auto text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                    >
                      Add
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSkill(false)}
                      className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground text-xs"
                      title="Cancel"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setIsAddingSkill(true)}
                    className="px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 border-2 border-dashed border-primary/60 text-primary hover:border-primary hover:bg-primary/10 shadow-sm cursor-pointer select-none"
                  >
                    <span>add+</span>
                  </motion.button>
                )}
              </div>

              {selectedSkills.length === 0 && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Please select at least 1 technical competency to proceed.
                </p>
              )}
            </motion.div>
          )}

          {/* STEP 6: AI RESUME INTELLIGENCE DROPZONE */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="py-4 max-w-4xl mx-auto w-full space-y-6"
            >
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  06
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Resume Intelligence Dropzone</h2>
                  <p className="text-sm text-muted-foreground">Upload your PDF resume for real-time simulated AI scanning and skill extraction.</p>
                </div>
              </div>

              {!isScanning && !scanComplete ? (
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border hover:border-foreground rounded-3xl p-10 text-center bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer relative group"
                >
                  <label className="cursor-pointer flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-md">
                      <UploadCloud className="w-10 h-10 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Drag & Drop your PDF Resume here</h3>
                      <p className="text-sm text-muted-foreground mt-1">or click to browse from your local device (PDF max 10MB)</p>
                    </div>
                    <div className="pt-2">
                      <span className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow-md hover:opacity-90 transition-opacity">
                        Select Resume PDF
                      </span>
                    </div>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      className="hidden" 
                      onChange={handleFileChange}
                    />
                  </label>

                  <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> AES-256 Encrypted</span>
                    <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-primary" /> Instant AI Extraction</span>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => simulateResumeScan(new File([""], "Anandhu_Pradeep_Resume_2026.pdf", { type: "application/pdf" }))}
                      className="text-xs text-primary underline hover:text-primary/80 font-medium"
                    >
                      Don&apos;t have a resume handy? Click here to simulate AI scan with a sample profile
                    </button>
                  </div>
                </div>
              ) : isScanning ? (
                <div className="p-10 rounded-3xl bg-secondary/40 border border-border/60 text-center space-y-6">
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <Loader2 className="w-20 h-20 text-primary animate-spin absolute" />
                    <Sparkles className="w-8 h-8 text-foreground animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 animate-pulse">{scanStepText}</h3>
                    <p className="text-xs font-mono text-muted-foreground">EDCA AI Intelligence Processor Active...</p>
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Scanning Progress</span>
                      <span className="text-primary">{scanProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden p-0.5 border border-border/50">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300 shadow-sm"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-secondary/50 border border-border space-y-6">
                  <div className="flex items-center justify-between border-b border-border/40 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-sm">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground flex items-center gap-2">
                          <span>{resumeFile?.name || 'Anandhu_Pradeep_Resume_2026.pdf'}</span>
                          <span className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[10px] font-bold uppercase">Verified</span>
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">1.4 MB • Scanned by EDCA AI v3.2</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setScanComplete(false); setResumeFile(null); }}
                      className="text-xs font-semibold hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                      Re-scan
                    </Button>
                  </div>

                  {/* Verification Checkmarks */}
                  <div className="space-y-3 bg-card/60 p-5 rounded-2xl border border-border/50">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" /> AI Verification Checkmarks
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Extracted 16 Technical Competencies</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Verified Academic Pedigree ({college || 'IIT/NIT'})</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>Experience Level Matched ({experienceLevel})</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>AI Resume Quality Score: <strong className="text-primary">96/100 (Optimal)</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 7: CALIBRATION SUMMARY & DASHBOARD LAUNCH */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="py-4 max-w-4xl mx-auto w-full text-center space-y-8 relative overflow-hidden"
            >
              {/* Confetti / Glow Effect */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10 py-12 flex flex-col items-center justify-center space-y-8">
                {/* Animated Green Tick Mark Lottie */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
                  <Lottie 
                    animationData={tickMarkAnim} 
                    loop={false} 
                    className="w-full h-full scale-125 drop-shadow-2xl" 
                  />
                </div>

                {/* You Are All Set Title */}
                <div className="space-y-2">
                  <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                    You Are All Set!
                  </h2>
                  <p className="text-base text-muted-foreground max-w-md mx-auto">
                    Your EDCA AI Assistant is fully calibrated and ready to accelerate your career preparation.
                  </p>
                </div>

                {/* Clickable Go to Dashboard Text */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleLaunchDashboard}
                    className="inline-flex items-center gap-2 text-lg sm:text-xl font-bold text-primary hover:text-primary/80 hover:underline underline-offset-8 transition-all duration-200 group cursor-pointer select-none"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BOTTOM NAVIGATION BUTTONS */}
        {step > 0 && step < 7 && (
          <div className={cn("mt-8 flex items-center border-t border-border/40 pt-6", step > 1 ? "justify-between" : "justify-end")}>
            {step > 1 && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setStep(prev => Math.max(0, prev - 1))}
                className="rounded-xl px-6 font-semibold hover:bg-secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back</span>
              </Button>
            )}

            {step < 7 ? (
              <div className="flex items-center gap-4">
                {getStepValidationError() && (
                  <motion.div 
                    layout
                    onClick={() => setShowValidationDetails(!showValidationDetails)}
                    className="cursor-pointer bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl px-3 py-2.5 flex items-center gap-2 transition-all shadow-sm select-none"
                    title="Click to expand validation details"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 animate-pulse" />
                    <AnimatePresence mode="popLayout">
                      {showValidationDetails && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0, scale: 0.95 }}
                          animate={{ opacity: 1, width: 'auto', scale: 1 }}
                          exit={{ opacity: 0, width: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="text-xs text-red-500 font-semibold whitespace-nowrap overflow-hidden pr-1"
                        >
                          {getStepValidationError()}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
                <Button 
                  size="lg"
                  disabled={!!getStepValidationError()}
                  onClick={() => setStep(prev => Math.min(7, prev + 1))}
                  className="rounded-xl px-8 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
