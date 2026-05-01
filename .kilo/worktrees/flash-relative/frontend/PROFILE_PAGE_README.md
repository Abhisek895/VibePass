# Facebook-like Profile Page - Frontend Implementation Guide

## 📋 Project Overview

This is a **production-ready, fully responsive Facebook-like profile page** built with Next.js 14, TypeScript, Tailwind CSS, and React Query. It includes all essential social features with modern UI patterns and best practices.

## 🗂️ Project Structure

```
frontend/src/
├── app/
│   └── profile/
│       ├── page.tsx              # Profile list page
│       └── [id]/
│           └── page.tsx          # Individual profile page (MAIN)
├── components/
│   └── profile/
│       ├── photo-sections.tsx    # Cover & Profile picture sections
│       ├── profile-actions.tsx   # Action buttons (Edit, Message, Add Friend)
│       ├── profile-sections-new.tsx  # About, Friends, Photos sidebars
│       ├── post-composer-new.tsx # Post creation form
│       ├── post-card-new.tsx     # Post display with reactions
│       ├── profile-tabs-new.tsx  # Tab navigation (Posts, About, Photos, Friends)
│       ├── edit-profile-modal-new.tsx # Profile editing modal
│       ├── loading-and-states.tsx # Loading, error, empty states
│       └── [other components]    # Additional components
├── hooks/
│   ├── use-profile-query.ts      # React Query hooks (PRIMARY)
│   └── [other hooks]             # Other custom hooks
├── lib/
│   ├── profile-constants.ts      # Constants, emojis, labels
│   ├── profile-utils.ts          # Utility functions
│   └── [other utils]             # Other utilities
├── services/
│   ├── api/                      # Real API services (for backend integration)
│   └── mock/
│       └── mock-api.ts           # Mock API with sample data
└── types/
    └── profile.ts                # TypeScript types (PRIMARY)
```

## 🎯 Core Features Implemented

### ✅ Profile Page Components
- **Cover Photo Section**: Editable cover image with upload
- **Profile Picture Section**: Avatar with edit overlay and online indicator
- **Profile Actions**: Edit profile, message, add friend buttons with status management
- **Profile Info Section**: Bio, work, education, location - all editable
- **Profile Stats**: Friends, posts, photos count display

### ✅ Social Features
- **Posts Tab**: Timeline with post composer and post cards
- **Post Composer**: Text input with media preview, privacy selector
- **Post Cards**: Display with:
  - User info and timestamp
  - Media gallery
  - Reaction bar (like, love, care, haha, wow, sad, angry)
  - Comment section with reply support
  - Share functionality
- **Comments System**: Nested replies with like functionality
- **Reactions**: 7 reaction types with emoji display

### ✅ Other Tabs
- **About Tab**: Comprehensive profile information display
- **Photos Tab**: Photo gallery with like/comment counts
- **Friends Tab**: Friend list with mutual friends count

### ✅ UI/UX Features
- **Loading States**: Skeleton loaders for perceived performance
- **Error States**: Graceful error handling with retry
- **Empty States**: Context-aware empty states for all sections
- **Responsive Design**: Mobile-first, fully responsive layout
- **Loading Indicators**: Spinners for async operations
- **Modal Dialogs**: Edit profile modal with validation

### ✅ Advanced Features
- **Tab Navigation**: Sticky tabs with active highlighting
- **Infinite Scroll Ready**: Structure supports pagination
- **Real-time Updates**: React Query invalidation on mutations
- **Type Safety**: Full TypeScript throughout

## 📦 Dependencies

```json
{
  "next": "14.2.0",
  "react": "^18",
  "react-dom": "^18",
  "@tanstack/react-query": "^5.3.0",
  "tailwindcss": "^3.3.0",
  "typescript": "^5",
  "lucide-react": "^1.7.0",
  "framer-motion": "^11.0.0",
  "zod": "^3.22.0"
}
```

## 🚀 Getting Started

### 1. Installation

```bash
cd frontend
npm install
# or
yarn install
```

### 2. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000/profile/ariana` to see the profile page.

### 3. View Sample Profiles

- **Ariana Miller (Owner)**: `http://localhost:3000/profile/ariana`
- **Taylor Hale (Visitor)**: `http://localhost:3000/profile/taylor`

## 🔄 Data Flow Architecture

```
Profile Page Component
├── useProfilePage Hook (React Query)
│   ├── useProfileQuery
│   ├── useProfilePostsQuery
│   ├── useProfilePhotosQuery
│   ├── useProfileFriendsQuery
│   ├── useCreatePostMutation
│   ├── useToggleReactionMutation
│   ├── useAddCommentMutation
│   ├── useUpdateProfileMutation
│   ├── useUploadProfileImageMutation
│   └── useUploadCoverImageMutation
└── Mock API Layer (services/mock/mock-api.ts)
    └── Sample Data (profiles, posts, photos, friends, comments)
```

## 📝 Types Overview

```typescript
// Main types
interface User { /* user data */ }
interface Profile extends User { /* extended profile */ }
interface Post { /* post with reactions, comments, media */ }
interface Comment { /* nested comment structure */ }
interface PhotoItem { /* photo with metadata */ }
interface FriendPreview { /* friend card data */ }

// Input types
interface PostCreateInput { /* for creating posts */ }
interface EditProfileInput { /* for updating profile */ }
interface CommentInput { /* for creating comments */ }
```

See `src/types/profile.ts` for complete type definitions.

## 🎨 Component Usage Examples

### Profile Page
```tsx
import { useProfilePage } from '@/hooks/use-profile-query';

export default function ProfilePage({ params }: { params: { id: string } }) {
  const {
    profile,
    posts,
    isLoading,
    createPost,
    toggleReaction,
  } = useProfilePage({ username: params.id });
  
  // Use the data...
}
```

### Post Composer
```tsx
import { PostComposer } from '@/components/profile/post-composer-new';

<PostComposer
  user={profile}
  onSubmit={async (content, media, privacy) => {
    await createPost({ content, media, privacy });
  }}
/>
```

### Post Card
```tsx
import { PostCard } from '@/components/profile/post-card-new';

<PostCard
  post={post}
  currentUser={user}
  onReaction={(postId, type) => toggleReaction(postId, type)}
  onComment={(postId) => openCommentModal(postId)}
/>
```

### Edit Profile Modal
```tsx
import { EditProfileModal } from '@/components/profile/edit-profile-modal-new';

<EditProfileModal
  user={profile}
  isOpen={isOpen}
  onClose={closeModal}
  onSubmit={updateProfile}
/>
```

## 🔌 Backend Integration Guide

### 1. Replace Mock API Services

Update `src/services/mock/mock-api.ts` with real API calls:

```typescript
export async function fetchProfile(username: string): Promise<Profile | null> {
  const response = await fetch(`/api/users/${username}`);
  return response.json();
}

export async function createPost(
  username: string,
  content: string,
  media: PostMedia[],
  privacy: PrivacyType
): Promise<Post> {
  const response = await fetch(`/api/posts`, {
    method: 'POST',
    body: JSON.stringify({ content, media, privacy }),
  });
  return response.json();
}

// Similar implementations for other functions...
```

### 2. Update Query Keys (Optional)

If your API structure differs, adjust query names in `hooks/use-profile-query.ts`:

```typescript
const QUERY_KEYS = {
  profile: (id: string) => ['user', id],
  profilePosts: (id: string) => ['user', id, 'posts'],
  // ...
};
```

### 3. Add Error Handling

Wrap mutations with error callbacks:

```typescript
const createPostMutation = useMutation({
  mutationFn: (input) => createStatePost(...),
  onSuccess: () => { /* invalidate */ },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

## 🛠️ Customization Guide

### Styling

- **Tailwind Config**: Modify `tailwind.config.ts` for colors/spacing
- **Component Styles**: Update className directly in components
- **Dark Mode**: Add `dark:` classes for dark mode support

### Constants

Edit `lib/profile-constants.ts` to customize:
- Reaction emojis and labels
- Privacy icons and labels
- Tab definitions
- Textarea character limits
- Animation delays

### Utilities

Add custom utilities in `lib/profile-utils.ts`:
```typescript
export function customDateFormat(date: string): string {
  // Your custom logic
}
```

## 📊 Mock Data Structure

### Sample Profiles
```typescript
const profiles = {
  'ariana': { /* owner profile */ },
  'taylor': { /* visitor profile */ },
};
```

### Sample Posts
Posts include:
- User info, content, media, reactions
- Comments with nested replies
- Share functionality
- Privacy levels

### Generate Test Data

Create additional profiles/posts in `mock-api.ts`:

```typescript
export const profiles: Record<string, Profile> = {
  'your-user': {
    // Profile data...
  },
  // Add more...
};

export const postsByUsername = {
  'your-user': [
    // Posts...
  ],
  // Add more...
};
```

## 🧪 Testing

### Test Profile Loading
```bash
npm run dev
# Navigate to: http://localhost:3000/profile/ariana
```

### Test Interactions
- Click "Edit profile" button
- Create a new post
- React to posts
- Add comments
- Switch tabs

### Test Responsive Design
- Use Chrome DevTools device emulation
- Test on mobile, tablet, desktop

## ⚡ Performance Optimizations

- **React Query**: Automatic caching and invalidation
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components load on demand
- **Stale Time**: 5 minutes for profiles, 3 minutes for posts
- **GC Time**: 30 minutes for cache retention

## 🔒 Security Considerations

- ✅ Never expose sensitive data in mock data
- ✅ Validate all inputs before sending to server
- ✅ Use HTTPS for production API calls
- ✅ Implement proper CORS policies
- ✅ Add authentication token to API requests
- ✅ Sanitize user-generated content

## 📱 Responsive Breakpoints

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl)

All components are mobile-first and fully responsive.

## 🚀 Production Deployment

### Before Deploying:
1. Replace mock API with real backend services
2. Add environment variables for API endpoints
3. Enable CSRF protection
4. Add authentication checks
5. Implement rate limiting
6. Set up error tracking (Sentry)
7. Add analytics

### Build for Production:
```bash
npm run build
npm start
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🐛 Troubleshooting

### Issue: Types not found
**Solution**: Ensure `tsconfig.json` has correct path aliases

### Issue: Components not rendering
**Solution**: Check React Query provider in layout.tsx

### Issue: Images not loading
**Solution**: Verify image URLs in mock-api.ts

### Issue: Styles not applying
**Solution**: Ensure Tailwind is configured in globals.css

## 📄 License

This implementation is production-ready and can be freely modified for your needs.

---

**Built with ❤️ for modern social applications**
