document.addEventListener("DOMContentLoaded", () => {
    const contactBtn = document.getElementById("contactNavBtn");
    const contactSection = document.getElementById("contactSection");
    const aboutContent = document.getElementById("aboutContent");
    const goBackBtn = document.getElementById("goBackButton");
  
    // Show contact form and hide about content
    contactBtn.addEventListener("click", () => {
      contactSection.classList.remove("hidden");
      aboutContent.classList.add("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  
    // Go back to about content
    goBackBtn.addEventListener("click", () => {
      contactSection.classList.add("hidden");
      aboutContent.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    
  });
  