const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;

// Needed so POST /api/applications can read JSON body
app.use(express.json());

// Serve frontend
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

// Fetch employer
app.get("/api/employers/:id", (req, res) => {
  const employerId = Number(req.params.id);
  if (!employerId) {
    return res.status(400).send("Invalid employer ID");
  }

  try {
    const stmt = db.prepare(`
      SELECT EmployerID, CompanyName, Location, Website,
             ContactFirst, ContactLast, Email, Phone
      FROM EMPLOYER
      WHERE EmployerID = ?
    `);

    const row = stmt.get(employerId);

    if (!row) {
      return res.status(404).send("Employer not found");
    }

    res.json({
      employerId: row.EmployerID,
      companyName: row.CompanyName,
      location: row.Location,
      website: row.Website,
      contactFirst: row.ContactFirst,
      contactLast: row.ContactLast,
      email: row.Email,
      phone: row.Phone
    });
  } catch (err) {
    console.error("Error in GET /api/employers/:id", err);
    res.status(500).send("Server error");
  }
});

// Update employer
app.put("/api/employers/:id", (req, res) => {
  const employerId = Number(req.params.id);
  if (!employerId) {
    return res.status(400).send("Invalid employer ID");
  }

  const {
    companyName,
    location,
    website,
    contactFirst,
    contactLast,
    email,
    phone
  } = req.body;

  if (!companyName) {
    return res.status(400).send("CompanyName is required");
  }

  try {
    const stmt = db.prepare(`
      UPDATE EMPLOYER
      SET CompanyName  = ?,
          Location     = ?,
          Website      = ?,
          ContactFirst = ?,
          ContactLast  = ?,
          Email        = ?,
          Phone        = ?
      WHERE EmployerID = ?
    `);

    const info = stmt.run(
      companyName,
      location || null,
      website || null,
      contactFirst || null,
      contactLast || null,
      email || null,
      phone || null,
      employerId
    );

    if (info.changes === 0) {
      return res.status(404).send("Employer not found");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error in PUT /api/employers/:id", err);
    res.status(500).send("Server error");
  }
});

// Fetch list of majors
app.get("/api/majors", (req, res) => {
  try {
    const rows = db
      .prepare(
        `SELECT MajorID AS majorId,
                MajorName AS majorName
         FROM MAJORS
         ORDER BY MajorName`
      )
      .all();

    res.json(rows);
  } catch (err) {
    console.error("Error in GET /api/majors:", err);
    res.status(500).json({ error: "Database error loading majors" });
  }
});

// Create a new job
app.post("/api/jobs", (req, res) => {
  const {
    employerId,
    title,
    description,
    numWeeks,
    numHours,
    location,
    reqSkills,
    prefSkills,
    salary,
    status,
    majorIds, // array of MajorID values
  } = req.body;

  if (!employerId || !title) {
    return res
      .status(400)
      .json({ error: "employerId and title are required" });
  }

  try {
    const insertJob = db.prepare(`
      INSERT INTO JOB (
        EmployerID, Title, Description, NumWeeks, NumHours,
        Location, ReqSkills, PrefSkills, Salary, Status
      ) VALUES (
        @employerId, @title, @description, @numWeeks, @numHours,
        @location, @reqSkills, @prefSkills, @salary, @status
      )
    `);

    const insertJobMajor = db.prepare(`
      INSERT INTO JOB_MAJORS (JobID, MajorID) VALUES (?, ?)
    `);

    const createJobTx = db.transaction(() => {
      const info = insertJob.run({
        employerId,
        title,
        description: description || null,
        numWeeks: numWeeks ?? null,
        numHours: numHours ?? null,
        location: location || null,
        reqSkills: reqSkills || null,
        prefSkills: prefSkills || null,
        salary: salary ?? null,
        status: status || "open",
      });

      const jobId = info.lastInsertRowid;

      if (Array.isArray(majorIds)) {
        for (const mid of majorIds) {
          insertJobMajor.run(jobId, mid);
        }
      }

      return jobId;
    });

    const jobId = createJobTx();

    res.status(201).json({ jobId });
  } catch (err) {
    console.error("Error in POST /api/jobs:", err);
    res.status(500).json({ error: "Database error creating job" });
  }
});

// Get all jobs for a specific employer
app.get("/api/employers/:employerId/jobs", (req, res) => {
  try {
    const employerId = Number(req.params.employerId);
    if (!employerId) {
      return res.status(400).json({ error: "Invalid employerId" });
    }

    const stmt = db.prepare(`
      SELECT
        JobID      AS jobId,
        Title      AS title,
        Status     AS status,
        Location   AS location,
        Salary     AS salary
      FROM JOB
      WHERE EmployerID = ?
      ORDER BY JobID DESC
    `);

    const jobs = stmt.all(employerId);
    res.json(jobs);
  } catch (err) {
    console.error("Error in GET /api/employers/:employerId/jobs", err);
    res.status(500).json({ error: "Server error while fetching employer jobs" });
  }
});

app.get("/api/employers/:employerId/applicants", (req, res) => {
  const employerId = req.params.employerId;

  try {
    const sql = `
      SELECT
        a.ApplicationID AS applicationId,
        a.Selected      AS selected,
        j.JobID         AS jobId,
        j.Title         AS jobTitle,
        s.StudentID     AS studentId,
        s.First         AS first,
        s.Last          AS last,
        s.Email         AS email,
        s.Phone         AS phone,
        s.CreditHours   AS creditHours,
        m.MajorName     AS majorName,
        s.Resume        AS resume
      FROM APPLICATION a
      JOIN JOB j      ON a.JobID = j.JobID
      JOIN STUDENT s  ON a.StudentID = s.StudentID
      LEFT JOIN MAJORS m ON s.MajorID = m.MajorID
      WHERE j.EmployerID = ?
      ORDER BY j.Title, s.Last, s.First
    `;

    const rows = db.prepare(sql).all(employerId);
    res.json(rows);
  } catch (err) {
    console.error("Error in /api/employers/:employerId/applicants", err);
    res.status(500).send("Server error while loading applicants");
  }
});


// Mark an application as selected
app.put("/api/applications/:applicationId/select", (req, res) => {
  try {
    const applicationId = Number(req.params.applicationId);
    if (!applicationId) {
      return res.status(400).json({ error: "Invalid applicationId" });
    }

    const stmt = db.prepare(`
      UPDATE APPLICATION
      SET Selected = 1
      WHERE ApplicationID = @applicationId
    `);

    const info = stmt.run({ applicationId });

    if (info.changes === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error selecting application", err);
    res.status(500).json({ error: "Server error updating application" });
  }
});

// Get co-op students for a faculty member's department
app.get("/api/faculty/:facultyId/coop", (req, res) => {
  const facultyId = Number(req.params.facultyId);
  if (!facultyId) {
    return res.status(400).send("Invalid facultyId");
  }

  try {
    const rows = db
      .prepare(
        `
        SELECT
          c.CoopID                AS coopId,
          s.StudentID             AS studentId,
          s.First                 AS first,
          s.Last                  AS last,
          m.MajorName             AS majorName,
          c.StudentSummary        AS studentSummary,
          c.Grade                 AS grade
        FROM COOP c
        JOIN APPLICATION a ON c.ApplicationID = a.ApplicationID
        JOIN STUDENT s     ON a.StudentID     = s.StudentID
        LEFT JOIN MAJORS m ON s.MajorID       = m.MajorID
        JOIN FACULTY f     ON f.FacultyID     = :facultyId
        -- match student's department to faculty's department
        WHERE m.DepartmentID = f.DepartmentID
        ORDER BY s.Last, s.First;
      `
      )
      .all({ facultyId });

    res.json(rows);
  } catch (err) {
    console.error("Error in /api/faculty/:facultyId/coop", err);
    res.status(500).send("Database error");
  }
});

// Update grade for a co-op record
app.put("/api/coop/:coopId/grade", (req, res) => {
  const coopId = Number(req.params.coopId);
  const { grade } = req.body;

  if (!coopId) {
    return res.status(400).send("Invalid coopId");
  }

  try {
    const info = db
      .prepare(
        `
        UPDATE COOP
        SET Grade = :grade
        WHERE CoopID = :coopId;
      `
      )
      .run({ grade, coopId });

    if (info.changes === 0) {
      return res.status(404).send("Co-op record not found");
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating COOP grade", err);
    res.status(500).send("Database error");
  }
});

// GET /api/students/:studentId/coop-summary
// Returns the student's coop record (if any) and existing summary
app.get("/api/students/:studentId/coop-summary", (req, res) => {
    try {
        const studentId = Number(req.params.studentId);
        if (!studentId) {
            return res.status(400).json({ error: "Invalid studentId" });
        }

        const row = db.prepare(`
            SELECT
                c.CoopID        AS coopId,
                c.StudentSummary AS studentSummary,
                c.Grade          AS grade,
                a.ApplicationID  AS applicationId
            FROM COOP c
            JOIN APPLICATION a ON c.ApplicationID = a.ApplicationID
            WHERE a.StudentID = ?
            LIMIT 1
        `).get(studentId);

        if (!row) {
            // No co-op record for this student
            return res.status(404).json({ error: "No co-op record found for this student" });
        }

        res.json(row);
    } catch (err) {
        console.error("Error in GET /api/students/:studentId/coop-summary", err);
        res.status(500).json({ error: "Server error" });
    }
});

// PUT /api/coop/:coopId/summary
// Body: { studentSummary: "..." }
app.put("/api/coop/:coopId/summary", (req, res) => {
    try {
        const coopId = Number(req.params.coopId);
        const { studentSummary } = req.body || {};

        if (!coopId) {
            return res.status(400).json({ error: "Invalid coopId" });
        }
        if (!studentSummary || !studentSummary.trim()) {
            return res.status(400).json({ error: "studentSummary is required" });
        }

        const info = db.prepare(`
            UPDATE COOP
            SET StudentSummary = ?
            WHERE CoopID = ?
        `).run(studentSummary.trim(), coopId);

        if (info.changes === 0) {
            return res.status(404).json({ error: "Co-op record not found" });
        }

        res.json({ success: true });
    } catch (err) {
        console.error("Error in PUT /api/coop/:coopId/summary", err);
        res.status(500).json({ error: "Server error" });
    }
});




// START SERVER 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
