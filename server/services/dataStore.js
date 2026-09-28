import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import { calculateSalaryComponents } from '../utils/salaryCalculator.js';

// Initial pre-configured seed records
const INITIAL_DEPARTMENTS = [
  { departmentName: 'IT', description: 'Information Technology and Software Development', status: 'Active' },
  { departmentName: 'HR', description: 'Human Resources and Talent Acquisition', status: 'Active' },
  { departmentName: 'Finance', description: 'Financial Planning, Accounting and Audits', status: 'Active' },
  { departmentName: 'Marketing', description: 'Brand Strategy, SEO, and Campaigns', status: 'Active' },
  { departmentName: 'Sales', description: 'Revenue Generation and Client Relations', status: 'Active' },
  { departmentName: 'Operations', description: 'Logistics, Facilities and Daily Execution', status: 'Active' },
];

const INITIAL_EMPLOYEES = [
  {
    employeeId: 'EMP001',
    name: 'Rahul Kumar',
    email: 'rahul@company.com',
    phone: '+91 98765 43210',
    address: '42 Cyber City, Tech Hub, Bengaluru, Karnataka - 560100',
    gender: 'Male',
    dateOfBirth: '1995-04-12',
    dateOfJoining: '2022-03-15',
    department: 'IT',
    designation: 'Software Developer',
    employmentType: 'Full-time',
    basicSalary: 55000,
    bankAccountNumber: '918237461928',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
  },
  {
    employeeId: 'EMP002',
    name: 'Priya Sharma',
    email: 'priya@company.com',
    phone: '+91 98765 43211',
    address: '15 Lotus Towers, Indiranagar, Bengaluru, Karnataka - 560038',
    gender: 'Female',
    dateOfBirth: '1996-08-23',
    dateOfJoining: '2022-07-01',
    department: 'HR',
    designation: 'HR Executive',
    employmentType: 'Full-time',
    basicSalary: 42000,
    bankAccountNumber: '492817293847',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
  },
  {
    employeeId: 'EMP003',
    name: 'Arjun Reddy',
    email: 'arjun@company.com',
    phone: '+91 98765 43212',
    address: '77 Jubilee Hills, Hyderabad, Telangana - 500033',
    gender: 'Male',
    dateOfBirth: '1993-11-05',
    dateOfJoining: '2021-01-10',
    department: 'Finance',
    designation: 'Accountant',
    employmentType: 'Full-time',
    basicSalary: 48000,
    bankAccountNumber: '617283940192',
    profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
  },
  {
    employeeId: 'EMP004',
    name: 'Sneha Rao',
    email: 'sneha@company.com',
    phone: '+91 98765 43213',
    address: '29 Marine Drive, Mumbai, Maharashtra - 400020',
    gender: 'Female',
    dateOfBirth: '1997-02-18',
    dateOfJoining: '2023-02-01',
    department: 'Marketing',
    designation: 'Marketing Executive',
    employmentType: 'Full-time',
    basicSalary: 38000,
    bankAccountNumber: '382910482910',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
  },
  {
    employeeId: 'EMP005',
    name: 'Kiran Kumar',
    email: 'kiran@company.com',
    phone: '+91 98765 43214',
    address: '88 MG Road, Pune, Maharashtra - 411001',
    gender: 'Male',
    dateOfBirth: '1994-09-30',
    dateOfJoining: '2022-10-15',
    department: 'Sales',
    designation: 'Sales Executive',
    employmentType: 'Full-time',
    basicSalary: 40000,
    bankAccountNumber: '592810394827',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'Active',
  },
];

// In-Memory Storage container for instantaneous execution and tests
class DataStore {
  constructor() {
    this.users = [];
    this.employees = [];
    this.departments = [];
    this.attendances = [];
    this.payrolls = [];
    this.initialized = false;
  }

  isMongoActive() {
    return mongoose.connection && mongoose.connection.readyState === 1;
  }

  async init() {
    if (this.initialized) return;

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const employeeHash = await bcrypt.hash('password123', salt);

    // Seed Departments
    this.departments = INITIAL_DEPARTMENTS.map((d, i) => ({
      _id: `dept_${i + 1}`,
      ...d,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Seed Employees
    this.employees = INITIAL_EMPLOYEES.map((e, i) => ({
      _id: `emp_doc_${i + 1}`,
      ...e,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Seed Users
    this.users = [
      {
        _id: 'usr_admin',
        username: 'Admin',
        email: 'admin@company.com',
        password: adminHash,
        role: 'admin',
        employeeId: null,
        createdAt: new Date().toISOString(),
      },
      ...this.employees.map((e, i) => ({
        _id: `usr_emp_${i + 1}`,
        username: e.name,
        email: e.email,
        password: employeeHash,
        role: 'employee',
        employeeId: e.employeeId,
        createdAt: new Date().toISOString(),
      })),
    ];

    // Seed Attendance for September 2026 and August 2026
    const months = [
      { month: 'August', year: 2026, workingDays: 22 },
      { month: 'September', year: 2026, workingDays: 24 },
    ];

    let attId = 1;
    for (const m of months) {
      for (let i = 0; i < this.employees.length; i++) {
        const emp = this.employees[i];
        const presentDays = m.workingDays - (i % 2) - (i === 4 ? 2 : 0);
        const absentDays = i % 2;
        const leaveDays = i === 4 ? 2 : 0;
        this.attendances.push({
          _id: `att_${attId++}`,
          employeeId: emp.employeeId,
          month: m.month,
          year: m.year,
          workingDays: m.workingDays,
          presentDays,
          absentDays,
          leaveDays,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Seed Payroll for August 2026 (Paid) and September 2026 (Mix of Paid and Pending)
    let payId = 1;
    for (const m of months) {
      for (let i = 0; i < this.employees.length; i++) {
        const emp = this.employees[i];
        const calc = calculateSalaryComponents({
          basicSalary: emp.basicSalary,
          hraPercent: 20,
          transportAllowance: 2000,
          otherAllowance: 1500,
          pfPercent: 10,
          taxPercent: 5,
          otherDeduction: 500,
        });

        const isPaid = m.month === 'August' || i < 3;
        const paymentDate = isPaid ? (m.month === 'August' ? '2026-08-31' : '2026-09-28') : null;

        this.payrolls.push({
          _id: `pay_doc_${payId}`,
          payrollId: `PAY-${m.year}-${m.month.slice(0, 3).toUpperCase()}-${String(payId).padStart(3, '0')}`,
          employeeId: emp.employeeId,
          month: m.month,
          year: m.year,
          ...calc,
          paymentStatus: isPaid ? 'Paid' : 'Pending',
          paymentDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        payId++;
      }
    }

    // If MongoDB is connected, also seed MongoDB collections if empty
    if (this.isMongoActive()) {
      try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('Seeding initial data into MongoDB...');
          await Department.insertMany(INITIAL_DEPARTMENTS);
          await Employee.insertMany(INITIAL_EMPLOYEES);
          // Pass pre-hashed or let pre-save hook work
          for (const u of this.users) {
            const newUser = new User({
              username: u.username,
              email: u.email,
              password: 'password123', // hooks will hash it
              role: u.role,
              employeeId: u.employeeId,
            });
            if (u.role === 'admin') newUser.password = 'admin123';
            await newUser.save();
          }
          await Attendance.insertMany(this.attendances.map(({ _id, ...rest }) => rest));
          await Payroll.insertMany(this.payrolls.map(({ _id, ...rest }) => rest));
          console.log('✅ MongoDB Seeded successfully.');
        }
      } catch (err) {
        console.error('Error seeding MongoDB:', err.message);
      }
    }

    this.initialized = true;
    console.log('🚀 Data store initialized with sample data (5 employees, 6 departments, attendance & payroll records).');
  }

  // USER OPERATIONS
  async findUserByEmail(email) {
    if (this.isMongoActive()) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id) {
    if (this.isMongoActive()) {
      return await User.findById(id).select('-password');
    }
    const u = this.users.find((u) => u._id === id);
    if (!u) return null;
    const { password, ...rest } = u;
    return rest;
  }

  async createUser({ username, email, password, role = 'employee', employeeId = null }) {
    if (this.isMongoActive()) {
      const user = new User({ username, email, password, role, employeeId });
      await user.save();
      const ret = user.toObject();
      delete ret.password;
      return ret;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      employeeId,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    const { password: _, ...clean } = newUser;
    return clean;
  }

  // EMPLOYEE OPERATIONS
  async getEmployees(search = '', department = '', status = '') {
    if (this.isMongoActive()) {
      const query = {};
      if (department) query.department = department;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { employeeId: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { designation: { $regex: search, $options: 'i' } },
        ];
      }
      return await Employee.find(query).sort({ employeeId: 1 });
    }

    let list = [...this.employees];
    if (department) {
      list = list.filter((e) => e.department.toLowerCase() === department.toLowerCase());
    }
    if (status) {
      list = list.filter((e) => e.status.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.employeeId.toLowerCase().includes(s) ||
          e.name.toLowerCase().includes(s) ||
          e.email.toLowerCase().includes(s) ||
          e.designation.toLowerCase().includes(s) ||
          e.department.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  }

  async getEmployeeByIdOrEmpId(idOrEmpId) {
    if (this.isMongoActive()) {
      if (mongoose.Types.ObjectId.isValid(idOrEmpId)) {
        const emp = await Employee.findById(idOrEmpId);
        if (emp) return emp;
      }
      return await Employee.findOne({ employeeId: idOrEmpId.toUpperCase() });
    }
    return (
      this.employees.find(
        (e) => e._id === idOrEmpId || e.employeeId.toUpperCase() === idOrEmpId.toUpperCase()
      ) || null
    );
  }

  async createEmployee(data) {
    if (this.isMongoActive()) {
      const emp = new Employee(data);
      return await emp.save();
    }
    const newEmp = {
      _id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      ...data,
      employeeId: data.employeeId.toUpperCase(),
      basicSalary: Number(data.basicSalary) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.employees.push(newEmp);

    // Also auto-create employee login user if not existing
    const existingUser = this.users.find((u) => u.email.toLowerCase() === newEmp.email.toLowerCase());
    if (!existingUser) {
      await this.createUser({
        username: newEmp.name,
        email: newEmp.email,
        password: 'password123',
        role: 'employee',
        employeeId: newEmp.employeeId,
      });
    }

    return newEmp;
  }

  async updateEmployee(idOrEmpId, data) {
    if (this.isMongoActive()) {
      let emp;
      if (mongoose.Types.ObjectId.isValid(idOrEmpId)) {
        emp = await Employee.findByIdAndUpdate(idOrEmpId, data, { new: true, runValidators: true });
      } else {
        emp = await Employee.findOneAndUpdate({ employeeId: idOrEmpId.toUpperCase() }, data, {
          new: true,
          runValidators: true,
        });
      }
      return emp;
    }

    const index = this.employees.findIndex(
      (e) => e._id === idOrEmpId || e.employeeId.toUpperCase() === idOrEmpId.toUpperCase()
    );
    if (index === -1) return null;

    this.employees[index] = {
      ...this.employees[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.employees[index];
  }

  async deleteEmployee(idOrEmpId) {
    if (this.isMongoActive()) {
      let emp;
      if (mongoose.Types.ObjectId.isValid(idOrEmpId)) {
        emp = await Employee.findByIdAndDelete(idOrEmpId);
      } else {
        emp = await Employee.findOneAndDelete({ employeeId: idOrEmpId.toUpperCase() });
      }
      return emp;
    }

    const index = this.employees.findIndex(
      (e) => e._id === idOrEmpId || e.employeeId.toUpperCase() === idOrEmpId.toUpperCase()
    );
    if (index === -1) return null;

    const removed = this.employees.splice(index, 1)[0];
    // Remove related records as well
    this.attendances = this.attendances.filter((a) => a.employeeId !== removed.employeeId);
    this.payrolls = this.payrolls.filter((p) => p.employeeId !== removed.employeeId);
    this.users = this.users.filter((u) => u.employeeId !== removed.employeeId);

    return removed;
  }

  // DEPARTMENT OPERATIONS
  async getDepartments() {
    if (this.isMongoActive()) {
      return await Department.find().sort({ departmentName: 1 });
    }
    return [...this.departments].sort((a, b) => a.departmentName.localeCompare(b.departmentName));
  }

  async createDepartment(data) {
    if (this.isMongoActive()) {
      const dept = new Department(data);
      return await dept.save();
    }
    const newDept = {
      _id: `dept_${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.departments.push(newDept);
    return newDept;
  }

  async updateDepartment(id, data) {
    if (this.isMongoActive()) {
      return await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    const idx = this.departments.findIndex((d) => d._id === id);
    if (idx === -1) return null;
    this.departments[idx] = {
      ...this.departments[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.departments[idx];
  }

  async deleteDepartment(id) {
    if (this.isMongoActive()) {
      return await Department.findByIdAndDelete(id);
    }
    const idx = this.departments.findIndex((d) => d._id === id);
    if (idx === -1) return null;
    return this.departments.splice(idx, 1)[0];
  }

  // ATTENDANCE OPERATIONS
  async getAttendance(filter = {}) {
    if (this.isMongoActive()) {
      const query = {};
      if (filter.employeeId) query.employeeId = filter.employeeId.toUpperCase();
      if (filter.month) query.month = filter.month;
      if (filter.year) query.year = Number(filter.year);
      return await Attendance.find(query).sort({ year: -1, month: -1 });
    }

    let list = [...this.attendances];
    if (filter.employeeId) {
      list = list.filter((a) => a.employeeId.toUpperCase() === filter.employeeId.toUpperCase());
    }
    if (filter.month) {
      list = list.filter((a) => a.month.toLowerCase() === filter.month.toLowerCase());
    }
    if (filter.year) {
      list = list.filter((a) => Number(a.year) === Number(filter.year));
    }
    return list;
  }

  async getAttendanceById(id) {
    if (this.isMongoActive()) {
      return await Attendance.findById(id);
    }
    return this.attendances.find((a) => a._id === id) || null;
  }

  async createAttendance(data) {
    if (this.isMongoActive()) {
      const existing = await Attendance.findOne({
        employeeId: data.employeeId.toUpperCase(),
        month: data.month,
        year: Number(data.year),
      });
      if (existing) {
        throw new Error(`Attendance for ${data.employeeId} for ${data.month} ${data.year} already exists.`);
      }
      const att = new Attendance({
        ...data,
        employeeId: data.employeeId.toUpperCase(),
        year: Number(data.year),
        workingDays: Number(data.workingDays),
        presentDays: Number(data.presentDays),
        absentDays: Number(data.absentDays || 0),
        leaveDays: Number(data.leaveDays || 0),
      });
      return await att.save();
    }

    const exists = this.attendances.find(
      (a) =>
        a.employeeId.toUpperCase() === data.employeeId.toUpperCase() &&
        a.month.toLowerCase() === data.month.toLowerCase() &&
        Number(a.year) === Number(data.year)
    );
    if (exists) {
      throw new Error(`Attendance for ${data.employeeId} for ${data.month} ${data.year} already exists.`);
    }

    const newAtt = {
      _id: `att_${Date.now()}`,
      employeeId: data.employeeId.toUpperCase(),
      month: data.month,
      year: Number(data.year),
      workingDays: Number(data.workingDays),
      presentDays: Number(data.presentDays),
      absentDays: Number(data.absentDays || 0),
      leaveDays: Number(data.leaveDays || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.attendances.push(newAtt);
    return newAtt;
  }

  async updateAttendance(id, data) {
    if (this.isMongoActive()) {
      return await Attendance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    const idx = this.attendances.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    this.attendances[idx] = {
      ...this.attendances[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.attendances[idx];
  }

  async deleteAttendance(id) {
    if (this.isMongoActive()) {
      return await Attendance.findByIdAndDelete(id);
    }
    const idx = this.attendances.findIndex((a) => a._id === id);
    if (idx === -1) return null;
    return this.attendances.splice(idx, 1)[0];
  }

  // PAYROLL OPERATIONS
  async getPayrolls(filter = {}) {
    if (this.isMongoActive()) {
      const query = {};
      if (filter.employeeId) query.employeeId = filter.employeeId.toUpperCase();
      if (filter.month) query.month = filter.month;
      if (filter.year) query.year = Number(filter.year);
      if (filter.paymentStatus) query.paymentStatus = filter.paymentStatus;
      return await Payroll.find(query).sort({ year: -1, month: -1, createdAt: -1 });
    }

    let list = [...this.payrolls];
    if (filter.employeeId) {
      list = list.filter((p) => p.employeeId.toUpperCase() === filter.employeeId.toUpperCase());
    }
    if (filter.month) {
      list = list.filter((p) => p.month.toLowerCase() === filter.month.toLowerCase());
    }
    if (filter.year) {
      list = list.filter((p) => Number(p.year) === Number(filter.year));
    }
    if (filter.paymentStatus) {
      list = list.filter((p) => p.paymentStatus.toLowerCase() === filter.paymentStatus.toLowerCase());
    }
    return list;
  }

  async getPayrollById(id) {
    if (this.isMongoActive()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const p = await Payroll.findById(id);
        if (p) return p;
      }
      return await Payroll.findOne({ payrollId: id });
    }
    return this.payrolls.find((p) => p._id === id || p.payrollId === id) || null;
  }

  async generatePayroll(data) {
    const {
      employeeId,
      month,
      year,
      basicSalary,
      hraPercent,
      hra,
      transportAllowance,
      otherAllowance,
      pfPercent,
      pf,
      taxPercent,
      tax,
      otherDeduction,
      paymentStatus = 'Pending',
      paymentDate = null,
    } = data;

    // Verify employee exists
    const emp = await this.getEmployeeByIdOrEmpId(employeeId);
    if (!emp) {
      throw new Error(`Employee with ID ${employeeId} does not exist.`);
    }

    // Check duplicate
    if (this.isMongoActive()) {
      const existing = await Payroll.findOne({
        employeeId: employeeId.toUpperCase(),
        month,
        year: Number(year),
      });
      if (existing) {
        throw new Error(`Payroll for ${emp.name} (${employeeId}) for ${month} ${year} has already been generated!`);
      }
    } else {
      const existing = this.payrolls.find(
        (p) =>
          p.employeeId.toUpperCase() === employeeId.toUpperCase() &&
          p.month.toLowerCase() === month.toLowerCase() &&
          Number(p.year) === Number(year)
      );
      if (existing) {
        throw new Error(`Payroll for ${emp.name} (${employeeId}) for ${month} ${year} has already been generated!`);
      }
    }

    const calc = calculateSalaryComponents({
      basicSalary: basicSalary !== undefined ? basicSalary : emp.basicSalary,
      hraPercent,
      hra,
      transportAllowance: transportAllowance !== undefined ? transportAllowance : 2000,
      otherAllowance: otherAllowance || 0,
      pfPercent,
      pf,
      taxPercent,
      tax,
      otherDeduction: otherDeduction || 0,
    });

    const payrollId = `PAY-${year}-${month.slice(0, 3).toUpperCase()}-${String(
      Math.floor(100 + Math.random() * 900)
    )}`;

    const payrollRecord = {
      payrollId,
      employeeId: employeeId.toUpperCase(),
      month,
      year: Number(year),
      ...calc,
      paymentStatus,
      paymentDate: paymentStatus === 'Paid' ? (paymentDate || new Date().toISOString().split('T')[0]) : null,
    };

    if (this.isMongoActive()) {
      const p = new Payroll(payrollRecord);
      return await p.save();
    }

    const saved = {
      _id: `pay_${Date.now()}`,
      ...payrollRecord,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.payrolls.unshift(saved);
    return saved;
  }

  async updatePayroll(id, data) {
    if (this.isMongoActive()) {
      let p;
      if (mongoose.Types.ObjectId.isValid(id)) {
        p = await Payroll.findByIdAndUpdate(id, data, { new: true });
      } else {
        p = await Payroll.findOneAndUpdate({ payrollId: id }, data, { new: true });
      }
      return p;
    }

    const idx = this.payrolls.findIndex((p) => p._id === id || p.payrollId === id);
    if (idx === -1) return null;

    if (data.paymentStatus === 'Paid' && !this.payrolls[idx].paymentDate && !data.paymentDate) {
      data.paymentDate = new Date().toISOString().split('T')[0];
    }

    this.payrolls[idx] = {
      ...this.payrolls[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.payrolls[idx];
  }

  async deletePayroll(id) {
    if (this.isMongoActive()) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        return await Payroll.findByIdAndDelete(id);
      }
      return await Payroll.findOneAndDelete({ payrollId: id });
    }
    const idx = this.payrolls.findIndex((p) => p._id === id || p.payrollId === id);
    if (idx === -1) return null;
    return this.payrolls.splice(idx, 1)[0];
  }

  // AGGREGATION & REPORTING
  async getDashboardStats() {
    const employees = await this.getEmployees();
    const departments = await this.getDepartments();
    const payrolls = await this.getPayrolls();
    const currentMonth = 'September';
    const currentYear = 2026;
    const attendances = await this.getAttendance({ month: currentMonth, year: currentYear });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'Active').length;
    const totalDepartments = departments.length;
    const totalPayrollGenerated = payrolls.length;

    const totalSalaryPaid = payrolls
      .filter((p) => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const pendingPayroll = payrolls.filter((p) => p.paymentStatus === 'Pending').length;
    const pendingAmount = payrolls
      .filter((p) => p.paymentStatus === 'Pending')
      .reduce((sum, p) => sum + (p.netSalary || 0), 0);

    const presentEmployees = attendances.reduce((sum, a) => sum + (a.presentDays > 0 ? 1 : 0), 0);
    const absentEmployees = attendances.reduce((sum, a) => sum + (a.absentDays > 0 ? 1 : 0), 0);

    return {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      totalPayrollGenerated,
      totalSalaryPaid,
      pendingPayroll,
      pendingAmount,
      presentEmployees: presentEmployees || totalEmployees,
      absentEmployees,
    };
  }
}

const dataStore = new DataStore();
export default dataStore;
