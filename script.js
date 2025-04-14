// DOM Elements
const chatbox = document.querySelector('.chatbox');
const chatInput = document.querySelector('.chat-input textarea');
const sendBtn = document.querySelector('#send-btn');

// API Configuration - IMPORTANT: Move this to Netlify Environment Variables for production
const API_KEY = "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";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

let userMessage;
const inputInitHeight = chatInput.scrollHeight;

// Initialize theme from localStorage
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.body.className = `${savedTheme}-mode`;
};

// Toggle theme
const toggleTheme = () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
};

// Create chat element
const createChatLi = (message, className) => {
  const chatLi = document.createElement('li');
  chatLi.classList.add('chat', className);
  
  let chatContent = className === 'outgoing' 
    ? `<p>${message}</p>`
    : `<span class="material-symbols-rounded">smart_toy</span><p>${message}</p>`;
  
  chatLi.innerHTML = chatContent;
  return chatLi;
};

// Generate response from Mistral AI
const generateResponse = async (chatElement) => {
  const messageElement = chatElement.querySelector('p');
  messageElement.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Mistral AI Chatbot'
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful AI assistant. Keep responses concise (20-40 words)." 
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || "No response from AI";
    
    // Type out response character by character
    messageElement.textContent = '';
    for (let i = 0; i < aiResponse.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20));
      messageElement.textContent += aiResponse[i];
      chatbox.scrollTo(0, chatbox.scrollHeight);
    }

  } catch (error) {
    console.error('API Error:', error);
    messageElement.classList.add('error');
    messageElement.textContent = "Error: Failed to get response. Check console for details.";
  }
};

// Handle chat
const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = '';
  chatInput.style.height = `${inputInitHeight}px`;

  // Append user message
  chatbox.appendChild(createChatLi(userMessage, 'outgoing'));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    const incomingChatLi = createChatLi('Thinking...', 'incoming');
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

// Event Listeners
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});

sendBtn.addEventListener('click', handleChat);
document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

// Initialize
initTheme();
