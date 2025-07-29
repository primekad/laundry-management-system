import { cn } from "@/lib/utils"

interface FormFieldErrorProps {
  id?: string
  clientError?: string
  serverErrors?: string[]
  className?: string
}

export function FormFieldError({ 
  id, 
  clientError, 
  serverErrors = [], 
  className 
}: FormFieldErrorProps) {
  const hasError = !!(clientError || serverErrors.length > 0)
  
  if (!hasError) return null
  
  return (
    <div 
      id={id} 
      aria-live="polite" 
      className={cn("text-xs text-red-500 mt-1", className)}
    >
      {serverErrors.map((error) => (
        <p key={error}>{error}</p>
      ))}
      {clientError && <p>{clientError}</p>}
    </div>
  )
}
