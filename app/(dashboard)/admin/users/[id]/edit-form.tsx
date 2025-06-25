'use client';

import { useFormState } from 'react-dom';
import { updateUser, type State } from '@/lib/actions/users';
import { Button } from '@/components/ui/button';
import type { Branch, User } from '@prisma/client';
import Link from 'next/link';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { useState } from 'react';

export function EditUserForm({ user, branches }: { user: User & { assignedBranches: Branch[] }; branches: Branch[] }) {
  const initialState = { message: '', errors: {} };
  
  const updateUserWithId = updateUser.bind(null, user.id);
  const [state, dispatch] = useFormState(updateUserWithId, initialState as State);
  const branchOptions: Option[] = branches.map((branch: Branch) => ({ value: branch.id, label: branch.name }));
  const [selectedBranches, setSelectedBranches] = useState<Option[]>(
    user.assignedBranches.map((branch: Branch) => ({ value: branch.id, label: branch.name }))
  );

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* First Name */}
        <div className="mb-4">
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={user.firstName ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="firstName-error"
          />
          <div id="firstName-error" aria-live="polite" aria-atomic="true">
            {state.errors?.firstName &&
              state.errors.firstName.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Surname */}
        <div className="mb-4">
          <label htmlFor="surname" className="mb-2 block text-sm font-medium">
            Surname
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            defaultValue={user.surname ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            aria-describedby="surname-error"
          />
           <div id="surname-error" aria-live="polite" aria-atomic="true">
            {state.errors?.surname &&
              state.errors.surname.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            readOnly
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="mb-2 block text-sm font-medium">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            defaultValue={user.phoneNumber ?? ''}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label htmlFor="role" className="mb-2 block text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={user.role}
            aria-describedby="role-error"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
           <div id="role-error" aria-live="polite" aria-atomic="true">
            {state.errors?.role &&
              state.errors.role.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Default Branch */}
        <div className="mb-4">
          <label htmlFor="defaultBranchId" className="mb-2 block text-sm font-medium">
            Default Branch
          </label>
          <select
            id="defaultBranchId"
            name="defaultBranchId"
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            defaultValue={user.defaultBranchId ?? ''}
            aria-describedby="defaultBranchId-error"
          >
            <option value="" disabled>
              Select a branch
            </option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          <div id="defaultBranchId-error" aria-live="polite" aria-atomic="true">
            {state.errors?.defaultBranchId &&
              state.errors.defaultBranchId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Secondary Branches */}
        <div className="mb-4">
          <label htmlFor="secondaryBranches" className="mb-2 block text-sm font-medium">
            Secondary Branches
          </label>
          <MultiSelect
            options={branchOptions}
            selected={selectedBranches}
            onChange={setSelectedBranches}
            className="w-full"
            placeholder="Select secondary branches..."
          />
          <input type="hidden" name="secondaryBranchIds" value={selectedBranches.map(b => b.value).join(',')} />
        </div>

         {/* Active Status */}
        <div className="mb-4">
            <label htmlFor="isActive" className="mb-2 block text-sm font-medium">
                Active Status
            </label>
            <input
                id="isActive"
                name="isActive"
                type="checkbox"
                defaultChecked={user.isActive}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
        </div>

      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/admin/users"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Update User</Button>
      </div>
    </form>
  );
}
