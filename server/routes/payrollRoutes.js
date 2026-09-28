import express from 'express';
import {
  getPayroll,
  getPayrollById,
  generatePayroll,
  updatePayroll,
  deletePayroll,
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getPayroll);
router.get('/:id', protect, getPayrollById);
router.post('/generate', protect, authorize('admin'), generatePayroll);
router.put('/:id', protect, authorize('admin'), updatePayroll);
router.delete('/:id', protect, authorize('admin'), deletePayroll);

export default router;
