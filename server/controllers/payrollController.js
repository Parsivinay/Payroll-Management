import dataStore from '../services/dataStore.js';
import { calculateSalaryComponents } from '../utils/salaryCalculator.js';

export const getPayroll = async (req, res, next) => {
  try {
    const { employeeId, month, year, paymentStatus } = req.query;

    let targetEmpId = employeeId;
    if (req.user.role === 'employee') {
      targetEmpId = req.user.employeeId;
    }

    const records = await dataStore.getPayrolls({
      employeeId: targetEmpId,
      month,
      year,
      paymentStatus,
    });

    const employees = await dataStore.getEmployees();
    const empMap = new Map(employees.map((e) => [e.employeeId, e]));

    const enriched = records.map((r) => {
      const p = r.toObject ? r.toObject() : r;
      const emp = empMap.get(p.employeeId);
      return {
        ...p,
        employeeName: emp ? emp.name : 'Unknown',
        department: emp ? emp.department : 'General',
        designation: emp ? emp.designation : 'Employee',
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getPayrollById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payroll = await dataStore.getPayrollById(id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (req.user.role === 'employee' && req.user.employeeId !== payroll.employeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot view payroll of another employee.' });
    }

    const emp = await dataStore.getEmployeeByIdOrEmpId(payroll.employeeId);
    const p = payroll.toObject ? payroll.toObject() : payroll;

    const enriched = {
      ...p,
      employeeName: emp ? emp.name : 'Unknown',
      department: emp ? emp.department : 'General',
      designation: emp ? emp.designation : 'Employee',
      dateOfJoining: emp ? emp.dateOfJoining : '',
      bankAccountNumber: emp ? emp.bankAccountNumber : '',
      email: emp ? emp.email : '',
      phone: emp ? emp.phone : '',
    };

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const generatePayroll = async (req, res, next) => {
  try {
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
      paymentDate,
    } = req.body;

    if (!employeeId || !month || !year) {
      return res.status(400).json({ success: false, message: 'Employee ID, Month, and Year are required.' });
    }

    const emp = await dataStore.getEmployeeByIdOrEmpId(employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: `Employee '${employeeId}' does not exist.` });
    }

    const created = await dataStore.generatePayroll({
      employeeId,
      month,
      year,
      basicSalary: basicSalary !== undefined ? basicSalary : emp.basicSalary,
      hraPercent,
      hra,
      transportAllowance,
      otherAllowance,
      pfPercent,
      pf,
      taxPercent,
      tax,
      otherDeduction,
      paymentStatus,
      paymentDate,
    });

    const p = created.toObject ? created.toObject() : created;

    res.status(201).json({
      success: true,
      message: `Payroll generated successfully for ${emp.name} (${month} ${year})`,
      data: {
        ...p,
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
      },
    });
  } catch (error) {
    if (error.message.includes('already been generated')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const updatePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentDate, basicSalary, hra, transportAllowance, otherAllowance, pf, tax, otherDeduction } = req.body;

    const existing = await dataStore.getPayrollById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    // Recalculate if salary fields changed
    let updatedFields = { paymentStatus, paymentDate };
    if (
      basicSalary !== undefined ||
      hra !== undefined ||
      transportAllowance !== undefined ||
      otherAllowance !== undefined ||
      pf !== undefined ||
      tax !== undefined ||
      otherDeduction !== undefined
    ) {
      const calc = calculateSalaryComponents({
        basicSalary: basicSalary !== undefined ? basicSalary : existing.basicSalary,
        hra: hra !== undefined ? hra : existing.hra,
        transportAllowance: transportAllowance !== undefined ? transportAllowance : existing.transportAllowance,
        otherAllowance: otherAllowance !== undefined ? otherAllowance : existing.otherAllowance,
        pf: pf !== undefined ? pf : existing.pf,
        tax: tax !== undefined ? tax : existing.tax,
        otherDeduction: otherDeduction !== undefined ? otherDeduction : existing.otherDeduction,
      });
      updatedFields = { ...updatedFields, ...calc };
    }

    const updated = await dataStore.updatePayroll(id, updatedFields);
    res.json({ success: true, message: 'Payroll updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deletePayroll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dataStore.deletePayroll(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }
    res.json({ success: true, message: 'Payroll record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
