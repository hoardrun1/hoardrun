# TODO: Reduce Quick Actions Sizes on Mobile Home Page

## Tasks
- [x] Update Primary Quick Actions section in `app/(dashboard)/home/page.tsx`:
  - Reduce button height to `h-12` on mobile, scaling to `h-14 sm:h-16` for larger screens.
  - Adjust `min-w-[90px]` to `min-w-[80px] w-auto` on mobile.
  - Reduce icon size to `h-4 w-4` on mobile (`h-4 w-4 sm:h-5 w-5`).
  - Update label text to `text-xs sm:text-sm`.
  - Adjust container gap to `gap-2 sm:gap-4`.
- [x] Update Secondary Quick Actions section in `app/(dashboard)/home/page.tsx`:
  - Change grid to `grid-cols-2 sm:grid-cols-3`.
  - Reduce button height to `h-12` on mobile, scaling to `h-14 sm:h-16`.
  - Adjust icon size to `h-4 w-4 sm:h-5 w-5`.
  - Update label text to `text-xs sm:text-sm`.
  - Adjust grid gap to `gap-2 sm:gap-3`.
- [ ] Test changes locally with `npm run dev` and mobile viewport simulation.
- [ ] Verify no layout breaks in other sections and adjust if needed.
