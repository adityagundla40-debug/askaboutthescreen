# Gemini Function Calling Guide

## Overview
The extension now uses **Gemini Function Calling** for browser commands. The AI automatically determines which function to call based on natural language input.

---

## Function Definitions

### 1. open_new_tab(url: string)
**Description**: Opens a specific website in a new Chrome tab

**Parameters**:
- `url` (string): The full URL to open (e.g., 'https://youtube.com')

**AI Behavior**:
- Automatically infers full URL from website names
- "Open YouTube" → `https://youtube.com`
- "Open Gmail" → `https://gmail.com`
- "Go to Amazon" → `https://amazon.com`

**Examples**:
```
User: "Open YouTube"
AI: open_new_tab(url="https://youtube.com")
Result: New tab opens with YouTube
```

---

### 2. search_google(query: string)
**Description**: Performs a Google search for the user's query

**Parameters**:
- `query` (string): The search query to look up on Google

**Examples**:
```
User: "Search for Python tutorials"
AI: search_google(query="Python tutorials")
Result: New tab opens with Google search results
```

---

### 3. switch_to_tab(keyword: string)
**Description**: Switches to an existing Chrome tab by matching the tab's title or URL

**Parameters**:
- `keyword` (string): The keyword to match against tab titles or URLs

**Examples**:
```
User: "Switch to Gmail"
AI: switch_to_tab(keyword="gmail")
Result: Switches to the Gmail tab if it exists
```

---

### 4. capture_screenshot()
**Description**: Captures a screenshot of the current active tab

**Parameters**: None

**Examples**:
```
User: "Take a screenshot"
AI: capture_screenshot()
Result: Screenshot captured and auto-switches to Chat Mode
```

---

## How It Works

### Backend (main.py)

#### Tool Definition
```python
open_new_tab_tool = genai.protos.Tool(
    function_declarations=[
        genai.protos.FunctionDeclaration(
            name="open_new_tab",
            description="Opens a specific website...",
            parameters=genai.protos.Schema(
                type=genai.protos.Type.OBJECT,
                properties={
                    "url": genai.protos.Schema(
                        type=genai.protos.Type.STRING,
                        description="The full URL to open..."
                    )
                },
                required=["url"]
            )
        ),
        # ... other functions
    ]
)
```

#### Model with Tools
```python
command_model = genai.GenerativeModel(
    "gemma-3-4b-it",
    tools=[open_new_tab_tool]
)
```

#### Function Call Detection
```python
response = command_model.generate_content(prompt)

if response.candidates[0].content.parts:
    for part in response.candidates[0].content.parts:
        if hasattr(part, 'function_call'):
            function_name = part.function_call.name
            function_args = dict(part.function_call.args)
            # Return function call details
```

---

### Frontend (App.jsx)

#### Execute Command
```javascript
const executeCommand = async () => {
  // Call backend
  const data = await fetch('/execute-command', {
    body: JSON.stringify({ prompt: query })
  });
  
  if (data.function_call) {
    // Show toast notification
    showToast(`Command recognized: Opening ${args.url}...`);
    
    // Execute the function
    const result = await executeFunctionCall(
      data.function_call.name,
      data.function_call.args
    );
  }
};
```

#### Function Execution
```javascript
const executeFunctionCall = async (functionName, args) => {
  switch (functionName) {
    case 'open_new_tab':
      return await openNewTab(args.url);
    case 'search_google':
      return await searchGoogle(args.query);
    case 'switch_to_tab':
      return await switchToTab(args.keyword);
    case 'capture_screenshot':
      return await captureScreenshot();
  }
};
```

---

## User Experience Flow

### Example: "Open YouTube"

```
1. User speaks: "Open YouTube"
   ↓
2. Frontend sends to backend: { prompt: "Open YouTube" }
   ↓
3. Backend calls Gemini with function tools
   ↓
4. Gemini returns: {
     function_call: {
       name: "open_new_tab",
       args: { url: "https://youtube.com" }
     }
   }
   ↓
5. Frontend shows toast: "Command recognized: Opening https://youtube.com..."
   ↓
6. Frontend executes: chrome.tabs.create({ url: "https://youtube.com" })
   ↓
7. New tab opens with YouTube
   ↓
8. Confirmation card shows:
   Function: open_new_tab
   Arguments: { "url": "https://youtube.com" }
   ✅ Opened: https://youtube.com
```

---

## AI URL Inference

The AI automatically infers full URLs from common website names:

| User Says | AI Infers |
|-----------|-----------|
| "Open YouTube" | `https://youtube.com` |
| "Open Gmail" | `https://gmail.com` |
| "Go to Amazon" | `https://amazon.com` |
| "Open Facebook" | `https://facebook.com` |
| "Go to Twitter" | `https://twitter.com` |
| "Open GitHub" | `https://github.com` |
| "Go to Reddit" | `https://reddit.com` |
| "Open Netflix" | `https://netflix.com` |

**How it works**:
- Function description tells AI to "automatically infer the full URL"
- AI uses its knowledge of common websites
- No hardcoded URL mapping needed
- Works for any well-known website

---

## Testing

### Test open_new_tab
```
🎙️ "Open YouTube"
Expected:
- Toast: "Command recognized: Opening https://youtube.com..."
- New tab opens with YouTube
- Confirmation card shows function details
```

### Test search_google
```
🎙️ "Search for Python tutorials"
Expected:
- Toast: "Command recognized: Searching for: Python tutorials..."
- New tab opens with Google search
- Confirmation card shows query
```

### Test switch_to_tab
```
🎙️ "Switch to Gmail"
Expected:
- Toast: "Command recognized: Switching to: gmail..."
- Tab switches to Gmail (if exists)
- Confirmation card shows keyword
```

### Test capture_screenshot
```
🎙️ "Take a screenshot"
Expected:
- Toast: "Command recognized: Capturing screenshot..."
- Screenshot captured
- Auto-switches to Chat Mode
- Confirmation card shows success
```

---

## Advantages of Function Calling

### Before (JSON Translation)
```
User: "Open YouTube"
AI: {"action": "OPEN_TAB", "value": "youtube"}
Extension: Needs to infer URL from "youtube"
```

### After (Function Calling)
```
User: "Open YouTube"
AI: open_new_tab(url="https://youtube.com")
Extension: Directly uses the URL
```

### Benefits
✅ **AI handles URL inference**: No frontend logic needed  
✅ **Structured output**: Function name + typed arguments  
✅ **Type safety**: Arguments have defined types  
✅ **Better accuracy**: AI understands function purpose  
✅ **Extensible**: Easy to add new functions  
✅ **No JSON parsing**: Direct function call objects  

---

## Toast Notifications

### Format
```
"Command recognized: [Action description]..."
```

### Examples
- `"Command recognized: Opening https://youtube.com..."`
- `"Command recognized: Searching for: Python tutorials..."`
- `"Command recognized: Switching to: gmail..."`
- `"Command recognized: Capturing screenshot..."`

### Behavior
- Appears in top-right corner
- Green background
- Auto-dismisses after 3 seconds
- Fade-in animation

---

## Confirmation Card

### Display
```
🌐 Function Executed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Function: open_new_tab
Arguments: {
  "url": "https://youtube.com"
}
✅ Opened: https://youtube.com
```

### Icons
- 🌐 `open_new_tab`
- 🔍 `search_google`
- 🔄 `switch_to_tab`
- 📸 `capture_screenshot`

---

## Error Handling

### No Function Call Detected
```
User: "Hello"
Backend: { success: true, function_call: null }
Frontend: "No browser command detected. Try 'Open YouTube'..."
```

### Function Execution Failed
```
User: "Switch to Gmail"
Backend: { function_call: { name: "switch_to_tab", args: { keyword: "gmail" } } }
Frontend: Executes switch_to_tab("gmail")
Result: ❌ No tab found matching: gmail
```

### API Error
```
Backend error: Connection timeout
Frontend: "Error: Connection timeout"
```

---

## Comparison: Old vs New

### Old System (JSON Translation)
```javascript
// Backend
return {
  command: {
    action: "SWITCH_TAB",
    value: "gmail"
  }
};

// Frontend
if (command.action === 'SWITCH_TAB') {
  await switchToTab(command.value);
}
```

### New System (Function Calling)
```javascript
// Backend
return {
  function_call: {
    name: "switch_to_tab",
    args: { keyword: "gmail" }
  }
};

// Frontend
await executeFunctionCall(
  function_call.name,
  function_call.args
);
```

---

## Adding New Functions

### 1. Define in Backend
```python
genai.protos.FunctionDeclaration(
    name="close_tab",
    description="Closes the current active tab",
    parameters=genai.protos.Schema(
        type=genai.protos.Type.OBJECT,
        properties={},
        required=[]
    )
)
```

### 2. Add to Frontend
```javascript
const executeFunctionCall = async (functionName, args) => {
  switch (functionName) {
    // ... existing cases
    case 'close_tab':
      return await closeTab();
  }
};

const closeTab = async () => {
  const [tab] = await chrome.tabs.query({ active: true });
  await chrome.tabs.remove(tab.id);
  return { success: true, message: '✅ Tab closed' };
};
```

### 3. Test
```
🎙️ "Close this tab"
AI: close_tab()
Result: Current tab closes
```

---

## Troubleshooting

### Function not called
- Check function description is clear
- Verify user input matches function purpose
- Check backend logs for function_call object

### Wrong arguments
- Check parameter descriptions
- Verify AI understands the context
- Add more examples in description

### URL not inferred correctly
- Check if website is well-known
- Provide full URL in user input
- Update function description with examples

---

## Files Modified

1. **backend/main.py**
   - Added function tool definitions
   - Created `command_model` with tools
   - Updated `/execute-command` to return function calls

2. **src/App.jsx**
   - Updated `executeCommand()` to handle function calls
   - Added `executeFunctionCall()` dispatcher
   - Added individual function handlers
   - Updated confirmation card for function details

---

## Next Steps

Try these commands:
- "Open YouTube"
- "Search for machine learning"
- "Switch to Gmail"
- "Take a screenshot"
- "Go to Amazon"
- "Find Python tutorials"

The AI will automatically call the right function with the right arguments! 🎉
