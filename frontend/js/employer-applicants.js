// TEMP: Mock applicant list
let mockApplicants = [
    { id: 101, name: "John Smith", major: "Computer Science", resume: "#" },
    { id: 102, name: "Sarah Johnson", major: "Software Engineering", resume: "#" },
    { id: 103, name: "Daniel Lee", major: "Electrical Engineering", resume: "#" }
];

window.onload = () => {
    renderApplicants();
};

function renderApplicants() {
    const body = document.getElementById("applicantBody");
    body.innerHTML = "";

    mockApplicants.forEach(applicant => {
        body.innerHTML += `
            <tr>
                <td>${applicant.name}</td>
                <td>${applicant.major}</td>
                <td><a href="${applicant.resume}" target="_blank">View Resume</a></td>
                <td><button onclick="selectStudent(${applicant.id})">Select</button></td>
            </tr>
        `;
    });
}

function selectStudent(id) {
    document.getElementById("selectedStudent").value = id;
}

function markPending() {
    let studentId = document.getElementById("selectedStudent").value;

    if (!studentId) {
        alert("Please select a student.");
        return;
    }

    alert("Position marked as PENDING for student ID: " + studentId);
}

function logout() {
    window.location.href = "../index.html";
}
