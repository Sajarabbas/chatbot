// DOM Elements
const chatbox = document.querySelector('.chatbox');
const chatInput = document.querySelector('.chat-input textarea');
const sendBtn = document.querySelector('#send-btn');
const themeToggle = document.querySelector('.theme-toggle');
const minimizeBtn = document.querySelector('.minimize-btn');

// API Configuration
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

  const requestOptions = {
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
          content: "You are a helpful AI assistant. Provide concise responses (20-40 words). Be friendly and professional." 
        },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150,
      stream: true
    })
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    messageElement.innerHTML = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.replace('data: ', '');
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.choices[0].delta?.content) {
              fullResponse += parsed.choices[0].delta.content;
              messageElement.textContent = fullResponse;
              chatbox.scrollTo(0, chatbox.scrollHeight);
            }
          } catch (err) {
            console.error('Error parsing chunk:', err);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    messageElement.classList.add('error');
    messageElement.textContent = "Oops! Something went wrong. Please try again.";
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
    // Display "Thinking..." message while waiting for response
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
themeToggle.addEventListener('click', toggleTheme);

// Minimize functionality (optional)
minimizeBtn.addEventListener('click', () => {
  document.querySelector('.chatbot-container').classList.toggle('minimized');
});

// Initialize
initTheme();