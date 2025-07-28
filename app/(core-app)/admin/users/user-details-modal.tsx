'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const role = user.role as 'admin' | 'manager' | 'staff';
  const roleStyles = {
    admin: 'bg-red-100 text-red-800 hover:bg-red-100',
    manager: 'bg-blue-800 text-blue-100 hover:bg-blue-800',
    staff: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Full details for {user.name}.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge className={`capitalize ${roleStyles[role]}`}>{role}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={user.isActive ? 'default' : 'destructive'}>
                {user.isActive ? 'Active' : 'Blocked'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{user.phoneNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Default Branch</span>
              <span>{user.defaultBranch?.name || 'N/A'}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-muted-foreground">Assigned Branches</h4>
            <ul className="list-disc pl-5 mt-1 text-sm">
              {user.assignedBranches?.map(branch => (
                branch && <li key={branch.id}>{branch.name}</li>
              ))}
              {(!user.assignedBranches || user.assignedBranches.length === 0) && <li className="text-muted-foreground">No branches assigned.</li>}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
