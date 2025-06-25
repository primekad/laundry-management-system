'use client';

import {
  KeyIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  deleteUser,
  reactivateUser,
  triggerPasswordReset,
} from '@/lib/actions/users';
import { Button } from '@/components/ui/button';

export function CreateUser() {
  return (
    <Button asChild>
      <Link href="/admin/users/create" className="flex items-center gap-2">
        <PlusIcon className="h-5 md:mr-2" />
        <span className="hidden md:block">Create User</span>
      </Link>
    </Button>
  );
}

export function UpdateUser({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/users/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteUser({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUser(id);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <button
      className="rounded-md border p-2 hover:bg-gray-100"
      onClick={handleDelete}
      disabled={isPending}
    >
      <span className="sr-only">Delete</span>
      <TrashIcon className="w-5" />
    </button>
  );
}

export function TriggerPasswordReset({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    startTransition(async () => {
      const result = await triggerPasswordReset(id);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <button
      className="rounded-md border p-2 hover:bg-gray-100"
      onClick={handleReset}
      disabled={isPending}
    >
      <span className="sr-only">Trigger Password Reset</span>
      <KeyIcon className="w-5" />
    </button>
  );
}

export function ReactivateUser({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleReactivate = () => {
    startTransition(async () => {
      const result = await reactivateUser(id);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }
    });
  };

  return (
    <button
      className="rounded-md border p-2 hover:bg-gray-100"
      onClick={handleReactivate}
      disabled={isPending}
    >
      <span className="sr-only">Reactivate User</span>
      <UserPlusIcon className="w-5" />
    </button>
  );
}
