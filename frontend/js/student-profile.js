// TEMP placeholder for saved profile
let studentProfile = {
    name: "",
    email: "",
    phone: "",
    dept: "",
    major: "",
    credits: 0,
    gpa: 0,
    startSem: "",
    transfer: "",
    resume: null
};

function saveStudentProfile() {
    studentProfile.name = document.getElementById("studentName").value;
    studentProfile.email = document.getElementById("studentEmail").value;
    studentProfile.phone = document.getElementById("studentPhone").value;
    studentProfile.dept = document.getElementById("studentDept").value;
    studentProfile.major = document.getElementById("studentMajor").value;
    studentProfile.credits = document.getElementById("credits").value;
    studentProfile.gpa = document.getElementById("gpa").value;
    studentProfile.startSem = document.getElementById("startSem").value;
    studentProfile.transfer = document.getElementById("transfer").value;
    studentProfile.resume = document.getElementById("resume").files[0];

    alert("Profile saved (frontend only).");
}

function logout() {
    window.location.href = "../index.html";
}
