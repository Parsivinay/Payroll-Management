import dataStore from '../services/dataStore.js';

export const getSummaryReport = async (req, res, next) => {
  try {
    const stats = await dataStore.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getPayrollReport = async (req, res, next) => {
  try {
    const { month, year, department } = req.query;
    const payrolls = await dataStore.getPayrolls({ month, year });
    const employees = await dataStore.getEmployees();
    const empMap = new Map(employees.map((e) => [e.employeeId, e]));

    let filtered = payrolls.map((p) => {
      const doc = p.toObject ? p.toObject() : p;
      const emp = empMap.get(doc.employeeId);
      return {
        ...doc,
        employeeName: emp ? emp.name : 'Unknown',
        department: emp ? emp.department : 'General',
        designation: emp ? emp.designation : 'Staff',
      };
    });

    if (department) {
      filtered = filtered.filter((p) => p.department.toLowerCase() === department.toLowerCase());
    }

    const totalGross = filtered.reduce((acc, p) => acc + (p.grossSalary || 0), 0);
    const totalDeductions = filtered.reduce((acc, p) => acc + (p.totalDeduction || 0), 0);
    const totalNet = filtered.reduce((acc, p) => acc + (p.netSalary || 0), 0);
    const paidCount = filtered.filter((p) => p.paymentStatus === 'Paid').length;
    const pendingCount = filtered.filter((p) => p.paymentStatus === 'Pending').length;

    res.json({
      success: true,
      summary: {
        totalRecords: filtered.length,
        totalGross,
        totalDeductions,
        totalNet,
        paidCount,
        pendingCount,
      },
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartmentReport = async (req, res, next) => {
  try {
    const departments = await dataStore.getDepartments();
    const employees = await dataStore.getEmployees();
    const payrolls = await dataStore.getPayrolls();

    const report = departments.map((dept) => {
      const deptEmployees = employees.filter(
        (e) => e.department.toLowerCase() === dept.departmentName.toLowerCase()
      );
      const empIds = new Set(deptEmployees.map((e) => e.employeeId));
      const deptPayrolls = payrolls.filter((p) => empIds.has(p.employeeId));

      const totalBasic = deptEmployees.reduce((sum, e) => sum + (e.basicSalary || 0), 0);
      const totalPaid = deptPayrolls
        .filter((p) => p.paymentStatus === 'Paid')
        .reduce((sum, p) => sum + (p.netSalary || 0), 0);

      return {
        departmentName: dept.departmentName,
        employeeCount: deptEmployees.length,
        totalBasicBudget: totalBasic,
        totalSalaryDisbursed: totalPaid,
        activeCount: deptEmployees.filter((e) => e.status === 'Active').length,
      };
    });

    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const attendances = await dataStore.getAttendance({ month, year });
    const employees = await dataStore.getEmployees();
    const empMap = new Map(employees.map((e) => [e.employeeId, e]));

    const enriched = attendances.map((a) => {
      const doc = a.toObject ? a.toObject() : a;
      const emp = empMap.get(doc.employeeId);
      const attendancePercentage = doc.workingDays > 0 ? Math.round((doc.presentDays / doc.workingDays) * 100) : 0;
      return {
        ...doc,
        employeeName: emp ? emp.name : 'Unknown',
        department: emp ? emp.department : 'General',
        attendancePercentage,
      };
    });

    const totalWorking = enriched.reduce((sum, a) => sum + a.workingDays, 0);
    const totalPresent = enriched.reduce((sum, a) => sum + a.presentDays, 0);
    const overallPercentage = totalWorking > 0 ? Math.round((totalPresent / totalWorking) * 100) : 100;

    res.json({
      success: true,
      summary: {
        totalRecords: enriched.length,
        totalPresentDays: totalPresent,
        averageAttendance: overallPercentage,
      },
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};
