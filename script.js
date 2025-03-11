// Theme Toggle
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

let isDarkTheme = false;

themeToggle.addEventListener("click", () => {
  isDarkTheme = !isDarkTheme;
  body.classList.toggle("dark-theme");
  themeToggle.textContent = isDarkTheme ? "☀️" : "🌙";
});

// Mobile Menu Toggle
const mobileMenu = document.querySelector(".mobile-menu");
const navLinks = document.querySelector(".nav-links");

mobileMenu.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Modal Handling
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const loginLink = document.getElementById("loginLink");
const signupLink = document.getElementById("signupLink");
const closeBtns = document.querySelectorAll(".close");

loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginModal.style.display = "block";
});

signupLink.addEventListener("click", (e) => {
  e.preventDefault();
  signupModal.style.display = "block";
});

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    loginModal.style.display = "none";
    signupModal.style.display = "none";
  });
});

window.addEventListener("click", (e) => {
  if (e.target === loginModal) loginModal.style.display = "none";
  if (e.target === signupModal) signupModal.style.display = "none";
});

// Form Validation
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.querySelector('input[type="email"]').value;
  const password = loginForm.querySelector('input[type="password"]').value;

  // Basic validation
  if (email && password) {
    // Here you would typically make an API call to authenticate
    console.log("Login attempt:", { email });
    loginModal.style.display = "none";
    loginForm.reset();
  }
});

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = signupForm.querySelector('input[type="text"]').value;
  const email = signupForm.querySelector('input[type="email"]').value;
  const passwords = signupForm.querySelectorAll('input[type="password"]');

  // Basic validation
  if (name && email && passwords[0].value === passwords[1].value) {
    // Here you would typically make an API call to register
    console.log("Signup attempt:", { name, email });
    signupModal.style.display = "none";
    signupForm.reset();
  } else {
    alert("Please check your inputs. Passwords must match.");
  }
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const href = this.getAttribute("href");
    if (href === "#") return;

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});
