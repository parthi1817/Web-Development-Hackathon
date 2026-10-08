# 🎓 EduPulse - Enterprise Student Management System (SMS)

> **Hackathon Prototype** | Centralized educational institution platform for student profiles, attendance compliance tracking, course records, and real-time GPA calculations.

---

## 🏛️ Architecture Overview (3-Tier Design)

The system adheres to a strict, decoupled 3-tier architecture:

```
┌────────────────────────────────────────────────────────┐
│  Tier 1: Frontend Presentation (React 19 + Vite)      │
│  - React Router v7 Navigation                          │
│  - Pure Vanilla CSS (Glassmorphic dark-mode, tokens)    │
│  - Centralized API service layer (client/src/api.js)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON REST Requests (/api/...)
                            ▼
┌────────────────────────────────────────────────────────┐
│  Tier 2: Application / API Server (Node.js + Express)  │
│  - Business Logic & Request Validation                 │
│  - Attendance threshold & Shortage computation (75%)   │
│  - Weighted GPA Calculation & Duplicate checking       │
│  - Supabase client initialization via @supabase/js    │
│  - Resilient In-Memory Fallback (Zero crash guarantee) │
└───────────────────────────┬────────────────────────────┘
                            │ PostgREST Queries / Realtime
                            ▼
┌────────────────────────────────────────────────────────┐
│  Tier 3: Database & Persistence (Supabase PostgreSQL)  │
│  - `students`, `attendance`, `academic_records` tables │
│  - Row Level Security (RLS) configured for hackathons  │
│  - SQL Migration & Seed script (server/schema.sql)     │
└────────────────────────────────────────────────────────┘
```

---

## 🛡️ Demo Resilience (Offline Fallback Mode)

Judges hate live demos that crash due to missing API keys or slow conference WiFi!
* If `SUPABASE_URL` or `SUPABASE_KEY` are not configured or unreachable, the Node.js server **automatically activates in-memory fallback mode** (`server/data/fallbackData.js`).
* The system is preloaded with realistic student profiles, attendance records, and course grades.
* **Full CRUD works live**: You can add students, delete students, mark attendance, and calculate GPAs even without an internet connection or database setup.
* A live status pill in the navbar indicates whether you are on **Supabase Live** (🟢) or **Demo Fallback Active** (🟠).

---

## 🚀 Quick Start Guide

### 1. Install All Dependencies
From the project root:
```bash
npm run install:all
```
*(Or run `npm install` inside both `/server` and `/client` directories)*

### 2. Run Both Server & Client Concurrently
```bash
npm run dev
```
* **Frontend UI**: [http://localhost:5173](http://localhost:5173)
* **Backend REST API**: [http://localhost:5000](http://localhost:5000)
* **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🗄️ Connecting Live Supabase (Optional)

If you have a Supabase project and want to connect it live:

1. **Required Credentials**:
   * `SUPABASE_URL`: Your Project URL (e.g., `https://xyzcompany.supabase.co`) from **Supabase Dashboard -> Project Settings -> API**.
   * `SUPABASE_KEY`: Your Project API Key (`anon` public key or `service_role` key) from **Supabase Dashboard -> Project Settings -> API**.

2. **Add Credentials to Server**:
   Open [`server/.env`](file:///r:/webdev-hackathon/hackathon-starter/server/.env) and update:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your-actual-supabase-anon-key
   ```

3. **Run SQL Schema**:
   Copy the SQL contents of [`server/schema.sql`](file:///r:/webdev-hackathon/hackathon-starter/server/schema.sql) and execute them inside your **Supabase Dashboard -> SQL Editor**.

---

## 📂 Project Directory Structure

```
hackathon-sms/
├── package.json              <-- Root script to run client and server concurrently
├── README.md                 <-- Architecture & Judge Defense Guide
├── server/
│   ├── package.json          <-- express, cors, dotenv, @supabase/supabase-js
│   ├── .env                  <-- SUPABASE_URL, SUPABASE_KEY, PORT=5000
│   ├── .env.example          <-- Template configuration
│   ├── schema.sql            <-- PostgreSQL migration for Supabase tables
│   ├── supabase.js           <-- Supabase client initialized with dotenv & health probe
│   ├── server.js             <-- Express server (CRUD routes, formulas, comments)
│   └── data/
│       └── fallbackData.js   <-- Backup in-memory data store for live demo resilience
└── client/
    ├── index.html            <-- Google Fonts (Inter, Outfit), responsive viewport
    ├── package.json          <-- React 19, React Router v7, Vite
    ├── vite.config.js        <-- Vite setup with /api proxy to localhost:5000
    └── src/
        ├── main.jsx          <-- React application entry
        ├── App.jsx           <-- React Router routes (/ , /students, /attendance, /academics)
        ├── index.css         <-- Global resets, dark theme variables, typography
        ├── App.css           <-- Glassmorphism cards, badges, progress meters, tables
        ├── api.js            <-- Centralized fetch helpers to Node.js backend
        ├── components/
        │   ├── Navbar.jsx    <-- Header with active route indicators & DB status pill
        │   └── StatCard.jsx  <-- Glassmorphic KPI cards with accent glows
        └── pages/
            ├── Dashboard.jsx <-- Executive metrics, low-attendance alerts, department breakdown
            ├── Students.jsx  <-- Add student form, instant search filter, delete action
            ├── Attendance.jsx<-- One-click Present/Absent, live % formula, shortage badge
            └── AcademicRecords.jsx <-- Course transcript, live GPA simulator, grading scale
```

---

## 👨‍🏫 Judge Q&A & Code Defense Guide

During hackathon evaluations, judges often ask technical questions about code architecture, business logic modifications, and data flow. Here are the exact files and lines to reference:

---

### Question 1: *"How do you change the attendance warning threshold from 75% to 80%?"*

* **Backend Modification**:
  * **File**: [`server/server.js`](file:///r:/webdev-hackathon/hackathon-starter/server/server.js#L35)
  * **Line**: Line 35
  * **Code**:
    ```javascript
    export const ATTENDANCE_THRESHOLD = 75; // <-- Change this to 80
    ```
  * **Effect**: The server immediately applies the 80% threshold across `/api/attendance` and `/api/dashboard`. Any student with attendance below 80% is flagged with `statusLabel: "Shortage Alert"` and `isEligible: false`.

* **Frontend Modification**:
  * **File**: [`client/src/pages/Attendance.jsx`](file:///r:/webdev-hackathon/hackathon-starter/client/src/pages/Attendance.jsx#L32)
  * **Line**: Line 32
  * **Code**:
    ```javascript
    const THRESHOLD = 75; // <-- Change to 80
    ```
  * **Effect**: The progress bar and badge dynamically turn red (`Shortage Alert (<80%)`) for any student under 80%.

---

### Question 2: *"Where is the Node.js POST route, and how do you add validation to disallow duplicate Roll Numbers?"*

* **File**: [`server/server.js`](file:///r:/webdev-hackathon/hackathon-starter/server/server.js#L110-L160)
* **Lines**: Lines 110 – 160 (`app.post("/api/students", async (req, res) => ... )`)
* **How Validation Works**:
  1. **Mandatory Field Checks**: Checks that `roll_no`, `name`, `department`, and `email` are non-empty strings.
  2. **Duplicate Check Query**:
     ```javascript
     const { data: existing } = await supabase
       .from("students")
       .select("id, roll_no")
       .ilike("roll_no", cleanRollNo);

     if (existing && existing.length > 0) {
       return res.status(400).json({
         success: false,
         error: `Duplicate Entry: A student with Roll Number '${cleanRollNo}' already exists.`
       });
     }
     ```
  3. If found, returns HTTP status `400 Bad Request`, preventing database duplicates.

---

### Question 3: *"How does Node.js connect to Supabase, and where are the database queries written?"*

* **Initialization**:
  * **File**: [`server/supabase.js`](file:///r:/webdev-hackathon/hackathon-starter/server/supabase.js#L26-L45)
  * **Code**:
    ```javascript
    import { createClient } from "@supabase/supabase-js";
    import dotenv from "dotenv";
    dotenv.config();

    export const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    ```
* **Database Query Handlers**:
  * Written cleanly inside [`server/server.js`](file:///r:/webdev-hackathon/hackathon-starter/server/server.js):
    * `GET /api/students`: `supabase.from('students').select('*').order('created_at', { ascending: false })`
    * `POST /api/students`: `supabase.from('students').insert([newStudent]).select()`
    * `DELETE /api/students/:id`: `supabase.from('students').delete().eq('id', id)`
    * `POST /api/attendance/mark`: `supabase.from('attendance').insert([entry]).select()`

---

### Question 4: *"How do you add a new field (e.g., Phone Number) across React UI -> Node.js API -> Supabase DB?"*

To add a new attribute end-to-end, follow these 3 clear steps:

1. **Step 1: Database (Supabase PostgreSQL)**:
   * In [`server/schema.sql`](file:///r:/webdev-hackathon/hackathon-starter/server/schema.sql), add:
     ```sql
     ALTER TABLE students ADD COLUMN phone_number VARCHAR(20);
     ```

2. **Step 2: Backend REST API (Node.js)**:
   * In [`server/server.js`](file:///r:/webdev-hackathon/hackathon-starter/server/server.js#L112), extract the field from `req.body`:
     ```javascript
     const { roll_no, name, department, semester, email, gpa, phone_number } = req.body;
     ```
   * Include `phone_number` in the insert statement:
     ```javascript
     supabase.from("students").insert([{ ..., phone_number: phone_number?.trim() }]);
     ```

3. **Step 3: Frontend (React UI)**:
   * In [`client/src/pages/Students.jsx`](file:///r:/webdev-hackathon/hackathon-starter/client/src/pages/Students.jsx#L42), add `phone_number: ""` to the `newStudent` state object.
   * Add the JSX input field inside the enrollment form:
     ```jsx
     <div className="input-group">
       <label className="input-label">Phone Number</label>
       <input 
         type="tel" 
         name="phone_number" 
         value={newStudent.phone_number} 
         onChange={handleInputChange} 
         placeholder="+1 (555) 019-2834" 
         className="input-field" 
       />
     </div>
     ```

---

### Question 5: *"Where is the GPA calculation logic, and how would you change the grading formula?"*

* **Backend GPA Logic**:
  * **File**: [`server/server.js`](file:///r:/webdev-hackathon/hackathon-starter/server/server.js#L240-L280)
  * Grade point mapping function:
    ```javascript
    function calculateGradePoint(marks) {
      if (marks >= 90) return { grade: "A+", points: 4.0 };
      if (marks >= 80) return { grade: "A", points: 3.5 };
      if (marks >= 70) return { grade: "B", points: 3.0 };
      if (marks >= 60) return { grade: "C", points: 2.0 };
      if (marks >= 50) return { grade: "D", points: 1.0 };
      return { grade: "F", points: 0.0 };
    }
    ```
  * **Weighted Cumulative GPA Formula**:
    $$\text{GPA} = \frac{\sum (\text{Grade Points} \times \text{Course Credits})}{\sum \text{Course Credits}}$$

* **Frontend Real-time Simulator**:
  * **File**: [`client/src/pages/AcademicRecords.jsx`](file:///r:/webdev-hackathon/hackathon-starter/client/src/pages/AcademicRecords.jsx#L28-L75)
  * The interactive simulator allows judges to drag mark sliders for **Data Structures, OS, Algorithms, and DBMS** to watch the GPA recalculate live in real-time!
  * To change the formula (e.g., switching to a 10.0 scale or changing the cutoff for A+ from 90 to 85), update the conditional thresholds in `getGradeAndPoints()` inside `AcademicRecords.jsx`.
