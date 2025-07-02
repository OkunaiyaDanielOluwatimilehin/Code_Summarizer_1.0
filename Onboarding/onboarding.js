window.addEventListener("DOMContentLoaded", async () => {
  const supabase = window.supabase.createClient(
    "https://dkixivngylkrisvcocvm.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraXhpdm5neWxrcmlzdmNvY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTkyMDMsImV4cCI6MjA2MzA3NTIwM30.t1QExOgESWvMXnHRKgm2BZghcpX7Bxrl79065_8WZBc"
  );

    const steps = document.querySelectorAll(".onboarding-step");
    let currentStep = 0;
  
    const usernameInput = document.getElementById("fullName");
    const generatedUsernameDisplay = document.getElementById("generated-username-display");
  
    // On load: get logged in user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (userError || !user) {
      alert("Please log in first.");
      window.location.href = "/auth/login.html";
      return;
    }
  
    // Generate username based on email or random fallback
    function generateUsername(email) {
      if (!email) return "user" + Math.floor(Math.random() * 10000);
      const namePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      return namePart || "user" + Math.floor(Math.random() * 10000);
    }
  
    // Initialize username field with generated username or from localStorage
    const savedUsername = localStorage.getItem("fullName");
    const generatedUsername = generateUsername(user.email);
  
    usernameInput.value = savedUsername || generatedUsername;
    generatedUsernameDisplay.textContent = `Suggested: ${generatedUsername}`;
  
    // Save username on input to localStorage
    usernameInput.addEventListener("input", () => {
      localStorage.setItem("fullName", usernameInput.value);
    });
  
    // Map fields per step for localStorage draft saving
    const fieldMap = {
      0: () => usernameInput,
      1: () => document.getElementById("role"),
      2: () => document.getElementById("language"),
    };
  
    // Restore other fields from localStorage
    Object.entries(fieldMap).forEach(([step, getField]) => {
      if (step == "0") return; // already handled username
      const field = getField();
      const saved = localStorage.getItem(field.id);
      if (saved) field.value = saved;
    });
  
    // Save draft for all fields
    Object.values(fieldMap).forEach((getField) => {
      const field = getField();
      field.addEventListener("input", () => {
        localStorage.setItem(field.id, field.value);
      });
    });
  
    // Navigation buttons event listeners
    document.querySelectorAll(".next-btn").forEach((btn) =>
      btn.addEventListener("click", nextStep)
    );
  
    document.querySelectorAll(".skip-btn").forEach((btn) =>
      btn.addEventListener("click", skipStep)
    );
  
    document.querySelectorAll(".back-btn").forEach((btn) =>
      btn.addEventListener("click", prevStep)
    );
  
    // Progress update
    function updateProgress() {
      const totalSteps = steps.length;
      const percentage = ((currentStep + 1) / totalSteps) * 100;
      document.getElementById("progress-fill").style.width = percentage + "%";
      document.getElementById("progress-text").textContent = `Step ${currentStep + 1} of ${totalSteps}`;
      document.querySelectorAll(".back-btn").forEach((btn) => {
        btn.style.display = currentStep === 0 ? "none" : "inline-block";
      });
    }
  
    // Navigation functions
    function goToStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= steps.length) return;
      steps[currentStep].classList.remove("active");
      currentStep = stepIndex;
      steps[currentStep].classList.add("active");
      updateProgress();
    }
  
    function nextStep() {
      const field = fieldMap[currentStep]?.();
      if (field && field.value.trim() === "") {
        alert("Please complete this step or press Skip.");
        return;
      }
      if (currentStep === steps.length - 1) {
        submitOnboarding();
      } else {
        goToStep(currentStep + 1);
      }
    }
  
    function skipStep() {
      if (currentStep === steps.length - 1) {
        submitOnboarding();
      } else {
        goToStep(currentStep + 1);
      }
    }
  
    function prevStep() {
      goToStep(currentStep - 1);
    }
  
    // Submit onboarding data
    async function submitOnboarding() {
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !user) {
        alert("User not logged in. Please log in before submitting.");
        window.location.href = "auth\login.html";
        return;
      }
    
      const profileData = {
        id: user.id,
        full_name: document.getElementById("fullName").value || null,
        language: document.getElementById("language").value || null,
        username: document.getElementById("fullName").value || null, // Or your logic for username
        avatar_url: null,  // fixed null, no upload or changes
      };
    
      // Username uniqueness check, if needed...
    
      const { error: profileError } = await supabase.from("profiles").upsert(profileData);
      if (profileError) {
        alert("Error saving profile: " + profileError.message);
        return;
      }
    
      alert("Profile saved successfully!");
      localStorage.clear();
      window.location.href = "Frontend\index.html";
    }

  });