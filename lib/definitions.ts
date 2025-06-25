export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  defaultBranch: {
    name: string;
  } | null;
};
