import { useToast } from '../../context/ToastContext';

export default function ExportButtons({ data, filename = 'export' }) {
  const toast = useToast();

  const exportCSV = () => {
    if (!data || data.length === 0) { toast.error('Sem dados para exportar'); return; }
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(','),
      ...data.map(row => keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('"') || str.includes('\n') ? `"${str}"` : str;
      }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado!');
  };

  const exportExcel = async () => {
    if (!data || data.length === 0) { toast.error('Sem dados para exportar'); return; }
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');
      XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exportado!');
    } catch {
      toast.error('Erro ao exportar Excel');
    }
  };

  const exportPDF = async () => {
    if (!data || data.length === 0) { toast.error('Sem dados para exportar'); return; }
    try {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFillColor(10, 8, 6);
      doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

      doc.setTextColor(201, 168, 76);
      doc.setFontSize(18);
      doc.text('PEAKY BLINDERS - Colorado RP', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(154, 138, 106);
      doc.text(`Exportado em ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

      const keys = Object.keys(data[0]);
      doc.autoTable({
        startY: 35,
        head: [keys],
        body: data.map(row => keys.map(k => {
          const val = row[k];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        })),
        theme: 'grid',
        headStyles: {
          fillColor: [26, 18, 8],
          textColor: [201, 168, 76],
          fontStyle: 'bold',
          fontSize: 8,
        },
        bodyStyles: {
          fillColor: [22, 19, 14],
          textColor: [232, 223, 200],
          fontSize: 8,
        },
        alternateRowStyles: {
          fillColor: [16, 13, 9],
        },
        styles: {
          lineColor: [42, 31, 14],
          lineWidth: 0.3,
        }
      });

      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exportado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao exportar PDF');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button className="btn btn-ghost btn-sm" onClick={exportCSV} title="Exportar CSV">📄 CSV</button>
      <button className="btn btn-ghost btn-sm" onClick={exportExcel} title="Exportar Excel">📊 Excel</button>
      <button className="btn btn-ghost btn-sm" onClick={exportPDF} title="Exportar PDF">📑 PDF</button>
    </div>
  );
}
