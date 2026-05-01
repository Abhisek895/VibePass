# Frontend Profile System - Implementation Guide

## Project Structure Overview

```
frontend/src/
├── app/
│   ├── (main)/profile/[username]/
│   │   ├── page.tsx           # Main profile page
│   │   └── layout.tsx         # Profile layout
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx          # Query client provider
├── components/
│   ├── profile/               # Profile-specific components
│   │   ├── CoverPhotoSection.tsx
│   │   ├── ProfileIdentity.tsx
│   │   ├── ProfileActions.tsx
│   │   ├── AboutCard.tsx
│   │   ├── FriendsPreviewCard.tsx
│   │   ├── PhotosPreviewCard.tsx
│   │   └── EditProfileModal.tsx
│   ├── posts/                 # Post-related components
│   │   ├── PostCard.tsx
│   │   ├── PostComposer.tsx
│   │   ├── CreatePostModal.tsx
│   │   └── SharedPostCard.tsx
│   ├── comments/              # Comment components
│   │   ├── CommentSection.tsx
│   │   ├── CommentItem.tsx
│   │   └── ReplyItem.tsx
│   ├── reactions/             # Reaction components
│   │   └── ReactionBar.tsx
│   └── ui/                    # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Avatar.tsx
│       ├── Modal.tsx
│       ├── Tabs.tsx
│       ├── Badge.tsx
│       ├── EmptyState.tsx
│       └── LoadingSkeleton.tsx
├── hooks/
│   ├── useProfile.ts
│   ├── useProfilePosts.ts
│   ├── useCreatePost.ts
│   ├── useReactToPost.ts
│   ├── useComments.ts
│   ├── useProfileFriends.ts
│   └── index.ts
├── lib/
│   ├── types/
│   │   ├── common.ts
│   │   ├── user.ts
│   │   ├── post.ts
│   │   ├── comment.ts
│   │   ├── reactions.ts
│   │   └── index.ts
│   ├── constants.ts
│   ├── utils.ts
│   └── date-utils.ts
├── services/
│   ├── api/
│   │   ├── profile.ts
│   │   ├── posts.ts
│   │   ├── comments.ts
│   │   └── reactions.ts
│   └── mock/
│       └── mockData.ts
└── store/
    └── types.ts
```

## Tech Stack

- **Next.js 14+**: App Router with TypeScript
- **React 18+**: Latest React features
- **TanStack Query (React Query)**: Data fetching and state management
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Full type safety
- **Zustand**: Only if global UI state needed (optional)

## Key Concepts

### 1. Type Safety Throughout

All data is strongly typed using TypeScript interfaces:

```typescript
// Types are defined in lib/types/
interface User extends Timestamp {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  profileImage?: string;
  // ... more fields
}

interface Post extends Timestamp {
  id: string;
  author: UserMinimal;
  content: string;
  privacy: PrivacyType;
  media: PostMedia[];
  reactionsCount: ReactionSummary;
  // ... more fields
}
```

### 2. Mock Data Layer

The application uses mock data for development. Replace in `services/mock/mockData.ts`:

```typescript
// Mock functions simulate API responses with delays
profileAPI.getProfile = async (username: string) => {
  await simulateNetworkDelay();
  return getProfileByUsername(username);
};
```

### 3. Custom Hooks Pattern

Each feature has a corresponding hook using TanStack Query:

```typescript
// useProfile.ts - Fetches profile data
export const useProfile = (username: string | null | undefined) => {
  const query = useQuery({
    queryKey: QUERY_KEYS.PROFILE(username || ''),
    queryFn: async () => profileAPI.getProfile(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });
  
  return {
    profile: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
```

### 4. Component Composition

Components are composable and reusable:

```typescript
// Profile page composes smaller components
<CoverPhotoSection {...props} />
<ProfileIdentity {...props} />
<ProfileActions {...props} />
<Tabs tabs={profileTabs} />
```

## Responsive Behavior

### Mobile (< 768px)
- Stack layout vertically
- Full-width cards
- Simplified navigation
- Compact header with profile picture smaller
- Cover image reduced height (h-48)
- Single column layout for all sections

### Tablet (768px - 1024px)
- Two-column layout with sidebar
- Profile tabs horizontal scrollable
- Medium-sized components
- Cover image h-56

### Desktop (> 1024px)
- Three-column layout (content + 2 sidebars possible)
- Full-width optimization
- Larger preview cards
- Cover image h-64
- Sidebar cards show up on right

### Responsive Classes Used
```css
/* Example patterns */
md:h-64          /* Medium+: larger cover */
lg:col-span-2    /* Large+: 2-column span */
md:flex-row      /* Medium+: flex row */
grid-cols-2      /* Default: 2 cols */
md:grid-cols-3   /* Medium+: 3 cols */
lg:grid-cols-4   /* Large+: 4 cols */
```

## State Management

### Query Client Setup

The application uses TanStack Query with a configured QueryClient:

```typescript
// In providers.tsx
<QueryClientProvider client={queryClient}>
  {children}
</QueryClientProvider>
```

### Data Flow

1. User navigates to `/profile/[username]`
2. Page component renders and calls `useProfile(username)`
3. Hook triggers `useQuery` with queryFn pointing to mock API
4. Data is fetched and cached
5. Component renders with data
6. User interactions trigger mutations (create, update, delete)
7. Mutations invalidate related queries to refresh data

## Integration with Real Backend

### Step 1: Replace Mock API Functions

In `services/api/` create real API service files:

```typescript
// services/api/profile.ts
import { UserProfile, UpdateProfileInput } from '@/lib/types';

export const profileAPI = {
  getProfile: async (username: string): Promise<UserProfile | null> => {
    const response = await fetch(`/api/profile/${username}`);
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateProfile: async (data: UpdateProfileInput) => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },
};
```

### Step 2: Update Imports

Replace mock imports in hooks:

```typescript
// Before:
import { profileAPI } from '@/services/mock/mockData';

// After:
import { profileAPI } from '@/services/api/profile';
```

### Step 3: Adjust Query Settings

Update staleTime, cacheTime based on your backend:

```typescript
const query = useQuery({
  queryKey: QUERY_KEYS.PROFILE(username || ''),
  queryFn: async () => profileAPI.getProfile(username),
  staleTime: 1000 * 60 * 10, // 10 minutes (increase for stable data)
  gcTime: 1000 * 60 * 60, // Keep for 1 hour
});
```

### Step 4: Handle Authentication

Add auth header to API calls:

```typescript
const getProfile = async (username: string) => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/api/profile/${username}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## Backend API Contract

Expected HTTP endpoints:

```
GET    /api/profile/:username          # Get profile
PUT    /api/profile                    # Update profile
POST   /api/profile/image              # Upload profile image
POST   /api/profile/cover              # Upload cover image

GET    /api/profile/:username/posts?page=1&limit=10  # Get user posts
POST   /api/posts                      # Create post
PUT    /api/posts/:postId              # Update post
DELETE /api/posts/:postId              # Delete post

POST   /api/posts/:postId/react        # Add reaction
DELETE /api/posts/:postId/reactions    # Remove reaction

GET    /api/posts/:postId/comments?page=1  # Get comments
POST   /api/posts/:postId/comments     # Create comment
PUT    /api/comments/:commentId        # Update comment
DELETE /api/comments/:commentId        # Delete comment

GET    /api/profile/:username/friends?page=1  # Get friends
POST   /api/friends/:userId/add        # Add friend
DELETE /api/friends/:userId            # Remove friend
```

## Performance Optimizations

1. **Image Optimization**
   - Use Next.js Image component
   - Lazy load media in posts
   - Implement progressive loading

2. **Code Splitting**
   - Dynamic modals load on demand
   - Route-based code splitting (Next.js App Router)

3. **Query Optimization**
   - Appropriate staleTime settings
   - Selective query invalidation
   - Pagination for large lists

4. **Component Memoization**
   - Memoize expensive list items
   - Use React.memo for CommentItem, PostCard

5. **Virtualization**
   - For very long lists, consider react-window

## Error Handling

```typescript
// Components display error states gracefully
if (query.isError) {
  return (
    <EmptyState
      title="Something went wrong"
      description={query.error?.message}
      action={<Button onClick={() => query.refetch()}>Try again</Button>}
    />
  );
}
```

## Accessibility

- Semantic HTML (buttons, links, headings)
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios meet WCAG standards
- Alt text on all images

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Testing Strategy

### Unit Tests
- Test utility functions
- Test component rendering with mocked hooks

### Integration Tests
- Test page with mock data
- Test user interactions

### E2E Tests
- Test full user flows
- Test with real API

## Security Considerations

1. **Authentication**
   - Store JWT in secure HTTP-only cookie (preferred)
   - If localStorage, ensure HTTPS

2. **Authorization**
   - Check `isOwnProfile` before showing edit buttons
   - Don't expose private data in UI

3. **CSRF Protection**
   - Use SameSite cookies
   - Add CSRF tokens to POST/PUT/DELETE requests

4. **Input Validation**
   - Validate all form inputs
   - Sanitize HTML content before displaying

5. **Image Upload**
   - Validate file type and size
   - Use server-side validation
   - Store images in secure location

## Styling System

### Tailwind CSS Framework
- No custom CSS needed (utility-first)
- Consistent color palette: blues, grays, reds
- Responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`

### Color Scheme
- Primary: Blue-600 (#2563eb)
- Secondary: Gray-200 (#e5e7eb)
- Accent: Red-600 (#dc2626)
- Text: Gray-900 (#111827)
- Border: Gray-200 (#e5e7eb)

### Spacing
- Gap units: 2, 3, 4, 6 (8px, 12px, 16px, 24px)
- Padding/Margin: 4, 6, 8, 12 (4px, 6px, 8px, 12px)

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=VibePass
```

## Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Format code
npm run format

# Lint
npm run lint
```

## Common Issues and Solutions

### Issue: Hydration mismatch
**Solution**: Wrap components in Suspense or use useEffect for client-only rendering

### Issue: Images not loading
**Solution**: Ensure Next.js Image component fill prop or set width/height

### Issue: Query not updating
**Solution**: Check queryKey matches between useQuery and invalidation

### Issue: Modal backdrop click closing too quickly
**Solution**: Add pointer-events-none to modals that delegate clicks

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query (TanStack Query)](https://tanstack.com/query/)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [React Patterns](https://react.dev)

## Support & Troubleshooting

For issues:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify mock data exists in mockData.ts
4. Check React Query DevTools
5. Verify TypeScript types match

---

**Last Updated**: January 2024
**Frontend Version**: 1.0.0
