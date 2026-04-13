// ===== SOUND EFFECTS =====
const darkSound = new Audio("../public/sounds/dark-on.mp3");
const lightSound = new Audio("../public/sounds/light-on.mp3");

darkSound.volume = 0.5;
lightSound.volume = 0.5;

/****************************************
 * VOICE ASSISTANT + DARK MODE
 ****************************************/

document.addEventListener("DOMContentLoaded", () => {

  const voiceBtn = document.getElementById("assistantSpeaker");
  const themeToggle = document.getElementById("themeToggle");

  // ===== VOICE FUNCTION =====
  function speak(text) {
    if (!window.speechSynthesis) {
      alert("Voice not supported in this browser");
      return;
    }

    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN"; // Indian English
    msg.rate = 1;
    msg.pitch = 1;
    window.speechSynthesis.speak(msg);
  }

  // Speak on button click
  if (voiceBtn) {
    voiceBtn.addEventListener("click", () => {
      speak(
        "Hello! Welcome to Joshi Choice Center. " +
        "Please enter customer details and save the transaction. " +
        "I am here to assist you."
      );
    });
  }

  // ===== DARK / LIGHT MODE =====
  themeToggle?.addEventListener("change", function () {

    if (this.checked) {
      document.body.classList.add("dark");
      speak("Dark mode enabled");
    } else {
      document.body.classList.remove("dark");
      speak("Light mode enabled");
    }
  });

});
