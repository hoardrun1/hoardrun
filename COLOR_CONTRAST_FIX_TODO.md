# Color Contrast Fix Implementation Plan

## Issues Identified
1. **Hard-coded color classes**: Components using `text-black`, `text-gray-400`, etc. that don't adapt to dark mode
2. **Inconsistent semantic color usage**: Mix of semantic and direct color values
3. **Missing dark mode overrides**: Colors that become invisible in dark mode
4. **Status color contrast issues**: Insufficient contrast in warning/success/error colors

## Implementation Steps

### Phase 1: Enhanced CSS Color System ✅
- [x] Improve CSS custom properties for better contrast
- [x] Add missing semantic color variables
- [x] Enhance dark mode color definitions
- [x] Add comprehensive dark mode overrides
- [x] Add input field and form element fixes
- [x] Add button, link, and icon color fixes

### Phase 2: Component Fixes ✅
- [x] Fix signin-page.tsx hard-coded colors
- [x] Fix investment components color issues
- [x] Fix auth-bypass-status.tsx contrast problems
- [x] Fix payment components color issues
- [x] Update other components with hard-coded colors

### Phase 3: Utility Enhancements ✅
- [x] Enhance color-utils.ts with validation functions
- [x] Add contrast checking utilities
- [x] Create semantic color mapping functions
- [x] Add helper functions for status colors
- [x] Add dark mode detection utilities

### Phase 4: Testing & Validation
- [ ] Test color contrast in both light and dark modes
- [ ] Validate WCAG AA compliance
- [ ] Create documentation for color usage

## Files Updated
- [x] hoardrun/app/globals.css
- [x] hoardrun/components/signin-page.tsx
- [x] hoardrun/components/investment/investment-card.tsx
- [x] hoardrun/components/investment/InvestmentAnalytics.tsx
- [x] hoardrun/components/auth-bypass-status.tsx
- [x] hoardrun/components/payments/MastercardPayment.tsx
- [x] hoardrun/lib/color-utils.ts

## Progress
- Phase 1: ✅ Complete
- Phase 2: ✅ Complete
- Phase 3: ✅ Complete
- Phase 4: In Progress

## Key Improvements Made

### CSS Fixes
- Added `!important` declarations to override hard-coded colors in dark mode
- Fixed `text-black` to use semantic colors in dark mode
- Enhanced input field contrast with proper background and border colors
- Improved placeholder text visibility
- Fixed status color combinations (success, warning, error)
- Added comprehensive icon and badge color fixes

### Component Fixes
- **signin-page.tsx**: Removed hard-coded `text-black` classes
- **investment-card.tsx**: Updated risk and return color functions to use semantic colors
- **InvestmentAnalytics.tsx**: Replaced `text-content-tertiary` with `text-muted-foreground`
- **auth-bypass-status.tsx**: Updated all gray colors to use semantic alternatives
- **MastercardPayment.tsx**: Fixed success indicators to use semantic success colors

### Utility Enhancements
- Added `getSemanticTextColor()` for consistent text color selection
- Added `getStatusColor()` and `getStatusBackgroundColor()` for status indicators
- Added `isDarkMode()` helper for theme detection
- Added `getContrastingTextColor()` for dynamic color selection

## Remaining Tasks
- Test the application in both light and dark modes
- Validate WCAG AA compliance using accessibility tools
- Create developer documentation for proper color usage
=======
