# Employee Payroll Management System (PayMatrix)

> **MERN Stack Final-Year Engineering Project**  
> A full-stack, enterprise-grade Employee Payroll and Human Resource Management System built with MongoDB, Express.js, React.js (JavaScript/JSX), and Node.js with Plain CSS design.

---

## 1. Project Overview

The **Employee Payroll Management System** automates the end-to-end payroll calculation, attendance tracking, department management, and salary disbursement lifecycle within an enterprise. Manual payroll calculation is prone to mathematical errors, compliance risks, and delayed salary slips. 

This system provides:
- **Role-Based Access Control (RBAC)** for Administrators and Employees.
- **Automated Calculation of Salary Components**: Basic Salary, House Rent Allowance (HRA), Transport Allowance, Special Allowances, Provident Fund (PF), Income Tax (TDS), and Other Deductions.
- **Attendance-Linked Verification**: Tracks working days, present days, unexcused absences, and approved leaves.
- **Salary Slip Generation & PDF Export**: Produces verifiable computer-generated payslips with print and downloadable PDF capabilities.
- **Management Reporting**: Real-time analytical breakdowns by department budgets, monthly disbursements, and attendance compliance.

---

## 2. Key Features

### Administrator Role:
- **Secure Authentication**: Bcrypt-encrypted password validation and JWT token issuance.
- **Executive Dashboard**: Real-time KPI counters (Total Staff, Departments, Payroll Disbursed, Pending Payouts, Attendance Metrics) with trend charts.
- **Employee Master Management**: Full CRUD operations (Add, View, Edit, Delete, Filter, and Search by ID/Name/Department/Designation).
- **Department Administration**: Manage company divisions and monitor staff allocations.
- **Attendance Tracking**: Record and audit monthly working schedules, present days, absences, and leaves.
- **Dynamic Payroll Generator**: Live calculation preview with configurable allowance percentages and deduction amounts. Prevents duplicate payroll generations for the same employee and pay cycle.
- **Payslip Viewer**: Instant generation of salary slips with Indian Rupee formatting and amount-in-words conversion.
- **Analytical Reports**: Department budget analysis, payroll summary, attendance compliance, and single-click CSV export.

### Employee Role (Self-Service):
- **Employee Portal**: Personalized dashboard summarizing take-home salary, punctuality rates, and quick action cards.
- **My Profile**: View official employment dossier, designation, joining date, and bank coordinates (read-only for security).
- **My Attendance**: Inspect monthly attendance logs, present days, leaves, and percentage ratings.
- **My Payroll Statements**: Historical compensation records, gross earnings, itemized deductions, and printable/downloadable PDF payslips.

---

## 3. Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19 (JavaScript / JSX) | Single Page Application (SPA) architecture |
| **Routing** | React Router v7 | Client-side routing with role-guarded routes |
| **HTTP Client** | Axios | REST API communication with Bearer token interceptor |
| **Styling** | Plain CSS3 | Modern CSS custom properties, responsive flex/grid layouts |
| **PDF & Print** | jsPDF + html2canvas | Client-side vector PDF generation and print stylesheets |
| **Backend** | Node.js + Express.js | Modular RESTful API server with custom middleware |
| **Authentication** | JWT (jsonwebtoken) + bcryptjs | Stateless session management with 10-round salt hashing |
| **Database** | MongoDB & Mongoose | Document modeling with schema validation (with hybrid memory persistence fallback) |

---

## 4. System Architecture

```
                  +----------------------------------------------+
                  |         Client Layer (React.js SPA)          |
                  |   - JavaScript / JSX Components              |
                  |   - Plain CSS3 (Responsive Design)           |
                  |   - React Router + AuthContext               |
                  +----------------------------------------------+
                                         |
                                  HTTPS / REST API
                            (Bearer JWT in Header)
                                         v
                  +----------------------------------------------+
                  |         Node.js / Express.js Server          |
                  |   - Auth Middleware (verify JWT & Role)      |
                  |   - Error Handler Middleware                 |
                  |   - Controllers & Business Logic             |
                  +----------------------------------------------+
                                         |
                               Mongoose ODM Queries
                                         v
                  +----------------------------------------------+
                  |           MongoDB / Database Engine          |
                  |   - Users Collection                         |
                  |   - Employees Collection                     |
                  |   - Departments Collection                   |
                  |   - Attendances Collection                   |
                  |   - Payrolls Collection                      |
                  +----------------------------------------------+
```

---

## 5. Mathematical Salary Calculation Model

According to standard corporate payroll formulas:

### Allowances & Gross Salary:
$$\text{HRA} = \frac{\text{Basic Salary} \times \text{HRA}\%}{100} \quad (\text{Default: } 20\%)$$
$$\text{Transport Allowance} = \text{Fixed Monthly Amount} \quad (\text{Default: ₹}2,000)$$
$$\text{Gross Salary} = \text{Basic Salary} + \text{HRA} + \text{Transport Allowance} + \text{Other Allowance}$$

### Deductions & Net Salary:
$$\text{PF Deduction} = \frac{\text{Basic Salary} \times \text{PF}\%}{100} \quad (\text{Default: } 10\%)$$
$$\text{Tax (TDS)} = \frac{\text{Gross Salary} \times \text{Tax}\%}{100} \quad (\text{Default: } 5\%)$$
$$\text{Total Deductions} = \text{PF} + \text{Tax} + \text{Other Deductions}$$
$$\text{Net Salary} = \text{Gross Salary} - \text{Total Deductions}$$

### Worked Example:
- **Basic Salary**: ₹30,000
- **HRA (20%)**: ₹6,000
- **Transport Allowance**: ₹2,000
- **Other Allowance**: ₹1,000
- **Gross Salary**: $30,000 + 6,000 + 2,000 + 1,000 = \text{₹}39,000$
- **PF (10%)**: ₹3,000
- **Tax (5% of Gross)**: ₹1,500
- **Other Deduction**: ₹500
- **Total Deduction**: $3,000 + 1,500 + 500 = \text{₹}5,000$
- **Net Take-Home**: $39,000 - 5,000 = \mathbf{\text{₹}34,000}$

---

## 6. Database Schema Design (Mongoose Models)

### 1. `User` Schema
- `username`: String (Required, trimmed)
- `email`: String (Required, unique, lowercase)
- `password`: String (Required, bcrypt hashed)
- `role`: String (Enum: `['admin', 'employee']`, Default: `'employee'`)
- `employeeId`: String (Nullable reference to Employee ID)

### 2. `Employee` Schema
- `employeeId`: String (Unique, uppercase, e.g., `EMP001`)
- `name`: String (Required)
- `email`: String (Unique, lowercase)
- `phone`: String
- `address`: String
- `gender`: String (Enum: `['Male', 'Female', 'Other']`)
- `dateOfBirth`: Date
- `dateOfJoining`: Date
- `department`: String (Ref Department name)
- `designation`: String
- `employmentType`: String (Enum: `['Full-time', 'Part-time', 'Contract', 'Intern']`)
- `basicSalary`: Number (Min: 0)
- `bankAccountNumber`: String
- `profileImage`: String (URL)
- `status`: String (Enum: `['Active', 'Inactive']`, Default: `'Active'`)

### 3. `Department` Schema
- `departmentName`: String (Unique, Required)
- `description`: String
- `status`: String (Enum: `['Active', 'Inactive']`)

### 4. `Attendance` Schema
- `employeeId`: String (Ref Employee)
- `month`: String (e.g., `'September'`)
- `year`: Number (e.g., `2026`)
- `workingDays`: Number (Min: 0)
- `presentDays`: Number (Min: 0)
- `absentDays`: Number (Min: 0)
- `leaveDays`: Number (Min: 0)
- *Compound unique index*: `(employeeId, month, year)`

### 5. `Payroll` Schema
- `payrollId`: String (Unique, e.g., `PAY-2026-SEP-001`)
- `employeeId`: String (Ref Employee)
- `month`: String
- `year`: Number
- `basicSalary`, `hra`, `transportAllowance`, `otherAllowance`, `grossSalary`: Number
- `pf`, `tax`, `otherDeduction`, `totalDeduction`, `netSalary`: Number
- `paymentStatus`: String (Enum: `['Pending', 'Paid']`, Default: `'Pending'`)
- `paymentDate`: Date (Nullable)
- *Compound unique index*: `(employeeId, month, year)`

---

## 7. REST API Documentation

### Authentication Endpoints
- `POST /api/auth/login`: Authenticate credentials, return JWT and user payload.
- `POST /api/auth/register`: Create user account (Admin only or initial onboarding).
- `POST /api/auth/logout`: Invalidate client session.
- `GET /api/auth/me`: Get authenticated user profile and assigned employee record.

### Employee Endpoints
- `GET /api/employees`: List employees with search, department, and status filters.
- `GET /api/employees/:id`: Get employee details by Mongo ID or Employee ID.
- `POST /api/employees`: Create new employee and auto-generate login credentials.
- `PUT /api/employees/:id`: Update employee records.
- `DELETE /api/employees/:id`: Delete employee and purge related attendance/payroll logs.

### Department Endpoints
- `GET /api/departments`: Retrieve all departments.
- `POST /api/departments`: Create department.
- `PUT /api/departments/:id`: Update department details.
- `DELETE /api/departments/:id`: Remove department.

### Attendance Endpoints
- `GET /api/attendance`: Filter attendance by employee, month, or year.
- `GET /api/attendance/:id`: Fetch single record.
- `POST /api/attendance`: Create attendance record with validation.
- `PUT /api/attendance/:id`: Update attendance figures.
- `DELETE /api/attendance/:id`: Delete attendance record.

### Payroll Endpoints
- `GET /api/payroll`: Query payroll records with filters.
- `GET /api/payroll/:id`: Get detailed payroll slip record with employee data.
- `POST /api/payroll/generate`: Compute and persist payroll (prevents duplicate generation).
- `PUT /api/payroll/:id`: Toggle payment status or adjust components.
- `DELETE /api/payroll/:id`: Remove payroll record.

### Reporting Endpoints
- `GET /api/reports/summary`: Dashboard counters and financial statistics.
- `GET /api/reports/payroll`: Monthly payroll breakdown report.
- `GET /api/reports/department`: Department salary allocations and headcount.
- `GET /api/reports/attendance`: Attendance compliance percentages.

---

## 8. Sample Login Credentials

| Role | Email | Password | Designation |
|---|---|---|---|
| **Administrator** | `admin@company.com` | `admin123` | Payroll & HR Admin |
| **Employee 1** | `rahul@company.com` | `password123` | Software Developer (IT) |
| **Employee 2** | `priya@company.com` | `password123` | HR Executive (HR) |
| **Employee 3** | `arjun@company.com` | `password123` | Accountant (Finance) |
| **Employee 4** | `sneha@company.com` | `password123` | Marketing Executive (Marketing) |
| **Employee 5** | `kiran@company.com` | `password123` | Sales Executive (Sales) |

*Note: The login page includes convenient 1-click test credential buttons for rapid demonstrations during college project evaluation.*

---

## 9. Local Installation & Setup Instructions

### Prerequisites:
- **Node.js**: v18.0.0 or higher
- **MongoDB**: (Optional locally) Either a local MongoDB instance running at `mongodb://localhost:27017` or MongoDB Atlas URI. *If omitted, the built-in persistent data store initializes with complete sample data automatically.*

### Steps:

1. **Clone or Download Repository**:
   ```bash
   git clone <repo-url>
   cd employee-payroll-management-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/payroll_db
   JWT_SECRET=super_secret_payroll_jwt_key_2026
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 10. Final-Year College Project Presentation Guide (Viva Preparation)

### Key Questions & Answers:
1. **Why use Plain CSS instead of Tailwind CSS?**  
   Plain CSS showcases core fundamental mastery of CSS3 flexbox, grid, CSS custom properties (variables), media queries, and print stylesheets without external framework abstractions.

2. **How does the system prevent duplicate payroll runs?**  
   The backend applies a compound uniqueness check on `(employeeId, month, year)`. If an administrator attempts to generate payroll for an employee who already has a record for that specific pay cycle, the API responds with a `400 Bad Request` and descriptive error message.

3. **How is security enforced?**  
   All passwords are encrypted using bcrypt with 10 salt rounds before storage. Every authenticated endpoint is guarded by an Express middleware that validates the JWT in the `Authorization: Bearer` header. Role authorization middleware verifies that standard employees cannot access admin mutation routes or view other employees' records.
