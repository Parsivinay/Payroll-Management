/**
 * Salary calculation engine and utilities according to specifications
 */

export const calculateSalaryComponents = ({
  basicSalary = 0,
  hraPercent = 20,
  transportAllowance = 2000,
  otherAllowance = 0,
  pfPercent = 10,
  taxPercent = 5,
  otherDeduction = 0,
  // Direct overrides if provided
  hra: hraOverride,
  pf: pfOverride,
  tax: taxOverride,
}) => {
  const basic = Math.max(0, Number(basicSalary) || 0);

  // Allowances
  const hra = hraOverride !== undefined && hraOverride !== null 
    ? Math.max(0, Number(hraOverride) || 0) 
    : Math.round((basic * (Number(hraPercent) || 0)) / 100);

  const transport = Math.max(0, Number(transportAllowance) || 0);
  const otherAllow = Math.max(0, Number(otherAllowance) || 0);

  const grossSalary = basic + hra + transport + otherAllow;

  // Deductions
  const pf = pfOverride !== undefined && pfOverride !== null 
    ? Math.max(0, Number(pfOverride) || 0) 
    : Math.round((basic * (Number(pfPercent) || 0)) / 100);

  const tax = taxOverride !== undefined && taxOverride !== null 
    ? Math.max(0, Number(taxOverride) || 0) 
    : Math.round((grossSalary * (Number(taxPercent) || 0)) / 100);

  const otherDed = Math.max(0, Number(otherDeduction) || 0);

  const totalDeduction = pf + tax + otherDed;
  const netSalary = Math.max(0, grossSalary - totalDeduction);

  return {
    basicSalary: basic,
    hra,
    transportAllowance: transport,
    otherAllowance: otherAllow,
    grossSalary,
    pf,
    tax,
    otherDeduction: otherDed,
    totalDeduction,
    netSalary,
  };
};

/**
 * Convert number to Indian currency words format for Salary Slip
 */
export const numberToWords = (num) => {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += Number(n[1]) !== 0 ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += Number(n[2]) !== 0 ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += Number(n[3]) !== 0 ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += Number(n[4]) !== 0 ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += Number(n[5]) !== 0 ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() ? str.trim() + ' Rupees Only' : 'Zero Rupees Only';
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
};
