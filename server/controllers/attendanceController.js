import dataStore from '../services/dataStore.js';

export const getAttendance = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;

    let targetEmpId = employeeId;
    // If employee role, restrict to their own records
    if (req.user.role === 'employee') {
      targetEmpId = req.user.employeeId;
    }

    const records = await dataStore.getAttendance({
      employeeId: targetEmpId,
      month,
      year,
    });

    // Populate employee details for display
    const employees = await dataStore.getEmployees();
    const empMap = new Map(employees.map((e) => [e.employeeId, e]));

    const enriched = records.map((r) => {
      const emp = empMap.get(r.employeeId);
      return {
        ...(r.toObject ? r.toObject() : r),
        employeeName: emp ? emp.name : 'Unknown',
        department: emp ? emp.department : 'General',
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await dataStore.getAttendanceById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (req.user.role === 'employee' && req.user.employeeId !== record.employeeId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot view attendance of another employee.' });
    }

    const emp = await dataStore.getEmployeeByIdOrEmpId(record.employeeId);
    const enriched = {
      ...(record.toObject ? record.toObject() : record),
      employeeName: emp ? emp.name : 'Unknown',
      department: emp ? emp.department : 'General',
    };

    res.json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const createAttendance = async (req, res, next) => {
  try {
    const { employeeId, month, year, workingDays, presentDays, absentDays = 0, leaveDays = 0 } = req.body;

    if (!employeeId || !month || !year || workingDays === undefined || presentDays === undefined) {
      return res.status(400).json({ success: false, message: 'All required fields must be filled.' });
    }

    const wDays = Number(workingDays);
    const pDays = Number(presentDays);
    const aDays = Number(absentDays || 0);
    const lDays = Number(leaveDays || 0);

    if (wDays < 0 || pDays < 0 || aDays < 0 || lDays < 0) {
      return res.status(400).json({ success: false, message: 'Attendance day counts cannot be negative.' });
    }

    if (pDays > wDays) {
      return res.status(400).json({
        success: false,
        message: `Present days (${pDays}) cannot exceed total working days (${wDays}).`,
      });
    }

    if (pDays + aDays + lDays > wDays) {
      return res.status(400).json({
        success: false,
        message: `Sum of Present (${pDays}) + Absent (${aDays}) + Leave (${lDays}) exceeds total working days (${wDays}).`,
      });
    }

    const emp = await dataStore.getEmployeeByIdOrEmpId(employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: `Employee '${employeeId}' does not exist.` });
    }

    const record = await dataStore.createAttendance({
      employeeId,
      month,
      year,
      workingDays: wDays,
      presentDays: pDays,
      absentDays: aDays,
      leaveDays: lDays,
    });

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: {
        ...(record.toObject ? record.toObject() : record),
        employeeName: emp.name,
        department: emp.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { workingDays, presentDays, absentDays, leaveDays } = req.body;

    if (workingDays !== undefined && Number(workingDays) < 0) {
      return res.status(400).json({ success: false, message: 'Working days cannot be negative.' });
    }
    if (presentDays !== undefined && Number(presentDays) < 0) {
      return res.status(400).json({ success: false, message: 'Present days cannot be negative.' });
    }

    const updated = await dataStore.updateAttendance(id, {
      ...(workingDays !== undefined && { workingDays: Number(workingDays) }),
      ...(presentDays !== undefined && { presentDays: Number(presentDays) }),
      ...(absentDays !== undefined && { absentDays: Number(absentDays) }),
      ...(leaveDays !== undefined && { leaveDays: Number(leaveDays) }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dataStore.deleteAttendance(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
