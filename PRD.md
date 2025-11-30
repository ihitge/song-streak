# Product Requirements Document (PRD)
# Song Streak

**Version:** 1.0
**Date:** November 30, 2025
**Status:** In Development (~77% Complete)

---

## 1. Executive Summary

Song Streak is an iOS and Android mobile application designed to help musicians organize their song repertoire, track practice sessions, and leverage AI to analyze music theory from video tutorial references. The app combines a personal song library with integrated practice tools (metronome, practice streak, practice time to track how long a specific song has been practiced) and analytics to help musicians build consistent practice habits. Progress will be gamified with rewards and achievements to keep users motivated based on practice streaks and fluency levels.

The app features a distinctive "Industrial Play" design aesthetic inspired by Teenage Engineering hardware, Dieter Rams principles, and Braun, emphasizing tactile minimalism and functional beauty.

---

## 2. Problem Statement

### The Challenge
Musicians face several challenges when trying to maintain a consistent practice routine:

1. **Disorganized repertoire** - Songs scattered across notes, tabs, and memory with no central reference. For individual musicians and bands. Sharing set lists with band mates or musicians "sitting in" is a challenge.
2. **Lost practice momentum** - No visibility into practice consistency leads to abandoned routines
3. **Manual theory lookup** - Extracting key, BPM, chords from songs requires manual effort
4. **Disconnected tools** - Metronome, timer, and song reference are separate apps
5. **No progress tracking** - Difficult to see improvement over time across different fluency levels

### The Opportunity
Create a unified practice companion that:
- Centralizes song library with rich music theory metadata
- Automates theory extraction using AI video analysis
- Tracks practice streaks to build habit momentum
- Integrates essential practice tools (metronome, timer)
- Provides clear progress visualization
- Makes it easy to share set lists with band mates or musicians "sitting in"
---

## 3. Target Users

### Primary Persona: "The Dedicated Hobbyist"
- **Age:** 15-65
- **Experience:** Intermediate musician (2-10 years)
- **Instruments:** Guitar, keys, bass, drums
- **Behavior:** Practices 3-5 times per week, wants to improve systematically
- **Pain Points:** Struggles with consistency, loses track of songs to learn
- **Goals:** Build repertoire, track progress, maintain streaks

### Secondary Persona: "The Multi-Instrumentalist"
- Plays multiple instruments
- Needs to track fluency separately per instrument
- Wants to see which songs they can play on which instruments

### Tertiary Persona: "The Cover Artist"
- Learns songs from YouTube tutorials or MP3 updloads 
- Needs quick theory extraction from video references
- Values accurate chord/key/BPM data

---

## 4. Product Goals & Objectives

### Vision Statement
*"Your personal practice studio in your pocket - where every session counts and every song is organized."*

### Key Objectives

| Objective | Success Metric | Target |
|-----------|---------------|--------|
| Build practice habits | Daily active users with streaks > 7 days | 40% of MAU |
| Organize repertoire | Average songs per user | > 20 songs |
| Enable consistent practice | Weekly practice time per user | > 60 minutes |
| Reduce friction | Time from video URL to populated form | < 30 seconds |
| Increase fluency | Songs moved to higher fluency level | > 2 per month |

---

## 5. Core Features (MVP)

### 5.1 Song Library Management

**User Stories:**
- As a musician, I want to add songs with title, artist, and instrument so I can build my repertoire
- As a musician, I want to filter songs by instrument, fluency, and genre so I can quickly find what to practice
- As a musician, I want to search songs by title or artist so I can locate specific songs

**Requirements:**

| Feature | Priority | Status |
|---------|----------|--------|
| Create song with basic metadata | P0 | Complete |
| Edit existing song | P0 | Complete |
| Delete song with confirmation | P0 | Complete |
| View song detail with all fields | P0 | Complete |
| Search by title/artist | P0 | Complete |
| Filter by instrument | P0 | Complete |
| Filter by fluency level | P0 | Complete |
| Filter by genre | P0 | Complete |
| Grid/list view of songs | P1 | Complete |
| Pull-to-refresh | P1 | Complete |
| Sort by title/artist/custom | P2 | Not Started |

**Data Model:**
```typescript
interface Song {
  id: string
  title: string
  artist: string
  genre: Genre // rock | blues | pop | jazz | metal | folk | indie | funk
  instrument: Instrument // guitar | keys | drums | bass | vocals
  fluencyLevel: FluencyLevel // performance | developer | reacher | campfire
  bpm?: number
  key?: string
  chords?: string[]
  scales?: string[]
  lyrics?: string
  videoUrl?: string
  imageUrl?: string
  theorySummary?: string
}
```

**Fluency Levels Explained:**
- **Campfire** - Can play basic version around a campfire
- **Reacher** - Reaching for mastery, actively learning
- **Developer** - Developing technique, refining details
- **Performance** - Ready to perform publicly

---

### 5.2 AI Video Analysis

**User Stories:**
- As a musician, I want to paste a YouTube URL or upload an MP3 file and auto-populate song theory so I save time on manual entry
- As a musician, I want AI to extract lyrics so I don't have to type them manually

**Requirements:**

| Feature | Priority | Status |
|---------|----------|--------|
| Parse YouTube URLs (youtube.com, youtu.be, shorts) | P0 | Complete |
| Extract title and artist | P0 | Complete |
| Extract key signature | P0 | Complete |
| Extract BPM/tempo | P0 | Complete |
| Extract chord progression | P0 | Complete |
| Extract scales used | P1 | Complete |
| Extract lyrics | P1 | Complete |
| Generate theory summary | P2 | Complete |
| Show loading state during analysis | P0 | Complete |
| Only fill empty fields (don't overwrite) | P1 | Complete |
| Confidence scoring for extractions | P3 | Not Started |

**Technical Implementation:**
- Supabase Edge Function calls Gemini 2.0 Flash API
- YouTube video context passed to AI model
- Structured JSON response parsed and mapped to form fields

---

### 5.3 Practice Session Tracking

**User Stories:**
- As a musician, I want to time my practice sessions so I know how long I practiced
- As a musician, I want to see my current practice streak so I stay motivated
- As a musician, I want to see my total practice time so I can track my investment

**Requirements:**

| Feature | Priority | Status |
|---------|----------|--------|
| Start/pause/resume practice timer | P0 | Complete |
| Finish session and save to database | P0 | Complete |
| Minimum 10-second session validation | P1 | Complete |
| Show elapsed time during practice | P0 | Complete |
| Show total practice time for song | P1 | Complete |
| Calculate current streak (consecutive days) | P0 | Complete |
| Calculate longest streak (personal best) | P0 | Complete |
| Grace period (streak valid if practiced yesterday) | P1 | Complete |
| Show today's practice time | P0 | Complete |
| Show weekly practice time | P0 | Complete |
| Show monthly practice time | P0 | Complete |
| Show yearly practice time | P1 | Complete |
| Show all-time practice time | P1 | Complete |
| Set weekly practice goal | P2 | Partial |
| Weekly practice chart (bar chart) | P2 | Not Started |
| Most practiced songs list | P2 | Not Started |

**Streak Logic:**
```
Current Date: Today
Last Practice: Yesterday → Streak continues (grace period)
Last Practice: 2+ days ago → Streak broken, reset to 0
```

---

### 5.4 Integrated Metronome

**User Stories:**
- As a musician, I want a metronome while practicing so I keep proper timing
- As a musician, I want to sync the metronome to my song's BPM so I don't have to set it manually

**Requirements:**

| Feature | Priority | Status |
|---------|----------|--------|
| BPM display with +/- controls | P0 | Complete |
| BPM range 30-300 | P0 | Complete |
| Time signature selection (2/4, 3/4, 4/4, 5/4, 6/4) | P0 | Complete |
| Play/pause toggle | P0 | Complete |
| Beat visualization (current beat / total) | P0 | Complete |
| Sync to song BPM button | P1 | Complete |
| "SYNCED" state indicator | P1 | Complete |
| Haptic feedback on beats | P0 | Complete |
| Accent haptic on beat 1 | P1 | Complete |
| Audio click sounds | P2 | Not Started |
| Tap tempo | P3 | Not Started |

---

### 5.5 Embedded Video Player

**User Stories:**
- As a musician, I want to watch my reference video in-app so I don't have to switch apps

**Requirements:**

| Feature | Priority | Status |
|---------|----------|--------|
| YouTube video embedding | P0 | Complete |
| Support youtube.com, youtu.be, shorts URLs | P0 | Complete |
| Video persists on song detail page | P0 | Complete |

---

### 5.6 User Authentication

**User Stories:**
- As a user, I want to create an account so my songs are saved to the cloud
- As a user, I want to sign in on multiple devices and see my data

**Requirements:**

| Feature | Priority | Status |
|---------|----------|--------|
| Email/password sign up | P0 | Complete |
| Email/password sign in | P0 | Complete |
| Session persistence (stay logged in) | P0 | Complete |
| Sign out with confirmation | P0 | Complete |
| Secure token storage (native) | P0 | Complete |
| localStorage fallback (web) | P1 | Complete |
| Password reset flow | P2 | Not Started |
| Social auth (Google/Apple) | P3 | Not Started |

---

## 6. Navigation Structure

### Tab Bar (Bottom Navigation)
The app uses a 3-tab bottom navigation bar:

| Tab | Label | Icon | Screen |
|-----|-------|------|--------|
| Left | STREAK | Graphy | Practice stats dashboard |
| Center | SET LIST | List | Song library + CRUD |
| Right | METRONOME | Clock | Standalone metronome |

### Screen Hierarchy
```
Root
├── (auth) - Unauthenticated
│   ├── Login
│   └── Sign Up
│
└── (tabs) - Authenticated
    ├── Practice Streak (Tab 1)
    │   └── Stats Dashboard
    │
    ├── Set List (Tab 2)
    │   ├── Song Library (with search/filters)
    │   ├── Song Detail [id]
    │   │   ├── Embedded Video
    │   │   ├── Practice Timer
    │   │   └── Inline Metronome
    │   ├── Add Song (tabbed form)
    │   └── Edit Song [id] (tabbed form)
    │
    └── Timing Machine (Tab 3)
        └── Standalone Metronome
```

---

## 7. Design System Overview

### Aesthetic Direction: "Industrial Play"
*"Braun meets Nintendo" - Teenage Engineering-inspired tactile minimalism*

**Core Principles:**
- Feels like a high-end physical object
- Matte finishes, no glossy gradients
- Dark-first design (light mode inverted)
- Hardware-inspired controls
- Every interaction has haptic feedback

See design_system.md for more details.
---

## 8. Technical Architecture

### Platform & Framework
- **React Native 0.81** with TypeScript
- **Expo 54** (Managed workflow)
- **Expo Router 6** (File-based routing)
- **iOS primary**, Web secondary, Android future

### State Management
- **React Context:** Auth state
- **React Query v5:** Server state, caching, mutations
- **React Hook Form + Zod:** Form state and validation

### Backend Services
- **Supabase:**
  - PostgreSQL database
  - Authentication
  - Edge Functions (AI integration)
- **Gemini 2.0 Flash:** AI video analysis

### Key Dependencies
| Package | Purpose |
|---------|---------|
| @supabase/supabase-js | Database & auth |
| @tanstack/react-query | Server state |
| react-hook-form + zod | Form handling |
| react-native-youtube-iframe | Video embedding |
| expo-haptics | Haptic feedback |
| expo-secure-store | Encrypted storage |
| date-fns | Date calculations |
| react-native-reanimated | Animations |

## Important Factors
Based on the highly stylized, tactile "Dieter Rams" aesthetic you are building, the best version is React Native 0.76+ with the New Architecture (Fabric) enabled.

Here is why this specific version and architecture are critical for this type of interface:

### 1. The "Inset Shadow" Problem (Solved by Skia)
Standard React Native (even 0.76) does not support box-shadow: inset or CSS filters like noise.

The Issue: The entire "Rams" aesthetic relies on recessed "wells" (inner shadows) and plastic textures (noise). You cannot achieve this with standard <View> styles.

The Solution: You must use @shopify/react-native-skia. Skia allows you to draw canvas-like graphics (inset shadows, gradients, noise filters) with native performance.

Version Requirement: Skia runs significantly better and integrates more deeply on the New Architecture found in 0.74+.

### 2. Metronome Precision (The Bridge is the Enemy)
A metronome needle swinging at 120 BPM requires rock-solid 60/120fps animation.

Old Architecture: Animations crossed the "Bridge" (JS -> Native) asynchronously. This causes frame drops and "drift" where the needle desyncs from the audio.

New Architecture (0.76+): Uses JSI (JavaScript Interface).

Animation: You will use react-native-reanimated. It runs the needle logic directly on the UI thread, bypassing the bridge completely.

Gestures: dragging that "Rams Fader" will feel instant, 1:1 with your finger, because there is no bridge latency.

### 3. Haptic Synchronization
For the tactile feel, you want the Haptic "click" to happen the exact millisecond the slider hits a notch or the toggle flips.

Expo 52+ (RN 0.76): Has optimized expo-haptics that play nicely with Reanimated worklets, allowing you to trigger haptics directly from the animation thread.

### The "Golden Stack" for this UI
To recreate the code I generated above in React Native, this is your required setup:

React Native: v0.76+ (Enables the New Architecture by default).

Graphics Engine: React Native Skia (Essential for the "Deep Dish" wells and Noise textures).

Animation: React Native Reanimated v3 (For the metronome needle and fader physics).

Gestures: React Native Gesture Handler (For the jog wheel/fader interaction).

Verdict: Do not use an older version (0.72 or below). The "Rams" look is too graphically intensive for the old renderer to handle performantly without dropping frames.
---

## 9. Future Roadmap

### Phase 2: Analytics & Goals
- [ ] Practice goals UI (set/edit/reset)
- [ ] Weekly practice chart (daily bar chart)
- [ ] Most practiced songs list
- [ ] Fluency distribution analytics
- [ ] Practice heatmap (GitHub-style)

### Phase 3: Audio Features
- [ ] Metronome audio clicks (not just haptics)
- [ ] Tap tempo for metronome
- [ ] Practice recording (audio capture)
- [ ] Playback of practice recordings

### Phase 4: Content & Learning
- [ ] Chord library with diagrams
- [ ] Scale reference library
- [ ] Setlist creation & ordering
- [ ] Offline mode

### Phase 5: Social & Collaboration
- [ ] Share setlists
- [ ] Band collaboration
- [ ] Practice challenges
- [ ] Leaderboards

---

## 10. Success Metrics

### North Star Metric
**Weekly Active Practice Minutes** - Total minutes practiced by active users per week

### Key Performance Indicators (KPIs)

| Metric | Definition | Target |
|--------|------------|--------|
| WAU | Weekly Active Users | Growth 10% MoM |
| Avg Session Duration | Mean practice session length | > 15 minutes |
| Streak Retention | Users with 7+ day streaks | > 40% of MAU |
| Songs per User | Average songs in library | > 20 |
| AI Analysis Usage | % of songs with video analysis | > 50% |
| Practice Frequency | Sessions per user per week | > 4 |

### Engagement Funnel
1. **Signup** → 2. **Add First Song** → 3. **First Practice Session** → 4. **7-Day Streak** → 5. **20 Songs**

---

## 11. Constraints & Assumptions

### Constraints
- iOS-first development (Android later)
- Single user per account (no multi-user households)
- English language only (v1)
- YouTube as primary video source
- Requires internet for AI analysis

### Assumptions
- Users have Spotify/YouTube to discover songs
- Users practice with their phone nearby
- Users value streaks as motivation
- AI extraction accuracy is "good enough" (manual edit available)

### Dependencies
- Supabase uptime and performance
- Gemini API availability and pricing
- YouTube iframe API compatibility
- Expo SDK compatibility with native modules

---

## 12. Appendix

### A. Fluency Level Definitions

| Level | Description | Criteria |
|-------|-------------|----------|
| **Campfire** | Can play basic version | Know main chords, rough timing |
| **Reacher** | Actively learning | Working on transitions, structure |
| **Developer** | Refining details | Polishing dynamics, tone, technique |
| **Performance** | Show-ready | Can play confidently in front of others |

### B. Supported Instruments
- Guitar
- Keys (Piano/Keyboard)
- Drums
- Bass

### C. Supported Genres
- Rock
- Blues
- Pop
- Jazz
- Metal
- Folk
- Indie
- Funk

### D. Database Schema

```sql
-- Songs table
songs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  title text NOT NULL,
  artist text NOT NULL,
  video_url text,
  genre text,
  instrument text,
  fluency_level text,
  bpm integer,
  key text,
  chords text[],
  scales text[],
  lyrics text,
  theory_summary text,
  created_at timestamptz,
  updated_at timestamptz
)

-- Practice sessions table
practice_sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  song_id uuid REFERENCES songs,
  duration_seconds integer,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz
)

-- Practice goals table
practice_goals (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  period text, -- 'day' | 'week'
  target_seconds integer,
  created_at timestamptz,
  updated_at timestamptz
)
```

---
