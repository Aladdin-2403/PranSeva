// Default user credentials (can be changed)
const DEFAULT_USERNAME = "user";
const DEFAULT_PASSWORD = "user123";

// Initialize users in localStorage if not exists
function initializeUsers() {
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      { username: DEFAULT_USERNAME, password: DEFAULT_PASSWORD }
    ];
    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }
}

function getUserCredentials() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUserCredentials(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function userLogin() {
  const username = document.getElementById("userUsername").value;
  const password = document.getElementById("userPassword").value;

  if (!username || !password) {
    alert("Please enter both username and password");
    return;
  }

  const users = getUserCredentials();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    // Store logged in user session
    sessionStorage.setItem("loggedInUser", username);
    sessionStorage.setItem("userType", "user");
    // Show user panel with Find Donor button
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("userPanel").classList.remove("hidden");
  } else {
    alert("Invalid credentials");
  }
}

function goToDonorPage() {
  window.location.href = "index.html";
}

// If already logged in as user, show panel automatically
if (sessionStorage.getItem("userType") === "user") {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("userPanel").classList.remove("hidden");
}

// Initialize users on page load
initializeUsers();

