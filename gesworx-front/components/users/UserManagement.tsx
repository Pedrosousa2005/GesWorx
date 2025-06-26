'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Shield,
  ShieldCheck,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { createUserApi, getUsers } from './data/request';
import { set } from 'date-fns';


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar: string;
  assignedVan?: string;
  createdAt: Date;
}


export function UserManagement() {
  const {  vans, createUser, updateUser, deleteUser } = useData();
  const [users, setUsers] = useState<User[]>([]);

  const { t } = useLanguage();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as UserRole,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      isActive: true,
    });
  };

  useEffect(() => {
     const loadUsers = async () => {
      try {
         const response = await getUsers();
          if (response) {

          
            console.log('Users loaded:', response);
          }

          setUsers(response.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            avatar: user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            assignedVan: user.assignedVan,
            createdAt: new Date(user.createdAt),
          }))); 
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    };

    loadUsers();
  }, []);


  const handleCreate = async () => {
  if (!formData.name || !formData.email) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    const user = {
      name: formData.name,
      email: formData.email,
      password: 'defaultPassword', 
      role: formData.role,
    };

    const response = await createUserApi(user);

    if (response) {
      toast.success(t('users.userCreated'));
      setIsCreateDialogOpen(false);
      resetForm();
    } else {
      toast.error(t('users.errorCreatingUser'));
    }
  } catch (error) {
    console.error(error);
    toast.error(t('users.errorCreatingUser'));
  }
};


  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    updateUser(editingUser.id, {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      isActive: formData.isActive,
      avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
    });

    toast.success(t('users.userUpdated'));
    setEditingUser(null);
    resetForm();
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId);
    toast.success(t('users.userDeleted'));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return <ShieldCheck className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'admin':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('users.title')}</h2>
          <p className="text-muted-foreground">{t('users.subtitle')}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t('users.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t('users.createUser')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('common.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="role">{t('common.role')}</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                >
                  <option value="user">{t('roles.user')}</option>
                  <option value="admin">{t('roles.admin')}</option>
                  <option value="superadmin">{t('roles.superAdmin')}</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreate}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.totalUsers')}</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.activeUsers')}</p>
                <p className="text-2xl font-bold">{users.filter(u => u.isActive).length}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('users.assignedVans')}</p>
                <p className="text-2xl font-bold">{users.filter(u => u.assignedVan).length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{t('users.allUsers')}</CardTitle>
          <CardDescription>{t('users.manageAccounts')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user.avatar || user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name}</h3>
                      {!user.isActive && (
                        <Badge variant="secondary" className="text-xs">{t('users.inactive')}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.assignedVan && (
                      <p className="text-xs text-muted-foreground">Van: {user.assignedVan}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="gap-1">
                      {getRoleIcon(user.role)}
                      {user.role === 'superadmin' ? t('roles.superAdmin') : 
                       user.role === 'admin' ? t('roles.admin') : t('roles.user')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('users.lastLogin')}: {formatLastLogin(user.createdAt)}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2" onClick={() => handleEdit(user)}>
                        <Edit className="h-4 w-4" />
                        {t('users.editUser')}
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem className="gap-2 text-destructive" onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="h-4 w-4" />
                            {t('users.deleteUser')}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card">
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('users.confirmDelete')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('users.deleteWarning')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(user.id)}>
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{t('users.editUserTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{t('common.name')}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">{t('common.email')}</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-panel"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">{t('common.role')}</Label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full p-2 rounded-md bg-background border border-input glass-panel"
                >
                  <option value="user">{t('roles.user')}</option>
                  <option value="admin">{t('roles.admin')}</option>
                  <option value="superadmin">{t('roles.superAdmin')}</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleUpdate}>
                  {t('common.save')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}