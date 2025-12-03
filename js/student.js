window.onload = () => {
    renderTable(internships);
};

function renderTable(list) {
    const body = document.getElementById("resultsBody");
    body.innerHTML = "";

    list.forEach(job => {
        const row = `
            <tr>
                <td>${job.title}</td>
                <td>${job.employer}</td>
                <td>${job.location}</td>
                <td>${job.major}</td>
                <td><button onclick="apply()">Apply</button></td>
            </tr>
        `;
        body.innerHTML += row;
    });
}

function apply() {
    alert("Application Submitted!");
}

function logout() {
    window.location.href = "../index.html";
}
