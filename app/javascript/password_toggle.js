document.addEventListener("turbo:load", () => {
  setupPassword("password", "toggle-password");
  setupPassword("password-confirmation", "toggle-password-confirmation");

  const password = document.getElementById("password");
  const error = document.getElementById("password-error");

  if (password) {
    password.addEventListener("input", () => {
      if (password.value.length === 0) {
        error.textContent = "";
      } else if (password.value.length < 8) {
        error.textContent = "パスワードは8文字以上必要です";
      } else {
        error.textContent = "";
      }
    });
  }
});

function setupPassword(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);

  if (!input || !toggle) return;

  toggle.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      toggle.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      toggle.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
}