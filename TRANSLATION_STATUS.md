# Translation Status

## ✅ Completed
- ✅ i18n system created (`lib/i18n.ts`, `hooks/useTranslation.ts`)
- ✅ English translations file created (`locales/en.json`)
- ✅ Home page (`app/page.tsx`)
- ✅ Header component (`components/Header.tsx`)
- ✅ ListingForm component (`components/ListingForm.tsx`)
- ✅ Listings page (`app/listings/page.tsx`)
- ✅ New listing page (`app/listings/new/page.tsx`)

## 🔄 In Progress
- Pages to translate:
  - `app/listings/[id]/page.tsx` - Listing detail
  - `app/listings/[id]/edit/page.tsx` - Edit listing
  - `app/orders/page.tsx` - Orders list
  - `app/orders/[id]/page.tsx` - Order detail
  - `app/messages/page.tsx` - Messages list
  - `app/messages/[id]/page.tsx` - Conversation detail
  - `app/profile/page.tsx` - Profile
  - `app/auth/signin/page.tsx` - Sign in
  - `app/auth/signup/page.tsx` - Sign up
  - `app/auth/forgot-password/page.tsx` - Forgot password
  - `app/checkout/[listingId]/page.tsx` - Checkout
  - `app/admin/**` - Admin pages

- Components to translate:
  - `components/FilterBar.tsx`
  - `components/ListingCard.tsx`
  - `components/MessageList.tsx`
  - `components/MessageInput.tsx`
  - `components/OrderStatus.tsx`
  - `components/ReviewForm.tsx`
  - `components/ReviewList.tsx`
  - `components/BottomNav.tsx`

## 📝 Notes
- All translations are in English in `locales/en.json`
- To add Serbian: create `locales/sr.json` with same structure
- To add French: create `locales/fr.json` with same structure
- The system uses `useTranslation()` hook in client components
- Locale is stored in localStorage (can be extended to URL-based routing)

