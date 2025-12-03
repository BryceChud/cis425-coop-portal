let coopStudents = [
    { name: "John Smith", major: "Computer Science", summary: "Worked at Google." },
    { name: "Sarah Ahmed", major: "Software Engineering", summary: "Worked at Ford." },
    { name: "Daniel Lee", major: "Electrical Engineering", summary: "Worked at GM." }
];

window.onload = () => {
    renderStudents();
};

function renderStudents() {
    const body = document.getElementById("facultyBody");
    body.innerHTML = "";

    coopStudents.forEach((student, index) => {
        const row = `
            <tr>
                <td>${student.name}</td>
                <td>${student.major}</td>
                <td><button onclick="viewSummary('${student.summary}')">View</button></td>
                <td><input id="grade-${index}" placeholder="A" style="width:50px;"></td>
                <td><button onclick="submitGrade(${index})">Submit</button></td>
            </tr>
        `;
        body.innerHTML += row;
    });
}

function viewSummary(text) {
    alert(text);
}

function submitGrade(i) {
    let grade = document.getElementById("grade-" + i).value;
    alert("Grade submitted: " + grade);
}

function logout() {
    window.location.href = "../index.html";
}
