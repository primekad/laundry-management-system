'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createUser, updateUser, type State } from '@/app/(core-app)/admin/users/actions';
import { CreateUserSchema, UpdateUserSchema } from './user-action-helpers';
import { useServerActionForm } from '@/hooks/use-server-action-form';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/definitions';
import type { Branch } from '@prisma/client';
import Link from 'next/link';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { useState, useMemo, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { FormFieldError } from '@/components/ui/form-field-error';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Role } from '@/lib/types/role';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UserFormProps {
  user?: User;
  branches: Branch[];
  intent: 'create' | 'edit';
}

type UserFormData = z.infer<typeof CreateUserSchema> | z.infer<typeof UpdateUserSchema>;

export function UserForm({ user, branches, intent }: UserFormProps) {
  const isEditMode = intent === 'edit';
  const initialState: State = { message: null, errors: {}, success: false };
  const router = useRouter();
  
  // Parse user name for edit mode
  const [firstName, surname] = useMemo(() => {
    if (isEditMode && user?.name) {
      const parts = user.name.split(' ');
      const lastName = parts.pop() || '';
      const firstName = parts.join(' ');
      return [firstName, lastName];
    }
    return ['', ''];
  }, [user, isEditMode]);

  const action = isEditMode ? updateUser.bind(null, user!.id) : createUser;
  const schema = isEditMode ? UpdateUserSchema : CreateUserSchema;
  
  const defaultValues = {
    firstName: firstName || '',
    surname: surname || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    role: (user?.role as Role) || Role.staff,
    defaultBranchId: user?.defaultBranchId || '',
    secondaryBranchIds: user?.assignedBranches?.map(b => b.id).join(',') || '',
    ...(isEditMode ? { isActive: user?.isActive ?? true } : { password: '' }),
  };

  const { form, state, isPending, onSubmit, getFieldError } = useServerActionForm<UserFormData>({
    action,
    initialState,
    formOptions: {
      resolver: zodResolver(schema),
      defaultValues,
      mode: 'onTouched',
    },
  });

  const branchOptions: Option[] = useMemo(() => 
    branches.map((branch) => ({ value: branch.id, label: branch.name })), 
    [branches]
  );

  const initialSelectedBranches = useMemo(() => {
    if (isEditMode && user?.assignedBranches) {
      return user.assignedBranches.map(b => ({ value: b.id, label: b.name }));
    }
    return [];
  }, [user, isEditMode]);

  const [selectedBranches, setSelectedBranches] = useState<Option[]>(initialSelectedBranches);

  // Update form values when selected branches change
  useEffect(() => {
    form.setValue('secondaryBranchIds', selectedBranches.map(b => b.value).join(','));
    
    // Validate branches
    if (selectedBranches.length === 0) {
      form.setError('secondaryBranchIds', {
        type: 'manual',
        message: 'At least one branch must be assigned to the user.'
      });
    } else {
      form.clearErrors('secondaryBranchIds');
    }
    
    // Validate default branch is within selected branches
    const currentDefaultBranch = form.getValues('defaultBranchId');
    if (currentDefaultBranch && !selectedBranches.some(branch => branch.value === currentDefaultBranch)) {
      form.setError('defaultBranchId', {
        type: 'manual',
        message: 'Default branch must be one of the assigned branches.'
      });
    } else if (currentDefaultBranch) {
      form.clearErrors('defaultBranchId');
    }
  }, [selectedBranches, form]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit User' : 'Create User'}</CardTitle>
            <CardDescription>
              {isEditMode ? 'Update the details for this user.' : 'Enter the details for the new user.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {/* Display form errors */}
            {state.errors?.form && state.errors.form.map((formError: string) => (
              <Alert key={formError} variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            ))}
            {state.message && !state.success && !state.errors?.form && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
            {state.message && state.success && (
              <Alert variant="default" className="mb-6 border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{state.message}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => {
                  const firstNameError = getFieldError("firstName");
                  return (
                    <FormItem>
                      <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          aria-describedby={firstNameError.hasError ? "firstName-error" : undefined}
                        />
                      </FormControl>
                      <FormFieldError
                        id="firstName-error"
                        clientError={firstNameError.clientError}
                        serverErrors={firstNameError.serverErrors}
                      />
                    </FormItem>
                  );
                }}
              />

              {/* Surname */}
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => {
                  const surnameError = getFieldError("surname");
                  return (
                    <FormItem>
                      <FormLabel>Surname <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          aria-describedby={surnameError.hasError ? "surname-error" : undefined}
                        />
                      </FormControl>
                      <FormFieldError
                        id="surname-error"
                        clientError={surnameError.clientError}
                        serverErrors={surnameError.serverErrors}
                      />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => {
                const emailError = getFieldError("email");
                return (
                  <FormItem>
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        {...field} 
                        aria-describedby={emailError.hasError ? "email-error" : undefined}
                      />
                    </FormControl>
                    <FormFieldError
                      id="email-error"
                      clientError={emailError.clientError}
                      serverErrors={emailError.serverErrors}
                    />
                  </FormItem>
                );
              }}
            />
            
            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => {
                const phoneNumberError = getFieldError("phoneNumber");
                return (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        {...field}
                        value={field.value || ''}
                        aria-describedby={phoneNumberError.hasError ? "phoneNumber-error" : undefined}
                      />
                    </FormControl>
                    <FormFieldError
                      id="phoneNumber-error"
                      clientError={phoneNumberError.clientError}
                      serverErrors={phoneNumberError.serverErrors}
                    />
                  </FormItem>
                );
              }}
            />

            {!isEditMode && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Password:</strong> A secure password will be generated automatically. 
                  The user will receive an email with instructions to set their own password.
                </p>
              </div>
            )}

            {/* Assigned Branches */}
            <div className="grid gap-2">
              <Label htmlFor="secondaryBranches">Assigned Branches <span className="text-red-500">*</span></Label>
              <p className="text-sm text-muted-foreground mb-2">
                Select all branches this user will have access to. If only one branch is selected, it will automatically become the default branch.
              </p>
              <MultiSelect
                options={branchOptions}
                selected={selectedBranches}
                onChange={setSelectedBranches}
                className="w-full"
                placeholder="Select at least one branch..."
              />
              <input type="hidden" name="secondaryBranchIds" value={selectedBranches.map(b => b.value).join(',')} />
              {(() => {
                const secondaryBranchIdsError = getFieldError("secondaryBranchIds");
                return (
                  <FormFieldError
                    id="secondaryBranchIds-error"
                    clientError={secondaryBranchIdsError.clientError}
                    serverErrors={secondaryBranchIdsError.serverErrors}
                  />
                );
              })()}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => {
                  const roleError = getFieldError("role");
                  return (
                    <FormItem>
                      <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-describedby={roleError.hasError ? "role-error" : undefined}>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormFieldError
                        id="role-error"
                        clientError={roleError.clientError}
                        serverErrors={roleError.serverErrors}
                      />
                    </FormItem>
                  );
                }}
              />

              {/* Default Branch */}
              <FormField
                control={form.control}
                name="defaultBranchId"
                render={({ field }) => {
                  const defaultBranchIdError = getFieldError("defaultBranchId");
                  return (
                    <FormItem>
                      <FormLabel>Default Branch <span className="text-red-500">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger aria-describedby={defaultBranchIdError.hasError ? "defaultBranchId-error" : undefined}>
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedBranches.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormFieldError
                        id="defaultBranchId-error"
                        clientError={defaultBranchIdError.clientError}
                        serverErrors={defaultBranchIdError.serverErrors}
                      />
                    </FormItem>
                  );
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update User' : 'Create User'
              )}
            </Button>
            
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
