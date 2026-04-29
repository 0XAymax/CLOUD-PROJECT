import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportService = {
  // Export to Excel
  exportToExcel: (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  },

  // Export to CSV
  exportToCSV: (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export to PDF
  exportToPDF: (data: any[], columns: string[], filename: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(filename, 14, 22);
    
    // Add table
    (doc as any).autoTable({
      head: [columns],
      body: data.map(item => columns.map(col => item[col])),
      startY: 30,
    });
    
    doc.save(`${filename}.pdf`);
  },
};
