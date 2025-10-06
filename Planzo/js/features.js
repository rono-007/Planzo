// Configuration
const GEMINI_MODEL = "gemini-2.5-flash-preview-05-20";
// API_KEY is expected to be available globally in the execution environment
const API_KEY = ""; 

// Storage for uploaded file content (Path -> Content mapping)
export let uploadedFileContents = {}; 

// Utility: Convert code backticks for display in HTML pre tag
const escapeBackticks = (text) => text.replace(/`/g, '`');

// --- LLM API Core Logic ---

const callGeminiApi = async (userPrompt, customSystemPrompt = null) => {
    // ... (unchanged callGeminiApi logic from the original file) ...
    const defaultSystemPrompt = "You are an AI Development Assistant. Your goal is to help the developer with code optimization, debugging, and providing concise technical advice. Be helpful, professional, and use markdown for code snippets. The user is a developer working on a large project.";
    const effectiveSystemPrompt = customSystemPrompt || defaultSystemPrompt;

    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: {
            parts: [{ text: effectiveSystemPrompt }]
        },
    };
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;
    
    let result;
    let success = false;
    let retries = 0;
    const maxRetries = 5;

    while (!success && retries < maxRetries) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                result = await response.json();
                success = true;
            } else if (response.status === 429 || response.status >= 500) {
                const delay = Math.pow(2, retries) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                retries++;
            } else {
                throw new Error(`API returned status ${response.status}`);
            }
        } catch (error) {
            console.error("Fetch attempt failed:", error);
            retries++;
        }
    }

    if (!success) {
        throw new Error("Failed to get response from Gemini API after multiple retries.");
    }

    const candidate = result.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "Sorry, I couldn't process that request.";
    
    return text;
};

// --- UI & View Control Functions (Exported) ---

export const toggleView = (mode) => {
    // ... (unchanged toggleView logic from the original file) ...
    const chatDisplay = document.getElementById('chat-messages-display');
    const editorView = document.getElementById('inline-editor-view');
    const chatBtn = document.getElementById('chat-mode-btn');
    const editorBtn = document.getElementById('editor-mode-btn');

    if (mode === 'editor') {
        chatDisplay.classList.add('hidden');
        editorView.classList.remove('hidden');
        
        chatBtn.classList.remove('font-bold', 'text-primary', 'border-primary');
        chatBtn.classList.add('font-medium', 'text-gray-500', 'dark:text-gray-400', 'border-transparent');
        
        editorBtn.classList.add('font-bold', 'text-primary', 'border-primary');
        editorBtn.classList.remove('font-medium', 'text-gray-500', 'dark:text-gray-400', 'border-transparent');
    } else { // 'chat' mode
        editorView.classList.add('hidden');
        chatDisplay.classList.remove('hidden');

        editorBtn.classList.remove('font-bold', 'text-primary', 'border-primary');
        editorBtn.classList.add('font-medium', 'text-gray-500', 'dark:text-gray-400', 'border-transparent');

        chatBtn.classList.add('font-bold', 'text-primary', 'border-primary');
        chatBtn.classList.remove('font-medium', 'text-gray-500', 'dark:text-gray-400', 'border-transparent');
    }
};

const displayMessage = (text, sender, type = 'text') => {
    // ... (unchanged displayMessage logic from the original file) ...
    const container = document.getElementById('chat-messages-display');
    const isUser = sender === 'user';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-start gap-3 ${isUser ? 'justify-end' : ''}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = `size-10 rounded-full bg-cover bg-center shrink-0 ${isUser ? 'order-2' : ''}`;
    if (isUser) {
        avatarDiv.style.backgroundImage = 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB1AA7HObhItISBYSLAD-XE7tiVv0VGjF0X3_IqqPX9PoGyfA8NICXk9U17VS7nAN7xGi-gkEmnyxdiEpHtrq6ZRKWKXdDvrDoLNJJ9QGFPWphYubXOechDQCnITZX59EDC6iOLhTWpuDChjawaiaWtBqZmDXelu7t1E4C30m2lBv8RETZKY6jwbNfW8KHzhXOYx0y18EOofdpYGy9FRl_p1xlEl_yDwMsbI4dEUppM0Ld4Cn3muRITUsN0GVCkyZYgJ4Wp0QSzPjc")';
    } else {
         avatarDiv.style.backgroundImage = 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVA6mO_BjMj794QUVgRBbXitGGveB9GbRXUF92YRdJ1aFh15sn1DRCPWnxIjgy-hIHER65ZNx_WM0ts27x6rJ0xUJ9DcSb-fY9gF5cDrgb3ibIoCAJl-qDabmV3OGhDD02j6C7DzI1mkENGfn35YOws3ObYLA-0ELfZ2QxOYUAC-MICPVxd7kiLJNvC2bJgOfi6FDXc3SDSM7Op6bUCHO4RlVXJ9ywYQU0pQwM04zF0WAfnwQDvEvf5EyhkbqqTmw2YzuIXTSARVQ")';
    }

    const contentWrapper = document.createElement('div');
    contentWrapper.className = `flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} ${!isUser ? 'w-full' : ''}`;

    const label = document.createElement('p');
    label.className = 'text-xs text-gray-500 dark:text-gray-400';
    label.textContent = isUser ? 'Developer' : 'AI Assistant';
    contentWrapper.appendChild(label);

    if (type === 'code') {
        const pre = document.createElement('pre');
        pre.className = `w-full text-sm rounded-lg p-3 bg-primary/10 dark:bg-primary/20 text-cyan-400 font-mono overflow-x-auto`;
        pre.innerHTML = `<code class="language-sql">${text}</code>`;
        contentWrapper.appendChild(pre);
    } else {
        const p = document.createElement('p');
        p.className = `text-sm rounded-lg p-3 ${isUser ? 'bg-primary text-white px-4 py-3' : 'bg-primary/10 dark:bg-primary/20'}`;
        p.textContent = text;
        contentWrapper.appendChild(p);
    }

    messageDiv.appendChild(isUser ? contentWrapper : avatarDiv);
    messageDiv.appendChild(isUser ? avatarDiv : contentWrapper);
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight;
    return messageDiv;
};

const createLoadingIndicator = () => {
    // ... (unchanged createLoadingIndicator logic from the original file) ...
    const container = document.getElementById('chat-messages-display');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'ai-loading-indicator';
    loadingDiv.className = 'flex items-start gap-3';
    loadingDiv.innerHTML = `
        <div class="size-10 rounded-full bg-cover bg-center shrink-0" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCVA6mO_BjMj794QUVgRBbXitGGveB9GbRXUF92YRdJ1aFh15sn1DRCPWnxIjgy-hIHER65ZNx_WM0ts27x6rJ0xUJ9DcSb-fY9gF5cDrgb3ibIoCAJl-qDabmV3OGhDD02j6C7DzI1mkENGfn35YOws3ObYLA-0ELfZ2QxOYUAC-MICPVxd7kiLJNvC2bJgOfi6FDXc3SDSM7Op6bUCHO4RlVXJ9ywYQU0pQwM04zF0WAfnwQDvEvf5EyhkbqqTmw2YzuIXTSARVQ")'></div>
        <div class="flex flex-col gap-1 items-start">
            <p class="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
            <div class="text-sm rounded-lg p-3 bg-primary/10 dark:bg-primary/20 flex items-center space-x-2">
                <span class="animate-pulse h-3 w-3 bg-primary rounded-full"></span>
                <span class="animate-pulse h-3 w-3 bg-primary rounded-full delay-150"></span>
                <span class="animate-pulse h-3 w-3 bg-primary rounded-full delay-300"></span>
            </div>
        </div>
    `;
    container.appendChild(loadingDiv);
    container.scrollTop = container.scrollHeight;
    return loadingDiv;
};

// --- Gemini Feature Logic (Exported) ---

export const sendMessage = async () => {
    // ... (unchanged sendMessage logic from the original file, using shared helpers) ...
    const inputElement = document.getElementById('command-input');
    const userPrompt = inputElement.value.trim();

    if (!userPrompt) return;

    toggleView('chat');

    displayMessage(userPrompt, 'user');
    inputElement.value = '';
    
    const loadingIndicator = createLoadingIndicator();
    
    try {
        const aiResponse = await callGeminiApi(userPrompt);

        loadingIndicator.remove();

        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        let lastIndex = 0;

        while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
            const textBefore = aiResponse.substring(lastIndex, match.index).trim();
            if (textBefore) {
                displayMessage(textBefore, 'ai', 'text');
            }

            const codeContent = match[2].trim();
            displayMessage(escapeBackticks(codeContent), 'ai', 'code');
            
            lastIndex = codeBlockRegex.lastIndex;
        }

        const textAfter = aiResponse.substring(lastIndex).trim();
        if (textAfter) {
            displayMessage(textAfter, 'ai', 'text');
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        loadingIndicator.remove();
        displayMessage("An error occurred while connecting to the AI assistant.", 'ai', 'text');
    }
};

export const handleCommandCenter = async () => {
    // ... (unchanged handleCommandCenter logic from the original file, using shared helpers) ...
    const commandInput = document.getElementById('command-input');
    const userCommand = commandInput.value.trim();

    if (!userCommand || commandInput.disabled) return;
    
    const originalPlaceholder = commandInput.placeholder;
    
    commandInput.disabled = true;
    commandInput.value = ''; 
    commandInput.placeholder = 'Processing command... please wait.';

    const commandSystemPrompt = "You are an Executive AI Command Processor. You receive natural language commands from a developer. Your response must be extremely concise, focusing only on the result of the command, a suggested next step, or a small code snippet (max 3 lines) if required. Do not use Markdown headings or introductory phrases. Be direct.";
    
    try {
        const commandResponse = await callGeminiApi(userCommand, commandSystemPrompt); 

        console.log("Command Center Output:", commandResponse);
        
        commandInput.placeholder = `Command Complete: ${commandResponse.substring(0, 50)}...`;
        
        setTimeout(() => {
            commandInput.value = '';
            commandInput.placeholder = originalPlaceholder;
            commandInput.disabled = false;
        }, 4000);

    } catch (error) {
        console.error("Command Center Error:", error);
        
        commandInput.placeholder = 'Error executing command. See console for details.';
        
        setTimeout(() => {
            commandInput.value = '';
            commandInput.placeholder = originalPlaceholder;
            commandInput.disabled = false;
        }, 5000);
    }
};

// --- File Tree Logic (Exported) ---

/**
 * Accesses stored content and displays it in the Inline Editor View.
 */
const displayFileContent = (path, fileName) => {
    // ... (unchanged displayFileContent logic from the original file) ...
    const content = uploadedFileContents[path];
    const titleEl = document.getElementById('editor-file-title');
    const codeEl = document.getElementById('editor-code-display');

    if (content !== undefined) {
        titleEl.textContent = fileName;
        codeEl.textContent = content;
        toggleView('editor');
    } else {
        titleEl.textContent = 'Error loading file.';
        codeEl.textContent = `Could not find content for path: ${path}`;
        toggleView('editor');
    }
};

/**
 * Recursively builds a nested JSON object representing the folder structure.
 */
const buildTreeData = (fileList) => {
    // ... (unchanged buildTreeData logic from the original file) ...
    const tree = {};

    for (const file of fileList) {
        const pathParts = file.webkitRelativePath.split('/').filter(p => p);
        if (pathParts.length <= 1) continue; 

        let currentLevel = tree;

        for (let i = 1; i < pathParts.length; i++) {
            const part = pathParts[i];
            
            if (!currentLevel[part]) {
                const isFile = i === pathParts.length - 1;
                
                currentLevel[part] = {
                    isFolder: !isFile,
                    children: isFile ? null : {},
                    path: pathParts.slice(1, i + 1).join('/')
                };
            }
            if (currentLevel[part].isFolder) {
                currentLevel = currentLevel[part].children;
            }
        }
    }
    return tree;
};

/**
 * Recursively renders the file structure into nested UL/LI elements.
 */
const renderTree = (treeData) => {
    // ... (unchanged renderTree logic from the original file) ...
    const ul = document.createElement('ul');
    ul.className = 'space-y-1 mt-1 border-l border-primary/20 ml-3 pl-3';

    const sortedKeys = Object.keys(treeData).sort((a, b) => {
        const isAFolder = treeData[a].isFolder;
        const isBFolder = treeData[b].isFolder;
        if (isAFolder && !isBFolder) return -1;
        if (!isAFolder && isBFolder) return 1;
        return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
        const item = treeData[key];
        const li = document.createElement('li');
        
        const hasChildren = item.isFolder && Object.keys(item.children).length > 0;
        
        li.className = 'cursor-pointer hover:text-cyan-400 transition-colors flex items-center gap-1';
        li.setAttribute('data-path', item.path);
        
        const iconName = item.isFolder ? 'folder' : 'draft';
        const iconColor = item.isFolder ? 'text-primary' : 'text-gray-500 dark:text-gray-400';
        
        li.innerHTML = `
            <span class="material-symbols-outlined text-base ${iconColor} select-none">
                ${iconName}
            </span>
            <span class="truncate">${key}</span>
        `;

        if (!item.isFolder) {
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                displayFileContent(item.path, key);
            });
        }

        if (hasChildren) {
            li.classList.add('font-semibold');
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                const sublist = li.nextElementSibling;
                if (sublist && sublist.tagName === 'UL') {
                    sublist.classList.toggle('hidden');
                }
            });

            const subTree = renderTree(item.children);
            ul.appendChild(li);
            ul.appendChild(subTree);
        } else {
            ul.appendChild(li);
        }
    }
    return ul;
};

export const handleFolderUpload = async (event) => {
    // ... (unchanged handleFolderUpload logic from the original file, using exported helpers) ...
    const files = event.target.files;
    const container = document.getElementById('knowledge-tree-container');
    
    if (files.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 p-4">No folder selected.</p>';
        return;
    }

    uploadedFileContents = {};
    container.innerHTML = '<p class="text-center text-cyan-400 p-4">Reading file contents...</p>';

    const filePromises = [];
    for (const file of files) {
        if (file.webkitRelativePath && file.size > 0) { 
            const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');
            filePromises.push(file.text().then(content => {
                uploadedFileContents[relativePath] = content;
            }));
        }
    }

    try {
        await Promise.all(filePromises);
    } catch (error) {
        console.error("Error reading one or more files:", error);
        container.innerHTML = `<p class="text-center text-red-400 p-4">Error reading file content. See console.</p>`;
        return;
    }

    const rootFolderName = files[0].webkitRelativePath.split('/')[0] || "Root Project";

    const internalTreeData = buildTreeData(files);

    const wrapper = document.createElement('div');
    wrapper.className = 'w-full';
    
    const rootNode = document.createElement('div');
    rootNode.className = 'font-bold text-lg text-primary flex items-center gap-2 mb-2 cursor-pointer';
    rootNode.innerHTML = `
        <span class="material-symbols-outlined text-xl">folder_open</span>
        <span>${rootFolderName}</span>
    `;
    wrapper.appendChild(rootNode);

    const renderedTree = renderTree(internalTreeData);
    wrapper.appendChild(renderedTree);

    container.innerHTML = '';
    container.appendChild(wrapper);

    document.getElementById('editor-file-title').textContent = 'Select a file to view its content.';
    document.getElementById('editor-code-display').textContent = '// Code content will appear here when a file is clicked in the Project Knowledge Map.';
};