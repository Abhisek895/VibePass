# Premium VibePass Feed Redesign (3-column Dark Theme)

**Information Gathered:**
- Current: Single column feed `(main)/feed/page.tsx` with FeedItem, PostComposer, hardcoded posts.
- Components: FeedItem.tsx (main post card), post-composer.tsx, PostCard.tsx (similar).
- Dark black cards, needs elegant layered dark + purple #8b5cfc accents.
- Responsive needed, desktop 3-col.

**Plan:**
1. **Layout:** `feed/page.tsx` → grid 3-col desktop (1-12-4 rem), stack mobile.
2. **Left sidebar:** Logo VibePass (purple), nav icons, user summary card.
3. **Center:** Composer (placeholder "What's on your mind?"), FeedItem list.
4. **Right sidebar:** Suggestions (users), trends, recent activity.
5. **Theme:** bg-gradient-to-br from-slate-900 to-gray-900, cards bg-slate-800/50 backdrop-blur-md border-slate-700, purple accents hover:from-purple-500.
6. **Cards:** Update FeedItem/PostCard: avatar+name+@username+time, text black? wait dark text-white, modern shadows radius-xl p-6.
7. **Responsive:** Tailwind grid-cols-1 md:grid-cols-[250px_1fr_300px].
8. **New files:** components/layout/LeftSidebar.tsx, RightSidebar.tsx, FeedLayout.tsx.
9. **Polish:** Typography (font-sans leading-relaxed), interactions (hover ring-purple ring-1), focus states.

**Dependent Files:**
- `frontend/src/app/(main)/feed/page.tsx` (layout)
- `frontend/src/components/posts/FeedItem.tsx` (card styling)
- `frontend/src/components/posts/post-composer.tsx` (placeholder)
- New: `frontend/src/components/layout/LeftSidebar.tsx`, `RightSidebar.tsx`

**Followup:**
- Implement step-by-step, test responsive.
- `cd frontend && npm run dev`, desktop/mobile devtools.

Plan approved? Proceed?
