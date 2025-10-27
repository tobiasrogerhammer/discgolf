import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Welcome Back
          </h1>
          <p className="mt-2 text-[var(--muted-foreground)]">
            Sign in to your account to continue
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[var(--primary)] hover:bg-[var(--primary)]/90',
              card: 'shadow-lg',
            }
          }}
        />
      </div>
    </div>
  )
}


