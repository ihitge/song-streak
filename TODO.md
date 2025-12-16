# Future Features

## 1. Setlist Flow (Transition Gaps)

**Pain Point:** Bands practice songs individually but fail to practice transitions. Awkward dead air on stage while tuning or counting off.

**Features:**
- **Segue Cables**: Visual "cable" graphic connecting song cards to indicate seamless transitions
- **Tuning Alerts**: Display tuning info (e.g., "Drop D") on cards; warn if adjacent songs have different tunings
- **Transition Notes**: Metadata for "Segue immediately" or "Talk to crowd here"

---

## 2. Tempo Match (Tempo Drift)

**Pain Point:** Adrenaline makes bands play faster live. Practicing without metronome creates false security.

**Features:**
- **Auto BPM Sync**: When hitting "Practice," metronome defaults to song's detected BPM
- **"Match Original" Button**: Instantly snaps metronome dial to song's BPM
- Leverage existing video BPM extraction

---

## 3. Global Transpose (Last Minute Transposition)

**Pain Point:** Singer needs to drop key at soundcheck; musicians scramble to transpose on the fly.

**Features:**
- **Transpose Knob**: RotaryKnob for +/- semitones
- **Instant Chord Shift**: Updates all chords in Theory tab instantly
- **Audio Feedback**: Mechanical "thud" sound when shifting key
- Visual update of chord grid (E → Eb)

---

## 4. Decay Tracker (Song Health)

**Pain Point:** Musicians struggle to balance new songs vs. keeping old songs fresh. Forget songs not played in a month.

**Features:**
- **Signal Strength Meter**: Visual indicator on Song Cards (like radio signal)
- **Health Logic:**
  - Practiced today → 100% Green LED
  - 2 weeks → 50% Yellow LED
  - 1 month → "Lost" Red LED/Static
- **"Repair Signal" Mode**: Auto-generate playlist of decaying songs

---

## Priority Summary

| Feature | Complexity | Impact |
|---------|------------|--------|
| Tempo Match | Low | High |
| Decay Tracker | Medium | High |
| Global Transpose | Medium | Medium |
| Setlist Transitions | High | Medium |
