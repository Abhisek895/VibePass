# VibePass Cleanup Plan

## Step 1: Delete malformed directory
- [x] Remove `frontendsrcappnotifications/` at repo root

## Step 2: Remove dead/unused component files
- [x] `frontend/src/components/profile/profile-sections-new.tsx`
- [x] `frontend/src/components/profile/edit-profile-modal-new.tsx`
- [x] `frontend/src/components/profile/post-card-new.tsx`
- [x] `frontend/src/components/profile/post-composer-new.tsx`
- [x] `frontend/src/components/profile/create-post-modal.tsx`
- [x] `frontend/src/components/profile/shared-post-card.tsx`
- [x] `frontend/src/components/profile/reaction-picker.tsx`
- [x] `frontend/src/components/profile/post-card.tsx`
- [x] `frontend/src/components/profile/loading-and-states.tsx`
- [x] `frontend/src/components/profile/photo-sections.tsx`

## Step 3: Clean up abandoned TODO markdown files
- [x] Delete completed/abandoned TODOs: `TODO_PROFILE.md`, `TODO_PROFILE_FIX.md`, `TODO_PROFILE_MODAL.md`, `TODO_FIX_IMAGE_ERROR.md`, `frontend/TODO_NOTIFICATIONS.md`, `frontend/TODO_NAVBAR_MOBILE.md`, `frontend/TODO_FEED_POSTS.md`, `frontend/TODO_FEED_REDESIGN.md`, `backend/TODO_NOTIFICATIONS_BACKEND.md`
- [x] Merge any remaining actionable items into root `TODO.md`

## Step 4: Wire notifications frontend → backend
- [x] `frontend/src/services/api/notifications.service.ts` created and wired
- [x] `frontend/src/services/api/index.ts` updated to export it
- [x] Frontend notification hooks/pages use real API

## Step 5: Remove console noise
- [x] `frontend/src/store/socket.tsx` — removed debug logs
- [x] `frontend/src/services/voice.service.ts` — removed debug logs
- [x] `frontend/src/components/comments/CommentInput.tsx` — silenced catch block
- [x] `frontend/src/components/profile/edit-profile-modal-new.tsx` — deleted

## Step 6: Type safety pass
- [x] `NotificationsList.tsx` — added `NotificationsCache` interface, replaced `any` in optimistic updates
- [x] `voice.service.ts` — added `IncomingCallData`, `CallAcceptedData`, `CallEndedData`, `SdpData`, `IceCandidateData`; replaced `any` types
- [x] `AuthFlow.tsx` — typed `handleAuthSuccess(data: AuthResponse)`, fixed reset-flow `apiRequest` generics

## Step 7: Verify builds
- [x] `cd frontend && npx tsc --noEmit` — 0 errors
- [x] `cd backend && npm run build` — nest build success (dist/ verified)

