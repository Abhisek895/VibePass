# Frontend Structure

VibePass utilizes Next.js 14+ with the App Router, heavily leaning on React Server Components where sensible, and Client Components for real-time interactivity.

## Directory Layout

```text
frontend/
├── src/
│   ├── app/                    # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/             # Login, magic-link routing
│   │   ├── (dashboard)/        # Main app post-login
│   │   │   ├── mood/           # Mood selection page
│   │   │   ├── matches/        # Match pool viewing
│   │   │   ├── chat/[id]/      # Active text chat UI
│   │   │   ├── rooms/          # Themed rooms list
│   │   │   └── settings/       # Profile, privacy settings
│   │   ├── onboarding/         # Vibe questions, nickname setup
│   │   ├── admin/              # Moderation dashboard (role-protected)
│   │   ├── layout.tsx          # Root layout (fonts, providers)
│   │   └── page.tsx            # the Landing Page
│   │
│   ├── components/             # Reusable UI Blocks
│   │   ├── core/               # Buttons, Inputs, Modals, Typography
│   │   ├── chat/               # Message bubbles, input area, typing indicators
│   │   ├── voice/              # WebRTC call UI, incoming call modals
│   │   ├── matches/            # Match cards, compatibility displays
│   │   ├── safety/             # Report forms, block confirmation modals
│   │   └── layout/             # Navigation bars, bottom sheets (mobile)
│   │
│   ├── hooks/                  # Custom React functionality
│   │   ├── useAuth.ts          # Session management
│   │   ├── useSocket.ts        # Manage Socket.io connection instance
│   │   ├── useChat.ts          # Text chat state and sending
│   │   ├── useWebRTC.ts        # Voice signaling and peer connection state
│   │   └── useMatching.ts      # Polling/fetching matches
│   │
│   ├── lib/                    # Utilities and configuration
│   │   ├── api.ts              # Axios/Fetch interceptors and endpoints
│   │   ├── socket.ts           # Socket initialization
│   │   ├── webrtc.ts           # Peer connection helpers
│   │   └── utils.ts            # Tailwind `cn`, date formatters
│   │
│   ├── store/                  # Global client state (Zustand or Context)
│   │   ├── authStore.ts
│   │   ├── uiStore.ts          # Drawer/Modal global states
│   │   └── callStore.ts        # Active call metadata
│   │
│   └── types/                  # TypeScript interface definitions
│       ├── user.d.ts
│       ├── chat.d.ts
│       └── match.d.ts
```

## Styling & Theming
- **Tailwind CSS** for rapid styling.
- **Dark Mode Default**: Premium, emotionally warm dark greys (`#121212`) with soft gradients (purple/indigo/warm orange).
- **Framer Motion**: Subtle spring animations, modal slides, and smooth page transitions.

## Mobile-First Considerations
- Bottom navigation bar on mobile devices.
- Swiping gestures on match cards.
- Bottom sheet panels for settings and modals to ensure thumb reachability.
