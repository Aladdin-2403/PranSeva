// Check if user is logged in
function checkUserLogin() {
  const loggedInUser = sessionStorage.getItem("loggedInUser");
  const userType = sessionStorage.getItem("userType");
  const topBar = document.querySelector(".top-bar");
  
  if (!loggedInUser || (userType !== "user" && userType !== "admin")) {
    // Show login prompt, hide donor content
    document.getElementById("loginPrompt").classList.remove("hidden");
    document.getElementById("donorContent").classList.add("hidden");
    if (topBar) topBar.classList.remove("hidden");
    return false;
  } else {
    // Hide login prompt, show donor content
    document.getElementById("loginPrompt").classList.add("hidden");
    document.getElementById("donorContent").classList.remove("hidden");
    if (topBar) topBar.classList.add("hidden");
    return true;
  }
}

const table = document.getElementById("donorTable");
const filterLocation = document.getElementById("filterLocation");
const filterType = document.getElementById("filterType");
const filterBlood = document.getElementById("filterBlood");
const filterOrgan = document.getElementById("filterOrgan");

let donors = JSON.parse(localStorage.getItem("donors")) || [];
const noDataMsg = document.getElementById("noDataMsg");
let currentDonorIndex = -1;

function getRequests() {
  return JSON.parse(localStorage.getItem("requests")) || [];
}

function saveRequests(requests) {
  localStorage.setItem("requests", JSON.stringify(requests));
}

function loadFilters() {
  const locations = new Set();
  const bloods = new Set();
  const organs = new Set();

  donors.forEach(d => {
    locations.add(d.location);
    if (d.blood) bloods.add(d.blood);
    if (d.organ && d.donationType === "organ") organs.add(d.organ);
  });

  locations.forEach(l => filterLocation.innerHTML += `<option>${l}</option>`);
  bloods.forEach(b => filterBlood.innerHTML += `<option>${b}</option>`);
  organs.forEach(o => filterOrgan.innerHTML += `<option>${o}</option>`);
}

function displayData() {
  table.innerHTML = "";
  let shown = 0;

  donors.forEach((d, index) => {
    const donationType = d.donationType || (d.organ ? "organ" : "blood");
    const typeDisplay = donationType === "blood" ? "Blood" : "Organ";
    
    const matches =
      (!filterLocation.value || d.location === filterLocation.value) &&
      (!filterType.value || donationType === filterType.value) &&
      (!filterBlood.value || d.blood === filterBlood.value) &&
      (!filterOrgan.value || (donationType === "organ" && d.organ === filterOrgan.value));

    if (!matches) return;
    shown += 1;
    const available = d.available === false || d.available === "no" ? "Not Available" : "Available";
    
    // Don't show Contact Hospital button for admin
    const userType = sessionStorage.getItem("userType");
    let actionCell = "";
    if (userType === "admin") {
      actionCell = "-"; // Admin doesn't need to contact hospital
    } else {
      actionCell = available === "Available"
        ? `<button onclick="requestDonation(${index})">Contact Hospital</button>`
        : `<span>Not Available</span>`;
    }

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
        <td>${available}</td>
        <td>${actionCell}</td>
      </tr>
    `;
  });

  if (noDataMsg) {
    if (shown === 0) {
      noDataMsg.classList.remove("hidden");
    } else {
      noDataMsg.classList.add("hidden");
    }
  }
}

filterLocation.onchange = filterType.onchange = filterBlood.onchange = filterOrgan.onchange = displayData;

// Only load data if user is logged in
if (checkUserLogin()) {
  // Hide Action column header for admin
  const userType = sessionStorage.getItem("userType");
  const actionHeader = document.querySelector(".action-header");
  if (userType === "admin" && actionHeader) {
    actionHeader.style.display = "none";
  } else if (actionHeader) {
    actionHeader.style.display = "";
  }
  
  loadFilters();
  displayData();
}

function requestDonation(index) {
  const loggedInUser = sessionStorage.getItem("loggedInUser") || "User";
  const userType = sessionStorage.getItem("userType");
  if (!loggedInUser || (userType !== "user" && userType !== "admin")) {
    alert("Please login to make a request.");
    return;
  }

  const donor = donors[index];
  if (!donor) {
    alert("Donor not found.");
    return;
  }

  if (donor.available === false || donor.available === "no") {
    alert("This donation is currently not available.");
    return;
  }

  // Store the donor index and show modal
  currentDonorIndex = index;
  const donationType = donor.donationType || (donor.organ ? "organ" : "blood");
  const typeDisplay = donationType === "blood" ? "Blood" : "Organ";
  const organInfo = donationType === "organ" ? ` - ${donor.organ}` : "";
  
  document.getElementById("donorInfo").textContent = 
    `Requesting ${typeDisplay}${organInfo} from ${donor.name} (${donor.blood})`;
  
  // Reset form
  document.getElementById("contactForm").reset();
  
  // Show modal
  document.getElementById("contactModal").classList.remove("hidden");
}

function closeContactModal() {
  document.getElementById("contactModal").classList.add("hidden");
  currentDonorIndex = -1;
}

function submitContactForm(event) {
  event.preventDefault();
  
  if (currentDonorIndex === -1) {
    alert("Donor information not found. Please try again.");
    return;
  }

  const donor = donors[currentDonorIndex];
  const userContact = document.getElementById("userContact").value;
  const userEmail = document.getElementById("userEmail").value;
  const requirement = document.getElementById("requirement").value;
  const loggedInUser = sessionStorage.getItem("loggedInUser") || "User";
  const donationType = donor.donationType || (donor.organ ? "organ" : "blood");

  const requests = getRequests();
  requests.push({
    requestedBy: loggedInUser,
    userContact: userContact,
    userEmail: userEmail,
    requirement: requirement,
    donorName: donor.name,
    type: donationType,
    blood: donor.blood,
    organ: donationType === "organ" ? donor.organ : "",
    donorLocation: donor.location,
    donorContact: donor.contact,
    time: new Date().toLocaleString()
  });
  saveRequests(requests);
  
  closeContactModal();
  alert("Your request has been sent to the hospital admin. You will be contacted soon!");
}

// Close modal when clicking outside of it
window.onclick = function(event) {
  const modal = document.getElementById("contactModal");
  if (event.target === modal) {
    closeContactModal();
  }
}
document.addEventListener('DOMContentLoaded', function() {
  const bloodDonor = document.getElementById('bloodDonor');
  const organDonor = document.getElementById('organDonor');
  const bloodGroup = document.getElementById('bloodGroup');
  const organType = document.getElementById('organType');

  function updateDonationType() {
    if (bloodDonor.checked) {
      bloodGroup.style.display = 'block';
      organType.style.display = 'none';
    } else {
      bloodGroup.style.display = 'none';
      organType.style.display = 'block';
    }
  }

  bloodDonor.addEventListener('change', updateDonationType);
  organDonor.addEventListener('change', updateDonationType);
  
  // Initialize
  updateDonationType();
});// Certificate Generation Functions
function generateCertificate(donor) {
  const modal = document.getElementById('certificateModal');
  const donorName = document.getElementById('donorName');
  const donationType = document.getElementById('donationTypeText');
  const donationDetail = document.getElementById('donationDetail');
  const certDate = document.getElementById('certDate');
  
  // Set certificate details
  donorName.textContent = donor.name;
  const isBloodDonation = donor.type === 'blood';
  donationType.textContent = isBloodDonation ? 'blood' : 'organ';
  donationDetail.textContent = isBloodDonation ? `blood (${donor.bloodGroup})` : donor.organ;
  
  // Set current date
  const today = new Date();
  certDate.textContent = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Show modal
  modal.classList.remove('hidden');
}

function closeCertificateModal() {
  document.getElementById('certificateModal').classList.add('hidden');
}

function downloadCertificate() {
  const element = document.getElementById('certificateContent');
  const opt = {
    margin: 10,
    filename: 'Donation_Certificate.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  // Use html2pdf library
  html2pdf().from(element).set(opt).save();
}

function printCertificate() {
  const element = document.getElementById('certificateContent');
  const originalContents = document.body.innerHTML;
  
  document.body.innerHTML = element.outerHTML;
  window.print();
  document.body.innerHTML = originalContents;
  location.reload();
}

// Add click handler for the Generate Certificate button
document.addEventListener('DOMContentLoaded', function() {
  const generateBtn = document.getElementById('generateCertBtn');
  if (generateBtn) {
    generateBtn.addEventListener('click', function() {
      // Check if user is logged in or has donor data
      const loggedInUser = sessionStorage.getItem('loggedInUser');
      if (loggedInUser) {
        // Get donor data - you'll need to implement this based on your data structure
        const donors = JSON.parse(localStorage.getItem('donors') || '[]');
        const donor = donors.find(d => d.username === loggedInUser);
        if (donor) {
          generateCertificate(donor);
        } else {
          alert('No donor information found. Please complete your profile first.');
        }
      } else {
        alert('Please login to generate a certificate.');
      }
    });
  }
});