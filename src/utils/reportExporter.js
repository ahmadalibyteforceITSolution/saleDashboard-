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
