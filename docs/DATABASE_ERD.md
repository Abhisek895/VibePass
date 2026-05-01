# Database ERD (Entity Relationship Diagram)
The DB is designed in PostgreSQL using robust foreign key relationships focusing on the separation of Authentication vs Public Profile vs Match State.

## Diagram Structure
*(Designed referencing a traditional Mermaid.js format)*

```mermaid
erDiagram
    Users ||--o{ Profiles : "has 1"
    Users ||--o{ AuthIdentities : "has 1"
    Users ||--o{ UserInterests : "selects"
    Users ||--o{ MatchScores : "receives"
    Users ||--o{ ChatSessions : "participates in"
    Users ||--o{ AbuseReports : "submits or receives"
    
    Profiles {
        UUID id PK
        UUID user_id FK
        String nickname
        Int age_band
        String current_mood
        JSON current_vibe_answers
        Int trust_score
    }
    
    ChatSessions {
        UUID id PK
        UUID user_a_id FK
        UUID user_b_id FK
        DateTime started_at
        Boolean voice_unlocked
        Boolean ended
        String end_reason
    }

    Messages {
        UUID id PK
        UUID chat_id FK
        UUID sender_id FK
        Text content
        DateTime sent_at
    }

    ChatSessions ||--|{ Messages : "contains"
```

## Key Entities
- **AuthIdentities**: Securely stores hashed email/passwords or OAuth tokens. This separates PII entirely from the matching engine.
- **Profiles**: Contains public-facing (within the app) metrics like Nickname, Mood, and Trust Score. This dictates algorithm matching logic without exposing raw users.
- **MatchScores**: Stores the output of the Matching Engine (`user_a`, `user_b`, `compatibility_score`).
- **AbuseReports**: Records `reporter_id`, `reported_id`, `chat_session_id`, and `reason` for admin review. Strongly coupled to Chat Sessions to enable Admins to pull chat history securely when specifically authorized by the report function.
