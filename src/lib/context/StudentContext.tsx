'use client'

import { createContext, useContext } from 'react'
import type { EstudianteData } from '@/types/api'

interface StudentContextValue {
  student: EstudianteData | null
}

export const StudentContext = createContext<StudentContextValue>({ student: null })

export function useStudent() {
  return useContext(StudentContext)
}
