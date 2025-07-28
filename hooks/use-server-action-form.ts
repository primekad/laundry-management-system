import { useActionState, useTransition, useCallback } from "react"
import { useForm, UseFormProps, FieldValues, Path } from "react-hook-form"

type ServerActionState = {
  message?: string | null
  errors?: Record<string, string[]>
  success?: boolean
  [key: string]: any
}

type UseServerActionFormProps<T extends FieldValues> = {
  action: (prevState: ServerActionState, formData: FormData) => Promise<ServerActionState>
  initialState: ServerActionState
  formOptions: UseFormProps<T>
}

export function useServerActionForm<T extends FieldValues>({
  action,
  initialState,
  formOptions
}: UseServerActionFormProps<T>) {
  const [state, formAction, isPending] = useActionState(action, initialState)
  const [isTransitioning, startTransition] = useTransition()
  
  const form = useForm<T>(formOptions)
  
  const onSubmit = useCallback((data: T) => {
    console.log('🚀 useServerActionForm onSubmit called with data:', data);
    const formData = new FormData()
    
    // Convert form data to FormData object
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'boolean') {
          // Always append boolean values as 'true' or 'false' strings
          // The server-side parsing will handle the conversion back to boolean
          formData.append(key, value ? 'true' : 'false')
        } else {
          formData.append(key, value as string)
        }
      }
    })
    
    console.log('📋 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    console.log('🔄 Starting transition and calling formAction');
    startTransition(() => {
      formAction(formData)
    })
  }, [formAction])
  
  // Helper function to get combined errors for a field
  const getFieldError = useCallback((fieldName: Path<T>) => {
    const clientError = form.formState.errors[fieldName]
    const serverError = state.errors?.[fieldName]
    
    return {
      hasError: !!(clientError || serverError),
      clientError: clientError?.message,
      serverErrors: serverError || []
    }
  }, [form.formState.errors, state.errors])
  
  return {
    form,
    state,
    isPending: isPending || isTransitioning,
    onSubmit: form.handleSubmit(onSubmit),
    getFieldError
  }
}
