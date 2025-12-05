const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// Needed so POST /api/applications can read JSON body
app.use(express.json());

// Serve frontend (adjust path if needed)
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");
app.use(express.static(FRONTEND_DIR));

// Open SQLite database
const db = new Database(path.join(__dirname, "internship.db"));

app.get("/", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

// Job Search API
app.get("/api/jobs", (req, res) => {
  try {
    const { keyword, major, location } = req.query;

    let sql = `
      SELECT
        JOB.JobID           AS jobId,
        JOB.Title           AS title,
        EMPLOYER.CompanyName AS employer
      FROM JOB
      JOIN EMPLOYER ON JOB.EmployerID = EMPLOYER.EmployerID
      WHERE 1 = 1
    `;

    const params = {};

    if (keyword) {
      sql += " AND JOB.Title LIKE '%' || @keyword || '%'";
      params.keyword = keyword;
    }

    if (location) {
      sql += " AND JOB.Location = @location";
      params.location = location;
    }

    if (major) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM JOB_MAJOR JM
          JOIN MAJORS M ON JM.MajorID = M.MajorID
          WHERE JM.JobID = JOB.JobID
            AND M.MajorName = @major
        )
      `;
      params.major = major;
    }

    const stmt = db.prepare(sql);
    const rows = stmt.all(params);

    res.json(rows);
  } catch (err) {
    console.error("Error in /api/jobs:", err);
    res.status(500).json({ error: "Failed to load jobs" });
  }
});

// Student application creation
app.post("/api/applications", (req, res) => {
  try {
    const { jobId, studentId } = req.body;

    if (!jobId || !studentId) {
      return res.status(400).json({ error: "jobId and studentId are required" });
    }

    const existing = db
      .prepare(
        `SELECT ApplicationID 
         FROM APPLICATION 
         WHERE JobID = ? AND StudentID = ?`
      )
      .get(jobId, studentId);

    if (existing) {
      return res
        .status(400)
        .json({ error: "You have already applied for this job." });
    }

    // Insert the new application
    // Adapt columns to your actual schema
    const stmt = db.prepare(`
      INSERT INTO APPLICATION (JobID, StudentID, Selected)
      VALUES (?, ?, 0)
    `);

    const info = stmt.run(jobId, studentId);

    res.json({
      applicationId: info.lastInsertRowid,
      jobId,
      studentId,
      selected: 0
    });
  } catch (err) {
    console.error("Error in /api/applications:", err);
    res.status(500).json({ error: "Failed to create application" });
  }
});

// Fetch student profile
app.get("/api/students/:id", (req, res) => {
  try {
    const studentId = Number(req.params.id);
    if (!studentId) {
      return res.status(400).json({ error: "Invalid student id" });
    }

    const sql = `
      SELECT
        s.StudentID,
        s.First,
        s.Last,
        s.Email,
        s.Phone,
        s.MajorID,
        s.Resume,
        s.CreditHours,
        s.GPA,
        s.YearStarted,
        s.Transfer,
        m.MajorName,
        d.DepartmentName
      FROM STUDENT s
      LEFT JOIN MAJORS m ON s.MajorID = m.MajorID
      LEFT JOIN DEPARTMENTS d ON m.DepartmentID = d.DepartmentID
      WHERE s.StudentID = ?
    `;

    const row = db.prepare(sql).get(studentId);

    if (!row) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      studentId: row.StudentID,
      first: row.First,
      last: row.Last,
      email: row.Email,
      phone: row.Phone,
      majorId: row.MajorID,
      majorName: row.MajorName,
      departmentName: row.DepartmentName,
      resume: row.Resume,
      creditHours: row.CreditHours,
      gpa: row.GPA,
      yearStarted: row.YearStarted,
      transfer: !!row.Transfer
    });
  } catch (err) {
    console.error("Error in GET /api/students/:id", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update student profile
app.put("/api/students/:id", (req, res) => {
  try {
    const studentId = Number(req.params.id);
    if (!studentId) {
      return res.status(400).json({ error: "Invalid student id" });
    }

    const {
      first,
      last,
      email,
      phone,
      majorId,
      resume,
      creditHours,
      gpa,
      yearStarted,
      transfer
    } = req.body;

    const stmt = db.prepare(`
      UPDATE STUDENT
      SET
        First       = @first,
        Last        = @last,
        Email       = @email,
        Phone       = @phone,
        MajorID     = @majorId,
        Resume      = @resume,
        CreditHours = @creditHours,
        GPA         = @gpa,
        YearStarted = @yearStarted,
        Transfer    = @transfer
      WHERE StudentID = @studentId
    `);

    const info = stmt.run({
      first,
      last,
      email,
      phone,
      majorId,
      resume,
      creditHours,
      gpa,
      yearStarted,
      transfer: transfer ? 1 : 0,
      studentId
    });

    if (info.changes === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in PUT /api/students/:id", err);
    res.status(500).json({ error: "Server error" });
  }
});



// START SERVER 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
