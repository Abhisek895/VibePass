# TODO: Super Admin "Everything" Access

## Backend Tasks
- [x] 1. Extend `admin.service.ts` with new super_admin methods (blocks, voice-sessions, notifications, badges, feedback, everything)
- [x] 2. Add super_admin endpoints in `admin.controller.ts` for the new methods

## Frontend Tasks
- [ ] 3. Add types in `frontend/src/lib/types/admin.ts`
- [ ] 4. Add API methods in `frontend/src/services/api/admin.service.ts`
- [ ] 5. Add hooks in `frontend/src/hooks/use-super-admin.ts`
- [ ] 6. Update `frontend/src/app/admin/users/[id]/page.tsx` with Chats, Messages, Matches, Match Requests, Blocks, Voice Calls, Notifications, Badges, Feedback tabs
- [ ] 7. Create `frontend/src/app/admin/everything/page.tsx` global super_admin dashboard
- [ ] 8. Update `frontend/src/app/admin/layout.tsx` with conditional super_admin nav links

## Verification
- [ ] 9. Backend compiles successfully
- [ ] 10. Frontend compiles successfully

