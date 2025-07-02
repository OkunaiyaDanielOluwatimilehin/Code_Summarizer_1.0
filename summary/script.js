// Supabase Client Initialization
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dkixivngylkrisvcocvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
);

const inputEl = document.getElementById('userInput');
const chat = document.getElementById('chat');
const submitBtn = document.getElementById('submitButton');
const avatarButton = document.getElementById("avatarButton");
const userDropdown = document.getElementById("userDropdown");

// Disable trial UI
function disableInput() {
  if (inputEl) {
    inputEl.disabled = true;
    inputEl.placeholder = "Trial limit reached. Please sign in to continue.";
    inputEl.style.opacity = 0.5;
    inputEl.style.cursor = "not-allowed";
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = 0.5;
    submitBtn.style.cursor = "not-allowed";
  }

  const loginPrompt = document.getElementById('loginPrompt');
  if (loginPrompt) {
    loginPrompt.style.display = 'block';
  }
}

submitBtn.addEventListener('click', handleSubmit);
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
});

function appendUserBubble(text) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble user-bubble';

  const previewLimit = 200;
  const isLong = text.length > previewLimit;
  const previewText = isLong ? text.slice(0, previewLimit) + '...' : text;

  const content = document.createElement('div');
  content.className = 'summary-content';
  content.textContent = previewText;

  const actions = document.createElement('div');
  actions.className = 'actions';

  if (isLong) {
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Show More';
    toggleBtn.onclick = () => {
      const expanded = content.textContent === text;
      content.textContent = expanded ? previewText : text;
      toggleBtn.textContent = expanded ? 'Show More' : 'Show Less';
    };
    actions.appendChild(toggleBtn);
  }

  bubble.appendChild(content);
  if (isLong) bubble.appendChild(actions);
  chat.appendChild(bubble);
  return bubble;
}

function appendLoadingBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble ai-bubble loading';
  bubble.textContent = 'Summarizing...';
  chat.appendChild(bubble);
  return bubble;
}

function buildAIBubble(fullText, truncated) {
  const bubble = document.createElement('div');
  bubble.className = 'bubble ai-bubble';

  const summaryContent = document.createElement('div');
  summaryContent.className = 'summary-content';
  summaryContent.textContent = truncated;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy';
  copyBtn.onclick = () => navigator.clipboard.writeText(fullText);

  const readMoreBtn = document.createElement('button');
  readMoreBtn.textContent = 'Read More';
  readMoreBtn.onclick = () => {
    summaryContent.textContent = fullText;
    readMoreBtn.remove();
  };

  actions.appendChild(copyBtn);
  if (truncated.length < fullText.length) actions.appendChild(readMoreBtn);

  bubble.appendChild(summaryContent);
  bubble.appendChild(actions);

  return bubble;
}

function scrollToBottom() {
  setTimeout(() => {
    chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
  }, 100);
}

function summarizeLogic(code) {
  return new Promise(resolve => {
    setTimeout(() => {
      const lines = code.split('\n');
      const result = lines.slice(0, Math.ceil(lines.length / 2)).join('\n');
      resolve(`Summary:\n${result}`);
    }, 700);
  });
}

function truncateText(text, limit) {
  return text.length > limit ? text.slice(0, limit) + '...' : text;
}

async function saveToSupabase(userId, input, output) {
  const { error } = await supabase.from('summaries').insert({
    user_id: userId,
    input,
    output,
    created_at: new Date().toISOString()
  });
  if (error) console.error('Supabase insert error:', error);
}

function getTrialCount() {
  return parseInt(localStorage.getItem('trialCount') || '0');
}
function incrementTrialCount() {
  localStorage.setItem('trialCount', getTrialCount() + 1);
}
function saveToLocal(input, output) {
  const list = JSON.parse(localStorage.getItem('summaries') || '[]');
  list.push({ input, output });
  localStorage.setItem('summaries', JSON.stringify(list));
}

function appendToHistory(input, output) {
  const sidebar = document.getElementById('history');
  const item = document.createElement('div');
  item.className = 'history-item';

  const timestamp = new Date().toLocaleString();
  item.innerHTML = `<strong>${timestamp}</strong><br><em>${truncateText(input, 80)}</em>`;

  item.onclick = () => {
    appendUserBubble(input);
    const aiBubble = buildAIBubble(output, truncateText(output, 300));
    chat.appendChild(aiBubble);
    scrollToBottom();
  };

  sidebar?.prepend(item);
}

async function handleSubmit() {
  const userText = inputEl.value.trim();
  if (!userText) return;

  appendUserBubble(userText);
  inputEl.value = '';
  scrollToBottom();

  const loading = appendLoadingBubble();
  const fullSummary = await summarizeLogic(userText);
  const truncated = truncateText(fullSummary, 300);

  const aiBubble = buildAIBubble(fullSummary, truncated);
  chat.replaceChild(aiBubble, loading);
  scrollToBottom();

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await saveToSupabase(user.id, userText, fullSummary);
    appendToHistory(userText, fullSummary);
  } else {
    const trialCount = getTrialCount();
    if (trialCount < 3) {
      saveToLocal(userText, fullSummary);
      incrementTrialCount();
    } else {
      disableInput(); // ⛔ lock the UI
      alert("Trial limit reached. Please sign in to continue.");
    }
  }
}

// UI setup and user/session state
window.addEventListener('DOMContentLoaded', async () => {
  const chat = document.getElementById('chat');
  if (!chat) return console.error('Missing #chat container');

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const username = profile?.username || user.email?.split("@")[0] || "User";
    document.getElementById('usernameLabel').textContent = `Hi, ${username}`;
  }

  let summaries = [];
  if (user) {
    const { data, error } = await supabase
      .from('summaries')
      .select('input, output')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error) summaries = data;
    else console.error('Error loading Supabase summaries:', error);
  } else {
    try {
      summaries = JSON.parse(localStorage.getItem('summaries')) || [];
    } catch (e) {
      console.warn('Local summaries load failed', e);
    }

    if (getTrialCount() >= 3) {
      disableInput(); // ⛔ auto-lock on page load
    }
  }

  summaries.forEach(({ input, output }) => {
    appendUserBubble(input);
    const aiBubble = buildAIBubble(output, truncateText(output, 300));
    chat.appendChild(aiBubble);
  });

  scrollToBottom();
});

// Sidebar toggle
const menuToggle = document.getElementById("menuToggle");
const userSidebar = document.getElementById("userSidebar");

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  userSidebar.classList.toggle("show");
});

document.addEventListener("click", (e) => {
  if (!userSidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    userSidebar.classList.remove("show");
  }
});

// Logout
const { data: { user } } = await supabase.auth.getUser();

const logoutBtn = document.getElementById("logoutBtn");
if (!user) {
  logoutBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
  logoutBtn.href = "/auth/login.html";
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/auth/login.html";
  });
} else {
  logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = "/auth/login.html";
  });
}
