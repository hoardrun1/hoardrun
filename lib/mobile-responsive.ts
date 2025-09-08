// Mobile-first responsive design utilities for HoardRun

export const mobileStyles = {
  // Container and layout
  container: 'w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8',
  pageContainer: 'min-h-screen bg-background overflow-x-hidden',
  contentWrapper: 'w-full max-w-full',
  
  // Dashboard specific
  dashboardContainer: 'min-h-screen bg-background pt-14 sm:pt-16 pb-20 sm:pb-6 px-3 sm:px-4 md:px-6',
  dashboardContent: 'max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6',
  
  // Typography - Mobile-first approach
  heading: {
    h1: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold',
    h2: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
    h3: 'text-sm sm:text-base md:text-lg lg:text-xl font-medium',
    h4: 'text-sm sm:text-sm md:text-base lg:text-lg font-medium',
  },
  
  text: {
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
    caption: 'text-xs',
    muted: 'text-xs sm:text-sm text-muted-foreground',
  },
  
  // Spacing
  spacing: {
    section: 'py-4 sm:py-6 md:py-8',
    card: 'p-3 sm:p-4 md:p-6',
    cardSmall: 'p-2 sm:p-3 md:p-4',
    gap: 'gap-3 sm:gap-4 md:gap-6',
    gapSmall: 'gap-2 sm:gap-3 md:gap-4',
  },
  
  // Grid layouts
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    cards: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6',
    stats: 'grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4',
    twoCol: 'grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6',
  },
  
  // Buttons
  button: {
    default: 'h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base',
    small: 'h-8 px-2 sm:px-3 text-xs sm:text-sm',
    large: 'h-10 sm:h-11 px-4 sm:px-6 text-sm sm:text-base',
    icon: 'h-8 w-8 sm:h-9 sm:w-9',
    iconSmall: 'h-6 w-6 sm:h-8 sm:w-8',
  },
  
  // Form elements
  form: {
    input: 'h-9 sm:h-10 px-3 text-sm sm:text-base',
    inputSmall: 'h-8 px-2 text-xs sm:text-sm',
    label: 'text-sm sm:text-base font-medium',
    group: 'space-y-2 sm:space-y-3',
  },
  
  // Cards and surfaces
  card: {
    default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    interactive: 'rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow',
    padding: 'p-3 sm:p-4 md:p-6',
    paddingSmall: 'p-2 sm:p-3 md:p-4',
  },
  
  // Navigation
  nav: {
    mobile: 'fixed bottom-0 left-0 right-0 z-50 bg-background border-t',
    desktop: 'hidden lg:flex',
    item: 'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 text-sm sm:text-base',
  },
  
  // Modal and overlay
  modal: {
    overlay: 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
    content: 'fixed left-[50%] top-[50%] z-50 w-[95%] max-w-lg translate-x-[-50%] translate-y-[-50%] sm:w-full',
    padding: 'p-4 sm:p-6',
  },
  
  // Sidebar
  sidebar: {
    mobile: 'fixed left-0 top-0 h-full w-[280px] sm:w-[320px] z-50 lg:hidden overflow-y-auto',
    desktop: 'hidden lg:flex lg:w-[360px] lg:flex-col',
    overlay: 'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden',
  },
  
  // Touch targets (minimum 44px for mobile)
  touch: {
    target: 'min-h-[44px] min-w-[44px]',
    button: 'h-11 px-4 sm:h-10 sm:px-4',
    icon: 'h-11 w-11 sm:h-10 sm:w-10',
  },
  
  // Safe areas for mobile devices
  safe: {
    top: 'pt-safe-top',
    bottom: 'pb-safe-bottom',
    left: 'pl-safe-left',
    right: 'pr-safe-right',
  },
};

// Responsive breakpoint utilities
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Mobile detection utility
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

// Touch device detection
export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Viewport height utility for mobile browsers
export const getViewportHeight = () => {
  if (typeof window === 'undefined') return '100vh';
  return `${window.innerHeight}px`;
};

// Safe area utilities for devices with notches
export const safeAreaStyles = {
  paddingTop: 'env(safe-area-inset-top)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
  paddingRight: 'env(safe-area-inset-right)',
};

// Common mobile patterns
export const mobilePatterns = {
  // Full-width button at bottom of screen
  bottomButton: 'fixed bottom-0 left-0 right-0 p-4 bg-background border-t',
  
  // Sticky header
  stickyHeader: 'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b',
  
  // Mobile-friendly list item
  listItem: 'flex items-center justify-between p-4 border-b last:border-b-0 min-h-[60px]',
  
  // Mobile card with proper touch targets
  touchCard: 'p-4 rounded-lg border bg-card shadow-sm active:scale-[0.98] transition-transform',
  
  // Mobile navigation item
  navItem: 'flex flex-col items-center justify-center p-2 min-h-[60px] text-xs',
  
  // Mobile form layout
  mobileForm: 'space-y-4 p-4',
  
  // Mobile-friendly table alternative
  mobileTable: 'space-y-2',
  mobileTableRow: 'flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-card rounded-lg border',
};

// Animation utilities for mobile
export const mobileAnimations = {
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 500 }
  },
  
  slideInFromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'spring', damping: 25, stiffness: 500 }
  },
  
  fadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  },
  
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: { type: 'spring', damping: 20, stiffness: 300 }
  }
};

export default mobileStyles;
