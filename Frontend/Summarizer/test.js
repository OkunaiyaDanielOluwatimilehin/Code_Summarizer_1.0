// --- DOM Elements ---
const submitButton = document.getElementById("submitButton");
const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");
const outputSection = document.getElementById("outputSection");
const historyContainer = document.getElementById("historyContainer");

// --- UI Logic ---
function showOutput(summary) {
  outputBox.textContent = summary;
  outputSection.style.display = "block";
}

function hideOutput() {
  outputBox.textContent = "";
  outputSection.style.display = "none";
}

// --- Dummy summary generator ---
function getDummySummary(inputText) {
  return `This is a dummy summary of "${inputText.slice(0, 50)}..."`;
}

// --- Load history from localStorage ---
function fetchGuestHistory() {
  const historyData = JSON.parse(localStorage.getItem("guestHistory") || "[]");
  historyContainer.innerHTML = "";

  historyData.forEach((item) => {
    const entry = document.createElement("div");
    entry.classList.add("history-entry");
    entry.innerHTML = `
      <p><strong>Input:</strong> ${item.input}</p>
      <p><strong>Summary:</strong> ${item.output}</p>
    `;
    historyContainer.appendChild(entry);
  });
}

// --- Submit handler ---
submitButton.addEventListener("click", () => {
  const inputText = inputBox.value.trim();
  if (!inputText) return;

  hideOutput();

  const summary = getDummySummary(inputText);

  const guestHistory = JSON.parse(localStorage.getItem("guestHistory") || "[]");
  guestHistory.unshift({ input: inputText, output: summary });
  localStorage.setItem("guestHistory", JSON.stringify(guestHistory));

  showOutput(summary);
  fetchGuestHistory();
});

// --- On page load ---
window.addEventListener("DOMContentLoaded", fetchGuestHistory);
