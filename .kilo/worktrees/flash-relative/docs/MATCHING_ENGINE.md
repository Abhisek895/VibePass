# Matching Engine

For the MVP, VibePass will utilize a rule-based algorithm that calculates compatibility based on explicit user signals.

## Score Calculation (0 - 100%)

### Inputs
1. **Current Mood** (e.g., Bored, Deep Talk, Flirty) - `35% weight`
2. **Conversation Purpose** (What they seek: Friends, Romance, Chat) - `25% weight`
3. **Shared Interests / Tags** (Music, Anime, Tech, etc.) - `20% weight`
4. **Vibe Question Overlap** (e.g., Both answered "Extroverted" to "Energy type") - `10% weight`
5. **Availability & Timing** (Both online, active within same hour) - `10% weight`

### The Algorithm Mechanics

#### 1. Hard Filters (Exclusion Rules)
Before scoring, users are entirely excluded if they:
- Have blocked each other.
- Are outside the user's defined Age Preference Band (e.g., 18-21).
- Fall below the system's active Trust Score threshold.

#### 2. Soft Scoring
For every potential candidate in the pool, score them:
- **Mood Exact Match**: +35 points. Sub-vibe related match (e.g., Bored + Playful): +15 points.
- **Purpose Match**: +25 points for exact. 
- **Interest Jaccard Similarity**: (Shared Interests / Total Unique Interests) * 20.
- **Vibe Prompt Harmony**: Provide logic mapping compatible answers in DB. +10 points max.
- **Online Score**: +10 if active past 5 minutes, +5 if active past hour.

#### 3. Output Output & Explanation
When handing the Match pool to the Frontend, the Engine must attach an `explanation` payload to increase psychological safety and intrigue:
- *“You both chose Deep Talk and matched on 3 Vibe Tags.”*
- *“94% Compatibility: Both are Night Owls looking for a calm chat.”*

#### 4. Anti-Stagnation
- Add a tiny amount of randomization (`Math.random() * 5`) to prevent users from seeing the exact same queue order every time they refresh.
- Enforce a "cooldown": Matched/Passed users shouldn't reappear in the pool for 24-48 hours.

## Future ML Implementation
The schema is built to record the `outcome` of these matches (Chat Started?, Voice Unlocked?, Positive Feedback?). These data points will format the training loop for a future collaborative filtering and embedding-based recommender system.
