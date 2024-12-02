interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = { default: 1, sm: 2, lg: 3 },
  className = '' 
}: ResponsiveGridProps) {
  const getGridCols = () => {
    return `grid grid-cols-${columns.default} sm:grid-cols-${columns.sm || columns.default} md:grid-cols-${columns.md || columns.sm || columns.default} lg:grid-cols-${columns.lg || columns.md || columns.sm || columns.default} xl:grid-cols-${columns.xl || columns.lg || columns.md || columns.sm || columns.default}`;
  };

  return (
    <div className={`${getGridCols()} gap-4 sm:gap-6 lg:gap-8 ${className}`}>
      {children}
    </div>
  );
} 