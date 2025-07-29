'use client';

import { useActionState } from 'react';
import { createBranch, updateBranch, type State } from '@/app/(core-app)/admin/branches/actions';
import { Button } from '@/components/ui/button';
import type { Branch } from '@prisma/client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BranchFormProps {
  branch?: Branch;
  intent: 'create' | 'edit';
}

export function BranchForm({ branch, intent }: BranchFormProps) {
  const isEditMode = intent === 'edit';
  const initialState: State = { message: '', errors: {} };

  const action = isEditMode ? updateBranch.bind(null, branch!.id) : createBranch;
  const [state, dispatch] = useActionState(action, initialState);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Branch' : 'Create Branch'}</CardTitle>
          <CardDescription>
            {isEditMode ? 'Update the details for this branch.' : 'Enter the details for the new branch.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={branch?.name ?? ''} />
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={branch?.address ?? ''} />
            <div id="address-error" aria-live="polite" aria-atomic="true">
              {state.errors?.address?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>
          
          {/* Phone Number */}
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={branch?.phone ?? ''} />
            <div id="phone-error" aria-live="polite" aria-atomic="true">
              {state.errors?.phone?.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>{error}</p>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/admin/branches">Cancel</Link>
          </Button>
          <Button type="submit">{isEditMode ? 'Update Branch' : 'Create Branch'}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
