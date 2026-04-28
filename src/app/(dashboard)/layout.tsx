import '@/styles/sii-design.css'
import StudentProvider from '@/components/layout/StudentProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sii-root">
      <StudentProvider>{children}</StudentProvider>
    </div>
  )
}
