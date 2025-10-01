# TODO: Reduce Fonts, Margins, and Paddings on Mobile Screens

## Tasks
- [x] Update `app/globals.css`:
  - Add media query to reduce base font size to 14px on mobile screens (max-width: 640px).
  - Reduce mobile utility paddings from px-4 to px-2 on mobile.
  - Adjust mobile section spacing from py-6 to py-4 on mobile.
- [x] Update `tailwind.config.ts`:
  - Reduce mobile font sizes to be smaller (e.g., mobile-xs from 0.75rem to 0.625rem).
  - Adjust mobile spacing if needed.
- [x] Test changes locally with `npm run dev` and mobile viewport simulation.
- [x] Verify no layout breaks and adjust components if needed.
- [x] Checked TSX files for hardcoded large paddings and adjusted key pages like settings to use p-4 sm:p-6 instead of p-6.
