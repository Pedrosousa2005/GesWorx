'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Truck, 
  Package, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock
} from 'lucide-react';

export function DashboardOverview() {
  const { user, hasPermission } = useAuth();

  const stats = [
    {
      title: 'Active Users',
      value: '12',
      change: '+2 this week',
      icon: Users,
      trend: 'up',
      show: hasPermission('manage_users'),
    },
    {
      title: 'Fleet Vehicles',
      value: '8',
      change: '2 in maintenance',
      icon: Truck,
      trend: 'stable',
      show: hasPermission('manage_vans'),
    },
    {
      title: 'Materials Tracked',
      value: '1,247',
      change: '+43 this week',
      icon: Package,
      trend: 'up',
      show: true,
    },
    {
      title: 'Tasks Today',
      value: '15',
      change: '8 completed',
      icon: Calendar,
      trend: 'up',
      show: true,
    },
  ].filter(stat => stat.show);

  const recentActivities = [
    {
      id: 1,
      action: 'Material ABC-001 loaded to van DEF-456',
      user: 'John Doe',
      time: '5 minutes ago',
      type: 'load',
    },
    {
      id: 2,
      action: 'New user Sarah Wilson added to system',
      user: 'Admin',
      time: '2 hours ago',
      type: 'user',
    },
    {
      id: 3,
      action: 'Van ABC-123 maintenance scheduled',
      user: 'Mike Johnson',
      time: '4 hours ago',
      type: 'maintenance',
    },
    {
      id: 4,
      action: 'QR code scanned for material XYZ-789',
      user: 'Lisa Brown',
      time: '6 hours ago',
      type: 'scan',
    },
  ];

  const vanStatus = [
    { license: 'ABC-123', status: 'active', load: 85, assignee: 'John Doe' },
    { license: 'DEF-456', status: 'active', load: 60, assignee: 'Sarah Wilson' },
    { license: 'GHI-789', status: 'maintenance', load: 0, assignee: null },
    { license: 'JKL-012', status: 'active', load: 92, assignee: 'Mike Johnson' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, {user?.name}!</h2>
            <p className="text-muted-foreground mt-1">
              Here's what's happening in your warehouse today.
            </p>
          </div>
          <div className="hidden md:block">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  ) : stat.trend === 'down' ? (
                    <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
                  ) : (
                    <Activity className="h-3 w-3 mr-1 text-blue-500" />
                  )}
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>by {activity.user}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Van Status */}
        {hasPermission('manage_vans') && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Fleet Status</CardTitle>
              <CardDescription>Current van locations and load status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {vanStatus.map((van, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{van.license}</div>
                    <Badge 
                      variant={van.status === 'active' ? 'default' : 'secondary'}
                      className={van.status === 'active' ? 'bg-green-500/20 text-green-300' : ''}
                    >
                      {van.status}
                    </Badge>
                  </div>
                  {van.status === 'active' && (
                    <>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Load capacity</span>
                        <span>{van.load}%</span>
                      </div>
                      <Progress value={van.load} className="h-2" />
                      {van.assignee && (
                        <p className="text-xs text-muted-foreground">
                          Assigned to: {van.assignee}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* User's Assigned Van (for regular users) */}
        {user?.role === 'user' && user.assignedVan && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Assigned Van</CardTitle>
              <CardDescription>Vehicle {user.assignedVan} details and materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">License Plate:</span>
                  <Badge variant="outline">{user.assignedVan}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Current Load:</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Loaded Materials:</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>• Power Tools (5 items)</div>
                    <div>• Safety Equipment (8 items)</div>
                    <div>• Electrical Components (12 items)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}