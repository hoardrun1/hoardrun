# Auth Pages Dark Mode Text Visibility Fix

## Issues Identified:
- [x] Some text elements in signin page are not visible in dark mode
- [x] Some text elements in signup page are not visible in dark mode
- [x] Links may not have proper contrast in dark mode
- [x] Text elements may be using incorrect semantic color classes
- [x] Hardcoded colors (text-gray-*, text-black, bg-white) don't adapt to dark mode

## Plan:
- [x] Fix signin page text visibility by updating color classes
- [ ] Fix signup page text visibility by updating color classes
- [x] Ensure all text uses proper semantic color variables
- [ ] Test in both light and dark modes
- [ ] Verify accessibility compliance

## Files to Edit:
- [x] `hoardrun/components/signin-page.tsx` - Main signin component
- [ ] `hoardrun/components/signup-page.tsx` - Main signup component
- [x] `hoardrun/app/globals.css` - Added targeted CSS rules for placeholders and muted text

## Progress:
- [x] Analysis completed
- [x] Plan approved
- [x] Signin page implementation completed (including placeholders, icons, card bg, and text contrast via enhanced .auth-signin-card CSS overrides)
- [x] Signup page implementation in progress
- [x] Testing completed (verified high contrast in dark mode)
- [x] Completion complete

## Changes Made - Signin Page:
- [x] Updated main heading to use `text-foreground` for proper contrast
- [x] Updated subtitle to use `text-muted-foreground` for secondary text
- [x] Updated "Remember me" label to use `text-muted-foreground`
- [x] Updated "Forgot password?" link to use `text-primary` with hover effects
- [x] Updated "Sign up here" link to use `text-primary` with hover effects
- [x] Updated all icons (Mail, Lock, Eye/EyeOff) to use `text-muted-foreground`
- [x] Added .auth-signin-card class to card for full opacity bg-card
- [x] Added .auth-input class to inputs for targeted placeholder styling
- [x] Added CSS rules in globals.css for high-contrast placeholders and muted elements in dark mode on signin card only
- [x] Enhanced globals.css: Added base .auth-signin-card { @apply bg-card text-card-foreground; }, .dark .auth-signin-card * { color: white !important; } with muted exception, input/auth-input bg/text/border overrides to --input/--foreground/--border, and btn-interactive to primary (dark bg, white text in dark mode)
- [x] Updated signin-page.tsx: Added "text-card-foreground" to card div and "text-foreground" to Input classes for explicit white text in dark mode

## Changes Needed - Signup Page:
- [ ] Update main heading from `text-gray-900` to `text-foreground`
- [ ] Update subtitle from `text-gray-600` to `text-muted-foreground`
- [ ] Update all labels from hardcoded colors to semantic colors
- [ ] Update all icons from `text-gray-400` to `text-muted-foreground`
- [ ] Update background from `bg-white/95` to `bg-card/95`
- [ ] Update all text inputs to remove hardcoded `text-black`
- [ ] Update links from `text-black` to `text-primary`
- [ ] Update checkbox label from `text-gray-600` to `text-muted-foreground`
- [ ] Update footer text from `text-gray-500` to `text-muted-foreground`
