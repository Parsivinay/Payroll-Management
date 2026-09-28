import express from 'express';
import {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAttendance);
router.get('/:id', protect, getAttendanceById);
router.post('/', protect, authorize('admin'), createAttendance);
router.put('/:id', protect, authorize('admin'), updateAttendance);
router.delete('/:id', protect, authorize('admin'), deleteAttendance);

export default router;
