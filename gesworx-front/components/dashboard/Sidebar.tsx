'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Package, 
  Calendar, 
  QrCode,
  X,
  LogOut,
  LoaderIcon
} from 'lucide-react';
import { DashboardView } from './Dashboard';

interface SidebarProps {
  currentView: DashboardView;
  setCurrentView: (view: DashboardView) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ currentView, setCurrentView, isOpen, setIsOpen }: SidebarProps) {
  const { user, logout, hasPermission } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    {
      id: 'overview' as DashboardView,
      label: t('dashboard.overview'),
      icon: LayoutDashboard,
      permission: null,
    },
    {
      id: 'users' as DashboardView,
      label: t('dashboard.userManagement'),
      icon: Users,
      permission: 'manage_users',
    },
    {
      id: 'vans' as DashboardView,
      label: t('dashboard.vanManagement'),
      icon: Truck,
      permission: 'manage_vans',
    },
    {
      id: 'materials' as DashboardView,
      label: t('dashboard.materialManagement'),
      icon: Package,
      permission: 'manage_materials',
    },
    {
      id: 'calendar' as DashboardView,
      label: t('dashboard.taskCalendar'),
      icon: Calendar,
      permission: user?.role === 'user' ? 'view_assigned_tasks' : 'manage_tasks',
    },
    {
      id: 'van-loading' as DashboardView,
      label: t('dashboard.vanLoading'),
      icon: LoaderIcon,
      permission: 'load_vans',
    },
    {
      id: 'scanner' as DashboardView,
      label: t('dashboard.qrScanner'),
      icon: QrCode,
      permission: 'scan_qr',
    },
  ].filter(item => !item.permission || hasPermission(item.permission));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col glass-panel border-r">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">GESWORX</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                {user?.avatar || user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role === 'superadmin' ? t('roles.superAdmin') : 
                   user?.role === 'admin' ? t('roles.admin') : t('roles.user')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    isActive && "bg-primary/10 text-primary border border-primary/20"
                  )}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {t('auth.signOut')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}