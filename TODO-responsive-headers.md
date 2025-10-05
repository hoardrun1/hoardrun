# Responsive Headers Implementation Plan

## Overview
Make the top section headers fully responsive for Savings and Cards pages:
- Restructure to have title and subtitle on top (centered, responsive sizing).
- Buttons below, centered on the page, smaller on mobile screens.
- For Savings: Title "Savings & Deposits", subtitle "Manage goals, fixed deposits, and automated savings". Buttons: "New Goal", "Fixed Deposit", "Auto Save".
- For Cards: Title "Cards & Management", subtitle "Manage your cards, payments, and security". Buttons: "New Card", "Issue Virtual Card", "Card Settings".

## Steps

### 1. Update Savings Page Header (components/savings-page.tsx)
- [ ] Add new hero section after sticky header: Centered title (text-2xl md:text-3xl), subtitle (text-sm md:text-base).
- [ ] Add centered button row below: Three buttons ("New Goal" - existing dialog, "Fixed Deposit" - existing dialog, "Auto Save" - new basic dialog for auto-save settings).
- [ ] Use responsive classes: flex flex-col items-center on mobile, gap-2 sm:gap-4, button sizes smaller on mobile (e.g., text-sm px-3 py-1 on sm screens).
- [ ] Ensure vertical stacking if needed on very small screens.

### 2. Add Auto Save Dialog (components/savings-page.tsx)
- [ ] Create new state and dialog for "Auto Save" button: Basic form to toggle global auto-save, set percentage (e.g., 10% of income).
- [ ] Implement placeholder handler (toast success, update local state).

### 3. Update Cards Page Header (components/cards-page.tsx)
- [ ] Modify existing sticky header or add hero section: Centered title "Cards & Management" (text-2xl md:text-3xl), subtitle "Manage your cards, payments, and security" (text-sm md:text-base).
- [ ] Move buttons below: "New Card" (existing dialog), "Issue Virtual Card" (existing), "Card Settings" (new or link to settings).
- [ ] Center buttons: flex justify-center gap-2 sm:gap-4, smaller on mobile (size="sm" or custom classes).
- [ ] Hide or adjust existing inline buttons for mobile.

### 4. Testing and Verification
- [ ] Use browser_action to launch savings page (e.g., http://localhost:3000/dashboard/savings), check mobile view (scroll, resize).
- [ ] Use browser_action for cards page (e.g., http://localhost:3000/dashboard/cards), verify responsiveness.
- [ ] If dev server not running, execute `npm run dev`.
- [ ] Update this TODO with completion marks.

### 5. Final Review
- [ ] Confirm no breaking changes to existing functionality.
- [ ] Attempt completion once all steps done.
