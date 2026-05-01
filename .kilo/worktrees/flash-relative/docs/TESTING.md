# Testing Plan

The VibePass platform relies on absolute reliability in its real-time components. A dropped call or failing chat socket breaks trust immediately.

## 1. Unit Testing
- **Backend (Jest)**
  - JWT generation and Verification.
  - The Match Engine Logic (Validate that 2 users with identical parameters receive the correct 100% score modifier).
  - Validation schemas (Zod validators rejecting malformed Nicknames or invalid ages).

- **Frontend (Vitest / React Testing Library)**
  - Component rendering for complex modals (Voice Request Modal, Panic Exit confirmation).
  - State management (Zustand store resetting properly on Logout).

## 2. Integration & Socket Testing
- **Socket.io Load Testing**: Use Artilery + Socket.io plugin to simulate 10,000 concurrent connection and `message:send` events. Measure latency and server CPU overhead. Redis Adapter pub/sub performance.
- **WebRTC Signaling Flow**: Simulate the Offer -> Answer -> ICE Candidate exchange using automated headless browser test scripts.

## 3. End-To-End (E2E) UI Testing
- **Cypress / Playwright**
  - The Auth Magic Link Flow (Mocking the SMTP transport).
  - Full Onboarding Flow (Ensuring all steps exist and route correctly).
  - Match -> Chat -> Voice Request Flow: Requires dual-browser orchestration to simulate User A clicking 'Request' and User B clicking 'Accept'.

## 4. Manual QA
- Cross-browser WebRTC permissions (iOS Safari requires explicit prompt handling unlike desktop Chrome).
- Mobile layout testing (Checking if the keyboard pushes up the Chat UI properly without obscuring the input box on iOS/Android).
