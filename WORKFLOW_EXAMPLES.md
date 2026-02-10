# ViewState Workflow Examples

## Visual Flow Diagrams

---

## Workflow 1: Quick Single Screenshot Analysis

```
START (Command Mode)
    ↓
[Click "📸 Capture This"]
    ↓
Screenshot Captured
    ↓
AUTO-SWITCH → Chat Mode
    ↓
Chat Input Auto-Focused
    ↓
[Type/Speak: "What's on this screen?"]
    ↓
[Click "🤖 Analyze Screenshots"]
    ↓
AI Response Displayed
    ↓
END
```

**Time**: ~10 seconds  
**Clicks**: 2  
**Mode Switches**: 1 (automatic)

---

## Workflow 2: Multi-Tab Product Comparison

```
START (Command Mode)
    ↓
Navigate to Amazon Product Page
    ↓
[Click "📸+ Multi-Capture"]
    ↓
Badge: (1) | Stay in Command Mode
    ↓
Navigate to eBay Product Page
    ↓
[Click "📸+ Multi-Capture"]
    ↓
Badge: (2) | Stay in Command Mode
    ↓
Navigate to Walmart Product Page
    ↓
[Click "📸+ Multi-Capture"]
    ↓
Badge: (3) | Stay in Command Mode
    ↓
[Click "✨ Process All Images"]
    ↓
AUTO-SWITCH → Chat Mode
    ↓
Query Auto-Filled: "Analyze all these screenshots"
    ↓
[Edit Query: "Compare prices and features"]
    ↓
[Click "🤖 Analyze Screenshots"]
    ↓
AI Compares All 3 Products
    ↓
END
```

**Time**: ~30 seconds  
**Clicks**: 5  
**Mode Switches**: 1 (automatic)  
**Images Analyzed**: 3

---

## Workflow 3: Voice Command + Screenshot

```
START (Command Mode)
    ↓
[Click 🎙️ Microphone]
    ↓
[Say: "Switch to Gmail"]
    ↓
[Click "▶️ Execute Command"]
    ↓
Toast: "Command Recognized: Switch Tab"
    ↓
Tab Switches to Gmail
    ↓
Stay in Command Mode
    ↓
[Click "📸 Capture This"]
    ↓
AUTO-SWITCH → Chat Mode
    ↓
[Ask: "Summarize my unread emails"]
    ↓
[Click "🤖 Analyze Screenshots"]
    ↓
AI Analyzes Gmail Screenshot
    ↓
END
```

**Time**: ~20 seconds  
**Clicks**: 4  
**Voice Commands**: 1  
**Mode Switches**: 1 (automatic)

---

## Workflow 4: Mixed Mode - Command → Chat → Command

```
START (Command Mode)
    ↓
[Click "📸 Capture This"]
    ↓
AUTO-SWITCH → Chat Mode
    ↓
[Ask: "What's the main heading?"]
    ↓
AI Response: "The main heading is..."
    ↓
[Click "← Back to Command Mode"]
    ↓
MANUAL-SWITCH → Command Mode
    ↓
[Click 🎙️]
    ↓
[Say: "Search for that heading on Google"]
    ↓
[Click "▶️ Execute Command"]
    ↓
New Tab Opens with Search
    ↓
END
```

**Time**: ~25 seconds  
**Clicks**: 5  
**Mode Switches**: 2 (1 auto, 1 manual)

---

## Workflow 5: Buffer Management

```
START (Command Mode)
    ↓
[Multi-Capture Tab 1] → Badge: (1)
    ↓
[Multi-Capture Tab 2] → Badge: (2)
    ↓
[Multi-Capture Tab 3] → Badge: (3)
    ↓
[Multi-Capture Tab 4] → Badge: (4)
    ↓
Review Thumbnails in Buffer
    ↓
[Click × on Thumbnail 2] → Remove
    ↓
Badge: (3) | 3 images remain
    ↓
[Click "✨ Process All Images"]
    ↓
AUTO-SWITCH → Chat Mode
    ↓
[Ask: "Compare these 3 options"]
    ↓
AI Analyzes Remaining 3 Images
    ↓
END
```

**Time**: ~40 seconds  
**Clicks**: 7  
**Images Captured**: 4  
**Images Analyzed**: 3 (after removal)

---

## Workflow 6: Documentation Research

```
START (Command Mode)
    ↓
[Voice: "Search for React hooks documentation"]
    ↓
[Execute Command] → New tab opens
    ↓
[Multi-Capture] → Badge: (1)
    ↓
[Voice: "Search for useState examples"]
    ↓
[Execute Command] → New tab opens
    ↓
[Multi-Capture] → Badge: (2)
    ↓
[Voice: "Search for useEffect tutorial"]
    ↓
[Execute Command] → New tab opens
    ↓
[Multi-Capture] → Badge: (3)
    ↓
[Click "✨ Process All Images"]
    ↓
AUTO-SWITCH → Chat Mode
    ↓
[Ask: "Summarize the key concepts from these docs"]
    ↓
AI Provides Comprehensive Summary
    ↓
END
```

**Time**: ~60 seconds  
**Voice Commands**: 3  
**Clicks**: 5  
**Images Analyzed**: 3

---

## State Transitions

### Automatic Transitions
```
Command Mode → Chat Mode
├─ Trigger: "📸 Capture This" clicked
├─ Trigger: "✨ Process All Images" clicked
└─ Result: Chat input auto-focused
```

### Manual Transitions
```
Chat Mode → Command Mode
├─ Trigger: "← Back to Command Mode" clicked
├─ Trigger: "🎮 Command Mode" tab clicked
└─ Result: Return to command interface

Command Mode → Command Mode
├─ Trigger: "📸+ Multi-Capture" clicked
├─ Trigger: Voice command executed
└─ Result: Stay in command mode
```

---

## Decision Tree

```
User Opens Extension
    ↓
    ├─ Want to analyze ONE screenshot?
    │   └─ Click "📸 Capture This"
    │       └─ Auto-switch to Chat Mode
    │           └─ Ask question
    │
    ├─ Want to analyze MULTIPLE screenshots?
    │   └─ Click "📸+ Multi-Capture" on each tab
    │       └─ Stay in Command Mode
    │           └─ Click "✨ Process All"
    │               └─ Auto-switch to Chat Mode
    │                   └─ Ask question
    │
    └─ Want to control browser?
        └─ Use voice commands
            └─ Stay in Command Mode
                └─ Execute commands
```

---

## Best Practices

### When to Use Single Capture
✅ Quick one-off screenshot analysis  
✅ Immediate question about current screen  
✅ Fast workflow (2 clicks)

### When to Use Multi-Capture
✅ Comparing multiple products/pages  
✅ Building context from multiple sources  
✅ Research across multiple tabs  
✅ Need to review before processing

### When to Use Voice Commands
✅ Hands-free browser control  
✅ Quick tab switching  
✅ Search without typing  
✅ Accessibility needs

---

## Performance Tips

### Optimize Multi-Capture
- Capture only relevant tabs
- Remove unwanted images before processing
- Max 3-4 images for 4GB VRAM

### Optimize Chat Queries
- Be specific in questions
- Use voice for longer queries
- Edit auto-filled queries if needed

### Optimize Mode Switching
- Let auto-switch handle transitions
- Use manual switch only when needed
- Stay in Command Mode for multiple commands

---

## Common Patterns

### Pattern 1: Research & Summarize
```
Multi-Capture (3-4 tabs) → Process All → "Summarize key points"
```

### Pattern 2: Compare & Decide
```
Multi-Capture (products) → Process All → "Which is best value?"
```

### Pattern 3: Navigate & Analyze
```
Voice: "Switch to X" → Capture This → "What's the main content?"
```

### Pattern 4: Search & Capture
```
Voice: "Search for X" → Multi-Capture → Process All → "Compare results"
```

---

## Error Recovery

### Captured Wrong Screen
```
Command Mode → Multi-Capture → See thumbnail → Click × to remove
```

### Wrong Mode
```
Any Mode → Click mode toggle at top → Switch modes
```

### Need to Start Over
```
Command Mode → Image Buffer → Click "🗑️ Clear" → Start fresh
```

---

## Time Estimates

| Workflow | Time | Clicks | Voice | Images |
|----------|------|--------|-------|--------|
| Single Capture | 10s | 2 | 0-1 | 1 |
| Multi-Capture (3) | 30s | 5 | 0 | 3 |
| Voice + Capture | 20s | 4 | 1 | 1 |
| Mixed Mode | 25s | 5 | 1 | 1 |
| Buffer Management | 40s | 7 | 0 | 3-4 |
| Documentation Research | 60s | 5 | 3 | 3 |

---

## Success Metrics

✅ **Single Capture**: 2 clicks to analysis  
✅ **Multi-Capture**: Stay in command mode  
✅ **Auto-Switch**: No manual mode toggle needed  
✅ **Auto-Focus**: Chat input ready immediately  
✅ **Count Badge**: Visual feedback on buffer size  
✅ **Process All**: Batch analyze in one click  

The ViewState system makes complex workflows simple and intuitive! 🎉
