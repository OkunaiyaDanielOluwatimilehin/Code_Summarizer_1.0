import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://dkixivngylkrisvcocvm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc'
);

document.addEventListener('DOMContentLoaded', () => {
  // === Signup form ===
  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!email || !password) {
      showToast("Email and password are required.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      showToast("Error: " + error.message);
      return;
    }

    showToast("Signup successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "Onboarding\onboarding.html";
    }, 1500);
  });

  // === Login form ===
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      showToast("Email and password are required.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showToast("Login failed: " + error.message);
      return;
    }

    showToast("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "summary\summary.html";
    }, 1500);
  });

  // === Google OAuth ===
  document.getElementById('googleSignIn')?.addEventListener('click', async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}Frontend\index.html`
      }
    });
  });

  // === GitHub OAuth ===
  document.getElementById('githubSignIn')?.addEventListener('click', async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}Frontend\index.html`
      }
    });
  });

  // === Toast utility ===
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // === Auto-login redirect (used only on login/signup pages) ===
  (async () => {
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes("login") || currentPath.includes("signup");

    const { data: { user } } = await supabase.auth.getUser();

    if (user && isAuthPage) {
      // Already signed in and on login/signup → redirect to dashboard
      window.location.href = "summary\summary.html";
    }
  })();
});
