// Temporary storage for job postings
let jobPostings = [];

function submitJob() {
    const job = {
        title: document.getElementById("jobTitle").value,
        description: document.getElementById("jobDesc").value,
        weeks: document.getElementById("weeks").value,
        hours: document.getElementById("hoursPerWeek").value,
        location: document.getElementById("jobLocation").value,
        majors: document.getElementById("majors").value,
        requiredSkills: document.getElementById("requiredSkills").value,
        preferredSkills: document.getElementById("preferredSkills").value,
        salary: document.getElementById("salary").value,
        status: "Open",
        id: jobPostings.length + 1
    };

    jobPostings.push(job);

    alert("Job posting submitted successfully!");
}

function logout() {
    window.location.href = "../index.html";
}
