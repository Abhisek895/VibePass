# VibePass Design System

**Core Vision**: A late-night, premium, private social experience. The UI must feel emotionally intelligent, safe, attractive, and addictive without being loud or trashy. It prioritizes mobile polish, tactile button feel, smooth loading states, and deep, elegant dark surfaces.

---

## 1. COLOR SYSTEM (Premium Dark Theme)

The palette avoids high saturation, neon, or stark blacks (`#000000`). It relies on deep, warm charcoals and soft violet/plum accents to feel intimate and calming.

- **Backgrounds**
  - `bg-primary`: `#121214` (Deep charcoal, almost midnight)
  - `bg-secondary`: `#1A1A1D` (Slightly elevated layer for base structure)
  - `bg-surface`: `#222226` (For cards and modals; soft and grounded)
  - `bg-elevated`: `#2A2A30` (For floating elements, dropdowns, sticky headers)
- **Accents (The "Vibe" Colors)**
  - `accent-primary`: `#8B5CF6` (Soft Violet - primary interactive color)
  - `accent-secondary`: `#D946EF` (Muted Fuchsia - for gradients and sparks)
  - `accent-tertiary`: `#F43F5E` (Gentle Rose - for warmth/heart indicators)
- **Feedback & States**
  - `success`: `#10B981` (Muted emerald - online status, success)
  - `warning`: `#F59E0B` (Soft amber)
  - `danger`: `#EF4444` (Muted red - report/block/panic exit)
  - `voice-active`: `#3B82F6` (Calm blue - specifically reserved for active voice calls)
- **Typography**
  - `text-primary`: `#F8FAFC` (Off-white, prevents eye strain)
  - `text-secondary`: `#94A3B8` (Cool gray for readability)
  - `text-muted`: `#64748B` (For timestamps and placeholders)
- **Borders & Dividers**
  - `border-subtle`: `rgba(255, 255, 255, 0.05)`
  - `border-strong`: `rgba(255, 255, 255, 0.1)`
- **Glassmorphism / Overlays**
  - `glass-panel`: `rgba(26, 26, 29, 0.7)` with `backdrop-blur-md`
  - `modal-overlay`: `rgba(0, 0, 0, 0.6)` with `backdrop-blur-sm`

---

## 2. TYPOGRAPHY SYSTEM

Typography is clean, modern, and highly legible. 
- **Primary Font**: `Inter` (or `SF Pro` on iOS). Extremely readable, neutral, and premium.
- **Display Font (Optional)**: `Outfit` or `Plus Jakarta Sans` for marketing headers or major vibe states, adding a touch of geometric warmth.

**Hierarchy**:
- `Heading 1` (Hero/Moods): 32px (2rem), SemiBold, tight tracking (`-0.02em`).
- `Heading 2` (Modals/Pages): 24px (1.5rem), Medium.
- `Heading 3` (Card Titles): 18px (1.125rem), Medium.
- `Body Large` (Chat Bubbles): 16px (1rem), Regular, 1.5 line-height.
- `Body Standard` (UI Text): 14px (0.875rem), Medium.
- `Caption / Tags`: 12px (0.75rem), Medium, slightly uppercase with wide tracking for tags.

---

## 3. SPACING SYSTEM

Based on a strict 4px/8px baseline grid to ensure mathematical harmony.
- `spacing-xs`: 4px (Inside tags)
- `spacing-sm`: 8px (Between icon and text)
- `spacing-md`: 16px (Standard padding for buttons/inputs)
- `spacing-lg`: 24px (Standard card padding)
- `spacing-xl`: 32px (Section gaps)
- `spacing-2xl`: 48px (Major structural breaks)
- **Mobile Margins**: Always `16px` or `20px` safe-area padding on left/right edges.

---

## 4. BORDER RADIUS SYSTEM

Softness is key to feeling safe and low-pressure. Hard edges (`0px`) are entirely avoided.
- `radius-sm`: 8px (Small chips, standard text inputs)
- `radius-md`: 12px (Chat bubbles, nested cards)
- `radius-lg`: 16px (Match cards, prominent buttons, room cards)
- `radius-xl`: 24px (Modals, bottom sheets)
- `radius-full`: 9999px (Avatars, floating action buttons, pill tags)

---

## 5. SHADOW AND DEPTH SYSTEM

In dark mode, depth is communicated through surface lightness and subtle glows, not harsh drop shadows.
- `shadow-sm`: `0 2px 8px rgba(0,0,0,0.4)` (Input focus states)
- `shadow-md`: `0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)` (Cards)
- `shadow-modal`: `0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`
- `glow-primary`: `0 0 20px rgba(139, 92, 246, 0.3)` (Used exclusively for the primary "Start Chat" or "Voice Request" CTA).

---

## 6. BUTTON SYSTEM

Buttons must feel tactile (`transform: scale(0.98)` on active) and substantial.
- **Primary CTA**: `bg-accent-primary` text `white`. Smooth hover state (`brightness-110`). Used for finding matches or accepting requests.
- **Secondary**: `bg-surface` with `border-strong`. Text is `text-primary`. Used for profile edits or skipping.
- **Ghost/Tertiary**: Transparent background, `text-secondary`. Hover gives `bg-white/5`.
- **Danger**: `bg-danger/10` with `text-danger`. Hover transitions to solid `bg-danger`. Used for Panic Exit or Block.
- **Voice Action**: Pill-shaped, incorporating a subtle pulse animation if ringing.

*All buttons have a minimum height of 48px for mobile tap accessibility.*

---

## 7. LOADING STATES

- **Skeleton Shimmer**: Soft `bg-surface` rectangles with a slow, low-contrast sweeping gradient (`rgba(255,255,255,0) -> rgba(255,255,255,0.05) -> rgba(255,255,255,0)`).
- **Match Search**: Instead of a spinner, use a soft, breathing/pulsing concentric circle effect centered on the user's avatar.
- **Chat Transitions**: Instant skeleton bubbles that fade into text smoothly.

---

## 8. INPUT AND FORM STYLES

- **Text Inputs**: `bg-secondary`, `border-transparent`, `radius-sm`. 
  - *Focus*: `ring-1 ring-accent-primary bg-surface`. Removes default browser outlines.
- **Chips (Selectable)**: Used for interests. Unselected: `bg-secondary text-secondary`. Selected: `bg-accent-primary/20 text-accent-primary border border-accent-primary/50`.
- **OTP Input**: Giant, legible 1-character boxes widely spaced. Focus state adds a soft primary glow.

---

## 9. CARD SYSTEM

- **Match Card**: Vertical stack. Fills 80% of mobile viewport. 
  - `bg-surface` with `radius-lg`. 
  - Top features a soft abstract gradient representing their "Mood" instead of a photo.
  - Vibe tags displayed as pill chips.
- **Saved Connection**: Horizontal list item. Avatar (abstract), Nickname, and "Last chat 2d ago" muted text.

---

## 10. CHAT UI STYLING

- **Self Bubble**: `bg-accent-primary` (Soft Violet), `text-white`. Right-aligned. Radius: `12px 12px 2px 12px`.
- **Other Bubble**: `bg-surface` (Warm Charcoal), `text-primary`. Left-aligned. Radius: `12px 12px 12px 2px`.
- **System Prompts**: Center-aligned, `text-muted`, `text-xs`. (e.g., *"Matched at 11:42 PM"*).
- **Chat Input Base**: Fixed at bottom, `glass-panel` background to let underlying messages blur slightly on scroll.

---

## 11. VOICE UI STYLING

Voice is the highest friction point; the UI must be extraordinarily reassuring.
- **Request Modal**: Slides up from bottom (Sheet). "User wants to voice chat. You remain anonymous." 
  - *Accept*: Primary CTA.
  - *Not right now*: Ghost button.
- **Active Call Banner**: Sticks to the top of the chat. `bg-voice-active/10` border `border-voice-active/30`. Features a minimal waveform animation.
- **End Call**: Solid `bg-surface` button with red icon. Easy to hit, but not accidentally pressed.

---

## 12. ROOM UI STYLING

- **Room Header**: Features the Topic Prompt aggressively. Adds a faint background blur matching the Room's theme color (e.g., Purple for "Late Night").
- **Participant Chips**: Small anonymous avatars clustering near the top right.
- **Stream**: Messages lack bubbles, styled more like a continuous IRC/Twitch stream to save space, with Nicknames colored uniquely per session.

---

## 13. MODAL / SHEET / DRAWER

- **Mobile First**: Prefer Bottom Sheets over centered Modals. They are easier to reach and feel less "blocking/error-like".
- **Backdrop**: `modal-overlay` with a 300ms fade-in.
- Sheets use a small `4px x 32px` grab-handle at the top center.

---

## 14. ANIMATION SYSTEM (Framer Motion)

Motion communicates high quality.
- **Page Transitions**: Suble fade and slide-up (Y: 10px, Opacity 0 -> 1, Duration: 0.3s, Easing: `easeOut`).
- **Cards**: Swipe mechanics use spring physics (high stiffness, medium damping) so they snap back safely.
- **Voice Pulse**: When receiving a voice request, a slow, continuous `scale(1) -> scale(1.05)` pulse on the voice icon.
- **No Bouncy/Toony easing**. Use cinematic, smooth cubic-beziers.

---

## 15. CSS TOKEN SYSTEM (Tailwind Config Core)

```js
module.exports = {
  theme: {
    colors: {
      base: { 900: '#121214', 800: '#1A1A1D', 700: '#222226', 600: '#2A2A30' },
      primary: { 500: '#8B5CF6', 400: '#A78BFA' }, // Violet
      danger: { 500: '#EF4444' },
      success: { 500: '#10B981' },
      text: { main: '#F8FAFC', muted: '#94A3B8' }
    },
    boxShadow: {
      card: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      glow: '0 0 20px rgba(139, 92, 246, 0.3)',
    }
  }
}
```

---

## 16. STATE SYSTEM

- **Selected**: Gets a subtle `bg-white/5` and bold border.
- **Disabled**: Drop opacity to `0.4`. Ensure cursor becomes `not-allowed`.
- **Loading**: Text becomes transparent, overlaid with the skeleton shimmer animation.
- **Muted/Blocked**: High contrast red/gray visual indicators to assure the user the action was successful.

---

## 17. ACCESSIBILITY REQUIREMENTS

- **Contrast**: Text-to-background contrast must hit WGAC AA standards (4.5:1). `#94A3B8` on `#121214` passes this.
- **Tap Targets**: Every clickable element MUST be at least `44x44px` invisible bounding box.
- **Focus Rings**: Keyboard navigation shows a highly visible `ring-2 ring-primary-500 ring-offset-2 ring-offset-base-900`. 

---

*This system guarantees VibePass feels like an exclusive, safe, emotional safe-haven. It strips away the anxiety of dating apps and replaces it with the comfort of a late-night chat with a friend.*
