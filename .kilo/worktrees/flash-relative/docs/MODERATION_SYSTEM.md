# Moderation & Safety System

VibePass prioritizes psychological safety above all. The platform targets 18-28 year-olds and specifically needs to avoid the toxicity of "random chat" environments. 

## 1. Zero Tolerance Reporting Pipeline
- **Easy Access**: Shield icon is permanently top-right in text chats, voice calls, and room streams.
- **Report Actions**:
  - `Harassment/Bullying`
  - `Inappropriate/Sexual Content`
  - `Underage (Under 18)`
  - `Spam/Bot`
  - `Other`
- **Immediate Mitigation**: Submitting a report instantly severs the connection and blocks the user from matching again.

## 2. Panic Exit Mechanism
- In active 1:1 sessions, the user has a **"Panic Exit"** button. This:
  1. Instantly kills the WebRTC peer connection.
  2. Disconnects the socket.
  3. Archives the chat to "Hidden/Blocked".
  4. Triggers an automated fast-track report prompt.

## 3. Trust Score System (Future / Iterative implementation)
- **Base Score**: 100 for verified signups.
- **Positive Impacts**: 
  - Consistent positive post-call feedback (e.g., "Good vibes", "Made me feel safe").
  - Receiving Vibe Badges.
- **Negative Impacts**:
  - High block rate.
  - Received reports (weighted heavily).
  - Suspiciously rapid swiping/passing behavior (bot pattern).
- Users with heavily degraded scores are silently ghost-banned or suspended pending review. Minimum trust score thresholds required for Voice Chat feature.

## 4. Automated Text Moderation
- Messages run through a lightweight profane/sensitive keyword filter locally.
- Blatant policy violations (e.g., sharing underage content keywords, extreme slurs) trigger flagged alerts directly to the Admin Queue, bypassing the need for user reports.
- *Privacy constraint*: To maintain the premise, human admins do not read private 1:1 chats unless one of the participants specifically Submits a Report, granting consent to access the chat logs surrounding the incident.

## 5. Age Gating
- 18+ strict enforcement on signup via Honor System for MVP, progressing to lightweight identity checks if scaling demands it.
- Underage reports trigger automatic immediate account suspension, requiring manual appeal.
