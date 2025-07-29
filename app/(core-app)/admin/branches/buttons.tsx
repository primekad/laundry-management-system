'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteBranch } from '@/app/(core-app)/admin/branches/actions';
import { Button } from '@/components/ui/button';

export function CreateBranch() {
  return (
    <Button asChild>
      <Link href="/admin/branches/create" className="flex items-center gap-2">
        <PlusIcon className="h-5 md:mr-2" />
        <span className="hidden md:block">Create Branch</span>
      </Link>
    </Button>
  );
}

export function UpdateBranch({ id }: { id: string }) {
  return (
    <Link
      href={`/admin/branches/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteBranch({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBranch(id);
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
