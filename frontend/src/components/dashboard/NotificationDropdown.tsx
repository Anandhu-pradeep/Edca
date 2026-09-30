import React, { useState, useEffect, useRef } from 'react';
import { axiosInstance } from '@/lib/axios';
import { Bell, Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) fetchNotifications();
        }}
        className="w-8 h-8 rounded-[10px] liquid-glass-subtle flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors relative cursor-pointer shadow-sm"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-[1.5px] border-card"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-border/50 bg-secondary/20 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={cn(
                    "p-3 border-b border-border/30 last:border-0 hover:bg-secondary/40 transition-colors cursor-pointer",
                    !notif.isRead ? "bg-primary/5" : ""
                  )}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm truncate", !notif.isRead ? "font-semibold text-foreground" : "text-foreground/80")}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notif.message}
                      </p>
                      
                      {/* Action buttons for specific notification types */}
                      {notif.type === 'ORG_INVITE' && !notif.isRead && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axiosInstance.post(`/organizations/invitations/${notif.relatedId}/accept`);
                                await axiosInstance.put(`/notifications/${notif.id}/read`);
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                // Automatically refresh page to apply new roles
                                window.location.reload();
                              } catch (err: any) {
                                console.error('Failed to accept invitation', err);
                                if (err?.response?.status === 400) {
                                  // Likely already processed, dismiss it
                                  try {
                                    await axiosInstance.put(`/notifications/${notif.id}/read`);
                                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                  } catch (e) {}
                                }
                              }
                            }}
                            className="px-3 py-1 bg-primary text-primary-foreground rounded text-[11px] font-medium hover:bg-primary/90 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axiosInstance.post(`/organizations/invitations/${notif.relatedId}/reject`);
                                await axiosInstance.put(`/notifications/${notif.id}/read`);
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                              } catch (err: any) {
                                console.error('Failed to reject invitation', err);
                                if (err?.response?.status === 400) {
                                  try {
                                    await axiosInstance.put(`/notifications/${notif.id}/read`);
                                    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                  } catch (e) {}
                                }
                              }
                            }}
                            className="px-3 py-1 bg-destructive/10 text-destructive rounded text-[11px] font-medium hover:bg-destructive/20 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Action buttons for organization deletion requests */}
                      {notif.type === 'INFO' && notif.title === 'Organization Deletion Request' && !notif.isRead && (
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!notif.relatedId) return;
                              try {
                                await axiosInstance.delete(`/admin/organizations/${notif.relatedId}`);
                                await axiosInstance.put(`/notifications/${notif.id}/read`);
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                                window.location.reload();
                              } catch (err) {
                                console.error('Failed to approve deletion', err);
                              }
                            }}
                            className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-[11px] font-medium hover:bg-destructive/90 transition-colors"
                          >
                            Approve Deletion
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await axiosInstance.put(`/notifications/${notif.id}/read`);
                                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                              } catch (err) {
                                console.error('Failed to reject deletion request', err);
                              }
                            }}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-[11px] font-medium hover:bg-secondary/80 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notif.isRead && notif.type !== 'ORG_INVITE' && (
                      <button 
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="p-1 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
