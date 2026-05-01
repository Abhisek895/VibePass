# VibePass User Flows

This document details the critical user journeys through the VibePass platform.

## 1. Onboarding Flow
1. **Landing Page**: User lands on the homepage. Reads "Match by vibe. Reveal by choice."
2. **Authentication**: User enters email. Receives OTP/Magic Link. Submits OTP.
3. **Basic Setup**: 
   - Enter Nickname.
   - Confirm Age (18+ gate).
4. **Vibe Profiling**:
   - Select primary conversational intent (e.g., Deep talk, Fun chat, Friendship).
   - Select overarching interests.
   - Adjust sliding scales on communication style.
5. **Initial Questions**:
   - Answer 5 fast-paced vibe questions (e.g., "What energy drains you?").
6. **Completion**: Lands on the Main Dashboard / Mood Selection.

## 2. Mood & Match Flow
1. **Select Mood**: User picks a current mood (e.g., Bored, Need Advice, Playful).
2. **Match Engine Processing**: System finds users with compatible vibe scores, similar selected mood, and availability.
3. **Match Cards**: User sees a stack of match cards displaying:
   - Nickname, Compatibility %
   - Shared tags and mood
   - **No profile picture or real name.**
4. **Action**: User clicks "Start Chat" on a match.
5. **Connection**: If the other user is online and accepts/auto-matches, the text chat opens.

## 3. Text Chat Flow
1. **Entering Chat**: Clean, minimal chat interface opens.
2. **Interacting**: Users exchange text messages. Typing indicators show presence.
3. **Prompt Assitance**: If conversation stalls, system suggests a "vibe prompt" widget in the chat.
4. **Conclusion**:
   - A user leaves the chat (connection archived).
   - Or, users choose to save the connection.
   - Or, users transition to Voice Chat.

## 4. Voice Consent & Reveal Flow
*See VOICE_CONSENT_UX.md for extreme detail.*
1. **Request**: User A presses the "Voice Chat" icon in the text chat menu.
2. **Consent Modal**: User B receives a non-intrusive prompt: "User A wants to start a voice chat. You will remain anonymous."
3. **Decision**:
   - If User B declines: User A sees "User B prefers to keep typing for now."
   - If User B accepts: WebRTC connection initializes.
4. **In-Call**: Active call modal with Mute, End Call, and Report options.
5. **Post-Call Feedback**: A fast popup asks "Did this feel safe?" and "Want to save this connection?".

## 5. Mutual Reveal Flow
1. **Initiation**: After a successful chat/call, User A initiates a "Reveal Request" (e.g., reveal first name or Instagram handle).
2. **Consent**: User B receives the request.
3. **Reveal**: Only if User B accepts, both users exchange the requested piece of information.
4. **Rejection**: If User B declines, the system enforces the boundary smoothly and keeps the conversation anonymous.

## 6. Moderation & Safety Flow
1. **Reporting**: Next to every message/user exists a clear "Shield" icon.
2. **Action**: User clicks Shield -> "Report / Block / Mute".
3. **Panic Exit**: A single button "End & Block" instantly severs the connection and hides the chat history.
4. **Feedback loop**: The system logs the report to the Admin Dashboard for review.
