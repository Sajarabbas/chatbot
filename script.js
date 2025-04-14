const chatInput = document.querySelector(".chat-input textarea");
const sendBtn = document.querySelector("#send-btn");
const chatbox = document.querySelector(".chatbox");
const themeToggle = document.querySelector(".theme-toggle");

let userMessage;
const API_KEY = "8NIITVxcdZeTY6VjSf0tocDwxokVQSWX"; // Replace with your actual Mistral AI key
const API_URL = "https://api.mistral.ai/v1/chat/completions";

// Set default theme
document.body.setAttribute("data-theme", "light");

// Theme toggle
themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", newTheme);
});

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", className);
  
  let chatContent = className === "outgoing" 
    ? `<p>${message}</p>`
    : `<span class="material-symbols-rounded">smart_toy</span><p>${message}</p>`;
  
  chatLi.innerHTML = chatContent;
  return chatLi;
};

const generateResponse = (incomingChatLi) => {
    const messageElement = incomingChatLi.querySelector("p");
  
    messageElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}` // Only authorization header needed
      },
      body: JSON.stringify({
        model: "mistral-tiny", // Can be "mistral-tiny", "mistral-small", or "mistral-medium"
        messages: [
          { role: "system", content: "You are a helpful chatbot that give replies in 20-25 words." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7
      })
    };
  
    fetch(API_URL, requestOptions)
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.choices?.[0]?.message?.content) {
          messageElement.textContent = data.choices[0].message.content.trim();
        } else {
          throw new Error("Invalid response format");
        }
      })
      .catch(error => {
        console.error("API Error:", error);
        messageElement.textContent = `Error: ${error.message}`;
      })
      .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  };

const handleChat = () => {
  userMessage = chatInput.value.trim();
  if (!userMessage) return;

  chatInput.value = "";
  chatInput.style.height = "auto";

  // Append user message
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);

  setTimeout(() => {
    // Show "Thinking..." message while waiting
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
};

sendBtn.addEventListener("click", handleChat);
chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleChat();
  }
});
