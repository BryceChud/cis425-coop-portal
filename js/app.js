document.getElementById("loginBtn").addEventListener("click", () => {
    const role = document.querySelector("input[name='role']:checked");

    if (!role) {
        alert("Please select a role.");
        return;
    }

    if (role.value === "student") {
        window.location.href = "student/dashboard.html";
    } 
    else if (role.value === "employer") {
        window.location.href = "employer/dashboard.html";
    } 
    else {
        window.location.href = "faculty/dashboard.html";
    }
});
