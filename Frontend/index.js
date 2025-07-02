import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dkixivngylkrisvcocvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
);

document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector(".hero");
  const typewriterTextElement = document.getElementById("typewriter-text");
  const getStartedButton = document.getElementById("getStartedButton");
  const avatar = document.getElementById("user-avatar");
  const extraBtnContainer = document.getElementById("extra-project-btn-container");
  const avatarButton = document.getElementById("avatarButton");
  const userDropdown = document.getElementById("userDropdown");
  const userName = document.getElementById("userName");

  // Typewriter in hero
  const phrases = [
    "Powered by cutting-edge AI.",
    "Making code accessible to everyone.",
    "Your ultimate code understanding companion.",
    "Efficient, accurate, and instant."
  ];
  let phraseIndex = 0, charIndex = 0, isDeleting = false;
  const typingSpeed = 100, deletingSpeed = 50, delayBetweenPhrases = 1500;

  function typeWriterEffect() {
    const currentPhrase = phrases[phraseIndex];
    typewriterTextElement.textContent = isDeleting
      ? currentPhrase.substring(0, charIndex--)
      : currentPhrase.substring(0, ++charIndex);

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      setTimeout(typeWriterEffect, delayBetweenPhrases);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeWriterEffect, 500);
    } else {
      setTimeout(typeWriterEffect, isDeleting ? deletingSpeed : typingSpeed);
    }
  }

  if (typewriterTextElement) typeWriterEffect();

  // Get Started / New Project logic
  (async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      avatar.innerHTML = '<i class="fas fa-user fa-xl"></i>';
      getStartedButton.innerHTML = 'New Project <i class="fas fa-plus"></i>';
      getStartedButton.onclick = () => window.location.href = "/summarizer/summarizer.html";

      const newBtn = document.createElement("button");
      newBtn.textContent = "New Project";
      newBtn.className = "btn secondary";
      newBtn.onclick = () => window.location.href = "/summarizer/summarizer.html";
      extraBtnContainer.appendChild(newBtn);

    } else {
      avatar.innerHTML = '<i class="fas fa-user-plus fa-xl"></i>';
      getStartedButton.innerHTML = 'Get Started <i class="fas fa-arrow-right"></i>';
    }
  })();

 
  
  
  // Toggle dropdown with animation
  let dropdownOpen = false;
  
  avatarButton.addEventListener("click", () => {
    dropdownOpen = !dropdownOpen;
    if (dropdownOpen) {
      userDropdown.classList.remove("hidden");
      requestAnimationFrame(() => userDropdown.classList.add("show"));
    } else {
      userDropdown.classList.remove("show");
      setTimeout(() => userDropdown.classList.add("hidden"), 200);
    }
      });
    })(); // Close the nested async function
  
 
// Close the DOMContentLoaded event listener
  
  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!avatarButton.contains(e.target) && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("show");
      setTimeout(() => userDropdown.classList.add("hidden"), 200);
      dropdownOpen = false;
    }
  });
  
  (async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
  
    const usernameLabel = document.getElementById("usernameLabel");
    const avatarButton = document.getElementById("avatarButton");
  
    if (user) {
      // Fetch username from `profiles` table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
  
      const username = profile?.username || user.email?.split("@")[0] || "User";
      usernameLabel.textContent = `Hi, ${username}`;
    } else {
      usernameLabel.textContent = "Hi, Guest";
    }
  
    // Mobile/Desktop logout on avatar click (optional here, you said we do this later)
    avatarButton.addEventListener("click", async () => {
      if (window.innerWidth <= 768) {
        // On mobile, clicking avatar logs out
        await supabase.auth.signOut();
        window.location.href = "Frontend\index.html";
      }
    });
  
    
    // Desktop logout button
    const logoutBtn = document.getElementById("logoutBtn");

(async () => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (!logoutBtn) return;

  if (!user) {
    logoutBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Login`;
    logoutBtn.setAttribute("href", "/auth/login.html");
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/auth/login.html";
    });
  } else {
    logoutBtn.innerHTML = `<i class="fa-solid fa-right-from-bracket"></i> Logout`;
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await supabase.auth.signOut();
      window.location.href = "/Frontend/index.html";
    });
  }
})();
});
