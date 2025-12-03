let employerJobs = [
    { title: "Web Dev Intern", status: "Open", applicants: 8 },
    { title: "Data Analyst Intern", status: "Pending", applicants: 3 },
    { title: "Software Engineer Intern", status: "Closed", applicants: 5 }
];

window.onload = () => {
    renderJobs();
};

function renderJobs() {
    const body = document.getElementById("jobBody");
    body.innerHTML = "";

    employerJobs.forEach((job, index) => {
        const row = `
            <tr>
                <td>${job.title}</td>
                <td>${job.status}</td>
                <td>${job.applicants}</td>
                <td>
                    <button onclick="viewApplicants(${index})">View</button>
                    <button onclick="changeStatus(${index})">Status</button>
                    <button onclick="openUpload(${index})">Offer</button>
                </td>
            </tr>
        `;
        body.innerHTML += row;
    });
}

function viewApplicants(i) {
    alert("Viewing applicants for: " + employerJobs[i].title);
}

function changeStatus(i) {
    let job = employerJobs[i];

    if (job.status === "Open") job.status = "Pending";
    else if (job.status === "Pending") job.status = "Closed";

    renderJobs();
}

let currentJob = null;

function openUpload(i) {
    currentJob = i;
    document.getElementById("uploadModal").style.display = "block";
}

function closeModal() {
    document.getElementById("uploadModal").style.display = "none";
}

function submitOffer() {
    alert("Offer letter submitted!");
    closeModal();
}

function logout() {
    window.location.href = "../index.html";
}
