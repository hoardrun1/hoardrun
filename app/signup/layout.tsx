import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - Your App Name',
  description: 'Create a new account to get started',
}

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}