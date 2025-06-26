'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardOverview } from './DashboardOverview';
import { UserManagement } from '../users/UserManagement';
import { VanManagement } from '../vans/VanManagement';
import { MaterialManagement } from '../materials/MaterialManagement';
import { CalendarView } from '../calendar/CalendarView';
import { QRScanner } from '../qr/QRScanner';
import { VanLoadingInterface } from '../van-loading/VanLoadingInterface';

export type DashboardView = 'overview' | 'users' | 'vans' | 'materials' | 'calendar' | 'scanner' | 'van-loading';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'vans':
        return <VanManagement />;
      case 'materials':
        return <MaterialManagement />;
      case 'calendar':
        return <CalendarView />;
      case 'scanner':
        return <QRScanner />;
      case 'van-loading':
        return <VanLoadingInterface />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="lg:pl-72">
        <Header 
          user={user}
          setSidebarOpen={setSidebarOpen}
          currentView={currentView}
        />
        
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}