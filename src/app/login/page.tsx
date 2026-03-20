import { LoginForm } from './LoginForm'

export const metadata = {
  title: "Acesso | Shop Heroes Planner"
}

export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string }> 
}) {
  const resolvedParams = await searchParams;
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-6">
      <LoginForm message={resolvedParams?.message} />
    </div>
  )
}
