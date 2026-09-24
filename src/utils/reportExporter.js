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

