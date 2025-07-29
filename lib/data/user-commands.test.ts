import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  updateUserRole,
  banUserAccount,
  unbanUserAccount,
  triggerPasswordReset,
} from './user-commands';
import { Role } from '@/lib/types/role';
import type { CreateUserData, UpdateUserData, AppUser } from '@/lib/better-auth-helpers/types';

// Mock the better-auth helpers
vi.mock('@/lib/better-auth-helpers/user-commands-helpers', () => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  setUserRole: vi.fn(),
  banUser: vi.fn(),
  unbanUser: vi.fn(),
  requestPasswordReset: vi.fn(),
}));

import {
  createUser as createUserHelper,
  updateUser as updateUserHelper,
  deleteUser as deleteUserHelper,
  setUserRole,
  banUser,
  unbanUser,
  requestPasswordReset,
} from '@/lib/better-auth-helpers/user-commands-helpers';

import { getUserById } from './user-queries';

vi.mock('./user-queries', () => ({
  getUserById: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn(() => new Headers()),
}));

describe('User Commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {


    it('should handle errors and throw meaningful message', async () => {
      const userData: CreateUserData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: Role.staff,
        defaultBranchId: 'branch-1',
      };

      vi.mocked(createUserHelper).mockRejectedValue(new Error('Database error'));

      await expect(createUser(userData)).rejects.toThrow('Failed to create user. Please try again.');
    });
  });

  describe('updateUser', () => {


    it('should handle errors and throw meaningful message', async () => {
      const userId = 'user-1';
      const userData: UpdateUserData = { name: 'Jane Doe', role: Role.manager };

      vi.mocked(updateUserHelper).mockRejectedValue(new Error('Update failed'));

      await expect(updateUser(userId, userData)).rejects.toThrow('Failed to update user. Please try again.');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = 'user-1';
      vi.mocked(deleteUserHelper).mockResolvedValue(undefined);

      const result = await deleteUser(userId);

      expect(deleteUserHelper).toHaveBeenCalledWith(userId, expect.any(Object));
      expect(result).toEqual({
        success: true,
        message: 'User deleted successfully.',
      });
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-1';
      vi.mocked(deleteUserHelper).mockRejectedValue(new Error('Delete failed'));

      const result = await deleteUser(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete user. Please try again.',
      });
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate user successfully', async () => {
      const userId = 'user-1';
      vi.mocked(unbanUser).mockResolvedValue({} as any);

      const result = await reactivateUser(userId);

      expect(unbanUser).toHaveBeenCalledWith(userId, expect.any(Object));
      expect(result).toEqual({
        success: true,
        message: 'User reactivated successfully.',
      });
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-1';
      vi.mocked(unbanUser).mockRejectedValue(new Error('Reactivate failed'));

      const result = await reactivateUser(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to reactivate user. Please try again.',
      });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const userId = 'user-1';
      const role = Role.admin;
      const mockUser: AppUser = { id: userId, role };

      vi.mocked(setUserRole).mockResolvedValue(mockUser as any);

      const result = await updateUserRole(userId, role);

      expect(setUserRole).toHaveBeenCalledWith(userId, role, expect.any(Object));
      expect(result).toEqual(mockUser);
    });

    it('should handle errors and throw meaningful message', async () => {
      const userId = 'user-1';
      const role = Role.admin;

      vi.mocked(setUserRole).mockRejectedValue(new Error('Role update failed'));

      await expect(updateUserRole(userId, role)).rejects.toThrow('Failed to update user role. Please try again.');
    });
  });

  describe('banUserAccount', () => {


    it('should handle errors gracefully', async () => {
      const userId = 'user-1';
      const reason = 'Violation of terms';
      vi.mocked(banUser).mockRejectedValue(new Error('Ban failed'));

      const result = await banUserAccount(userId, reason);

      expect(result).toEqual({
        success: false,
        message: 'Failed to ban user. Please try again.',
      });
    });
  });

  describe('unbanUserAccount', () => {
    it('should unban user successfully', async () => {
      const userId = 'user-1';
      vi.mocked(unbanUser).mockResolvedValue({} as any);

      const result = await unbanUserAccount(userId);

      expect(unbanUser).toHaveBeenCalledWith(userId, expect.any(Object));
      expect(result).toEqual({
        success: true,
        message: 'User unbanned successfully.',
      });
    });

    it('should handle errors gracefully', async () => {
      const userId = 'user-1';
      vi.mocked(unbanUser).mockRejectedValue(new Error('Unban failed'));

      const result = await unbanUserAccount(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to unban user. Please try again.',
      });
    });
  });

  describe('triggerPasswordReset', () => {




    it('should handle errors gracefully', async () => {
      const userId = 'user-1';
      vi.mocked(getUserById).mockRejectedValue(new Error('Database error'));

      const result = await triggerPasswordReset(userId);

      expect(result).toEqual({
        success: false,
        message: 'Failed to send password reset email. Please try again.',
      });
    });
  });
});
