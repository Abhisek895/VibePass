# Complete Profile System Implementation

## Overview

This document provides a complete breakdown of the Facebook-like profile page system built with Next.js, TypeScript, Tailwind CSS, and React Query.

## System Architecture

### High-Level Flow

```
User navigates to /profile/[username]
    ↓
Page component renders
    ↓
useProfile hook fetches user data via React Query
    ↓
useProfilePosts, useProfileFriends hooks fetch additional data
    ↓
Components render with data
    ↓
User interactions trigger mutations
    ↓
Mutations invalidate queries, causing data refresh
```

## Component Hierarchy

### Profile Page Structure

```
ProfilePage
├── CoverPhotoSection
│   └── Avatar (overlaid)
├── ProfileIdentity
│   └── Shows name, bio, stats
├── ProfileActions
│   └── Context-specific buttons
├── Tabs
│   ├── Posts Tab
│   │   ├── PostComposer (if own profile)
│   │   └── PostCard (repeated)
│   │       └── ReactionBar (hover)
│   │       └── CommentSection
│   ├── About Tab
│   │   └── AboutCard
│   ├── Photos Tab
│   │   └── PhotosPreviewCard
│   └── Friends Tab
│       └── Friend cards grid
└── Sidebar (desktop only)
    ├── AboutCard
    ├── FriendsPreviewCard
    └── PhotosPreviewCard
```

## Detailed Component Documentation

### 1. CoverPhotoSection

**Purpose**: Displays cover image with overlaid profile picture

**Props**:
```typescript
interface CoverPhotoSectionProps {
  coverImage?: string;
  profileImage?: string;
  profileName: string;
  isOwn: boolean;
  onEditCover?: () => void;
  onEditProfile?: () => void;
}
```

**Features**:
- Cover image with fallback gradient
- Profile picture overlapping with edit button
- Responsive sizing (h-48 mobile, h-64 desktop)
- Edit buttons visible only for own profile

**Example Usage**:
```tsx
<CoverPhotoSection
  coverImage="https://..."
  profileImage="https://..."
  profileName="Alex Chen"
  isOwn={true}
  onEditCover={() => setShowEditCover(true)}
  onEditProfile={() => setShowEditProfile(true)}
/>
```

---

### 2. ProfileIdentity

**Purpose**: Displays user name, username, intro, bio, and quick stats

**Props**:
```typescript
interface ProfileIdentityProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}
```

**Features**:
- Large name display (h1 text-4xl)
- Username with @ prefix
- Friend count and join date
- Intro and bio text
- Edit Profile button for own profile

**Responsive**: Stack on mobile, inline on desktop

---

### 3. ProfileActions

**Purpose**: Context-aware action buttons based on relationship status

**Props**:
```typescript
interface ProfileActionsProps {
  isOwnProfile: boolean;
  friendshipStatus: FriendshipStatus;
  onMessage?: () => void;
  onAddFriend?: () => void;
  onRemoveFriend?: () => void;
  onAcceptRequest?: () => void;
  onCancelRequest?: () => void;
  onEditProfile?: () => void;
  onCreatePost?: () => void;
}
```

**Behavior**:

For own profile:
- ✏️ Edit Profile
- ➕ Create Post
- ⋯ More menu (Settings, Privacy, Logout)

For other user:
- **FRIENDS**: 💬 Message, 👋 Unfriend
- **PENDING_OUTGOING**: ❌ Cancel Request
- **PENDING_INCOMING**: ✓ Accept Request, ✕ Decline
- **NONE**: ➕ Add Friend, 💬 Message

---

### 4. AboutCard

**Purpose**: Displays profile information in structured sections

**Props**:
```typescript
interface AboutCardProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
}
```

**Displays**:
- Intro (professional headline)
- Work (title at company)
- Education (school name)
- Current City
- Hometown
- Relationship Status

**Features**:
- Only displays filled fields
- Edit button for own profile
- Clean section-based layout

---

### 5. FriendsPreviewCard

**Purpose**: Shows preview of first 6 friends with mutual count

**Props**:
```typescript
interface FriendsPreviewCardProps {
  friends: FriendPreview[];
  isLoading?: boolean;
  onViewAll?: () => void;
}
```

**Layout**: Grid of 3 columns with:
- Friend avatar
- Friend name
- Mutual friends count
- "View All Friends" button

---

###  6. PhotosPreviewCard

**Purpose**: Photo grid preview of media from posts

**Props**:
```typescript
interface PhotosPreviewCardProps {
  photos: PostMedia[];
  isLoading?: boolean;
  onViewAll?: () => void;
  onPhotoClick?: (photo: PostMedia) => void;
}
```

**Features**:
- 3-column grid
- Square aspect ratio (pt-[100%])
- Clickable for lightbox
- Loading skeleton support

---

### 7. PostComposer

**Purpose**: Inline post creation trigger

**Props**:
```typescript
interface PostComposerProps {
  userName?: string;
  userAvatar?: string;
  onCreatePost?: () => void;
}
```

**Layout**:
- Avatar + input field in top row
- Quick action buttons (Photo, Video, Feeling)
- Opens full CreatePostModal on click

---

### 8. CreatePostModal

**Purpose**: Full-featured post creation form

**Props**:
```typescript
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, privacy: PrivacyType, bgColor?: string) => void;
  isLoading?: boolean;
  userAvatar?: string;
  userName?: string;
}
```

**Features**:
- User info header with privacy selector (Public/Friends/Only Me)
- Large textarea for content (max 300 chars recommended)
- 5 background color presets for text-only posts
- Action buttons (Photo, Video, Emoji - placeholders)
- Character count
- Post button disabled until content present
- Cancel button

**State Management**:
```typescript
const [content, setContent] = useState('');
const [privacy, setPrivacy] = useState<PrivacyType>('PUBLIC');
const [bgColor, setBgColor] = useState<string | undefined>();
```

---

### 9. PostCard

**Purpose**: Displays individual post with all interactions

**Props**:
```typescript
interface PostCardProps {
  post: Post;
  onReact?: (reactionType: ReactionType) => void;
  onComment?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  isOwnPost?: boolean;
}
```

**Sections**:

1. **Header**
   - Author avatar
   - Author name and username
   - Timestamp (relative, e.g., "2h ago")
   - Privacy indicator (🌍 🔒 👥)
   - Three-dot menu (Edit, Delete)

2. **Content**
   - Post text (full)
   - Optional background color

3. **Media**
   - Single image (full width)
   - Multiple images (2-column grid)
   - Video thumbnail placeholders

4. **Reaction Summary**
   - Emoji reactions that have counts
   - Total reaction count

5. **Stats Row**
   - Reaction count
   - Comment count
   - Share count

6. **Action Bar**
   - React button with hover emoji picker
   - Comment button
   - Share button

---

### 10. SharedPostCard

**Purpose**: Displays a shared post (post reshare)

**Structure**:
```
Shared Header (gray background)
├── Sharer avatar
├── "Sharer Name shared a post"
└── Sharer's caption (optional)

Original Post (lighter gray background)
├── Original author info
├── Original post content
└── Original post media
```

**Features**:
- Shows who shared the post
- Embeds the original post
- Graceful fallback if original deleted: "This post is no longer available"
- Full reaction/comment capability on shared post

---

### 11. ReactionBar

**Purpose**: Display and select emoji reactions

**Props**:
```typescript
interface ReactionBarProps {
  onReact: (reactionType: ReactionType) => void;
  userReaction?: ReactionType;
  className?: string;
}
```

**Reactions**: 👍 ❤️ 🤍 😂 😮 😢 😠

**Display**: 
- Show as rounded pill floating above/below post
- Appears on hover of Like button
- Disappears on click or mouse leave
- Selected reaction highlighted with blue background

---

### 12. CommentSection

**Purpose**: Display comments and create new comments

**Props**:
```typescript
interface CommentSectionProps {
  comments: Comment[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  userAvatar?: string;
  userName?: string;
  onAddComment?: (content: string) => void;
  onLoadMore?: () => void;
  isOwnPost?: boolean;
}
```

**Features**:
- Comment input at top (auto-expand on focus)
- List of comments below
- "Load More Comments" if hasMore
- Shows comment count
- "No comments yet" empty state
- Support for reply threads under each comment

---

### 13. CommentItem

**Purpose**: Individual comment display with reply support

**Props**:
```typescript
interface CommentItemProps {
  comment: Comment;
  onReply?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  isOwnComment?: boolean;
  isLoading?: boolean;
}
```

**Layout**:
```
Avatar | Gray bubble
        ├── Author name (bold)
        ├── Comment text
        └── Reply count if >0
        
        Actions: Reply | Timestamp
        
        Replies (indented):
        └── Same layout as comment but smaller
```

---

### 14. EditProfileModal

**Purpose**: Form to edit all profile fields

**Props**:
```typescript
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateProfileInput) => void;
  initialData?: User;
  isLoading?: boolean;
}
```

**Form Fields**:
- First Name (text)
- Last Name (text)
- Bio (textarea, 160 char limit)
- Intro (text)
- Work Title (text)
- Work Company (text)
- Education School (text)
- Education Year (number)
- Current City (text)
- Hometown (text)
- Relationship Status (select)

**Features**:
- Scrollable form (max-h-96 overflow-y-auto)
- Character count for bio
- All fields optional
- Cancel / Save Changes buttons
- Loading state during submit

---

## Hooks Documentation

### useProfile

**Purpose**: Fetch user profile by username

```typescript
const { profile, isLoading, isError, error, refetch } = useProfile(username);
```

**Features**:
- Enabled only when username provided
- 5-minute stale time
- Caches data
- Error handling

---

### useProfilePosts

**Purpose**: Fetch posts for a profile

```typescript
const { posts, isLoading, isError, error, refetch, hasMore } = useProfilePosts(username, page);
```

**Features**:
- Pagination support
- 2-minute stale time
- hasMore for infinite scroll

---

### useCreatePost

**Purpose**: Create new post

```typescript
const { createPost, isLoading, isSuccess, error } = useCreatePost(username);
```

**Usage**:
```typescript
createPost({ content, privacy, media, backgroundColor });
```

---

### useReactToPost

**Purpose**: Add/change reaction on post

```typescript
const { reactToPost, isLoading } = useReactToPost(postId);
```

**Usage**:
```typescript
reactToPost('LIKE');
```

---

### useComments

**Purpose**: Fetch comments for post

```typescript
const { comments, isLoading, isError, error, refetch } = useComments(postId, page);
```

---

### useCreateComment

**Purpose**: Create comment on post

```typescript
const { createComment, isLoading, isSuccess, error } = useCreateComment(postId);
```

---

### useProfileFriends

**Purpose**: Fetch friends list

```typescript
const { friends, isLoading, isError, error, refetch, hasMore } = useProfileFriends(username, page);
```

---

## UI Components Library

### Button

```typescript
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  isLoading={boolean}
  disabled={boolean}
>
  Click me
</Button>
```

### Avatar

```typescript
<Avatar
  src="https://..."
  alt="User name"
  size="xs" | "sm" | "md" | "lg" | "xl" | "xxl"
  initials="AN"
  bgColor="bg-blue-500"
/>
```

### Card, CardHeader, CardBody, CardFooter

```typescript
<Card>
  <CardHeader>
    <h3>Title</h3>
  </CardHeader>
  <CardBody>
    Content here
  </CardBody>
  <CardFooter>
    Footer actions
  </CardFooter>
</Card>
```

### Modal

```typescript
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
  size="md"
>
  Content here
</Modal>
```

### Tabs

```typescript
<Tabs
  tabs={[
    { id: 'posts', label: 'Posts', icon: '📝' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

### EmptyState

```typescript
<EmptyState
  icon="📭"
  title="No Posts"
  description="Be the first to share"
  action={<Button>Create Post</Button>}
/>
```

### LoadingSkeleton

```typescript
<LoadingSkeleton
  variant="post" | "comment" | "friend" | "photo" | "text" | "card"
  count={3}
/>
```

---

## Responsive Design Breakdown

### Mobile (< 640px)

**Layout**:
- Single column
- Full width except 16px padding
- Cover image: h-48
- Avatar: w-24 h-24

**Components**:
- Stack all sidebars below main content
- Tabs scrollable horizontally
- Grid 2 columns (friends, photos)

**Spacing**:
- Reduced gaps and padding
- Compact card layouts

### Tablet (640px - 1024px)

**Layout**:
- Two columns (content + right sidebar)
- Cover image: h-56
- Avatar: w-20 h-20

**Components**:
- Main content + About + Friends cards visible
- Photos grid: 3 columns
- Friends card: grid-cols-3

**Spacing**:
- Medium gaps (gap-4)
- Balanced padding

### Desktop (> 1024px)

**Layout**:
- Three columns possible
- Cover image: h-64
- Avatar: w-24 h-24

**Components**:
- Main content + 2 sidebars
- All preview cards visible
- Photos grid: 4-6 columns
- Friends card: grid-cols-4

**Spacing**:
- Generous gaps (gap-6)
- Full padding

---

## Type System

### Core Types

```typescript
// User
interface User extends Timestamp {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  intro?: string;
  work?: { title: string; company: string };
  education?: { school: string; graduationYear?: number };
  location?: { city: string; hometown?: string };
  relationshipStatus?: string;
  dateOfBirth?: string;
  friendsCount: number;
}

// Post
interface Post extends Timestamp {
  id: string;
  author: UserMinimal;
  content: string;
  privacy: PrivacyType;
  media: PostMedia[];
  backgroundColor?: string;
  reactionsCount: ReactionSummary;
  commentsCount: number;
  sharesCount: number;
  isShared: boolean;
  originalPost?: Post;
}

// Comment
interface Comment extends Timestamp {
  id: string;
  postId: string;
  author: UserMinimal;
  content: string;
  reactions: CommentReaction[];
  repliesCount: number;
  replies?: Reply[];
}
```

---

## State Management Strategy

### TanStack Query (React Query)

Used for server state:
- Profile data
- Posts
- Comments
- Friends
- Reactions

**Key Settings**:
```typescript
const query = useQuery({
  queryKey: ['profile', username],
  queryFn: () => fetchProfile(username),
  staleTime: 1000 * 60 * 5, // 5 mins
  gcTime: 1000 * 60 * 60, // 1 hour
  enabled: !!username,
});
```

### Local Component State

Used for UI state:
- Modal open/close
- Tab selection
- Form input values
- Menu visibility
- Pagination page

```typescript
const [activeTab, setActiveTab] = useState<TabId>('posts');
const [showCreateModal, setShowCreateModal] = useState(false);
```

### Optional: Zustand

For global UI state (if needed later):
```typescript
// Would store:
// - Current user
// - Notification toast
// - Theme preference
```

---

## Performance Optimization Checklist

- [x] Image lazy loading with Next.js Image
- [x] Route-based code splitting (Next.js App Router)
- [x] Query caching with appropriate staleTime
- [x] Component memoization for lists
- [x] Pagination for large datasets
- [x] Debounced search/filter
- [x] Suspense boundaries
- [ ] React.lazy() for modals (can implement)
- [ ] Virtualization for very long lists (future optimization)

---

## Accessibility Features

- Semantic HTML (button, link, heading tags)
- ARIA labels on buttons and interactive elements
- Alt text on all images
- Keyboard navigation support
- Focus states on all interactive components
- Color contrast ratio ≥4.5:1
- Loading states announced to screen readers

---

## Error Handling

### Display Errors

```typescript
if (query.isError) {
  return (
    <EmptyState
      title="Error Loading Profile"
      description={query.error?.message}
      action={<Button onClick={() => query.refetch()}>Try Again</Button>}
    />
  );
}
```

### Network Errors
- Show toast notification
- Provide retry option
- Log to error tracking service

### Validation Errors
- Show inline error below input
- Highlight invalid field
- Disable submit until fixed

---

## Browser Testing Matrix

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✓ |
| Firefox | Latest | ✓ |
| Safari | Latest | ✓ |
| Edge | Latest | ✓ |
| iOS Safari | Latest | ✓ |
| Chrome Mobile | Latest | ✓ |

---

## File Size Optimization

- Components: ~5-15 KB (minified)
- Types: ~2 KB
- Hooks: ~1-3 KB each
- CSS: Tailwind purges unused (production: ~40-50KB)
- Total JS bundle: ~200-300KB (with Next.js runtime)

---

## Next Steps for Production

1. **Connect Real Backend**
   - Replace mock API with real endpoints
   - Implement authentication
   - Add error boundaries

2. **Add Features**
   - Search profile
   - Advanced filtering
   - Notifications
   - Real-time updates (WebSocket)

3. **Performance**
   - Image CDN integration
   - Progressive image loading
   - Caching strategy

4. **Security**
   - Input sanitization
   - XSS protection
   - CSRF tokens
   - Rate limiting

5. **Monitoring**
   - Error tracking (Sentry)
   - Analytics
   - Performance monitoring
   - User session tracking

---

**Document Version**: 1.0.0
**Last Updated**: January 2024
**Compatibility**: Next.js 14+, React 18+, TypeScript 5+
