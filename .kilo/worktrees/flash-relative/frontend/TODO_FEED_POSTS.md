# Dummy Posts for /feed

## Information Gathered:
- Feed page at `frontend/src/app/(main)/feed/page.tsx` calls postsService.getFeed()
- No backend, needs mock in `frontend/src/services/mock/mock-api.ts` for `/api/posts/feed`
- Types from social.service.ts: Post, FeedResponse {posts, nextCursor}
- Existing mockData.ts/mock-api.ts have users/media for reuse

## Plan:
1. Add `mockFeedPosts: Post[]` array (15 diverse posts: text, images, shares from alex-chen, sarah-williams etc.)
2. Add `getFeed(cursor?: string): Promise<FeedResponse>` to mock-api.ts using mockFeedPosts with cursor pagination
3. Ensure apiRequest fallback uses mock-api for development

## Dependent Files:
- `frontend/src/services/mock/mock-api.ts` (add data + function)

## Followup steps:
- Test: cd frontend && npm run dev, visit http://localhost:3000/feed (login first)
- Mark complete

Complete! Added mockFeedData.ts with 15 posts, integrated getFeed in mock-api.ts. Infinite scroll ready. Test /feed.
