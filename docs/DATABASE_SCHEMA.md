# VibePass Database Schema (Prisma ORM)

---

## Overview

**Database:** PostgreSQL  
**ORM:** Prisma  
**Total Tables:** 17  

This schema supports:
- User authentication & profiles
- Onboarding & preferences
- Matching & compatibility
- Text & voice chats
- Messaging & reactions
- Moderation & safety
- Analytics & audit logs

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Users     │◄────────┤   Auth Sessions  │         │    Moods     │
├─────────────┤         └──────────────────┘         ├──────────────┤
│ id (PK)     │                                      │ id (PK)      │
│ email       │                                      │ name         │
│ username    │                                      │ emoji        │
│ age         │◄────────┐   ┌─────────────────────┐ │ description  │
│ created_at  │         │   │  User Preferences  │ │ color        │
│ updated_at  │         └───┤ (1:1)              │ │ category     │
└─────────────┘             └─────────────────────┘ └──────────────┘
       │
       │ 1:M
       ├─────────────────────►┌──────────────┐
       │ creates               │   Profiles   │
       │                       ├──────────────┤
       │                       │ id (PK)      │
       │                       │ user_id (FK) │
       │                       │ bio          │
       │                       │ pronouns     │
       │                       │ interests[]  │
       │                       │ voice_open   │
       │                       │ updated_at   │
       │                       └──────────────┘
       │
       │ 1:M
       ├─────────────────────►┌──────────────┐
       │ answers               │ Prompt       │
       │                       │ Answers      │
       │                       ├──────────────┤
       │                       │ id (PK)      │
       │                       │ user_id (FK) │
       │                       │ prompt_id(FK)│
       │                       │ answer_text  │
       │                       │ created_at   │
       │                       └──────────────┘
       │
       ├─────────────────────►┌──────────────────┐
       │ initiates             │  Chats / Rooms   │
       │                       ├──────────────────┤
       │                       │ id (PK)          │
       │                       │ user1_id (FK)    │
       │                       │ user2_id (FK)    │
       │                       │ room_id (FK, opt)│
       │                       │ status           │
       │                       │ started_at       │
       │                       │ ended_at         │
       │                       │ archived_at      │
       │                       └──────────────────┘
       │                                │
       │                                │ 1:M
       │                                ├─► Messages
       │                                │    ├─ id
       │                                │    ├─ chat_id
       │                                │    ├─ sender_id
       │                                │    ├─ content
       │                                │    ├─ moderation_status
       │                                │    └─ created_at
       │
       ├─────────────────────►┌──────────────────┐
       │ initiates             │  Voice Sessions  │
       │                       ├──────────────────┤
       │                       │ id (PK)          │
       │                       │ user1_id (FK)    │
       │                       │ user2_id (FK)    │
       │                       │ chat_id (FK)     │
       │                       │ status           │
       │                       │ duration_seconds │
       │                       │ signal_url       │
       │                       │ started_at       │
       │                       │ ended_at         │
       │                       └──────────────────┘
       │
       ├─────────────────────►┌──────────────────┐
       │ sends                 │  Reports         │
       │                       ├──────────────────┤
       │                       │ id (PK)          │
       │                       │ reporter_id (FK) │
       │                       │ reported_id (FK) │
       │                       │ chat_id (FK, opt)│
       │                       │ reason           │
       │                       │ description      │
       │                       │ status           │
       │                       │ created_at       │
       │                       └──────────────────┘
       │
       ├─────────────────────►┌──────────────────┐
       │ manages               │  Blocks          │
       │                       ├──────────────────┤
       │                       │ id (PK)          │
       │                       │ blocker_id (FK)  │
       │                       │ blocked_id (FK)  │
       │                       │ created_at       │
       │                       └──────────────────┘
       │
       ├─────────────────────►┌──────────────────┐
       │ receives              │  Badges          │
       │                       ├──────────────────┤
       │ (many-to-many)        │ id (PK)          │
       │                       │ user_id (FK)     │
       │                       │ badge_type       │
       │                       │ count            │
       │                       │ awarded_at       │
       │                       └──────────────────┘
       │
       ├─────────────────────►┌──────────────────┐
       │ saves                 │  Saved Conn.     │
       │ (many-to-many)        ├──────────────────┤
       │                       │ id (PK)          │
       │                       │ user1_id (FK)    │
       │                       │ user2_id (FK)    │
       │                       │ chat_id (FK, opt)│
       │                       │ label            │
       │                       │ saved_at         │
       │                       └──────────────────┘
       │
       └─────────────────────►┌──────────────────┐
         rates (feedback)      │  User Feedback   │
                               ├──────────────────┤
                               │ id (PK)          │
                               │ from_user_id(FK) │
                               │ to_user_id (FK)  │
                               │ chat_id (FK)     │
                               │ attributes[]     │
                               │ created_at       │
                               └──────────────────┘

┌──────────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Prompts        │     │   Interests  │     │   Conversation   │
├──────────────────┤     ├──────────────┤     │   Intents        │
│ id (PK)          │     │ id (PK)      │     ├──────────────────┤
│ text             │     │ name         │     │ id (PK)          │
│ type             │     │ emoji        │     │ name             │
│ category         │     │ description  │     │ description      │
│ difficulty       │     │ color        │     │ icon             │
│ is_active        │     └──────────────┘     └──────────────────┘
│ is_daily         │
│ is_rotated       │     ┌──────────────┐
│ daily_theme      │     │   Rooms      │
│ created_at       │     ├──────────────┤
│ expires_at       │     │ id (PK)      │
└──────────────────┘     │ name         │
                         │ description  │
                         │ prompt_id(FK)│
                         │ theme        │
                         │ is_voice     │
                         │ capacity     │
                         │ created_at   │
                         │ expires_at   │
                         └──────────────┘
                                │
                                │ 1:M
                                ├─► Room_Members
                                │    ├─ id
                                │    ├─ room_id
                                │    ├─ user_id
                                │    ├─ joined_at
                                │    └─ left_at

┌──────────────────────┐  ┌────────────────┐  ┌──────────────────┐
│  Moderation Actions  │  │ Audit Logs     │  │ Admin Users      │
├──────────────────────┤  ├────────────────┤  ├──────────────────┤
│ id (PK)              │  │ id (PK)        │  │ id (PK)          │
│ report_id (FK, opt)  │  │ admin_id (FK)  │  │ email            │
│ action_type          │  │ action         │  │ role             │
│ action_reason        │  │ target_type    │  │ permissions[]    │
│ target_user_id (FK)  │  │ target_id      │  │ created_at       │
│ admin_id (FK)        │  │ details        │  │ updated_at       │
│ status               │  │ created_at     │  └──────────────────┘
│ created_at           │  └────────────────┘
│ expires_at           │
└──────────────────────┘

┌──────────────────────┐  ┌────────────────────┐
│ Compatibility Scores │  │ Settings/Features  │
├──────────────────────┤  ├────────────────────┤
│ id (PK)              │  │ id (PK)            │
│ user1_id (FK)        │  │ feature_key        │
│ user2_id (FK)        │  │ feature_value      │
│ score                │  │ feature_type       │
│ components:          │  │ is_enabled         │
│   mood_match         │  │ updated_at         │
│   interest_match     │  │ updated_by         │
│   intent_match       │  └────────────────────┘
│   vibe_match         │
│ calculated_at        │
└──────────────────────┘
```

## Core Tables

### Users
Primary user entity. Stores identity and core data.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,  -- nickname
  age INT NOT NULL CHECK (age >= 18),
  password_hash VARCHAR(255),  -- NULL if using magic link only
  
  -- Account status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'deleted')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  
  -- Privacy & preferences
  show_status BOOLEAN DEFAULT TRUE,
  last_seen_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  
  -- Indexing
  CONSTRAINT age_18_plus CHECK (age >= 18)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

### Profiles
User profile data (bio, interests, pronouns, etc.).

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Bio and identity
  bio VARCHAR(500),
  pronouns VARCHAR(100),
  
  -- Interests (JSON array)
  interests JSONB DEFAULT '[]',
  
  -- Voice comfort
  voice_preference VARCHAR(50) DEFAULT 'conditional' 
    CHECK (voice_preference IN ('yes', 'maybe', 'conditional', 'no', 'not_sure')),
  
  -- Reputation / Safety
  reputation_score INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  moderation_flags INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_voice_preference ON profiles(voice_preference);
```

### Auth_Sessions
JWT tokens and refresh tokens.

```sql
CREATE TABLE auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Token data
  refresh_token_hash VARCHAR(255) NOT NULL,
  access_token_jti VARCHAR(255),  -- JWT ID for revocation
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  device VARCHAR(100),
  
  -- Validity
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_expires_at ON auth_sessions(expires_at);
```

### Moods
Pre-defined moods users can select.

```sql
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,  -- "curious", "bored", "lonely"
  emoji VARCHAR(10),
  description TEXT,
  color VARCHAR(7),  -- Hex color
  category VARCHAR(50),  -- "emotional", "social", "activity"
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moods_category ON moods(category);
CREATE INDEX idx_moods_is_active ON moods(is_active);
```

### Interests
Pre-defined interests users can select.

```sql
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  emoji VARCHAR(10),
  category VARCHAR(50),  -- "music", "activities", "topics"
  description TEXT,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interests_category ON interests(category);
```

### Conversation_Intents
User's desired conversation type (deep talk, fun, flirting, etc.).

```sql
CREATE TABLE conversation_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,  -- "deep_talk", "flirting", "friendship"
  emoji VARCHAR(10),
  description TEXT,
  color VARCHAR(7),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User_Preferences
User's current session preferences (mood, intent, shown on profile).

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Current session
  current_mood_id UUID REFERENCES moods(id),
  conversation_intent_id UUID REFERENCES conversation_intents(id),
  
  -- Filters
  preferred_age_min INT DEFAULT 18,
  preferred_age_max INT DEFAULT 60,
  prefer_voice BOOLEAN DEFAULT TRUE,
  
  -- Accessibility
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  
  -- Privacy
  hide_from_matching BOOLEAN DEFAULT FALSE,
  matching_cooldown_until TIMESTAMP,
  
  -- Updated
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_current_mood_id ON user_preferences(current_mood_id);
```

### Prompts
Dynamic prompt questions for onboarding and chat.

```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text VARCHAR(500) NOT NULL,
  
  -- Categorization
  prompt_type VARCHAR(50) DEFAULT 'vibe' 
    CHECK (prompt_type IN ('onboarding', 'chat_starter', 'daily', 'room')),
  category VARCHAR(50),
  difficulty VARCHAR(50) DEFAULT 'medium' 
    CHECK (difficulty IN ('light', 'medium', 'deep')),
  
  -- Functionality
  answer_type VARCHAR(50) DEFAULT 'text' 
    CHECK (answer_type IN ('text', 'single_select', 'multi_select', 'slider')),
  choices JSONB,  -- Options for single/multi-select
  
  -- Rotation
  is_daily BOOLEAN DEFAULT FALSE,
  daily_theme VARCHAR(100),
  daily_starts_at TIMESTAMP,
  daily_expires_at TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_prompts_type ON prompts(prompt_type);
CREATE INDEX idx_prompts_category ON prompts(category);
CREATE INDEX idx_prompts_is_active ON prompts(is_active);
CREATE INDEX idx_prompts_difficulty ON prompts(difficulty);
```

### Prompt_Answers
User's responses to prompts.

```sql
CREATE TABLE prompt_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prompt_id UUID NOT NULL REFERENCES prompts(id),
  
  -- Answer data
  answer_text TEXT,
  answer_value JSONB,  -- For structured answers
  
  -- Tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, prompt_id)  -- One answer per prompt per user
);

CREATE INDEX idx_prompt_answers_user_id ON prompt_answers(user_id);
CREATE INDEX idx_prompt_answers_prompt_id ON prompt_answers(prompt_id);
```

### Chats
Chat session between two users.

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context
  room_id UUID REFERENCES rooms(id),  -- NULL for 1:1, set for room-started chat
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' 
    CHECK (status IN ('active', 'archived', 'blocked', 'reported', 'deleted')),
  
  -- Visibility (mutual consent for reveals)
  user1_revealed BOOLEAN DEFAULT FALSE,
  user2_revealed BOOLEAN DEFAULT FALSE,
  
  -- Messaging
  last_message_at TIMESTAMP,
  message_count INT DEFAULT 0,
  
  -- Archive info
  archived_by_user1_at TIMESTAMP,
  archived_by_user2_at TIMESTAMP,
  
  -- Timestamps
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chats_user1_id ON chats(user1_id);
CREATE INDEX idx_chats_user2_id ON chats(user2_id);
CREATE INDEX idx_chats_status ON chats(status);
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC);
```

### Messages
Individual messages within a chat.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Content
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text' 
    CHECK (content_type IN ('text', 'emoji', 'reaction')),
  
  -- Metadata
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP,
  
  -- Moderation
  moderation_status VARCHAR(50) DEFAULT 'clean' 
    CHECK (moderation_status IN ('clean', 'flagged', 'hidden', 'deleted')),
  moderation_reason VARCHAR(200),
  flagged_by_user_id UUID,  -- Who reported this message
  
  -- Read receipts
  read_by_recipient_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_moderation_status ON messages(moderation_status);
```

### Voice_Sessions
Voice call or voice room sessions.

```sql
CREATE TABLE voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Context
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'ringing', 'accepted', 'active', 'ended', 'rejected', 'missed', 'failed')),
  
  -- Signaling
  initiator_id UUID REFERENCES users(id),
  signal_offer TEXT,  -- WebRTC offer
  signal_answer TEXT,  -- WebRTC answer
  signal_candidates JSONB,  -- ICE candidates
  
  -- Call metrics
  duration_seconds INT DEFAULT 0,
  quality_score INT,  -- 1-5
  
  -- Recording (future feature)
  is_recorded BOOLEAN DEFAULT FALSE,
  recording_url VARCHAR(500),
  
  -- Timestamps
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_voice_sessions_user1_id ON voice_sessions(user1_id);
CREATE INDEX idx_voice_sessions_user2_id ON voice_sessions(user2_id);
CREATE INDEX idx_voice_sessions_chat_id ON voice_sessions(chat_id);
CREATE INDEX idx_voice_sessions_status ON voice_sessions(status);
```

### Reports
User reports for safety and moderation.

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  -- Context
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  voice_session_id UUID REFERENCES voice_sessions(id) ON DELETE SET NULL,
  
  -- Report details
  reason VARCHAR(100) NOT NULL,  -- "harassment", "abuse", "inappropriate", etc.
  description TEXT,
  evidence_screenshots JSONB,  -- URLs to screenshots
  
  -- Investigation
  status VARCHAR(50) DEFAULT 'open' 
    CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed', 'appealed')),
  assigned_to_admin_id UUID REFERENCES admin_users(id),
  investigation_notes TEXT,
  
  -- Action
  action_taken VARCHAR(100),  -- "user_warned", "chat_blocked", "user_suspended", etc.
  action_expires_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user_id ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
```

### Blocks
User blocking user.

```sql
CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Reason (optional)
  reason VARCHAR(200),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(blocker_id, blocked_user_id),
  CONSTRAINT no_self_block CHECK (blocker_id != blocked_user_id)
);

CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_user_id ON blocks(blocked_user_id);
```

### Compatibility_Scores
Pre-calculated match compatibility between users.

```sql
CREATE TABLE compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Overall score
  total_score DECIMAL(5, 2) DEFAULT 0,  -- 0-100
  
  -- Component scores (out of 100)
  mood_compatibility INT DEFAULT 0,
  interest_compatibility INT DEFAULT 0,
  intent_compatibility INT DEFAULT 0,
  vibe_compatibility INT DEFAULT 0,
  response_time_bonus INT DEFAULT 0,
  
  -- Metadata
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_compatibility_scores_user1_id ON compatibility_scores(user1_id);
CREATE INDEX idx_compatibility_scores_total_score ON compatibility_scores(total_score DESC);
```

### Badges
Reputation badges earned by users.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Badge type
  badge_type VARCHAR(100) NOT NULL 
    CHECK (badge_type IN ('good_listener', 'funny', 'kind_energy', 'honest', 'thoughtful', 'green_flag', 'calm_presence', 'easy_to_talk_to', 'vibe_match_pro')),
  
  -- Data
  count INT DEFAULT 1,
  awarded_by_feedback BOOLEAN DEFAULT TRUE,  -- vs. automatic
  
  -- Timestamps
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, badge_type)
);

CREATE INDEX idx_badges_user_id ON badges(user_id);
CREATE INDEX idx_badges_badge_type ON badges(badge_type);
```

### Saved_Connections
Favorites / saved matches.

```sql
CREATE TABLE saved_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Chat context
  chat_id UUID REFERENCES chats(id) ON DELETE SET NULL,
  
  -- Labels / notes
  label VARCHAR(100),  -- "good_vibe", "potential_friend", etc.
  notes TEXT,
  
  -- Tracking
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_contacted_at TIMESTAMP,
  
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_saved_connections_user1_id ON saved_connections(user1_id);
CREATE INDEX idx_saved_connections_saved_at ON saved_connections(saved_at DESC);
```

### User_Feedback
Post-chat feedback on user behavior.

```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Context
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  
  -- Feedback attributes (booleans)
  is_respectful BOOLEAN,
  is_kind BOOLEAN,
  is_funny BOOLEAN,
  is_thoughtful BOOLEAN,
  made_me_comfortable BOOLEAN,
  
  -- Optional comment
  comment TEXT,
  
  -- Privacy
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(from_user_id, to_user_id, chat_id)
);

CREATE INDEX idx_user_feedback_to_user_id ON user_feedback(to_user_id);
```

### Rooms
Themed group chat/voice rooms.

```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  description TEXT,
  theme VARCHAR(100),  -- "overthinkers", "music_lovers", etc.
  emoji VARCHAR(10),
  
  -- Functionality
  prompt_id UUID REFERENCES prompts(id),
  is_voice_enabled BOOLEAN DEFAULT FALSE,
  capacity INT DEFAULT 50,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' 
    CHECK (status IN ('active', 'paused', 'archived')),
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Creator/Moderation
  created_by_admin_id UUID REFERENCES admin_users(id),
  moderation_level VARCHAR(50) DEFAULT 'standard',
  
  -- Schedule
  starts_at TIMESTAMP,
  expires_at TIMESTAMP,
  
  -- Tracking
  participant_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP
);

CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_is_featured ON rooms(is_featured);
CREATE INDEX idx_rooms_expires_at ON rooms(expires_at);
```

### Room_Members
Users in a room.

```sql
CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Participation
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  is_muted BOOLEAN DEFAULT FALSE,
  
  -- Contribution
  message_count INT DEFAULT 0,
  
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room_id ON room_members(room_id);
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
```

### Moderation_Actions
Admin actions (warn, suspend, ban).

```sql
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action
  action_type VARCHAR(50) NOT NULL 
    CHECK (action_type IN ('warning', 'message_deletion', 'chat_suspension', 'account_suspension', 'ban', 'appeal_review')),
  
  -- Target
  target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  
  -- Details
  reason VARCHAR(500) NOT NULL,
  severity VARCHAR(50) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Duration
  duration_days INT,  -- NULL for permanent
  expires_at TIMESTAMP,
  
  -- Admin
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  admin_notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' 
    CHECK (status IN ('active', 'appealed', 'overturned', 'expired')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  reviewed_by_admin_id UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_moderation_actions_target_user_id ON moderation_actions(target_user_id);
CREATE INDEX idx_moderation_actions_status ON moderation_actions(status);
CREATE INDEX idx_moderation_actions_expires_at ON moderation_actions(expires_at);
```

### Admin_Users
Admin staff with moderation permissions.

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Permissions
  role VARCHAR(50) NOT NULL CHECK (role IN ('moderator', 'senior_moderator', 'admin', 'developer')),
  permissions JSONB DEFAULT '[]',  -- Fine-grained permissions
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by_admin_id UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
```

### Audit_Logs
Record of all important actions for compliance.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action
  action VARCHAR(200) NOT NULL,
  action_type VARCHAR(50),  -- "user_created", "report_resolved", "user_banned", etc.
  
  -- Actor
  admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  actor_type VARCHAR(50),  -- "admin", "system", "user"
  
  -- Target
  target_type VARCHAR(50),  -- "user", "chat", "message", "report"
  target_id UUID,
  
  -- Details
  details JSONB,
  ip_address INET,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Settings
Global feature flags and configuration.

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Key-value pair
  key VARCHAR(255) NOT NULL UNIQUE,
  value TEXT,
  value_type VARCHAR(50),  -- "string", "integer", "boolean", "json"
  
  -- Metadata
  description TEXT,
  is_feature_flag BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by_admin_id UUID REFERENCES admin_users(id)
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_is_feature_flag ON settings(is_feature_flag);
```

## Indexing Strategy

Key indexes for performance:
- **user_id**: All tables with user references (chats, messages, reports)
- **created_at** DESC: For fetching recent data
- **status**: For filtering by state
- **Composite indexes**: (user1_id, user2_id) for chat/connection lookups
- **Full-text search**: On message content and bio (future)

## Constraints & Rules

1. **Age Verification**: age >= 18 enforced at database level
2. **Unique Usernames**: Single username per user
3. **No Self-Interactions**: Users cannot chat with themselves, block themselves
4. **Cascade Deletion**: Delete user → cascade to all related records
5. **Immutable Timestamps**: created_at should never be updated
6. **Status Tracking**: Important entities track status (active, suspended, deleted)

## Soft Deletes

Some tables use soft deletes (deleted_at timestamp) for compliance and audit trails:
- users
- chats
- messages
- reports

Others use hard deletes or status flags depending on data sensitivity.

## Migration Strategy

See `backend/database/migrations/` for SQL files:
```
001_create_users.sql
002_create_profiles.sql
003_create_moods.sql
...
```

Each migration is incremental and idempotent.
