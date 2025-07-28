import { fetchUserById } from '@/lib/data/users';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, Phone, Calendar, Building, Shield } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ToastHandler } from '../toast-handler';

interface UserViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserViewPage({ params }: UserViewPageProps) {
  const { id } = await params;
  
  const user = await fetchUserById(id);
  
  if (!user) {
    notFound();
  }

  const getRoleBadgeStyle = (role: string) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800 hover:bg-red-100',
      manager: 'bg-blue-800 text-blue-100 hover:bg-blue-800',
      staff: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    };
    return roleStyles[role as keyof typeof roleStyles] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeStyle = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 hover:bg-green-100'
      : 'bg-red-100 text-red-800 hover:bg-red-100';
  };

  return (
    <div className="space-y-6">
      <ToastHandler />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Details</h1>
            <p className="text-slate-600 mt-1">View and manage user information</p>
          </div>
        </div>
        <Link href={`/admin/users/${id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </Link>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || ''} alt={user.name || 'User avatar'} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.name || 'N/A'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`capitalize ${getRoleBadgeStyle(user.role)}`}>
                  {user.role}
                </Badge>
                <Badge className={getStatusBadgeStyle(user.isActive)}>
                  {user.isActive ? 'Active' : 'Blocked'}
                </Badge>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{user.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm">{user.phoneNumber || 'N/A'}</p>
              </div>
            </div>
          </div>


        </CardContent>
      </Card>

      {/* Branch Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Branch Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Default Branch</label>
            <p className="text-sm mt-1">
              {user.defaultBranch?.name || 'No default branch assigned'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Assigned Branches</label>
            <div className="mt-1">
              {user.assignedBranches && user.assignedBranches.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.assignedBranches.map((branch) => (
                    <Badge key={branch.id} variant="outline" className="text-xs">
                      {branch.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No branches assigned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Account Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-sm mt-1">
              {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-sm mt-1">
              {user.updatedAt ? format(new Date(user.updatedAt), 'PPP') : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Login</label>
            <p className="text-sm mt-1">
              {/* This would come from session data if available */}
              N/A
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
