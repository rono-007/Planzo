// Firebase SDK Imports (moved from index.html)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Import all feature logic (LLM, UI helpers, file tree)
import { 
    sendMessage, 
    handleCommandCenter, 
    handleFolderUpload, 
    toggleView 
} from './features.js';

// Global variables provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Firebase instances
let app, db, auth;

// --- Firebase Initialization and Authentication ---

const initApp = async () => {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        await new Promise((resolve) => {
            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                }
                const userId = auth.currentUser?.uid || crypto.randomUUID();
                document.getElementById('dev-id-display').textContent = `User ID: ${userId.substring(0, 8)}...`;
                resolve();
            });
        });

        console.log("Firebase initialized. User ID:", auth.currentUser.uid);
    } catch (error) {
        console.error("Error initializing Firebase or signing in:", error);
    }
};

// --- Event Listeners and Setup ---

window.onload = () => {
    initApp();

    // UI Elements
    const applyFixBtn = document.getElementById('apply-fix-btn');
    const commandInput = document.getElementById('command-input');
    const folderInput = document.getElementById('folder-upload');
    const uploadButton = document.getElementById('upload-folder-btn');
    const chatModeBtn = document.getElementById('chat-mode-btn');
    const editorModeBtn = document.getElementById('editor-mode-btn');
    
    // 1. Upload Listener
    uploadButton.addEventListener('click', () => {
        folderInput.click();
    });
    folderInput.addEventListener('change', handleFolderUpload);

    // 2. Tab Mode Listeners
    chatModeBtn.addEventListener('click', () => toggleView('chat'));
    editorModeBtn.addEventListener('click', () => toggleView('editor'));


    // 3. Command Input Listener (Unified Input)
    commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage(); // Default action on Enter is general chat
        }
    });

    // 4. Specific Command button listener
    applyFixBtn.addEventListener('click', handleCommandCenter);
    
    // 5. Dummy button action for 'Run'
    document.getElementById('run-command-btn').addEventListener('click', () => {
        console.log("Running commands...");
        commandInput.placeholder = "Code execution triggered. See console for logs.";
        setTimeout(() => {
            commandInput.placeholder = "Natural Language Command Center...";
        }, 3000);
    });
};