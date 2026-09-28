import express from 'express';
import {
  getSummaryReport,
  getPayrollReport,
  getDepartmentReport,
  getAttendanceReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', protect, authorize('admin'), getSummaryReport);
router.get('/payroll', protect, authorize('admin'), getPayrollReport);
router.get('/department', protect, authorize('admin'), getDepartmentReport);
router.get('/attendance', protect, authorize('admin'), getAttendanceReport);

export default router;
