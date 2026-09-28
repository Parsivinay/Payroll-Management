import dataStore from '../services/dataStore.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await dataStore.getDepartments();
    res.json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { departmentName, description, status } = req.body;
    if (!departmentName) {
      return res.status(400).json({ success: false, message: 'Department name is required' });
    }

    const depts = await dataStore.getDepartments();
    const exists = depts.find(
      (d) => d.departmentName.toLowerCase() === departmentName.trim().toLowerCase()
    );
    if (exists) {
      return res.status(400).json({ success: false, message: 'Department with this name already exists' });
    }

    const newDept = await dataStore.createDepartment({
      departmentName: departmentName.trim(),
      description: description || '',
      status: status || 'Active',
    });

    res.status(201).json({ success: true, message: 'Department created successfully', data: newDept });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentName, description, status } = req.body;

    const updated = await dataStore.updateDepartment(id, {
      ...(departmentName && { departmentName: departmentName.trim() }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    res.json({ success: true, message: 'Department updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await dataStore.deleteDepartment(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};
