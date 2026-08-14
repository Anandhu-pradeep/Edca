"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, Image as ImageIcon, X, ShieldCheck, Loader2, Paintbrush } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { axiosInstance } from "@/lib/axios";

export default function ThemePreferences() {
  const { theme, setTheme } = useTheme();
  const { user, updateUser } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [customThemeBg, setCustomThemeBg] = useState<string | null>(user?.customThemeBg || null);
  const [customTextColor, setCustomTextColor] = useState<string>(user?.customTextColor || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isCustomMode = theme === "custom" || (user?.customThemeBg && theme === "system" && !customThemeBg) || customThemeBg !== null;

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions for background
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          
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
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // compress to 70% quality JPEG
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedBase64 = await compressImage(file);
      setCustomThemeBg(compressedBase64);
      setTheme("dark"); // Force dark mode instead of falling back to light mode when a custom image is active
    }
  };

  const handleSaveTheme = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await axiosInstance.put(`/users/onboarding`, {
        customThemeBg: customThemeBg,
        customTextColor: customTextColor || null
      });
      
      if (user) {
        updateUser({ 
          customThemeBg: customThemeBg || undefined, 
          customTextColor: customTextColor || undefined 
        });
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save custom theme", error);
      alert("Failed to save custom theme. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const clearCustomTheme = () => {
    setCustomThemeBg(null);
    setTheme("system");
    
    // Auto-save the removal so the backend clears it (sending empty string removes it in the backend)
    axiosInstance.put(`/users/onboarding`, {
      customThemeBg: "",
      customTextColor: ""
    }).then(() => {
      if (user) {
        updateUser({ customThemeBg: undefined, customTextColor: undefined });
      }
    });
  };
  
  const selectTheme = (newTheme: string) => {
    if (newTheme !== "custom") {
      setTheme(newTheme);
      // If we are switching away from custom, we can clear the custom bg from view
      if (customThemeBg) {
        clearCustomTheme();
      }
    } else {
      // User clicked 'Custom'
      setTheme("dark");
      if (!customThemeBg) {
        fileInputRef.current?.click();
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium mb-1">Preferences</h2>
          <p className="text-muted-foreground text-xs">Customize your app appearance and custom backgrounds.</p>
        </div>
        {success && (
          <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-bold flex items-center gap-1 animate-in fade-in zoom-in">
            <ShieldCheck className="w-4 h-4" /> Saved
          </div>
        )}
      </div>
      
      <div className="pt-4 border-t border-border/30 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <span className="font-medium text-foreground uppercase tracking-wider text-xs w-16">Theme</span>
          
          <div className="flex flex-wrap items-center bg-secondary/30 p-1 rounded-full border border-border/50 w-fit">
            <button
              onClick={() => selectTheme("light")}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                theme === "light" && !customThemeBg 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              Light
            </button>
            
            <button
              onClick={() => selectTheme("dark")}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                theme === "dark" && !customThemeBg 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              Dark
            </button>
            
            <button
              onClick={() => selectTheme("system")}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all ${
                theme === "system" && !customThemeBg 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              System
            </button>

            <button
              onClick={() => selectTheme("custom")}
              className={`px-6 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                customThemeBg 
                  ? "bg-background shadow-sm text-orange-500" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <span>+</span> Custom
            </button>
          </div>
        </div>

        {/* Hidden file input always in DOM so the Custom button can trigger it */}
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleImageChange}
        />

        {/* Custom Background Uploader - Only visible when custom mode is active */}
        {customThemeBg && (
          <div className="pt-4 border-t border-border animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="font-medium text-foreground text-sm mb-3">Custom Background Image</h3>
            
            <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-orange-500/50 group">
              <img src={customThemeBg} alt="Custom Theme" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                  Change Image
                </Button>
                <Button variant="destructive" onClick={clearCustomTheme}>
                  <X className="w-4 h-4 mr-2" /> Clear Custom Theme
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-foreground text-sm mb-3">Custom Text Color</h3>
              <div className="flex items-center gap-4">
                 <input 
                   type="color" 
                   value={customTextColor || (theme === 'dark' ? '#ffffff' : '#000000')} 
                   onChange={(e) => setCustomTextColor(e.target.value)}
                   className="w-12 h-12 rounded cursor-pointer border-0 bg-transparent p-1"
                 />
                 <span className="text-xs text-muted-foreground flex-1">Pick a color that contrasts well with your background image.</span>
                 {customTextColor && (
                    <Button variant="outline" size="sm" onClick={() => setCustomTextColor("")} className="liquid-glass-subtle">
                      Reset Color
                    </Button>
                 )}
              </div>
            </div>

            <div className="flex justify-end pt-8">
              <Button 
                onClick={handleSaveTheme} 
                disabled={saving || (customThemeBg === user?.customThemeBg && customTextColor === (user?.customTextColor || ""))}
                className="min-w-[120px] bg-orange-500 hover:bg-orange-600 text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {saving ? "Saving..." : "Save Custom Theme"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
