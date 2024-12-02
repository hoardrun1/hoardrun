'use client'

interface LayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function LayoutWrapper({ children, className = '' }: LayoutWrapperProps) {
  return (
    <div className={`min-h-screen w-full ${className}`}>
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
} 