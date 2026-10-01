/**
 * reportExporter.js
 * Multi-format ERP Report Exporter supporting:
 * 1. Print Form (Formatted browser print layout)
 * 2. XLSX Form (Excel XML Spreadsheet .xlsx)
 * 3. PDF Form (Print-to-PDF layout with executive styling)
 * 4. Word Form (.docx / .doc Word HTML/XML)
 * 5. CSV Form (Comma separated values)
 */

import { useUiStore } from '@/stores/uiStore'

export function exportPrint(reportTitle, metadata = {}, columns = [], rows = []) {
  const printWindow = window.open('', '_blank', 'width=1100,height=800')
  if (!printWindow) {
    try {
      const uiStore = useUiStore()
      uiStore.showModal('Popup Blocked', 'Please allow popups in your browser to view and print this report.', 'warning')
    } catch (e) {
      console.warn('Popup blocked: allow popups to print report.')
    }
    return
  }

  const metaHtml = Object.entries(metadata)
    .map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`)
    .join('')

  const theadHtml = columns.map(c => `<th>${c}</th>`).join('')
  const tbodyHtml = rows.map(r => `<tr>${r.map(cell => `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}</tr>`).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportTitle} - Medimage Services ERP</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: flex-end; }
          .company-name { font-size: 24px; font-weight: 800; color: #4338ca; }
          .report-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 4px; }
          .metadata-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px; font-size: 13px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #4f46e5; color: white; text-align: left; padding: 8px 10px; font-weight: 600; border: 1px solid #4338ca; }
          td { padding: 7px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">Medimage Services ERP</div>
            <div class="report-title">${reportTitle}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #64748b;">
            <div>Peshawar HO • Multan • Lahore</div>
            <div>Printed: ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="metadata-grid">
          ${metaHtml}
        </div>

        <table>
          <thead>
            <tr>${theadHtml}</tr>
          </thead>
          <tbody>
            ${tbodyHtml}
          </tbody>
        </table>

        <div class="footer">
          <span>Medimage Services Medical Equipment ERP System</span>
          <span>Confidential Business Document</span>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

export function exportPDF(reportTitle, metadata = {}, columns = [], rows = [], filename = 'report.pdf') {
  // Directly trigger formatted print-to-PDF layout
  exportPrint(reportTitle, metadata, columns, rows)
}

export function exportXLSX(arg1, arg2 = [], arg3 = [], arg4 = 'medimage_erp_report.xlsx', maybeFilename = null) {
  let reportTitle = 'ERP Report'
  let metadata = {}
  let columns = []
  let rawRows = []
  let filename = 'medimage_erp_report.xlsx'

  // Pattern A: exportXLSX(rows, filename)
  if (Array.isArray(arg1) && (typeof arg2 === 'string' || !arg2)) {
    rawRows = arg1
    filename = typeof arg2 === 'string' ? arg2 : 'medimage_erp_report.xlsx'
    reportTitle = filename.replace(/\.xlsx$/i, '').replace(/_/g, ' ')
  }
  // Pattern B: exportXLSX(title, metadata, columns, rows, filename)
  else if (typeof arg1 === 'string' && typeof arg2 === 'object' && !Array.isArray(arg2)) {
    reportTitle = arg1
    metadata = arg2 || {}
    columns = Array.isArray(arg3) ? arg3 : []
    rawRows = Array.isArray(arg4) ? arg4 : []
    filename = typeof maybeFilename === 'string' ? maybeFilename : (typeof arg4 === 'string' ? arg4 : 'medimage_erp_report.xlsx')
  }
  // Pattern C: exportXLSX(columns, rows, filename)
  else if (Array.isArray(arg1) && Array.isArray(arg2)) {
    columns = arg1
    rawRows = arg2
    filename = typeof arg3 === 'string' ? arg3 : 'medimage_erp_report.xlsx'
  }
  // Pattern D: exportXLSX(title, columns, rows, filename)
  else if (typeof arg1 === 'string' && Array.isArray(arg2)) {
    reportTitle = arg1
    columns = arg2
    rawRows = Array.isArray(arg3) ? arg3 : []
    filename = typeof arg4 === 'string' ? arg4 : 'medimage_erp_report.xlsx'
  } else {
    rawRows = Array.isArray(arg1) ? arg1 : []
  }

  // If columns are not specified, extract keys from first object
  if ((!columns || columns.length === 0) && rawRows.length > 0 && typeof rawRows[0] === 'object' && !Array.isArray(rawRows[0])) {
    columns = Object.keys(rawRows[0])
  }

  // Normalize columns to { label, key }
  const colDefs = columns.map(c => {
    if (typeof c === 'object' && c !== null) {
      return { label: c.label || c.name || c.key || '', key: c.key || c.label || '' }
    }
    return { label: String(c), key: String(c) }
  })

  // Normalize rows to arrays of cell values
  const normalizedRows = rawRows.map(r => {
    if (Array.isArray(r)) {
      return r
    }
    if (typeof r === 'object' && r !== null) {
      return colDefs.map(col => {
        if (r[col.key] !== undefined) return r[col.key]
        if (r[col.label] !== undefined) return r[col.label]
        return ''
      })
    }
    return [String(r)]
  })

  // Generate XML-based Microsoft Excel Spreadsheet format (.xlsx / .xml)
  const theadXml = colDefs.map(c => `<Cell ss:StyleID="Header"><Data ss:Type="String">${c.label}</Data></Cell>`).join('')
  
  const rowsXml = normalizedRows.map(r => {
    const cells = r.map(val => {
      const isNum = typeof val === 'number' && !isNaN(val)
      const sanitized = val !== null && val !== undefined ? String(val).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
      return isNum 
        ? `<Cell ss:StyleID="Number"><Data ss:Type="Number">${val}</Data></Cell>`
        : `<Cell ss:StyleID="String"><Data ss:Type="String">${sanitized}</Data></Cell>`
    }).join('')
    return `<Row>${cells}</Row>`
  }).join('\n')

  const metaRows = Object.entries(metadata).map(([k, v]) => 
    `<Row><Cell ss:StyleID="SubHeader"><Data ss:Type="String">${k}: ${v}</Data></Cell></Row>`
  ).join('\n')

  const excelTemplate = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#10B981" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="10" ss:Color="#475569" ss:Italic="1"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Number">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="String">
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="14" ss:Color="#047857" ss:Bold="1"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="ERP Report">
  <Table>
   <Row ss:Index="1">
    <Cell ss:StyleID="Title"><Data ss:Type="String">Medimage Services ERP - ${reportTitle}</Data></Cell>
   </Row>
   <Row ss:Index="2">
    <Cell><Data ss:Type="String">Exported on: ${new Date().toLocaleString()}</Data></Cell>
   </Row>
   ${metaRows}
   <Row ss:Index="${metaRows ? 5 : 4}">
    ${theadXml}
   </Row>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`

  const blob = new Blob([excelTemplate], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Requirement 2: BL Closing & Automatic Excel Reporting
 * Generates the official Bill of Lading (BL) Closing Excel Sheet containing all 17 mandatory fields:
 * 1. BL Number
 * 2. Delivery Date
 * 3. Customer Name
 * 4. Invoice Number
 * 5. Product Name
 * 6. Product Code
 * 7. Serial Number
 * 8. Sale Amount
 * 9. Received Amount
 * 10. Outstanding Amount
 * 11. Mode of Payment
 * 12. Bank Name
 * 13. Bank Details
 * 14. Transaction / Cheque Reference
 * 15. Payment Date
 * 16. Branch
 * 17. Sales Person & Payment Status
 */
export function exportBLClosingExcel(blNumber, rows = [], metadata = {}) {
  const columns = [
    'BL Number',
    'Delivery Date',
    'Customer Name',
    'Invoice Number',
    'Product Name',
    'Product Code',
    'Serial Number',
    'Sale Amount (PKR)',
    'Received Amount (PKR)',
    'Outstanding Amount (PKR)',
    'Mode of Payment',
    'Bank Name',
    'Bank Details',
    'Transaction / Cheque Ref',
    'Payment Date',
    'Branch',
    'Sales Person',
    'Payment Status'
  ]

  const title = `BL Closing Audit Sheet - ${blNumber}`
  const filename = `BL_Closing_${blNumber}_${new Date().toISOString().substring(0, 10)}.xlsx`
  exportXLSX(title, metadata, columns, rows, filename)
}

export function printBLClosingReport(blNumber, rows = [], metadata = {}) {
  const printWindow = window.open('', '_blank', 'width=1200,height=900')
  if (!printWindow) {
    try {
      const uiStore = useUiStore()
      uiStore.showModal('Popup Blocked', 'Please allow popups in your browser to view and print this report.', 'warning')
    } catch (e) {
      console.warn('Popup blocked: allow popups to print report.')
    }
    return
  }

  const columns = [
    '#',
    'Delivery Date',
    'Customer / Hospital',
    'Invoice #',
    'Product / Machine',
    'Model Code',
    'Serial Number',
    'Sale Price (PKR)',
    'Paid (PKR)',
    'Outstanding (PKR)',
    'Payment Mode',
    'Bank Details',
    'Branch',
    'Status'
  ]

  let totalSale = 0
  let totalPaid = 0
  let totalOutstanding = 0

  const tableRowsHtml = (rows || []).map((r, idx) => {
    const saleAmt = Number(r[7] || 0)
    const paidAmt = Number(r[8] || 0)
    const outAmt = Number(r[9] || 0)
    totalSale += saleAmt
    totalPaid += paidAmt
    totalOutstanding += outAmt

    const isPaid = (r[17] || '').toLowerCase() === 'paid'

    return `
      <tr>
        <td style="text-align: center; font-weight: bold; color: #64748b;">${idx + 1}</td>
        <td style="white-space: nowrap; font-family: monospace;">${r[1] || '—'}</td>
        <td style="font-weight: 700; color: #0f172a;">${r[2] || '—'}</td>
        <td style="font-family: monospace; font-weight: bold; color: #2563eb;">${r[3] || '—'}</td>
        <td style="font-weight: 600;">${r[4] || '—'}</td>
        <td style="font-family: monospace; color: #7c3aed;">${r[5] || '—'}</td>
        <td style="font-family: monospace; font-weight: 800; color: #0284c7; background: #f0f9ff;">${r[6] || '—'}</td>
        <td style="text-align: right; font-family: monospace; font-weight: bold;">${saleAmt.toLocaleString()}</td>
        <td style="text-align: right; font-family: monospace; font-weight: bold; color: #16a34a;">${paidAmt.toLocaleString()}</td>
        <td style="text-align: right; font-family: monospace; font-weight: bold; color: ${outAmt > 0 ? '#dc2626' : '#64748b'};">${outAmt.toLocaleString()}</td>
        <td>${r[10] || '—'}</td>
        <td style="font-size: 11px; color: #475569;">${r[11] || ''} ${r[13] ? `(${r[13]})` : ''}</td>
        <td><span style="display: inline-block; padding: 2px 6px; background: #f1f5f9; border-radius: 4px; font-weight: 600; font-size: 11px;">${r[15] || 'Peshawar'}</span></td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 800; font-family: monospace; ${isPaid ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;' : 'background: #fef3c7; color: #b45309; border: 1px solid #fde68a;'}">
            ${r[17] || (isPaid ? 'PAID' : 'PENDING')}
          </span>
        </td>
      </tr>
    `
  }).join('')

  const emptyNotice = (!rows || rows.length === 0) ? `<tr><td colspan="14" style="text-align: center; padding: 30px; color: #94a3b8; font-style: italic;">No machine units or sales transactions mapped to this Bill of Lading consignment yet.</td></tr>` : ''

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Official BL Closing Sheet - ${blNumber}</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 15px;
            background: #ffffff;
            font-size: 12px;
          }
          .letterhead-bar {
            border-bottom: 3px solid #6366f1;
            padding-bottom: 12px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .company-brand {
            font-size: 22px;
            font-weight: 900;
            color: #4338ca;
            letter-spacing: -0.5px;
          }
          .company-subtitle {
            font-size: 11px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .doc-badge {
            display: inline-block;
            background: #ede9fe;
            color: #5b21b6;
            border: 1px solid #c4b5fd;
            font-weight: 800;
            font-size: 11px;
            padding: 4px 10px;
            border-radius: 6px;
            margin-top: 6px;
            font-family: monospace;
          }
          .kpi-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 16px;
          }
          .kpi-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
          }
          .kpi-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
          }
          .kpi-val {
            font-size: 16px;
            font-weight: 900;
            font-family: monospace;
            margin-top: 3px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-bottom: 20px;
          }
          th {
            background: #1e293b;
            color: #ffffff;
            padding: 8px 6px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
            border: 1px solid #334155;
          }
          td {
            padding: 6px;
            border: 1px solid #cbd5e1;
            vertical-align: middle;
          }
          tr:nth-child(even) {
            background: #f8fafc;
          }
          .tfoot-row td {
            background: #f1f5f9;
            font-weight: 900;
            border-top: 2px solid #334155;
            font-size: 11px;
          }
          .signatures-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 35px;
            page-break-inside: avoid;
          }
          .sig-box {
            border-top: 1.5px solid #64748b;
            padding-top: 6px;
            text-align: center;
          }
          .sig-title {
            font-weight: 800;
            font-size: 11px;
            color: #1e293b;
          }
          .sig-sub {
            font-size: 10px;
            color: #64748b;
          }
          .btn-print-toolbar {
            margin-bottom: 15px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .btn-action {
            background: #4f46e5;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            font-size: 12px;
          }
          @media print {
            .btn-print-toolbar { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="btn-print-toolbar">
          <button class="btn-action" onclick="window.print()">🖨️ Print Report / Save PDF</button>
          <button class="btn-action" style="background: #64748b;" onclick="window.close()">✕ Close</button>
        </div>

        <div class="letterhead-bar">
          <div>
            <div class="company-brand">MEDIMAGE SERVICES</div>
            <div class="company-subtitle">Biomedical Equipment Imports & Surgical Systems</div>
            <div class="doc-badge">OFFICIAL BILL OF LADING CLOSING & EQUIPMENT AUDIT REPORT</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #475569;">
            <div><strong>BL Consignment Ref:</strong> <span style="font-family: monospace; font-weight: 800; color: #4338ca; font-size: 13px;">${blNumber}</span></div>
            <div><strong>Destination Depot:</strong> ${metadata.branch || 'Peshawar HO'}</div>
            <div><strong>Audit Officer:</strong> ${metadata.closedBy || 'Finance Director'}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
          </div>
        </div>

        <div class="kpi-row">
          <div class="kpi-card">
            <div class="kpi-label">Reconciled Machines</div>
            <div class="kpi-val" style="color: #6366f1;">${rows ? rows.length : 0} Units</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Billed Volume</div>
            <div class="kpi-val" style="color: #0f172a;">PKR ${totalSale.toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Recovered Cash</div>
            <div class="kpi-val" style="color: #16a34a;">PKR ${totalPaid.toLocaleString()}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Outstanding Balance</div>
            <div class="kpi-val" style="color: ${totalOutstanding > 0 ? '#dc2626' : '#16a34a'};">PKR ${totalOutstanding.toLocaleString()}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${columns.map(c => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
            ${emptyNotice}
          </tbody>
          <tfoot class="tfoot-row">
            <tr>
              <td colspan="7" style="text-align: right; padding-right: 12px;">CONSIGNMENT TOTALS (PKR):</td>
              <td style="text-align: right; font-family: monospace; color: #0f172a;">${totalSale.toLocaleString()}</td>
              <td style="text-align: right; font-family: monospace; color: #16a34a;">${totalPaid.toLocaleString()}</td>
              <td style="text-align: right; font-family: monospace; color: ${totalOutstanding > 0 ? '#dc2626' : '#64748b'};">${totalOutstanding.toLocaleString()}</td>
              <td colspan="4"></td>
            </tr>
          </tfoot>
        </table>

        <div class="signatures-grid">
          <div class="sig-box">
            <div class="sig-title">Warehouse & Import Logistics</div>
            <div class="sig-sub">Receiving & Serial Verification</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">Accounts & Recovery Officer</div>
            <div class="sig-sub">Financial Ledger Reconciliation</div>
          </div>
          <div class="sig-box">
            <div class="sig-title">Executive Managing Director</div>
            <div class="sig-sub">Final Consignment Clearance Sign-Off</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 350);
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

export function exportWord(reportTitle, metadata = {}, columns = [], rows = [], filename = 'medimage_erp_report.docx') {
  const metaHtml = Object.entries(metadata)
    .map(([k, v]) => `<tr><td style="font-weight: bold; width: 30%;">${k}:</td><td>${v}</td></tr>`)
    .join('')

  const theadHtml = columns.map(c => `<th style="background-color: #4f46e5; color: white; padding: 8px; border: 1px solid #312e81;">${c}</th>`).join('')
  const tbodyHtml = rows.map(r => `<tr>${r.map(cell => `<td style="padding: 6px 8px; border: 1px solid #cbd5e1;">${cell !== null && cell !== undefined ? cell : ''}</td>`).join('')}</tr>`).join('')

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${reportTitle}</title>
        <style>
          body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; }
          h1 { color: #4338ca; font-size: 18pt; margin-bottom: 4pt; }
          h2 { color: #1e293b; font-size: 14pt; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        </style>
      </head>
      <body>
        <h1>Medimage Services ERP</h1>
        <h2>${reportTitle}</h2>
        <p style="color: #64748b; font-size: 9pt;">Generated: ${new Date().toLocaleString()} • Head Office: Peshawar, Multan, Lahore</p>

        <table style="width: 100%; margin-bottom: 16pt; background: #f8fafc; border: 1px solid #e2e8f0;">
          ${metaHtml}
        </table>

        <table border="1" style="border-collapse: collapse;">
          <thead>
            <tr>${theadHtml}</tr>
          </thead>
          <tbody>
            ${tbodyHtml}
          </tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob([wordHtml], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.docx') || filename.endsWith('.doc') ? filename : `${filename}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportCSV(columns = [], rows = [], filename = 'medimage_report.csv') {
  const csvContent = [
    columns.join(','),
    ...rows.map(r => r.map(c => `"${String(c !== null && c !== undefined ? c : '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportReport(format = 'xlsx', reportData = {}) {
  const title = reportData.title || 'Medimage Services ERP Report'
  const metadata = reportData.summary || {
    'Branch': reportData.branch || 'All Branches',
    'Date Range': reportData.dateRange || new Date().toISOString().split('T')[0]
  }
  const columns = reportData.headers || []
  const rows = reportData.rows || []
  const baseName = reportData.filename || `medimage_erp_report_${new Date().toISOString().split('T')[0]}`

  switch (format) {
    case 'print':
      exportPrint(title, metadata, columns, rows)
      break
    case 'xlsx':
      exportXLSX(title, metadata, columns, rows, `${baseName}.xlsx`)
      break
    case 'pdf':
      exportPDF(title, metadata, columns, rows)
      break
    case 'word':
      exportWord(title, metadata, columns, rows, `${baseName}.docx`)
      break
    case 'csv':
      exportCSV(columns, rows, `${baseName}.csv`)
      break
    default:
      exportXLSX(title, metadata, columns, rows, `${baseName}.xlsx`)
  }
}

/**
 * Requirement 47: Official Printed Sales Invoice with Previous Balance + Current Invoice + New Outstanding Balance
 */
export function exportInvoicePrint(invoice, ledgerSummary = {}) {
  const printWindow = window.open('', '_blank', 'width=900,height=1000')
  if (!printWindow) {
    try {
      const uiStore = useUiStore()
      uiStore.showModal('Popup Blocked', 'Please allow popups in your browser to print the invoice.', 'warning')
    } catch (e) {}
    return
  }

  const prevBalance = Number(ledgerSummary.previousBalance ?? invoice.previousBalance ?? 0)
  const currentInvoice = Number(ledgerSummary.currentInvoiceAmount ?? invoice.grandTotal ?? 0)
  const paymentReceived = Number(ledgerSummary.paymentReceived ?? invoice.paidAmount ?? (invoice.paymentMethod === 'Cash Payment' ? currentInvoice : 0))
  const finalBalance = Number(ledgerSummary.finalOutstandingBalance ?? invoice.finalOutstandingBalance ?? Math.max(0, prevBalance + currentInvoice - paymentReceived))

  const itemsHtml = (invoice.items || []).map((it, idx) => {
    const serialsStr = it.serials && it.serials.length ? it.serials.join(', ') : 'N/A'
    const unitPrice = Number(it.unitPrice || 0)
    const lineTotal = Number(it.total || (it.qty * unitPrice) || 0)
    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #0f172a;">${it.productName}</div>
          <div style="font-size: 11px; color: #64748b; font-family: monospace;">Serials / Codes: ${serialsStr}</div>
        </td>
        <td style="text-align: center; font-family: monospace; font-weight: 700;">${it.qty}</td>
        <td style="text-align: right; font-family: monospace;">PKR ${unitPrice.toLocaleString()}</td>
        <td style="text-align: right; font-family: monospace; font-weight: 700; color: #047857;">PKR ${lineTotal.toLocaleString()}</td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sales Invoice ${invoice.invoiceNo} - Medimage Services ERP</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; margin: 0; }
          .invoice-box { max-width: 820px; margin: auto; }
          .header { border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
          .brand { font-size: 24px; font-weight: 800; color: #4338ca; letter-spacing: -0.5px; }
          .brand-tag { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px; }
          .company-details { font-size: 11px; color: #475569; line-height: 1.4; text-align: right; }
          .invoice-title { font-size: 20px; font-weight: 800; color: #0f172a; text-transform: uppercase; text-align: center; margin: 15px 0; letter-spacing: 1px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 12px; }
          .meta-group div { margin-bottom: 4px; }
          .meta-label { color: #64748b; font-weight: 600; }
          .meta-val { font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          th { background: #4f46e5; color: #fff; padding: 8px 10px; font-weight: 600; border: 1px solid #4338ca; }
          td { padding: 8px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
          .totals-flex { display: flex; justify-content: flex-end; margin-bottom: 20px; }
          .totals-table { width: 280px; font-size: 12px; }
          .totals-table td { padding: 6px 8px; border: 1px solid #e2e8f0; }
          .ledger-card { border: 2px solid #059669; border-radius: 8px; background: #ecfdf5; padding: 14px 18px; margin: 20px 0; }
          .ledger-header { font-size: 13px; font-weight: 800; color: #065f46; text-transform: uppercase; border-bottom: 1px dashed #10b981; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; }
          .ledger-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; color: #064e3b; }
          .ledger-row.total { border-top: 2px solid #059669; margin-top: 6px; padding-top: 6px; font-size: 14px; font-weight: 800; color: #065f46; }
          .signatures { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; font-size: 11px; }
          .sig-box { width: 220px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 6px; color: #475569; font-weight: 600; }
          .footer-note { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="no-print" style="text-align: right; margin-bottom: 15px;">
            <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Invoice</button>
          </div>

          <div class="header">
            <div>
              <div class="brand">MEDIMAGE SERVICES</div>
              <div class="brand-tag">Medical & Aesthetic Laser Equipment ERP</div>
              <div style="font-size: 11px; color: #475569; margin-top: 4px;">Peshawar HO • Multan • Lahore Depots</div>
            </div>
            <div class="company-details">
              <div><strong>NTN / Reg:</strong> 7291823-1</div>
              <div><strong>Contact:</strong> +92 91 5838000 / support@medimage.pk</div>
              <div><strong>Generated By:</strong> ${invoice.salesPerson || invoice.sellerName || 'Admin'}</div>
            </div>
          </div>

          <div class="invoice-title">OFFICIAL COMMERCIAL SALES INVOICE</div>

          <div class="meta-grid">
            <div class="meta-group">
              <div><span class="meta-label">Invoice Number:</span> <span class="meta-val" style="color: #4f46e5; font-family: monospace;">${invoice.invoiceNo}</span></div>
              <div><span class="meta-label">Customer / Dealer:</span> <span class="meta-val">${invoice.customer}</span></div>
              <div><span class="meta-label">Sales Branch:</span> <span class="meta-val">${invoice.branch || 'Peshawar'}</span></div>
              <div><span class="meta-label">Bill of Lading (BL):</span> <span class="meta-val" style="font-family: monospace;">${invoice.blNumber || 'N/A'}</span></div>
            </div>
            <div class="meta-group">
              <div><span class="meta-label">Invoice Date:</span> <span class="meta-val font-mono">${invoice.saleDate || new Date().toISOString().substring(0, 10)}</span></div>
              <div><span class="meta-label">Delivery Date:</span> <span class="meta-val font-mono">${invoice.deliveryDate || invoice.saleDate || 'N/A'}</span></div>
              <div><span class="meta-label">Payment Mode:</span> <span class="meta-val">${invoice.paymentMethod}</span></div>
              <div><span class="meta-label">Status:</span> <span class="meta-val" style="color: ${invoice.paymentStatus === 'Paid' ? '#059669' : '#dc2626'};">${invoice.paymentStatus || 'Pending'}</span></div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 35px;">#</th>
                <th>Item & Serial Identification</th>
                <th style="width: 50px; text-align: center;">Qty</th>
                <th style="width: 130px; text-align: right;">Unit Price</th>
                <th style="width: 140px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals-flex">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">PKR ${(invoice.subtotal || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Sales Tax (${invoice.taxRatio || 18}%)</td>
                <td style="text-align: right; font-family: monospace; font-weight: 600;">PKR ${(invoice.tax || 0).toLocaleString()}</td>
              </tr>
              ${invoice.discount ? `<tr><td>Discount</td><td style="text-align: right; font-family: monospace; color: #dc2626;">- PKR ${invoice.discount.toLocaleString()}</td></tr>` : ''}
              <tr style="background: #f1f5f9; font-weight: 800;">
                <td>Current Invoice Amount</td>
                <td style="text-align: right; font-family: monospace; color: #4338ca; font-size: 13px;">PKR ${(invoice.grandTotal || 0).toLocaleString()}</td>
              </tr>
            </table>
          </div>

          <!-- Requirement 47: Customer Ledger Balance Calculation Breakdown -->
          <div class="ledger-card">
            <div class="ledger-header">
              <span>💳 Customer Ledger Balance Reconciliation</span>
              <span>Centralized Ledger</span>
            </div>
            <div class="ledger-row">
              <span>Previous Outstanding Balance:</span>
              <strong style="font-family: monospace;">PKR ${prevBalance.toLocaleString()}</strong>
            </div>
            <div class="ledger-row">
              <span>Current Invoice Amount:</span>
              <strong style="font-family: monospace; color: #4338ca;">(+) PKR ${currentInvoice.toLocaleString()}</strong>
            </div>
            <div class="ledger-row">
              <span>Payment Received at Issuance:</span>
              <strong style="font-family: monospace; color: #059669;">(-) PKR ${paymentReceived.toLocaleString()}</strong>
            </div>
            <div class="ledger-row total">
              <span>Total New Outstanding Balance:</span>
              <span style="font-family: monospace; color: ${finalBalance > 0 ? '#b91c1c' : '#059669'};">PKR ${finalBalance.toLocaleString()}</span>
            </div>
          </div>

          <div class="signatures">
            <div class="sig-box">Authorized Sales / Accounts Officer</div>
            <div class="sig-box">Customer / Dealer Signature & Stamp</div>
          </div>

          <div class="footer-note">
            Medimage Services ERP System • Valid computer generated commercial invoice • Thank you for your partnership!
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * Requirement 48: Low Stock Report Export (Excel, PDF, Print, CSV)
 */
export function exportLowStockReport(products = [], format = 'xlsx') {
  const columns = [
    'Product / Equipment Name',
    'SKU Code',
    'Category',
    'Depot / Location',
    'Cost Price (PKR)',
    'Sale Price (PKR)',
    'Current Available Stock',
    'Minimum Stock Level',
    'Deficit Units Required',
    'Status'
  ]

  const rows = products.map(p => {
    const minLvl = p.minStock !== undefined ? p.minStock : 5
    const currStock = p.stockQty || 0
    const deficit = Math.max(0, minLvl - currStock)
    const status = currStock === 0 ? 'OUT OF STOCK' : currStock <= minLvl ? 'LOW STOCK' : 'WELL STOCKED'
    return [
      p.name,
      p.sku,
      p.category,
      p.allocationCity || 'Peshawar',
      p.costPrice || 0,
      p.sellingPrice || p.salePrice || 0,
      currStock,
      minLvl,
      deficit,
      status
    ]
  })

  const title = 'Inventory Low Stock & Minimum Level Alert Report'
  const metadata = {
    'Report Type': 'Low Stock & Restocking Analysis',
    'Total Alert Items': products.length,
    'Generated Date': new Date().toLocaleString(),
    'Depot Coverage': 'Centralized (Peshawar, Multan, Lahore)'
  }

  const filename = `Low_Stock_Report_${new Date().toISOString().substring(0, 10)}`

  exportReport(format, {
    title,
    summary: metadata,
    headers: columns,
    rows,
    filename
  })
}

/**
 * Print Official Payment In Receipt (Customer Collection)
 */
export function printPaymentReceipt(receipt = {}) {
  const printWindow = window.open('', '_blank', 'width=850,height=800')
  if (!printWindow) {
    try {
      const uiStore = useUiStore()
      uiStore.showModal('Popup Blocked', 'Please allow popups in your browser to print the payment receipt.', 'warning')
    } catch (e) {}
    return
  }

  const receiptNo = receipt.receiptNo || receipt.voucherOrReceiptNo || 'RCT-PREVIEW'
  const party = receipt.customer || receipt.partyName || 'Customer / Hospital'
  const date = receipt.paymentDate || receipt.date || new Date().toISOString().substring(0, 10)
  const branch = receipt.branch || 'Peshawar'
  const method = receipt.paymentType || receipt.paymentMethod || 'Cash Payment'
  const amount = Number(receipt.amount || 0)
  const description = receipt.description || 'Payment Received'
  const receivedBy = receipt.receivedBy || receipt.user || 'Authorized Staff'
  const paidSerials = receipt.paidSerials || receipt.allocatedSerials || []

  const serialsHtml = paidSerials.length > 0
    ? `
      <div style="margin: 18px 0;">
        <div style="font-size: 12px; font-weight: 700; color: #065f46; text-transform: uppercase; margin-bottom: 6px;">Machine & Serial Number Payment Allocation</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: #059669; color: white;">
              <th style="padding: 6px 10px; text-align: left;">Serial Code</th>
              <th style="padding: 6px 10px; text-align: left;">Machine Code</th>
              <th style="padding: 6px 10px; text-align: left;">Equipment / Model</th>
              <th style="padding: 6px 10px; text-align: right;">Allocated (PKR)</th>
            </tr>
          </thead>
          <tbody>
            ${paidSerials.map(s => `
              <tr style="border-bottom: 1px solid #d1fae5;">
                <td style="padding: 6px 10px; font-family: monospace; font-weight: bold;">${(s.serialCode || '').replace(/^SN-/i, '')}</td>
                <td style="padding: 6px 10px; font-family: monospace; color: #047857; font-weight: bold;">${s.machineCode || '—'}</td>
                <td style="padding: 6px 10px;">${s.productName || s.sku || 'Equipment Unit'}</td>
                <td style="padding: 6px 10px; text-align: right; font-family: monospace; font-weight: bold; color: #065f46;">PKR ${(s.amountAllocated || s.salePrice || 0).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
    : `
      <div style="margin: 14px 0; padding: 10px 14px; background: #f0fdf4; border: 1px dashed #86efac; border-radius: 6px; font-size: 12px; color: #166534;">
        <strong>Allocation Note:</strong> Payment recorded as General Account Settlement / Customer Advance Balance.
      </div>
    `

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Receipt ${receiptNo} - Medimage Services ERP</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; margin: 0; }
          .receipt-box { max-width: 780px; margin: auto; border: 2px solid #059669; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { border-bottom: 2px solid #059669; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .brand { font-size: 22px; font-weight: 800; color: #047857; letter-spacing: -0.5px; }
          .brand-tag { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px; }
          .title-tag { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 13px; display: inline-block; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 15px 0; font-size: 12px; }
          .meta-item { margin-bottom: 4px; }
          .meta-label { color: #64748b; font-weight: 600; }
          .meta-val { font-weight: 700; color: #0f172a; }
          .amount-card { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
          .amount-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
          .amount-val { font-size: 26px; font-weight: 900; font-family: monospace; }
          .desc-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; font-size: 12px; margin-top: 10px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 15px; font-size: 11px; }
          .sig-box { width: 220px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 6px; color: #475569; font-weight: 600; }
          .footer-note { margin-top: 25px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="no-print" style="text-align: right; margin-bottom: 12px;">
            <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Official Receipt</button>
          </div>

          <div class="header">
            <div>
              <div class="brand">MEDIMAGE SERVICES</div>
              <div class="brand-tag">Medical & Aesthetic Laser Equipment ERP</div>
              <div style="font-size: 11px; color: #475569; margin-top: 3px;">Peshawar HO • Multan • Lahore Depots</div>
            </div>
            <div style="text-align: right;">
              <div class="title-tag">💰 MONEY IN RECEIPT</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #047857; margin-top: 4px;">${receiptNo}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div class="meta-item"><span class="meta-label">Received From (Customer):</span> <span class="meta-val">${party}</span></div>
              <div class="meta-item"><span class="meta-label">Receiving Branch:</span> <span class="meta-val">${branch}</span></div>
              <div class="meta-item"><span class="meta-label">Payment Mode:</span> <span class="meta-val">${method}</span></div>
            </div>
            <div>
              <div class="meta-item"><span class="meta-label">Receipt Date:</span> <span class="meta-val font-mono">${date}</span></div>
              <div class="meta-item"><span class="meta-label">Cashier / Staff:</span> <span class="meta-val">${receivedBy}</span></div>
              <div class="meta-item"><span class="meta-label">Payment Status:</span> <span class="meta-val" style="color: #059669;">Verified & Cleared</span></div>
            </div>
          </div>

          <div class="amount-card">
            <div>
              <div class="amount-label">Total Amount Received</div>
              <div style="font-size: 11px; opacity: 0.85;">Official Cash Flow Inflow</div>
            </div>
            <div class="amount-val">PKR ${amount.toLocaleString()}</div>
          </div>

          ${serialsHtml}

          <div class="desc-card">
            <div style="font-weight: bold; color: #334155; margin-bottom: 2px;">Transaction Remarks / Reference:</div>
            <div style="color: #475569;">${description}</div>
          </div>

          <div class="signatures">
            <div class="sig-box">Authorized Cashier / Accounts Officer</div>
            <div class="sig-box">Customer / Depositor Signature</div>
          </div>

          <div class="footer-note">
            Medimage Services ERP System • Valid Computer Generated Payment Receipt • NTN: 7291823-1
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * Print Official Payment Out Voucher (Disbursement / Refund / Vendor Outflow)
 */
export function printPaymentOutVoucher(voucher = {}) {
  const printWindow = window.open('', '_blank', 'width=850,height=800')
  if (!printWindow) {
    try {
      const uiStore = useUiStore()
      uiStore.showModal('Popup Blocked', 'Please allow popups in your browser to print the payment voucher.', 'warning')
    } catch (e) {}
    return
  }

  const voucherNo = voucher.voucherNo || voucher.voucherOrReceiptNo || 'VOU-PREVIEW'
  const payee = voucher.payee || voucher.partyName || 'Payee / Recipient'
  const category = voucher.category || 'Disbursement'
  const date = voucher.paymentDate || voucher.date || new Date().toISOString().substring(0, 10)
  const branch = voucher.branch || 'Peshawar'
  const method = voucher.paymentType || voucher.paymentMethod || 'Cash Payment'
  const amount = Number(voucher.amount || 0)
  const refInvoice = voucher.refInvoiceNo || 'N/A'
  const description = voucher.description || 'Payment Out Voucher'
  const disbursedBy = voucher.disbursedBy || voucher.user || 'Authorized Staff'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payment Voucher ${voucherNo} - Medimage Services ERP</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1e293b; background: #fff; margin: 0; }
          .voucher-box { max-width: 780px; margin: auto; border: 2px solid #dc2626; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
          .header { border-bottom: 2px solid #dc2626; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; }
          .brand { font-size: 22px; font-weight: 800; color: #b91c1c; letter-spacing: -0.5px; }
          .brand-tag { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-top: 2px; }
          .title-tag { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 13px; display: inline-block; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin: 15px 0; font-size: 12px; }
          .meta-item { margin-bottom: 4px; }
          .meta-label { color: #64748b; font-weight: 600; }
          .meta-val { font-weight: 700; color: #0f172a; }
          .amount-card { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
          .amount-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9; }
          .amount-val { font-size: 26px; font-weight: 900; font-family: monospace; }
          .desc-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; font-size: 12px; margin-top: 12px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 45px; padding-top: 15px; font-size: 11px; }
          .sig-box { width: 190px; border-top: 1px solid #94a3b8; text-align: center; padding-top: 6px; color: #475569; font-weight: 600; }
          .footer-note { margin-top: 25px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="voucher-box">
          <div class="no-print" style="text-align: right; margin-bottom: 12px;">
            <button onclick="window.print()" style="background: #dc2626; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Payment Voucher</button>
          </div>

          <div class="header">
            <div>
              <div class="brand">MEDIMAGE SERVICES</div>
              <div class="brand-tag">Medical & Aesthetic Laser Equipment ERP</div>
              <div style="font-size: 11px; color: #475569; margin-top: 3px;">Peshawar HO • Multan • Lahore Depots</div>
            </div>
            <div style="text-align: right;">
              <div class="title-tag">💸 PAYMENT OUT VOUCHER</div>
              <div style="font-family: monospace; font-size: 14px; font-weight: 800; color: #b91c1c; margin-top: 4px;">${voucherNo}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <div class="meta-item"><span class="meta-label">Paid To (Payee):</span> <span class="meta-val">${payee}</span></div>
              <div class="meta-item"><span class="meta-label">Outflow Category:</span> <span class="meta-val">${category}</span></div>
              <div class="meta-item"><span class="meta-label">Disbursing Branch:</span> <span class="meta-val">${branch}</span></div>
              <div class="meta-item"><span class="meta-label">Payment Method:</span> <span class="meta-val">${method}</span></div>
            </div>
            <div>
              <div class="meta-item"><span class="meta-label">Voucher Date:</span> <span class="meta-val font-mono">${date}</span></div>
              <div class="meta-item"><span class="meta-label">Disbursed By:</span> <span class="meta-val">${disbursedBy}</span></div>
              <div class="meta-item"><span class="meta-label">Ref Document / PO / Return:</span> <span class="meta-val font-mono">${refInvoice}</span></div>
              <div class="meta-item"><span class="meta-label">Status:</span> <span class="meta-val" style="color: #dc2626;">Disbursed & Debited</span></div>
            </div>
          </div>

          <div class="amount-card">
            <div>
              <div class="amount-label">Disbursement Amount</div>
              <div style="font-size: 11px; opacity: 0.85;">Official Cash Flow Outflow</div>
            </div>
            <div class="amount-val">PKR ${amount.toLocaleString()}</div>
          </div>

          <div class="desc-card">
            <div style="font-weight: bold; color: #334155; margin-bottom: 3px;">Reason & Purpose of Outflow / Remarks:</div>
            <div style="color: #475569;">${description}</div>
          </div>

          <div class="signatures">
            <div class="sig-box">Prepared By</div>
            <div class="sig-box">Approved By (Management)</div>
            <div class="sig-box">Payee / Recipient Signature</div>
          </div>

          <div class="footer-note">
            Medimage Services ERP System • Valid Computer Generated Disbursement Voucher • NTN: 7291823-1
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * UNIFIED ERP REPORT GENERATOR & EXPORTER (ALL 8 REPORT TYPES)
 * ══════════════════════════════════════════════════════════════════════════════
 */
export const ERP_REPORT_TYPES = [
  { id: 'sales', name: 'Sales & Invoices Report', icon: 'ShoppingCart', description: 'Complete sales invoices, customer details, revenue & payment statuses', color: 'blue' },
  { id: 'payment_in', name: 'Payment In Collections Report', icon: 'Receipt', description: 'Inflow receipts, customer bank/cash vouchers & machine serial allocations', color: 'emerald' },
  { id: 'payment_out', name: 'Payment Out / Expenses Report', icon: 'DollarSign', description: 'Outflow vouchers, supplier disbursements, vendor debits & expense breakdown', color: 'amber' },
  { id: 'inventory', name: 'Stock & Inventory Valuation Report', icon: 'Package', description: 'Warehouse stock balances, product SKUs, landing costs & retail valuations', color: 'indigo' },
  { id: 'credit', name: 'Customer Credit & Ledger Aging Report', icon: 'ShieldAlert', description: 'Customer credit limits, headroom exposure, balance dues & overdue tracking', color: 'purple' },
  { id: 'containers', name: 'Containers & Import BL Closing Report', icon: 'Truck', description: 'Inbound port shipments, machine counts, supplier invoices & landing costs', color: 'teal' },
  { id: 'serials', name: 'Machine Serial Registry & Journey Report', icon: 'QrCode', description: 'Individual machine serial codes, depot allocations, customer ownership & warranties', color: 'rose' },
  { id: 'profit', name: 'Executive P&L & Profit Margin Report', icon: 'TrendingUp', description: 'Gross revenue, COGS, gross margins, net collections vs disbursements', color: 'cyan' }
]

export function getERPReportDefinition(reportType, dataStore, options = {}) {
  const now = new Date().toLocaleString()
  const branchFilter = options.branch || 'ALL'
  const searchFilter = (options.search || '').toLowerCase().trim()
  const productFilter = options.product || 'ALL'

  switch (reportType) {
    case 'sales': {
      let invoices = (dataStore.salesInvoices || [])
      if (branchFilter !== 'ALL') {
        invoices = invoices.filter(i => (i.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }
      if (productFilter !== 'ALL') {
        const prodTarget = productFilter.toLowerCase()
        invoices = invoices.filter(i => (i.items || []).some(it => 
          (it.sku && it.sku.toLowerCase() === prodTarget) ||
          (it.productId && it.productId === productFilter) ||
          (it.productName && it.productName.toLowerCase().includes(prodTarget))
        ))
      }
      if (searchFilter) {
        invoices = invoices.filter(i => 
          (i.invoiceNo || '').toLowerCase().includes(searchFilter) ||
          (i.customer || '').toLowerCase().includes(searchFilter) ||
          (i.blNumber || '').toLowerCase().includes(searchFilter)
        )
      }

      const totalRevenue = invoices.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0)
      const totalPaid = invoices.reduce((sum, i) => sum + (Number(i.paidAmount) || 0), 0)
      const totalBalance = Math.max(0, totalRevenue - totalPaid)

      const columns = [
        'Invoice #',
        'Sale Date',
        'Delivery Date',
        'Customer Name',
        'Branch',
        'Inbound BL #',
        'Items Sold & Serials',
        'Grand Total (PKR)',
        'Paid Amount (PKR)',
        'Balance Due (PKR)',
        'Payment Method',
        'Status'
      ]

      const rows = invoices.map(i => [
        i.invoiceNo,
        i.saleDate || i.date || 'N/A',
        i.deliveryDate || i.saleDate || 'N/A',
        i.customer || 'Unknown Customer',
        i.branch || 'Peshawar',
        i.blNumber || 'SENDNB2606060',
        (i.items || []).map(it => `${it.qty}x ${it.productName || it.sku} ${it.serials?.length ? `(${it.serials.join(', ')})` : ''}`).join(' | '),
        Number(i.grandTotal || 0),
        Number(i.paidAmount || 0),
        Math.max(0, (Number(i.grandTotal) || 0) - (Number(i.paidAmount) || 0)),
        i.paymentMethod || 'Credit Terms',
        (Number(i.paidAmount) >= Number(i.grandTotal)) ? 'Fully Paid' : (Number(i.paidAmount) > 0 ? 'Partially Paid' : 'Unpaid Due')
      ])

      return {
        title: 'Sales & Outbound POS Invoices Report',
        filename: `sales_invoices_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Commercial Sales & Outbound Invoicing',
          'Total Invoices': `${invoices.length} Orders`,
          'Gross Revenue': `PKR ${totalRevenue.toLocaleString()}`,
          'Total Collected': `PKR ${totalPaid.toLocaleString()}`,
          'Outstanding Receivable': `PKR ${totalBalance.toLocaleString()}`,
          'Branch Scope': branchFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalRevenue, totalPaid, totalBalance, count: invoices.length }
      }
    }

    case 'payment_in': {
      let receipts = (dataStore.paymentReceipts || [])
      if (branchFilter !== 'ALL') {
        receipts = receipts.filter(r => (r.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }
      if (productFilter !== 'ALL') {
        const prodTarget = productFilter.toLowerCase()
        receipts = receipts.filter(r => (r.paidSerials || []).some(s => 
          (s.sku && s.sku.toLowerCase() === prodTarget) ||
          (s.machineCode && s.machineCode.toLowerCase().includes(prodTarget)) ||
          (s.serialCode && s.serialCode.toLowerCase().includes(prodTarget))
        ))
      }
      if (searchFilter) {
        receipts = receipts.filter(r => 
          (r.receiptNo || '').toLowerCase().includes(searchFilter) ||
          (r.customer || '').toLowerCase().includes(searchFilter) ||
          (r.description || '').toLowerCase().includes(searchFilter)
        )
      }

      const totalCollected = receipts.reduce((sum, r) => sum + (Number(r.amount || r.amountReceived) || 0), 0)

      const columns = [
        'Receipt #',
        'Date',
        'Customer Name',
        'Payment Mode',
        'Branch Depot',
        'Allocated Machine Serials',
        'Amount Received (PKR)',
        'Description / Notes'
      ]

      const rows = receipts.map(r => [
        r.receiptNo,
        r.paymentDate || r.date || 'N/A',
        r.customer || 'Customer Account',
        r.paymentType || r.paymentMethod || 'Cash Payment',
        r.branch || 'Peshawar',
        (r.paidSerials || []).map(s => `${s.machineCode || ''} (${s.serialCode || ''})`).join(', ') || 'General Account Credit',
        Number(r.amount || r.amountReceived || 0),
        r.description || 'Payment In Inflow'
      ])

      return {
        title: 'Payment In Collections & Receipts Report',
        filename: `payment_in_receipts_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Inflow Cash & Bank Collections',
          'Total Receipts': `${receipts.length} Vouchers`,
          'Total Cash Inflow': `PKR ${totalCollected.toLocaleString()}`,
          'Branch Filter': branchFilter,
          'Product Filter': productFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalCollected, count: receipts.length }
      }
    }

    case 'payment_out': {
      let vouchers = (dataStore.paymentOutVouchers || [])
      if (branchFilter !== 'ALL') {
        vouchers = vouchers.filter(v => (v.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }
      if (searchFilter) {
        vouchers = vouchers.filter(v => 
          (v.voucherNo || '').toLowerCase().includes(searchFilter) ||
          (v.payee || '').toLowerCase().includes(searchFilter) ||
          (v.category || '').toLowerCase().includes(searchFilter) ||
          (v.description || '').toLowerCase().includes(searchFilter)
        )
      }

      const totalOutflow = vouchers.reduce((sum, v) => sum + (Number(v.amount) || 0), 0)

      const columns = [
        'Voucher #',
        'Date',
        'Payee / Recipient',
        'Expense Category',
        'Payment Method',
        'Disbursing Branch',
        'Amount Disbursed (PKR)',
        'Reference Doc / PO',
        'Reason / Description'
      ]

      const rows = vouchers.map(v => [
        v.voucherNo,
        v.paymentDate || v.date || 'N/A',
        v.payee || 'Supplier / Vendor',
        v.category || 'General Disbursement',
        v.paymentType || 'Cash Payment',
        v.branch || 'Peshawar',
        Number(v.amount || 0),
        v.refInvoiceNo || 'N/A',
        v.description || 'Official Outflow Voucher'
      ])

      return {
        title: 'Payment Out & Expense Disbursements Report',
        filename: `payment_out_expenses_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Outflow Expenditures & Vendor Payouts',
          'Total Vouchers': `${vouchers.length} Records`,
          'Total Outflow': `PKR ${totalOutflow.toLocaleString()}`,
          'Branch Filter': branchFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalOutflow, count: vouchers.length }
      }
    }

    case 'inventory': {
      let prods = (dataStore.products || [])
      if (productFilter !== 'ALL') {
        prods = prods.filter(p => (p.id === productFilter || p._id === productFilter || p.sku === productFilter || p.name === productFilter))
      }
      if (searchFilter) {
        prods = prods.filter(p => 
          (p.name || '').toLowerCase().includes(searchFilter) ||
          (p.sku || '').toLowerCase().includes(searchFilter) ||
          (p.category || '').toLowerCase().includes(searchFilter)
        )
      }

      const totalStock = prods.reduce((sum, p) => sum + (Number(p.stockQty) || 0), 0)
      const totalCostValuation = prods.reduce((sum, p) => sum + ((Number(p.stockQty) || 0) * (Number(p.costPrice) || 0)), 0)
      const totalRetailValuation = prods.reduce((sum, p) => sum + ((Number(p.stockQty) || 0) * (Number(p.sellingPrice) || 0)), 0)

      const columns = [
        'SKU Code',
        'Product / Equipment Name',
        'Category',
        'Stock Qty (Units)',
        'Unit Cost (PKR)',
        'Selling Price (PKR)',
        'Total Cost Valuation (PKR)',
        'Total Retail Valuation (PKR)',
        'Stock Health'
      ]

      const rows = prods.map(p => {
        const qty = Number(p.stockQty || 0)
        const cost = Number(p.costPrice || 0)
        const sell = Number(p.sellingPrice || 0)
        return [
          p.sku || 'N/A',
          p.name || 'Medical Equipment',
          p.category || 'Ultrasound / Laser',
          qty,
          cost,
          sell,
          qty * cost,
          qty * sell,
          qty <= 2 ? 'LOW STOCK ALERT' : (qty <= 5 ? 'Reorder Warning' : 'Optimal Stock')
        ]
      })

      return {
        title: 'Product Stock & Inventory Valuation Report',
        filename: `inventory_stock_valuation_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Warehouse Inventory & Asset Valuation',
          'Total SKUs': `${prods.length} Products`,
          'Total Machines In-Stock': `${totalStock} Units`,
          'Total Cost Valuation': `PKR ${totalCostValuation.toLocaleString()}`,
          'Total Retail Valuation': `PKR ${totalRetailValuation.toLocaleString()}`,
          'Product Filter': productFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalStock, totalCostValuation, totalRetailValuation, count: prods.length }
      }
    }

    case 'credit': {
      let custs = (dataStore.customers || [])
      if (branchFilter !== 'ALL') {
        custs = custs.filter(c => (c.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }
      if (searchFilter) {
        custs = custs.filter(c => 
          (c.name || '').toLowerCase().includes(searchFilter) ||
          (c.category || '').toLowerCase().includes(searchFilter) ||
          (c.phone || '').toLowerCase().includes(searchFilter)
        )
      }

      let totalLimitAll = 0
      let totalExposureAll = 0
      let totalRemainingAll = 0

      const columns = [
        'Customer Name',
        'Category Tier',
        'Branch',
        'Credit Limit (PKR)',
        'Current Outstanding (PKR)',
        'Available Headroom (PKR)',
        'Exposure Ratio %',
        'Allowed Terms (Days)',
        'Max Overdue Days',
        'Credit Status'
      ]

      const rows = custs.map(c => {
        const st = dataStore.getCustomerCreditStatus ? dataStore.getCustomerCreditStatus(c.name, 0) : {}
        const limit = Number(st.creditLimit || c.baseCreditLimit || 2000000)
        const outstanding = Number(st.outstanding || 0)
        const remaining = Math.max(0, limit - outstanding)
        const pct = limit > 0 ? Number(((outstanding / limit) * 100).toFixed(1)) : 0
        const overdueDays = Number(st.maxOverdueDays || 0)

        totalLimitAll += limit
        totalExposureAll += outstanding
        totalRemainingAll += remaining

        return [
          c.name,
          `Tier ${c.categoryCode || c.category || 'C'}`,
          c.branch || 'Peshawar',
          limit,
          outstanding,
          remaining,
          `${pct}%`,
          c.paymentDays || c.allowedDays || 30,
          overdueDays,
          st.status === 'locked' ? 'LOCKED' : (pct >= 90 ? 'CRITICAL (90%)' : (pct >= 75 ? 'WARNING (75%)' : 'NORMAL (SAFE)'))
        ]
      })

      return {
        title: 'Customer Credit Governance & Outstanding Aging Report',
        filename: `customer_credit_governance_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Accounts Receivable & Credit Risk Control',
          'Total Accounts': `${custs.length} Customers`,
          'Assigned Credit Limits': `PKR ${totalLimitAll.toLocaleString()}`,
          'Total Active Receivables': `PKR ${totalExposureAll.toLocaleString()}`,
          'Total Headroom Remaining': `PKR ${totalRemainingAll.toLocaleString()}`,
          'Branch Scope': branchFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalLimitAll, totalExposureAll, totalRemainingAll, count: custs.length }
      }
    }

    case 'containers': {
      let blList = (dataStore.blList || dataStore.containers || [])
      if (branchFilter !== 'ALL') {
        blList = blList.filter(b => (b.branch || b.destinationCity || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }
      if (searchFilter) {
        blList = blList.filter(b => 
          (b.blNumber || '').toLowerCase().includes(searchFilter) ||
          (b.supplierName || '').toLowerCase().includes(searchFilter) ||
          (b.containerNo || '').toLowerCase().includes(searchFilter)
        )
      }
      const totalLanding = blList.reduce((sum, b) => sum + (Number(b.landingCost) || 0), 0)

      const columns = [
        'BL / Container #',
        'Supplier / Shipper',
        'Arrival / Receiving Date',
        'Destination Depot',
        'Total Machines (Units)',
        'Sold Units',
        'In-Stock Available',
        'Landing Cost (PKR)',
        'BL Status'
      ]

      const rows = blList.map(b => [
        b.blNumber || b.containerNo,
        b.supplierName || b.companyName || 'Import Supplier',
        b.receivingDate || b.arrivalDate || 'N/A',
        b.branch || b.destinationCity || 'Peshawar',
        Number(b.totalUnits || 0),
        Number(b.soldUnits || 0),
        Number(b.availableUnits || 0),
        Number(b.landingCost || 0),
        b.blStatus || b.status || 'Active'
      ])

      return {
        title: 'Containers & Import Bill of Lading (BL) Report',
        filename: `containers_bl_import_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Import Consignments & BL Clearances',
          'Total Shipments': `${blList.length} Consignments`,
          'Total Landing Cost': `PKR ${totalLanding.toLocaleString()}`,
          'Branch Scope': branchFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalLanding, count: blList.length }
      }
    }

    case 'serials': {
      let serialsList = (dataStore.serials || [])
      if (branchFilter !== 'ALL') {
        serialsList = serialsList.filter(s => (s.allocationCity || s.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }
      if (productFilter !== 'ALL') {
        const prodTarget = productFilter.toLowerCase()
        serialsList = serialsList.filter(s => 
          (s.sku && s.sku.toLowerCase() === prodTarget) ||
          (s.productId && s.productId === productFilter) ||
          (s.productName && s.productName.toLowerCase().includes(prodTarget))
        )
      }
      if (searchFilter) {
        serialsList = serialsList.filter(s => 
          (s.serialCode || '').toLowerCase().includes(searchFilter) ||
          (s.machineCode || '').toLowerCase().includes(searchFilter) ||
          (s.productName || '').toLowerCase().includes(searchFilter) ||
          (s.customer || '').toLowerCase().includes(searchFilter)
        )
      }

      const columns = [
        'Machine Code',
        'Unique Serial Number',
        'Product / Equipment Name',
        'Current Status',
        'Depot Location',
        'Allocated Customer',
        'Invoice Ref',
        'Sale Date',
        'Payment Status'
      ]

      const rows = serialsList.map(s => [
        s.machineCode || 'N/A',
        (s.serialCode || '').replace(/^SN-/i, ''),
        s.productName || s.sku || 'Equipment System',
        s.status || 'In Stock',
        s.allocationCity || s.branch || 'Peshawar',
        s.customer || 'Unallocated Inventory',
        s.invoiceNo || 'N/A',
        s.saleDate || s.unpaidDate || 'N/A',
        s.paymentStatus || (s.status === 'Sold' ? 'Paid / Partial' : 'In Warehouse')
      ])

      return {
        title: 'Machine Serial Number Registry & Journey Report',
        filename: `serial_number_registry_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Unit-Level Serial Traceability',
          'Total Registered Machines': `${serialsList.length} Units`,
          'Branch Scope': branchFilter,
          'Product Filter': productFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { count: serialsList.length }
      }
    }

    case 'profit':
    default: {
      let sales = dataStore.salesInvoices || []
      let receipts = dataStore.paymentReceipts || []
      let vouchers = dataStore.paymentOutVouchers || []
      let products = dataStore.products || []

      if (branchFilter !== 'ALL') {
        sales = sales.filter(i => (i.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
        receipts = receipts.filter(r => (r.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
        vouchers = vouchers.filter(v => (v.branch || 'Peshawar').toUpperCase() === branchFilter.toUpperCase())
      }

      if (productFilter !== 'ALL') {
        const prodTarget = productFilter.toLowerCase()
        sales = sales.filter(i => (i.items || []).some(it => 
          (it.sku && it.sku.toLowerCase() === prodTarget) ||
          (it.productId && it.productId === productFilter) ||
          (it.productName && it.productName.toLowerCase().includes(prodTarget))
        ))
        products = products.filter(p => (p.id === productFilter || p._id === productFilter || p.sku === productFilter || p.name === productFilter))
      }

      const totalRevenue = sales.reduce((sum, i) => sum + (Number(i.grandTotal) || 0), 0)
      const totalCogs = products.reduce((sum, p) => sum + ((Number(p.soldQty) || 1) * (Number(p.costPrice) || 0)), 0)
      const grossProfit = Math.max(0, totalRevenue - totalCogs)
      const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0
      const totalCollections = receipts.reduce((sum, r) => sum + (Number(r.amount || r.amountReceived) || 0), 0)
      const totalExpenses = vouchers.reduce((sum, v) => sum + (Number(v.amount) || 0), 0)
      const netCashFlow = totalCollections - totalExpenses

      const columns = [
        'Financial Statement Line Item',
        'Category',
        'Amount (PKR)',
        'Contribution %',
        'Audit Notes'
      ]

      const rows = [
        ['Gross Sales Invoiced Revenue', 'Operating Inflow', totalRevenue, '100.0%', `${sales.length} Sales Invoices Issued`],
        ['Cost of Goods Sold (COGS)', 'Operating Direct Cost', totalCogs, `${totalRevenue > 0 ? ((totalCogs / totalRevenue) * 100).toFixed(1) : 0}%`, 'Equipment import landing & unit cost'],
        ['Gross Operating Profit', 'Gross Margin', grossProfit, `${grossMarginPct}%`, 'Revenue less COGS direct cost'],
        ['Total Cash & Bank Collections', 'Realized Inflow', totalCollections, `${totalRevenue > 0 ? ((totalCollections / totalRevenue) * 100).toFixed(1) : 0}%`, `${receipts.length} Customer receipts settled`],
        ['Total Expense Disbursements', 'Operating Outflow', totalExpenses, `${totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : 0}%`, `${vouchers.length} Payment Out vouchers cleared`],
        ['Net Cash Flow Position', 'Net Liquidity', netCashFlow, 'N/A', netCashFlow >= 0 ? 'Surplus Cash Flow' : 'Deficit Cash Flow']
      ]

      return {
        title: 'Executive Financial Performance & Profit Margin Report',
        filename: `executive_financial_pnl_report_${new Date().toISOString().substring(0, 10)}`,
        metadata: {
          'Report Category': 'Executive P&L and Margin Performance',
          'Total Gross Revenue': `PKR ${totalRevenue.toLocaleString()}`,
          'Gross Operating Profit': `PKR ${grossProfit.toLocaleString()}`,
          'Gross Margin Ratio': `${grossMarginPct}%`,
          'Net Cash Flow': `PKR ${netCashFlow.toLocaleString()}`,
          'Branch Scope': branchFilter,
          'Product Filter': productFilter,
          'Generated At': now
        },
        columns,
        rows,
        summary: { totalRevenue, totalCogs, grossProfit, grossMarginPct, totalCollections, totalExpenses, netCashFlow }
      }
    }
  }
}

export function exportUnifiedReport(reportType, format = 'xlsx', dataStore, options = {}) {
  const reportDef = getERPReportDefinition(reportType, dataStore, options)

  switch (format.toLowerCase()) {
    case 'print':
      exportPrint(reportDef.title, reportDef.metadata, reportDef.columns, reportDef.rows)
      break
    case 'pdf':
      exportPDF(reportDef.title, reportDef.metadata, reportDef.columns, reportDef.rows, `${reportDef.filename}.pdf`)
      break
    case 'word':
    case 'docx':
      exportWord(reportDef.title, reportDef.metadata, reportDef.columns, reportDef.rows, `${reportDef.filename}.docx`)
      break
    case 'csv':
      exportCSV(reportDef.columns, reportDef.rows, `${reportDef.filename}.csv`)
      break
    case 'xlsx':
    case 'excel':
    default:
      exportXLSX(reportDef.title, reportDef.metadata, reportDef.columns, reportDef.rows, `${reportDef.filename}.xlsx`)
      break
  }
}



