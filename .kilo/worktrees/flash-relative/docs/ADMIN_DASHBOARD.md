# Admin Dashboard

The primary goal of the Admin architecture is rapid moderation. The dashboard must empower staff to protect the 18-28 target demographic efficiently without reading personal chats unnecessarily.

## MVP Pages & Functions

### 1. The Queue (Abuse Reports)
- **Ticket System**: Aggregates User Reports -> Tickets.
- **Priority**: Tickets flagged with "Underage" or "Extreme Harassment" keywords bypass standard queues.
- **Action Links**: `Ban User`, `Suspend 24h`, `Dismiss Report`, `Request More Context`.

### 2. User Management
- View **Trust Scores**, total reports received, total matches completed.
- Access to high-level metadata (Account age, block lists).
- **Hard Rule**: The dashboard CANNOT pull chat logs manually unless a specific Chat Session ID has been linked to an active Abuse Report by one of the participants.

### 3. Prompt & Room Manager
- **Daily Prompt Management**: Schedule "Tonight's Vibe" questions (CRON inputs).
- **Themed Rooms Config**: Create and manage static text rooms ("Late-night overthinkers", "Music lovers").
- **Vibe Category Admin**: Add/remove interests and moods based on user trends.

### 4. System Analytics
- Track core conversion flows:
  - Account Signups -> Onboarding Completion.
  - Match Conversion Rate.
  - Voice Invite Acceptance Rate (The key metric for psychological safety success).
  - Total active text sessions per hour.
- System health (Redis mapping counts, socket connections).

## Future Expansion
- **Appeal Management Workspace**: Allow banned users to submit appeals and staff to review them.
- **AI Triage**: NLP integration to assign confidence scores to incoming reports before a human reads them.
