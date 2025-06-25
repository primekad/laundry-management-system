'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { LogOut } from 'lucide-react'

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/login')
            router.refresh()
          },
        },
      })
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/login')
    }
  }

  return (
    <Button 
      variant="ghost" 
      className={className}
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4"  />
      <span className="sr-only">Log out</span>
    </Button>
  )
}
