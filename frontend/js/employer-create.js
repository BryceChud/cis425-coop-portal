function submitJob() {
    const job = {
        title: document.getElementById("jobTitle").value.trim(),
        description: document.getElementById("description").value.trim(),
        weeks: document.getElementById("weeks").value.trim(),
        hours: document.getElementById("hours").value.trim(),
        location: document.getElementById("location").value.trim(),
        majors: document.getElementById("majors").value.trim(),
        requiredSkills: document.getElementById("requiredSkills").value.trim(),
        preferredSkills: document.getElementById("preferredSkills").value.trim(),
        salary: document.getElementById("salary").value.trim(),
        status: "Open"  // hidden default
    };

    // BASIC VALIDATION
    if (!job.title || !job.description || !job.weeks || !job.hours || !job.location) {
        alert("Please fill out all required fields.");
        return;
    }

    // For demo: Show job in console
    console.log("Job submitted:", job);

    alert("Job posting has been submitted!");

    // Redirect back to employer dashboard
    window.location.href = "./dashboard.html";
}
