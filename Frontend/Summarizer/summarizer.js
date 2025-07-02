import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dkixivngylkrisvcocvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
);

// --- DOM Elements ---
const submitButton = document.getElementById("submitButton");
const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");
const outputSection = document.getElementById("outputSection");
const historyContainer = document.getElementById("historyContainer");
const usernameLabel = document.getElementById("usernameLabel");
const avatarButton = document.getElementById("avatarButton");
const userDropdown = document.getElementById("userDropdown");

// --- UI Output ---
function showOutput(summary) {
  outputBox.value = summary;
  outputSection.classList.remove("hidden");
}

function hideOutput() {
  outputBox.value = "";
  outputSection.classList.add("hidden");
}

// --- Fetch Summarization from Vercel API ---
async function getSummaryFromAPI(inputText) {
  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputText })
  });

  const data = await response.json();

  if (!data.summary) {
    throw new Error("No summary returned");
  }

  return data.summary;
}

// --- Fetch History ---
async function fetchHistory(userId) {
  let historyData = [];

  if (userId) {
    const { data, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch history error:", error);
      return;
    }

    historyData = data;
  } else {
    historyData = JSON.parse(localStorage.getItem("guestHistory") || "[]");
  }

  historyContainer.innerHTML = "";
  historyData.forEach((item) => {
    const entry = document.createElement("div");
    entry.classList.add("summary-item");
    entry.innerHTML = `
      <p><strong>Input:</strong> ${item.input}</p>
      <p><strong>Summary:</strong> ${item.output}</p>
    `;
    historyContainer.appendChild(entry);
  });
}

// --- Submit Button Click ---
submitButton.addEventListener("click", async () => {
  const inputText = inputBox.value.trim();
  if (!inputText) return;

  submitButton.disabled = true;
  hideOutput();

  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    const summary = await getSummaryFromAPI(inputText);

    if (userId) {
      // Save to Supabase
      await supabase.from("summaries").insert({
        user_id: userId,
        input: inputText,
        output: summary
      });
    } else {
      // Save to localStorage
      const guestHistory = JSON.parse(localStorage.getItem("guestHistory") || "[]");
      guestHistory.unshift({ input: inputText, output: summary, timestamp: Date.now() });
      localStorage.setItem("guestHistory", JSON.stringify(guestHistory));
    }

    showOutput(summary);
    fetchHistory(userId);
  } catch (err) {
    alert("Error summarizing: " + err.message);
    console.error(err);
  } finally {
    submitButton.disabled = false;
  }
});

// --- DOM Ready ---
window.addEventListener("DOMContentLoaded", async () => {
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  fetchHistory(user?.id || null);

  // Show username if logged in
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const username = profile?.username || user.email?.split("@")[0] || "User";
    usernameLabel.textContent = `Hi, ${username}`;
  } else {
    usernameLabel.textContent = "Hi, Guest";
  }

  // Toggle dropdown with animation
  document.addEventListener("DOMContentLoaded", () => {
    const avatarButton = document.getElementById("avatarButton");
    const userDropdown = document.getElementById("userDropdown");
  
    if (!avatarButton || !userDropdown) {
      console.warn("Dropdown elements not found");
      return;
    }
  
    avatarButton.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("hidden");
    });
  
    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target) && !avatarButton.contains(e.target)) {
        userDropdown.classList.add("hidden");
      }
    });
  });
  

  // Auth logic
  const { data: { user: repeatUser }, error } = await supabase.auth.getUser();

  if (repeatUser) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", repeatUser.id)
      .single();

    const username = profile?.username || repeatUser.email?.split("@")[0] || "User";
    usernameLabel.textContent = `Hi, ${username}`;
  }

  avatarButton.addEventListener("click", async () => {
    if (window.innerWidth <= 768) {
      await supabase.auth.signOut();
      window.location.href = "/login.html";
    }
  });

  document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.href = "auth/login.html";
  });
});
