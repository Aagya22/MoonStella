import Navbar from '@/app/components/shared/navbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}