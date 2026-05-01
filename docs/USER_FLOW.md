# VibePass User Flows

---

## 1. New User Landing & Signup Flow

### 1.1 Landing Page
**URL:** `/`

**Elements:**
- Hero section: "Match by vibe. Reveal by choice."
- "How It Works" section (5 steps with icons)
- "Why Feel Different" section (trust, anonymity, quality)
- Privacy-first promise section
- Text & voice explanation
- Safety & moderation section
- FAQ (5-7 common questions)
- CTA buttons: "Start Anonymously", "Find Your Vibe"

**Flow:**
```
User visits → Sees hero + benefits
→ Scrolls through sections
→ Clicks "Start Anonymously"
→ Navigated to /auth/signup
```

---

### 1.2 Email Signup
**URL:** `/auth/signup`

**Step 1: Email Entry**
- Input: Email address
- Validation: Valid email format, not already registered
- Button: "Send OTP"
- Privacy note: "We'll send a 6-digit code to verify"

**Step 2: OTP Verification**
- Display: "Check your email for a 6-digit code"
- Input: 6-digit code (auto-focus, paste-friendly)
- Resend timer: 60s before "Resend" button active
- Error handling: Invalid code, expired code (resend)
- Success: Creates user session, redirects to `/auth/age-confirm`

**Code:**
```typescript
// POST /api/v1/auth/request-otp
{ email: "user@example.com" }

// POST /api/v1/auth/verify-otp
{ email: "user@example.com", otp: "123456" }
```

---

### 1.3 Age Confirmation
**URL:** `/auth/age-confirm`

**Elements:**
- Headline: "Confirm you're 18+"
- Checkbox: "I confirm I'm at least 18 years old"
- Checkbox: "I agree to Terms of Service"
- Button: "Continue"
- Legal links: ToS, Privacy Policy

**Logic:**
- Must check both boxes
- Button disabled until both checked
- On confirm: POST `/api/v1/users/confirm-age`
- Redirect to `/onboarding/nickname`

---

### 1.4 Nickname Creation
**URL:** `/onboarding/nickname`

**Elements:**
- Headline: "Choose your vibe name"
- Input: Nickname (3-20 chars, alphanumeric + underscore)
- Real-time validation: Check availability (debounced GET `/api/v1/users/check-nickname`)
- Suggestions: Show 3 alternatives if taken
- Info: "This is how others see you (changeable anytime)"
- Button: "Create Profile"

**Logic:**
- Regex: `^[a-zA-Z0-9_]{3,20}$`
- Check uniqueness real-time
- Show green checkmark if available
- Show red X if taken, with alternatives
- On submit: POST `/api/v1/users/create-profile`
- Redirect to `/onboarding/form`

---

## 2. Onboarding Flow

**URL:** `/onboarding/form` (multi-step form)

### 2.1 Step 1: Basic Info
**Duration:** ~1 min

**Fields:**
- Age band (radio): 18-20, 21-24, 25-28
- Pronouns (optional dropdown): He/Him, She/Her, They/Them, Other, Skip
- Gender preference (optional radio): Male/Female/Non-binary/Skip

**Design:**
- Large, tappable radio buttons
- Smooth step transitions
- Progress bar: "Step 1 of 5"
- "Next" button (disabled until all required filled)

---

### 2.2 Step 2: Conversation Intent
**Duration:** ~1 min

**Format:** Multi-select (2-3 choices required)

**Options:**
- Make new friends
- Deep conversations
- Casual chat
- Romantic chemistry
- Find study buddy
- Music discussion
- Overthinking buddy
- Fun vibes

**Design:**
- Card-based layout, highlight on select
- Allow 2-3 selections
- Smooth animations

---

### 2.3 Step 3: Interests
**Duration:** ~1.5 min

**Format:** Chips / tags with search

**Categories:**
- Music: indie, hip-hop, pop, classical, lo-fi, etc.
- Hobbies: gaming, reading, hiking, photography, cooking, etc.
- Vibes: late night, cozy, intellectual, spontaneous, etc.

**Logic:**
- Searchable list of 50+ interests
- Select 3-7 interests
- Show selected as chips
- Remove by clicking X on chip

---

### 2.4 Step 4: Language & Timezone
**Duration:** ~1 min

**Fields:**
- Preferred language (dropdown): English, Spanish, French, etc.
- Timezone (dropdown or auto-detect): UTC, EST, PST, etc.
- Voice chat comfort (slider): "Not interested" → "Very interested"

**Design:**
- Auto-populate timezone from browser
- Voice comfort slider with emoji reactions

---

### 2.5 Step 5: Safety Acknowledgment
**Duration:** ~1 min

**Content:**
- "Safety is our priority"
- Checklist of user responsibilities:
  - ✓ I won't share personal info until I trust someone
  - ✓ I'll respect other users' boundaries
  - ✓ I'll report inappropriate behavior
  - ✓ I understand this is anonymous until I choose to reveal

**Logic:**
- Must check all 4 boxes
- Button: "Complete Onboarding"
- Success: POST `/api/v1/users/onboard`
- Redirect to `/mood-selection`

---

## 3. Mood Selection

**URL:** `/mood-selection`

**Headline:** "What's your vibe right now?"

**Mood Options (Grid Layout):**
```
[Bored]        [Lonely]       [Curious]
[Want Friends] [Deep Talk]    [Soft Energy]
[Fun Chat]     [Flirting]     [Music Talk]
[Need Advice]  [Overthinking] [Study Buddy]
```

**Design:**
- 12 emoji-icon cards in 3x4 grid
- Large tap targets (mobile-first)
- Selected mood highlighted
- Button: "Find My Match"

**Logic:**
- Single-select only
- On select: POST `/api/v1/users/set-current-mood`
- Redirect to `/vibe-questions`

---

## 4. Vibe Questions

**URL:** `/vibe-questions`

**Format:** 5 quick questions (carousel or steps)

**Question Examples:**
1. "Your ideal hangout is..." (Single select)
   - Options: Coffee shop, late-night call, outdoors, creative space, cozy room
   
2. "Communication style?" (Multi-select, pick 2)
   - Options: Deep, witty, chill, adventurous, emotional, analytical

3. "Energy level today?" (Slider)
   - Scale: Low ←→ High

4. "What's on your mind?" (Short text, optional)
   - Placeholder: "Overthinking... feeling lonely... just want good convo..."

5. "Sunday vibe?" (Single select)
   - GIF/emoji based answers (aesthetic vibes)

**Logic:**
- POST `/api/v1/users/answer-vibe-questions`
- Answers feed matching algorithm
- Redirect to `/matches`

---

## 5. Home Screen (Logged In)

**URL:** `/home`

**Navigation:**
- Top: Notifications icon + Profile menu
- Bottom: Home | Rooms | Saved | Profile (mobile tab bar)

**Main Content:**
```
┌─────────────────────────────┐
│  Your Current Mood: 🤔      │
│    [Overthinking]           │
│  [Change Mood] [New Prompt] │
└──────────────┬──────────────┘
               │
       ┌───────▼────────┐
       │  Match Cards   │
       │  (swipe/tap)   │
       │  Fresh today   │
       └────────────────┘
```

**Sections (Scrollable):**
1. **Current Mood + Quick Actions**
   - Show selected mood
   - [Change Mood] button → `/mood-selection`
   - [New Daily Prompt] → Shows random conversation starter

2. **Fresh Matches**
   - Paginated match cards
   - Each card shows:
     - Nickname
     - Vibe score (70% compatible)
     - Current mood
     - Shared interests (2-3)
     - Text availability indicator
     - Voice openness indicator
   - Tap card → `/chat/:chatId` or `/chat/new/:userId`

3. **Themed Rooms**
   - Horizontal scroll
   - Room cards: emoji + name + active users count
   - Tap → `/rooms/:roomId`

4. **Saved Connections**
   - Show 3 most recent
   - Avatar + nickname + last message date
   - Tap → `/chat/:chatId`

5. **Daily Prompt**
   - Large card: "Today's question: What would you ask a stranger?"
   - Reaction buttons + discuss in rooms

---

## 6. Match Card Details

**When User Taps a Match Card:**

**URL:** `/matches/:userId`

**Content:**
```
┌──────────────────────────┐
│ [←] Back       [Share]   │
├──────────────────────────┤
│      vibe_user_123       │
│   Compatibility: 78%     │
│                          │
│   📍 Current Mood:       │
│      Overthinking        │
│                          │
│   💬 Conversation Goal:  │
│      Deep conversations  │
│                          │
│   🎵 Shared Interests:   │
│      indie | late-night  │
│      cozy vibes          │
│                          │
│   Communication Style:   │
│      Deep, witty, chill  │
│                          │
│   🎤 Voice Comfort:      │
│      Open to voice       │
│                          │
│   [Block] [Start Chat]   │
└──────────────────────────┘
```

**Actions:**
- [Block]: Block user, remove from matches
- [Start Chat]: Create chat session → `/chat/new/:userId`

---

## 7. Text Chat Flow

**URL:** `/chat/:chatId`

**Top Bar:**
```
[←] Back | other_user_nick | [Report] [Block]
```

**Chat Messages:**
- Own messages: Right-aligned, blue bubble
- Other messages: Left-aligned, gray bubble
- Timestamp: "Just now", "2m ago", "Today 3:45pm"
- Typing indicator: "vibe_user is typing..."
- Read receipts: Small checkmark icon

**Message Input:**
```
┌─────────────────────────────────┐
│ [+] Message input...   [Send ↓] │
│ Suggested prompts:              │
│ [❓ Fav late night snack?]      │
│ [🎵 Music rec?]                │
│ [😂 Funny story?]              │
└─────────────────────────────────┘
```

**Features in Chat:**
1. **Send Message**
   - Text input (max 500 chars, no image/file in MVP)
   - Send button or enter to send
   - Optimistic UI (show immediately)

2. **Typing Indicator**
   - Show typing status (real-time WebSocket)
   - "vibe_user is typing..."

3. **Reactions**
   - Long-press message → emoji menu
   - Options: 😂 😍 😮 👏 ❤️
   - Show count on message

4. **Suggested Prompts**
   - AI/curated conversation starters
   - Tap to insert in message
   - Example: "Fav late night snack?"

5. **Quick Actions Menu**
   - [Save Connection]: Save chat for later
   - [Report User]: Report for moderation
   - [Block User]: Block + close chat
   - [End Chat]: Leave conversation

---

## 8. Voice Chat Request Flow

**Prerequisites:**
- Minimum 5 messages exchanged
- Chat duration > 2 minutes
- Trust score > 50%

**Scenario:** User A requests voice

**Step 1: Request Sent**
- User A clicks [Voice Icon] or [Request Voice]
- Button shows: "Awaiting response..."
- User B receives notification

**Step 2: Recipient Sees Request**
- Notification banner: "vibe_user wants to voice chat"
- Actions: [Accept] [Decline]

**Step 3: Acceptance**
- User B clicks [Accept]
- Both users see: "Connecting..."
- WebRTC offer/answer exchange
- **Voice chat starts** (both see timer, mute/unmute buttons)

**Step 4: In Call**
```
┌──────────────────────────┐
│ vibe_user • 02:34        │
│                          │
│ [🎤 Mute]  [End Call ↓]  │
│ [Report]                 │
└──────────────────────────┘
```

**In-Call Options:**
- Mute/unmute audio
- End call
- Report user (harassment)

**After Call:**
- "End call?" confirmation
- Show summary: "Talked for 2m 34s"
- Options: [Save Connection] [Report] [Block] [Back to Chat]

---

## 9. Mutual Reveal Flow

**Prerequisites:**
- Chat duration > 10 minutes OR 50+ messages
- Voice call completed OR high trust score

**Scenario:** User A initiates reveal

**Step 1: Request Reveal**
- User A can click [Profile Icon] or menu → "Reveal Name"
- Modal: "Share your first name with vibe_user?"
- Input: First name only
- Info: "They can reveal too, but it's optional"

**Step 2: Recipient Notification**
- User B sees: "vibe_user shared their name: Alex"
- Prompt: "Share your name back? [Yes] [No]"

**Step 3: Mutual Reveal Achieved**
- Both see each other's first names
- Unlock optional: profile photo, social handle, emoji bio

**Step 4: Save to Trusted Circle**
- Option: [Save to Trusted] 
- Next time either connects first → easier access
- Shows in "Saved Connections" with first name

---

## 10. Themed Rooms Flow

**URL:** `/rooms/:roomId`

**Example:** "Late-Night Overthinkers"

```
┌────────────────────────────────┐
│ [←] Late-Night Overthinkers    │
│ 247 users active               │
├────────────────────────────────┤
│ Today's Prompt:                │
│ "What do you overthink about?" │
│ [Emoji reactions under]        │
│                                │
│ Room Feed (messages from all): │
│ vibe_user_1: "My future..."   │
│ vibe_user_2: "Same! 😅"       │
│                                │
│ [+] Your message...            │
└────────────────────────────────┘
```

**Features:**
- Scroll through public messages
- Add reaction (emoji)
- Reply to message → creates 1:1 chat
- [Leave Room] button at bottom

**Room Types:**
- Late-night overthinkers
- No judgment zone
- Music lovers
- Green flag / red flag
- Study and chill
- Soft talk room
- Honest hour
- Roast my playlist

---

## 11. Saved Connections

**URL:** `/saved`

**Display:**
```
┌────────────────────────────────┐
│ Saved Connections (12)         │
├────────────────────────────────┤
│ [👤 Alex] "Talked about life"  │
│  Last chat: Yesterday          │
│ [👤 Sam] "Great chemistry"     │
│  Last chat: 3 days ago         │
│ ...                            │
└────────────────────────────────┘
```

**Features:**
- List all saved users
- Show first names if mutually revealed
- Display last chat date
- Tap user → reopens chat
- [Unsave] option on long-press

---

## 12. Settings

**URL:** `/settings`

```
┌────────────────────────────────┐
│ Settings                       │
├────────────────────────────────┤
│ Account                        │
│ [Your Nickname: vibe_user_123] │
│ [Change Nickname]              │
│ [Email: user@example.com]      │
│ [Edit Interests/Age Band]      │
│                                │
│ Privacy & Safety               │
│ [Blocked Users (3)]            │
│ [Mood Preferences]             │
│ [Voice Comfort Level]          │
│ [Language: English]            │
│                                │
│ Notifications                  │
│ [New matches: ON]              │
│ [Voice requests: ON]           │
│ [Room mentions: OFF]           │
│                                │
│ Data & Compliance              │
│ [Download my data] (GDPR)      │
│ [Delete account]              │
│ [Terms of Service]            │
│ [Privacy Policy]              │
│                                │
│ [Logout]                       │
└────────────────────────────────┘
```

---

## 13. Report & Block Flow

**URL:** `/report` (modal or dedicated page)

**Trigger:** [Report] button in chat

**Modal:**
```
┌────────────────────────────────┐
│ Report User                    │
│ vibe_user_123                  │
├────────────────────────────────┤
│ Reason (required):             │
│ ○ Inappropriate messages       │
│ ○ Harassing behavior           │
│ ○ Spam                         │
│ ○ Scam / Catfish              │
│ ○ Other                        │
│                                │
│ Details (optional):            │
│ [Text area for context]        │
│                                │
│ [Cancel] [Submit Report]       │
└────────────────────────────────┘
```

**After Submit:**
- Confirmation: "Thanks for helping keep VibePass safe"
- Chat with user continues (user doesn't know they're reported)
- Moderation queue receives report
- Admin reviews within 24h

**Block Flow:**
- Same modal, one-click [Block]
- Immediately removes chat
- User unaware they're blocked
- Can unblock in Settings

---

## 14. Logout

**URL:** Any page + click profile → [Logout]

**Flow:**
1. Confirm: "Logout?"
2. POST `/api/v1/auth/logout` (invalidate JWT + session)
3. Clear local storage
4. Redirect to `/` (landing)

---

## 15. On Next Return (Returning User)

**URL:** `/` (redirects based on auth status)

**Flow:**
1. User logs back in with email OTP
2. Backend checks: `user.onboarding_completed`
3. If true → Redirect to `/home` + check mood:
   - If mood older than 24h → Show `/mood-selection`
   - Else → Show `/home` with fresh matches + new daily prompt

**Home Shows:**
- Recent chats (last 3 saved connections)
- New vibe prompt for the day
- Fresh matches filtered by new mood
- Notifications (if any)

---

**Next:** See API_SPECIFICATION.md for backend endpoint details.
