import dataStore from '../services/dataStore.js';

export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const employees = await dataStore.getEmployees(search, department, status);
    res.json({ success: true, count: employees.length, data: employees });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Security check: if role is employee, employee can only view their own profile
    if (req.user.role === 'employee' && req.user.employeeId && req.user.employeeId !== id && req.user._id !== id) {
      // Check if this id resolves to the employee
      const requestedEmp = await dataStore.getEmployeeByIdOrEmpId(id);
      if (!requestedEmp || requestedEmp.employeeId !== req.user.employeeId) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own profile.' });
      }
      return res.json({ success: true, data: requestedEmp });
    }

    const employee = await dataStore.getEmployeeByIdOrEmpId(id);
    if (!employee) {
      return res.status(404).json({ success: false, message: `Employee with ID '${id}' not found` });
    }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      name,
      email,
      phone,
      address,
      gender,
      dateOfBirth,
      dateOfJoining,
      department,
      designation,
      employmentType,
      basicSalary,
      bankAccountNumber,
      profileImage,
      status,
    } = req.body;

    if (!employeeId || !name || !email || !department || !designation || basicSalary === undefined) {
      return res.status(400).json({ success: false, message: 'Please fill in all required employee fields.' });
    }

    if (Number(basicSalary) < 0) {
      return res.status(400).json({ success: false, message: 'Basic salary cannot be negative.' });
    }

    // Check unique employeeId
    const existingEmpId = await dataStore.getEmployeeByIdOrEmpId(employeeId);
    if (existingEmpId) {
      return res.status(400).json({ success: false, message: `Employee ID '${employeeId}' is already registered.` });
    }

    // Check unique email
    const allEmployees = await dataStore.getEmployees();
    const existingEmail = allEmployees.find((e) => e.email.toLowerCase() === email.toLowerCase());
    if (existingEmail) {
      return res.status(400).json({ success: false, message: `Email '${email}' is already in use.` });
    }

    const newEmp = await dataStore.createEmployee({
      employeeId,
      name,
      email,
      phone: phone || '',
      address: address || '',
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '1995-01-01',
      dateOfJoining: dateOfJoining || new Date().toISOString().split('T')[0],
      department,
      designation,
      employmentType: employmentType || 'Full-time',
      basicSalary: Number(basicSalary),
      bankAccountNumber: bankAccountNumber || '0000000000',
      profileImage: profileImage || '',
      status: status || 'Active',
    });

    res.status(201).json({ success: true, message: 'Employee added successfully', data: newEmp });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.basicSalary !== undefined && Number(updateData.basicSalary) < 0) {
      return res.status(400).json({ success: false, message: 'Basic salary cannot be negative.' });
    }

    const updated = await dataStore.updateEmployee(id, updateData);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dataStore.deleteEmployee(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({ success: true, message: 'Employee and related records deleted successfully' });
  } catch (error) {
    next(error);
  }
};
