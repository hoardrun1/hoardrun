export const responsiveStyles = {
  // Container widths - Mobile-first with better small screen support
  container: 'w-full max-w-[98%] sm:max-w-[95%] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1140px] mx-auto px-2 sm:px-4 md:px-6',
  
  // Typography - Mobile-first responsive design with much smaller mobile fonts
  heading1: 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold',
  heading2: 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold',
  heading3: 'text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-medium',
  bodyText: 'text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base',
  
  // Spacing - Tighter mobile spacing
  section: 'py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12',
  sectionInner: 'space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6',

  // Card layouts - Better mobile grid
  cardGrid: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6',
  card: 'p-2 sm:p-3 md:p-4 lg:p-6',

  // Form elements - Smaller mobile forms
  formGroup: 'space-y-1 sm:space-y-2 md:space-y-3',
  input: 'w-full px-2 py-1.5 sm:px-3 sm:py-2 md:py-3 text-xs sm:text-sm',
  button: 'px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 text-xs sm:text-sm md:text-base',
  
  // Navigation - Mobile-first navigation
  nav: 'flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2 md:space-x-4 lg:space-x-6',

  // Flexbox utilities
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',

  // Responsive padding and margin - Much smaller mobile spacing
  padding: 'p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8',
  margin: 'm-2 sm:m-3 md:m-4 lg:m-6 xl:m-8',
}; 