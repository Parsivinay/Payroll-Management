import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Employees can read profiles (getEmployeeById will verify employee id), Admin has full CRUD
router.get('/', protect, authorize('admin'), getEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, authorize('admin'), createEmployee);
router.put('/:id', protect, authorize('admin'), updateEmployee);
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

export default router;
