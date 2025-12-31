const USERNAME = "admin";
const PASSWORD = "1234";

function login() {
  const user = document.getElementById("adminUser").value;
  const pass = document.getElementById("adminPass").value;

  if (user === USERNAME && pass === PASSWORD) {
    // Store admin session
    sessionStorage.setItem("loggedInUser", user);
    sessionStorage.setItem("userType", "admin");
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    loadAdminTable();
    loadRequests();
  } else {
    alert("Invalid credentials");
  }
}

function getDonors() {
  return JSON.parse(localStorage.getItem("donors")) || [];
}

function saveDonors(donors) {
  localStorage.setItem("donors", JSON.stringify(donors));
}

function getRequests() {
  return JSON.parse(localStorage.getItem("requests")) || [];
}

function saveRequests(requests) {
  localStorage.setItem("requests", JSON.stringify(requests));
}
function toggleDonationFields() {
  const donationType = document.getElementById("donationType").value;
  const organField = document.getElementById("organ");
  
  if (donationType === "organ") {
    organField.classList.remove("hidden");
    organField.required = true;
  } else {
    organField.classList.add("hidden");
    organField.required = false;
    organField.value = "";
  }
}

function addDonor() {
  const name = document.getElementById("name").value;
  const age = document.getElementById("age").value;
  const blood = document.getElementById("blood").value;
  const donationType = document.getElementById("donationType").value;
  const organ = donationType === "organ" ? document.getElementById("organ").value : "";
  const location = document.getElementById("location").value;
  const contact = document.getElementById("contact").value;
  const available = document.getElementById("available").value === "yes";

  // Validation
  if (!name || !age || !blood || !location || !contact) {
    alert("Please fill all required fields");
    return;
  }

  if (donationType === "organ" && !organ) {
    alert("Please specify the organ");
    return;
  }

  const donor = {
    name: name,
    age: age,
    blood: blood,
    donationType: donationType,
    organ: donationType === "organ" ? organ : "",
    location: location,
    contact: contact,
    available: available
  };

  const donors = getDonors();
  donors.push(donor);
  saveDonors(donors);

  // Reset form
  document.getElementById("name").value = "";
  document.getElementById("age").value = "";
  document.getElementById("blood").value = "";
  document.getElementById("organ").value = "";
  document.getElementById("location").value = "";
  document.getElementById("contact").value = "";
  document.getElementById("donationType").value = "blood";
  document.getElementById("available").value = "yes";
  toggleDonationFields();

  loadAdminTable();
}

function loadAdminTable() {
  const table = document.getElementById("adminTable");
  const donors = getDonors();
  table.innerHTML = "";

  donors.forEach((d, index) => {
    const donationType = d.donationType || (d.organ ? "organ" : "blood");
    const typeDisplay = donationType === "blood" ? "Blood" : "Organ";
    const organDisplay = donationType === "organ" ? (d.organ || "-") : "-";
    
    table.innerHTML += `
      <tr>
        <td>${d.name}</td>
        <td>${d.age}</td>
        <td>${typeDisplay}</td>
        <td>${d.blood || "-"}</td>
        <td>${organDisplay}</td>
        <td>${d.location}</td>
        <td>${d.contact}</td>
        <td>${d.available === false || d.available === "no" ? "Not Available" : "Available"}</td>
        <td>
          <button onclick="deleteDonor(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function deleteDonor(index) {
  const donors = getDonors();
  donors.splice(index, 1);
  saveDonors(donors);
  loadAdminTable();
}
function loadRequests() {
  const table = document.getElementById("requestTable");
  if (!table) return;
  const requests = getRequests();
  table.innerHTML = "";

  requests.forEach((r, index) => {
    const typeDisplay = r.type === "blood" ? "Blood" : "Organ";
    const bloodOrganDisplay = r.type === "blood" ? (r.blood || "-") : (r.organ || "-");
    
    table.innerHTML += `
      <tr>
        <td>${r.requestedBy || "User"}</td>
        <td>${r.userContact || "-"}</td>
        <td>${r.userEmail || "-"}</td>
        <td style="max-width: 200px; word-wrap: break-word;">${r.requirement || "-"}</td>
        <td>${r.donorName}</td>
        <td>${typeDisplay}</td>
        <td>${bloodOrganDisplay}</td>
        <td>${r.donorLocation || r.location || "-"}</td>
        <td>${r.donorContact || r.contact || "-"}</td>
        <td>${r.time || ""}</td>
        <td><button onclick="resolveRequest(${index})">Mark Done</button></td>
      </tr>
    `;
  });
}

function resolveRequest(index) {
  const requests = getRequests();
  requests.splice(index, 1);
  saveRequests(requests);
  loadRequests();
}
function goToUserPage() {
  window.location.href = "index.html";
}

function checkRequests() {
  // Scroll to User Requests section
  const requestsSection = document.querySelector('.form-section:last-child');
  if (requestsSection) {
    requestsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Highlight the section briefly
    requestsSection.style.transition = 'box-shadow 0.3s';
    requestsSection.style.boxShadow = '0 10px 30px rgba(230, 57, 70, 0.4)';
    setTimeout(() => {
      requestsSection.style.boxShadow = '';
    }, 2000);
  }
}

// If already logged in as admin, show panel automatically
if (sessionStorage.getItem("userType") === "admin") {
  document.getElementById("loginBox").classList.add("hidden");
  document.getElementById("adminPanel").classList.remove("hidden");
  toggleDonationFields();
  loadAdminTable();
  loadRequests();
}
