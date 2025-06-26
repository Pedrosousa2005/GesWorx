'use client';

import { Button } from '@/components/ui/button';
import { Menu, Bell, Search, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { DashboardView } from './Dashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  user: User | null;
  setSidebarOpen: (open: boolean) => void;
  currentView: DashboardView;
}

export function Header({ user, setSidebarOpen, currentView }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const viewTitles: Record<DashboardView, string> = {
    overview: t('dashboard.overview'),
    users: t('dashboard.userManagement'),
    vans: t('dashboard.vanManagement'),
    materials: t('dashboard.materialManagement'),
    calendar: t('dashboard.taskCalendar'),
    scanner: t('dashboard.qrScanner'),
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 glass-panel">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{viewTitles[currentView]}</h1>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search') + '...'}
              className="pl-10 w-64 glass-panel"
            />
          </div>
        </div>

        {/* Language Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              {language === 'en' ? 'EN' : 'PT'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')}>
              English
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('pt')}>
              Português
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-xs">
              3
            </Badge>
          </Button>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
            {user?.avatar || user?.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}