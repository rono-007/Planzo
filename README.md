# 🤖 AI Dev Companion Hub

The **AI Dev Companion Hub** is an innovative, single-page application (SPA) designed to serve as a unified cockpit for modern development. It boosts developer productivity by seamlessly integrating **Google's Gemini API** for real-time code assistance, powerful contextual analysis, and natural language command execution.

## ✨ Features Overview: The Developer's Toolkit

The Hub provides three integrated tools designed to accelerate your workflow, eliminate context switching, and enhance code quality.

### 1. 💬 Hybrid Chat & AI Assistance (Central Panel: Instant Problem Solver)

The central panel acts as your dedicated, real-time pair programmer. Its core value lies in eliminating the time spent searching external documentation and forums.

* **Instant Real-time Debugging:** Paste an error message or a complex function, and receive instant, context-aware explanations and suggested fixes, allowing you to bypass manual troubleshooting.

* **Boilerplate & Velocity:** Accelerate initial development by requesting functions, algorithms, data structures, or configuration snippets in any language, directly injected into the chat.

* **Learning & Explanation:** Ask the AI to break down complex architectural patterns or unfamiliar code blocks, turning abstract logic into clear, understandable steps.

### 2. 📁 Project Knowledge Map (Right Sidebar: Context & Navigation)

This feature transforms your codebase into an interactive knowledge resource, providing immediate context crucial for onboarding, code review, or working on legacy systems.

* **Zero-Setup Context:** Upload an entire local folder to instantly generate a complete, hierarchical **File Tree View**. This is done entirely on the client-side, making the information immediately available.

* **Rapid Code Inspection:** Clicking any file in the tree switches the main view to the **Inline Editor Mode** and displays the full content. This allows you to quickly pull code context to share with the AI or inspect structure.

### 3. 🧠 Natural Language Command Center (Fixed Footer: Workflow Automation)

The unified command bar at the bottom is designed to accelerate your workflow by translating intent into action without distraction.

* **Single-Line Task Execution:** Use the input field for all commands. General queries go to chat (via **Enter**), while specific, actionable requests (e.g., "Summarize module X", "Suggest better variable names") are sent using **Apply Fix**.

* **Executive Commands (`Apply Fix`):** This button triggers a highly focused LLM call designed to generate concise, actionable, and short outputs (max 3 lines of code/text) for instant task completion or environment-related feedback, keeping the AI response short and direct.

## 🎨 Design and UX: Focus on Developer Comfort

The design choices prioritize visual comfort, responsiveness, and minimal distraction.

* **Sleek Aesthetic:** Features a high-contrast, dark theme (`#1A1A1A` background) with a vibrant **light blue primary color** (`#4a7edc`), ensuring visual comfort during long coding sessions.

* **Fixed Layout for Focus:** The header and command footer remain **fixed** in the viewport. Crucially, the central **chat/editor area is the only scrollable content**, maintaining navigation controls and inputs always within reach.

* **Seamless Toggling:** Easily switch between the **Chat Mode** and the **Inline Editor View** using the integrated tabs above the main content area.

## 🛠️ Code Structure and Setup

The entire application is contained within a single `index.html` file, leveraging JavaScript's ES Module capabilities for internal organization, separating concerns between UI, initialization, and core features.

### Required Global Variables

The application relies on global variables provided by the execution environment (e.g., Canvas) for secure initialization:

| Variable | Purpose |
| :--- | :--- |
| `__firebase_config` | JSON object for initializing the Firebase App instance. |
| `__initial_auth_token` | Custom Firebase token for secure user sign-in. |
| `__app_id` | Identifier used for scoping Firestore database paths. |

### Core JavaScript Logic

All application logic is implemented within the `<script type="module">` block in `index.html`, logically grouped by function:

1.  **Firebase & Auth:** Handles application initialization and signs the user in, either via the provided custom token or anonymously, setting the `userId`.

2.  **`callGeminiApi`**: The core network function responsible for communicating with Google's LLM endpoints, including exponential backoff for resilience.

3.  **UI/Chat Helpers**: Functions like `displayMessage`, `createLoadingIndicator`, and `toggleView` manage the visual state and rendering of chat elements and views.

4.  **File System Logic**:

    * `handleFolderUpload`: Reads local files and stores their content in the `uploadedFileContents` JavaScript object.

    * `buildTreeData`/`renderTree`: Recursively processes the file paths to generate the interactive, hierarchical DOM structure displayed in the Project Knowledge Map.

### Getting Started

1.  **Ensure Environment:** The application requires an environment that provides the necessary global Firebase configuration variables (`__firebase_config`, `__initial_auth_token`).

2.  **Open:** Open `index.html` in your web browser.

3.  **Interact:** Use the **Upload** button to analyze a local folder, or use the **Natural Language Command Center** in the footer for real-time AI assistance.
