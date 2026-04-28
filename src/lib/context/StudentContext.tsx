'use client'

import { createContext, useContext } from 'react'
import type { EstudianteData } from '@/types/api'

interface StudentContextValue {
  student: EstudianteData | null
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const StudentContext = createContext<StudentContextValue>({
  student: null,
  searchQuery: '',
  setSearchQuery: () => {},
})

export function useStudent() {
  return useContext(StudentContext)
}
