'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { FormEvent } from 'react';

interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
}

export function SearchInput({ placeholder = "Search users...", defaultValue = "" }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const term = formData.get('search') as string;
    
    const params = new URLSearchParams(searchParams);
    
    // Reset to page 1 when searching
    params.set('page', '1');
    
    if (term && term.trim()) {
      params.set('search', term.trim());
    } else {
      params.delete('search');
    }
    
    router.replace(`?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        name="search"
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </form>
  );
}
