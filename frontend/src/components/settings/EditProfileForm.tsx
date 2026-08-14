import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { axiosInstance } from '@/lib/axios';
import { Camera, Loader2, Check, AlertCircle, CheckCircle2, User, Phone, MapPin, GraduationCap, Briefcase, Code, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function EditProfileForm() {
  const { user, setOnboarded } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [banner, setBanner] = useState<string>(user?.banner || '');
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  
  const [username, setUsername] = useState<string>(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [location, setLocation] = useState<string>(user?.location || '');
  
  const [college, setCollege] = useState<string>(user?.college || '');
  const [degree, setDegree] = useState<string>(user?.degree || '');
  const [gradYear, setGradYear] = useState<string>(user?.gradYear || '');
  
  const [targetRole, setTargetRole] = useState<string>(user?.targetRole || '');
  const [experienceLevel, setExperienceLevel] = useState<string>(user?.experienceLevel || '');
  
  const [techStackInput, setTechStackInput] = useState<string>(user?.techStack?.join(', ') || '');

  // Username validation
  useEffect(() => {
    if (username === user?.username) {
      setUsernameStatus('idle');
      return;
    }
    if (!username || username.length < 3) {
      setUsernameStatus(username ? 'taken' : 'idle');
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
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        setUsernameStatus('available');
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [username, user?.username]);

  const compressImage = (file: File, type: 'avatar' | 'banner'): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = type === 'avatar' ? 512 : 1920;
          const MAX_HEIGHT = type === 'avatar' ? 512 : 1080;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast("Please upload a valid image file (JPG, PNG).");
        return;
      }
      const compressedBase64 = await compressImage(file, type);
      if (type === 'avatar') setAvatar(compressedBase64);
      if (type === 'banner') setBanner(compressedBase64);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const updatedTechStack = techStackInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const payload = {
        username: username,
        avatar: avatar,
        banner: banner,
        phone: phone,
        location: location,
        college: college,
        degree: degree,
        gradYear: gradYear,
        targetRole: targetRole,
        experienceLevel: experienceLevel,
        techStack: updatedTechStack
      };

      const resp = await axiosInstance.put('/users/onboarding', payload);
      const updatedUser = resp.data.data;
      
      if (updatedUser) {
        setOnboarded(true, updatedUser);
      }
      
      showToast("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      showToast("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      <div>
        <h2 className="text-lg font-medium mb-1">Edit Profile</h2>
        <p className="text-muted-foreground text-xs">Update your public profile and professional details.</p>
      </div>

      <div className="overflow-hidden">
        {/* Banner Section */}
        <div className="relative h-48 sm:h-64 bg-secondary/80 group">
          {banner ? (
            <img src={banner} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <span className="text-muted-foreground/50 font-medium">Add a banner image</span>
            </div>
          )}
          
          <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" /> Change Banner
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} />
          </label>
        </div>

        {/* Avatar Section */}
        <div className="relative px-6 sm:px-10 pb-8">
          <div className="relative -mt-16 sm:-mt-20 mb-6 flex justify-between items-end">
            <label className="relative group cursor-pointer z-10">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-card bg-secondary overflow-hidden shadow-xl">
                {avatar ? (
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-foreground/50">
                    {(user?.firstName?.charAt(0) || 'A') + (user?.lastName?.charAt(0) || 'P')}
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'avatar')} />
            </label>

            <Button onClick={handleSaveChanges} disabled={loading} className="shadow-lg rounded-full px-6 mb-2 sm:mb-4">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
            
            {/* Locked Fields */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                Email Address <Lock className="w-3 h-3 text-muted-foreground" />
              </label>
              <input type="text" disabled value={user?.email || ''} className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed text-xs" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                Gender <Lock className="w-3 h-3 text-muted-foreground" />
              </label>
              <input type="text" disabled value={user?.gender || 'Prefer not to say'} className="w-full p-3 bg-secondary/50 border border-border rounded-xl text-muted-foreground cursor-not-allowed text-xs" />
            </div>

            {/* Editable Basic Info */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span className="flex items-center gap-2"><User className="w-4 h-4" /> Username</span>
                {usernameStatus === 'checking' && <span className="text-xs text-muted-foreground">Checking...</span>}
                {usernameStatus === 'available' && <span className="text-xs text-emerald-500">Available</span>}
                {usernameStatus === 'taken' && <span className="text-xs text-red-500">Taken</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">@</div>
                <input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} 
                  className={cn(
                    "w-full pl-8 pr-4 py-3 bg-background border rounded-xl text-sm transition-all focus:outline-none focus:ring-2",
                    usernameStatus === 'available' ? "border-emerald-500 focus:ring-emerald-500/50" : 
                    usernameStatus === 'taken' ? "border-red-500 focus:ring-red-500/50" : "border-border focus:ring-primary/50"
                  )} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Target Role
              </label>
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> College / University
              </label>
              <input type="text" value={college} onChange={(e) => setCollege(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Degree</label>
                <input type="text" value={degree} onChange={(e) => setDegree(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Grad Year</label>
                <input type="text" value={gradYear} onChange={(e) => setGradYear(e.target.value)} className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-foreground flex items-center gap-2">
                <Code className="w-4 h-4" /> Tech Stack / Skills <span className="text-[10px] text-muted-foreground font-normal">(Comma separated)</span>
              </label>
              <input 
                type="text" 
                value={techStackInput} 
                onChange={(e) => setTechStackInput(e.target.value)} 
                placeholder="React, Spring Boot, PostgreSQL, Java, Python"
                className="w-full p-3 bg-background border border-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/50" 
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
