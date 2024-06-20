"use client"

import { PropsWithChildren } from 'react'
import { useFormStatus } from 'react-dom'
 
export function SubmitButton({children}: PropsWithChildren) {
  const { pending } = useFormStatus()
 
  return (
    <button type="submit" disabled={pending}>
      {children}
    </button>
  )
}