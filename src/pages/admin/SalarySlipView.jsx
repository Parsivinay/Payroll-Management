import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Download,
  ArrowLeft,
  Building2,
  FileCheck2,
  CheckCircle,
  Clock,
} from 'lucide-react';

export default function SalarySlipView() {
  const { id } = useParams();
  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const slipRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await api.get(`/payroll/${id}`);
        if (res.data.success) {
          setPayroll(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching payroll for slip', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, [id]);

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const numberToWords = (num) => {
    if (!num) return 'Zero Rupees Only';
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!slipRef.current) return;
    try {
      setIsExporting(true);
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save(`Salary_Slip_${payroll?.employeeId}_${payroll?.month}_${payroll?.year}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating salary slip..." />;
  if (!payroll) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Salary slip not found</h3>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header no-print">
        <div className="page-title-box">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '8px' }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1>Official Salary Slip</h1>
          <p>
            Reference: {payroll.payrollId} • {payroll.month} {payroll.year}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} />
            Print Slip
          </button>
          <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={isExporting}>
            <Download size={16} />
            {isExporting ? 'Generating PDF...' : 'Download as PDF'}
          </button>
        </div>
      </div>

      {/* Salary Slip Document (Printable & Exportable Area) */}
      <div className="salary-slip-card" ref={slipRef}>
        <div className="slip-header">
          <div className="slip-company-name">APEX GLOBAL TECHNOLOGIES INC.</div>
          <div className="slip-company-address">
            Cyber Tech Park, Phase 1, Electronics City, Bengaluru, Karnataka - 560100
          </div>
          <div className="slip-company-address" style={{ fontSize: '0.78rem', color: '#64748b' }}>
            CIN: U72200KA2018PTC112345 • Corporate Payroll Division
          </div>
          <div className="slip-title">
            PAYSLIP FOR THE MONTH OF {payroll.month?.toUpperCase()} {payroll.year}
          </div>
        </div>

        {/* Employee Particulars Grid */}
        <div className="slip-info-grid">
          <div className="slip-info-row">
            <span className="slip-info-label">Employee Name:</span>
            <span className="slip-info-val">{payroll.employeeName}</span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Employee ID:</span>
            <span className="slip-info-val" style={{ fontFamily: 'var(--font-mono)' }}>
              {payroll.employeeId}
            </span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Department:</span>
            <span className="slip-info-val">{payroll.department}</span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Designation:</span>
            <span className="slip-info-val">{payroll.designation}</span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Date of Joining:</span>
            <span className="slip-info-val">
              {payroll.dateOfJoining ? String(payroll.dateOfJoining).split('T')[0] : 'N/A'}
            </span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Bank Account:</span>
            <span className="slip-info-val" style={{ fontFamily: 'var(--font-mono)' }}>
              {payroll.bankAccountNumber || '••••••••••••'}
            </span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Payment Status:</span>
            <span className="slip-info-val" style={{ color: payroll.paymentStatus === 'Paid' ? '#059669' : '#d97706' }}>
              ● {payroll.paymentStatus?.toUpperCase()}
            </span>
          </div>
          <div className="slip-info-row">
            <span className="slip-info-label">Disbursement Date:</span>
            <span className="slip-info-val">
              {payroll.paymentDate ? String(payroll.paymentDate).split('T')[0] : 'Pending Release'}
            </span>
          </div>
        </div>

        {/* Earnings & Deductions Breakdown Table */}
        <table className="slip-breakdown-table">
          <thead>
            <tr>
              <th style={{ width: '35%' }}>EARNINGS</th>
              <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT (₹)</th>
              <th style={{ width: '35%' }}>DEDUCTIONS</th>
              <th style={{ width: '15%', textAlign: 'right' }}>AMOUNT (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(payroll.basicSalary)}</td>
              <td>Provident Fund (PF)</td>
              <td style={{ textAlign: 'right', color: '#dc2626' }}>{formatINR(payroll.pf)}</td>
            </tr>
            <tr>
              <td>House Rent Allowance (HRA)</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(payroll.hra)}</td>
              <td>Income Tax (TDS)</td>
              <td style={{ textAlign: 'right', color: '#dc2626' }}>{formatINR(payroll.tax)}</td>
            </tr>
            <tr>
              <td>Transport Allowance</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(payroll.transportAllowance)}</td>
              <td>Other Deductions / Advance</td>
              <td style={{ textAlign: 'right', color: '#dc2626' }}>{formatINR(payroll.otherDeduction)}</td>
            </tr>
            <tr>
              <td>Other Special Allowance</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatINR(payroll.otherAllowance)}</td>
              <td>—</td>
              <td style={{ textAlign: 'right' }}>—</td>
            </tr>
            <tr className="total-row">
              <td>GROSS EARNINGS</td>
              <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 800 }}>
                {formatINR(payroll.grossSalary)}
              </td>
              <td>TOTAL DEDUCTIONS</td>
              <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 800 }}>
                {formatINR(payroll.totalDeduction)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Net Salary Highlight Box */}
        <div className="slip-net-box">
          <div>
            <div className="slip-net-label">NET TAKE-HOME PAYABLE</div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>
              Credited to Bank Account
            </div>
          </div>
          <div className="slip-net-value">{formatINR(payroll.netSalary)}</div>
        </div>

        {/* Amount in Words */}
        <div className="slip-words-box">
          <strong>Amount in Words: </strong> {numberToWords(payroll.netSalary)}
        </div>

        {/* Signatures */}
        <div className="slip-signature-grid">
          <div className="slip-sig-box">
            Employee Signature
          </div>
          <div className="slip-sig-box">
            Authorized Signatory / Finance Controller
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>
          This is a computer-generated salary slip and requires no physical seal if verified electronically.
        </div>
      </div>
    </div>
  );
}
