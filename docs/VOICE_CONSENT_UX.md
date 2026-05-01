# Voice Consent and Reveal UX

Voice chat represents a significant escalation in intimacy and risk compared to text chat. VibePass handles this transition through strict mutual-consent gateways that prioritize psychological safety.

## Core UX Principles
1. **Opt-in Only**: Text chat is the default. Voice chat is never automatic.
2. **Asymmetric Safety**: Declining an invite must not cause friction or awkwardness.
3. **Clear Escape Routes**: Exiting a call should take exactly one tap.
4. **No Guilt**: System-generated copies soften the blow of a rejected voice request.

## The Voice Request Flow

### Step 1: The Request
- **User A** clicks the "Voice" icon in the text chat.
- The UI asks User A to confirm: "Send a voice chat request to [Nickname]?"
- **User A** confirms. The chat displays a status message: *"Voice chat request sent..."*

### Step 2: The Gateway
- **User B** sees a localized modal or inline notification: 
  > **🎙️ Voice Chat Request**
  > [Nickname] wants to voice chat. You will remain anonymous.
  > [ Accept ]  [ Not right now ]
- **Anti-pressure design**: The "Not right now" button is visually equal or grouped cleanly to avoid feeling like a hostile rejection.

### Step 3: Resolution
- **If User B accepts**:
  - The text chat transitions into an Active Call state at the top of the screen.
  - A subtle ringing/connecting indicator plays.
  - WebRTC establishes the connection.
- **If User B declines**:
  - The voice request is hidden.
  - **User A** sees an inline system message: *"User B prefers to stick to text for now."*
  - This removes the sting of rejection and frames it as a preference.

## The Active Call Experience

- **Minimal UI**: Soft pulsing avatar or audio level wave.
- **Controls**: 
  - Mute Microphone
  - Report / Panic Exit 🚨
  - End Call
- **No Video**: The video track is physically disabled in the WebRTC configuration.

## Post-Call Safety Check
Immediately upon ending a call, both users receive an ephemeral sheet:
> **How was your chat with [Nickname]?**
> - 🟢 Great vibe
> - 🟡 Neutral
> - 🔴 Uncomfortable (Report anonymously)

This drives the Vibe Badges and trust scoring system organically.

## The Reveal Mechanics
When users want to drop anonymity, they use the modular Reveal Flow.

1. **Trigger**: "Send a Reveal Request" menu.
2. **Options**: Choose what to reveal (e.g., "First Name", "Instagram Handle").
3. **Consent**: The other user must explicitly agree to the *same* reveal level.
4. **Execution**: Both items are unlocked simultaneously on both screens.
5. **No Takebacks but Blocking**: Once revealed, you cannot un-reveal to that specific user, but you can block them, which severs all access.
