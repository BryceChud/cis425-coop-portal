// TEMP: Mock saved profile data
let companyProfile = {
    name: "",
    location: "",
    website: "",
    contactName: "",
    contactEmail: "",
    contactPhone: ""
};

// Save profile to temporary object
function saveProfile() {
    companyProfile.name = document.getElementById("companyName").value;
    companyProfile.location = document.getElementById("companyLocation").value;
    companyProfile.website = document.getElementById("companyWebsite").value;
    companyProfile.contactName = document.getElementById("contactName").value;
    companyProfile.contactEmail = document.getElementById("contactEmail").value;
    companyProfile.contactPhone = document.getElementById("contactPhone").value;

    alert("Profile saved (frontend-only placeholder).");
}

function logout() {
    window.location.href = "../index.html";
}
