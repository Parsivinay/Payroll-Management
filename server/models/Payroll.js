import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    payrollId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    hra: {
      type: Number,
      default: 0,
      min: 0,
    },
    transportAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherAllowance: {
      type: Number,
      default: 0,
      min: 0,
    },
    grossSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    pf: {
      type: Number,
      default: 0,
      min: 0,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    otherDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeduction: {
      type: Number,
      required: true,
      min: 0,
    },
    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);
export default Payroll;
