import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      ref: 'Employee',
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    workingDays: {
      type: Number,
      required: [true, 'Total working days is required'],
      min: [0, 'Working days cannot be negative'],
    },
    presentDays: {
      type: Number,
      required: [true, 'Present days is required'],
      min: [0, 'Present days cannot be negative'],
    },
    absentDays: {
      type: Number,
      default: 0,
      min: [0, 'Absent days cannot be negative'],
    },
    leaveDays: {
      type: Number,
      default: 0,
      min: [0, 'Leave days cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 attendance record per employee per month & year
attendanceSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;
