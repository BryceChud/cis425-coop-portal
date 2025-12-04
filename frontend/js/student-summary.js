// TEMP variable for co-op summary
let coopSummary = "";

function submitSummary() {
    coopSummary = document.getElementById("summaryText").value;

    if (coopSummary.trim() === "") {
        alert("Please enter a summary before submitting.");
        return;
    }

    alert("Summary submitted! (frontend-only placeholder)");
}

function logout() {
    window.location.href = "../index.html";
}
