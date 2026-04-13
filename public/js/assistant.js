/****************************************
 * VOICE ASSISTANT + DARK MODE
 ****************************************/

document.addEventListener("DOMContentLoaded", () => {

  const voiceBtn = document.getElementById("voiceBtn");
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
  voiceBtn?.addEventListener("click", () => {
    speak("Welcome to Joshi Choice Center. Transaction system is ready.");
  });

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
