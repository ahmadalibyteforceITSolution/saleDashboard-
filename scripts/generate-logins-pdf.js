import fs from 'fs'
import path from 'path'
import PDFDocument from 'pdfkit'

const doc = new PDFDocument({
  size: 'A4',
  margin: 40
})

const outputPath = path.resolve(process.cwd(), 'Medical_Equipment_ERP_All_Logins.pdf')
const writeStream = fs.createWriteStream(outputPath)
doc.pipe(writeStream)

// ── Colors ──
const primaryColor = '#4f46e5'
const secondaryColor = '#0f172a'
const purpleColor = '#9333ea'
const greenColor = '#059669'
const slateText = '#475569'
const lightBg = '#f8fafc'
const borderCol = '#e2e8f0'

// ── Header Banner ──
doc.rect(40, 40, 515, 60).fill('#1e1b4b')
doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('MEDICAL EQUIPMENT ERP SYSTEM', 55, 52)
doc.fillColor('#a5b4fc').fontSize(10).font('Helvetica').text('Official System Logins & Organizational Hierarchy Directory', 55, 76)

doc.moveDown(3)

// ── Section 1: Peshawar HQ ──
doc.fillColor(purpleColor).fontSize(13).font('Helvetica-Bold').text('1. PESHAWAR HEAD OFFICE — SOLE SUPERADMIN HQ', 40, 120)
doc.fillColor(slateText).fontSize(8.5).font('Helvetica').text('Master authority over all branches, financial reconciliations, stock transfers, and audit logs.', 40, 136)

drawTable(150, [
  { name: 'Alexander Sterling', role: 'SuperAdmin (Level 4 - Primary Owner)', email: 'superadmin@nexis.com', pass: 'superadmin123', branch: 'Peshawar HQ' }
], purpleColor)

// ── Section 2: Lahore Branch ──
doc.fillColor(primaryColor).fontSize(13).font('Helvetica-Bold').text('2. LAHORE BRANCH DEPOT — SALES TEAM & STORE ADMIN', 40, 215)
doc.fillColor(slateText).fontSize(8.5).font('Helvetica').text('Punjab North regional equipment sales, warehousing & ultrasound department.', 40, 231)

drawTable(245, [
  { name: 'Marcus Vance', role: 'Senior Sales Executive (POS & Field)', email: 'sales@nexis.com', pass: 'sales123', branch: 'Lahore' },
  { name: 'Usman Tariq', role: 'Ultrasound Sales Officer', email: 'sales.lahore2@nexis.com', pass: 'sales123', branch: 'Lahore' },
  { name: 'Sarah Jenkins', role: 'Store Admin (Inventory & POs)', email: 'admin@nexis.com', pass: 'admin123', branch: 'Lahore' },
  { name: 'Hamza Rasheed', role: 'Branch Accountant', email: 'accountant.lahore@nexis.com', pass: 'accountant123', branch: 'Lahore' }
], primaryColor)

// ── Section 3: Multan Branch ──
doc.fillColor(greenColor).fontSize(13).font('Helvetica-Bold').text('3. MULTAN BRANCH DEPOT — SALES TEAM & 35M+ CONTAINER HUB', 40, 395)
doc.fillColor(slateText).fontSize(8.5).font('Helvetica').text('Punjab South sales force, laser equipment & container import accounting.', 40, 411)

drawTable(425, [
  { name: 'Bilal Khan', role: 'Senior Sales Executive', email: 'sales.multan@nexis.com', pass: 'sales123', branch: 'Multan' },
  { name: 'Farhan Ali', role: 'Aesthetic Laser Sales Officer', email: 'sales.multan2@nexis.com', pass: 'sales123', branch: 'Multan' },
  { name: 'Tariq Mahmood', role: 'Chief Accountant & Container Controller', email: 'accountant@nexis.com', pass: 'accountant123', branch: 'Multan' },
  { name: 'Ayesha Malik', role: 'Store Admin (Inventory & POs)', email: 'admin.multan@nexis.com', pass: 'admin123', branch: 'Multan' }
], greenColor)

// ── Section 4: Karachi & Islamabad Coastal / Capital ──
doc.fillColor('#0284c7').fontSize(13).font('Helvetica-Bold').text('4. REGIONAL BRANCH DEPOTS — KARACHI & ISLAMABAD SALES', 40, 575)
doc.fillColor(slateText).fontSize(8.5).font('Helvetica').text('Specialized territory sales leads for hospital accounts & maritime logistics.', 40, 591)

drawTable(605, [
  { name: 'Zubair Ahmed', role: 'Regional Sales Lead (Coastal)', email: 'sales.karachi@nexis.com', pass: 'sales123', branch: 'Karachi' },
  { name: 'Haris Nawaz', role: 'Key Accounts Sales Lead (Federal)', email: 'sales.islamabad@nexis.com', pass: 'sales123', branch: 'Islamabad' }
], '#0284c7')

// ── Footer ──
doc.rect(40, 755, 515, 30).fill('#f1f5f9')
doc.fillColor('#64748b').fontSize(8).font('Helvetica').text('Protected by Medical Equipment ERP Security Protocol v4.2 • Single SuperAdmin in Peshawar & Multi-City Sales Force', 45, 765, { align: 'center', width: 505 })

// Helper Table Drawer
function drawTable(startY, rows, themeCol) {
  const colWidths = [120, 140, 135, 75, 45]
  const colX = [40, 160, 300, 435, 510]
  const headers = ['NAME', 'ROLE / DESIGNATION', 'EMAIL ADDRESS', 'PASSWORD', 'BRANCH']

  // Header row
  doc.rect(40, startY, 515, 18).fill('#e2e8f0')
  doc.fillColor('#1e293b').fontSize(7.5).font('Helvetica-Bold')
  headers.forEach((h, i) => {
    doc.text(h, colX[i] + 4, startY + 5)
  })

  let currentY = startY + 18

  rows.forEach((r, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc'
    doc.rect(40, currentY, 515, 18).fill(rowBg)
    doc.rect(40, currentY, 515, 18).stroke('#e2e8f0')

    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(r.name, colX[0] + 4, currentY + 5, { width: 115, lineBreak: false })
    doc.fillColor('#334155').fontSize(7.5).font('Helvetica').text(r.role, colX[1] + 4, currentY + 5, { width: 135, lineBreak: false })
    doc.fillColor(themeCol).fontSize(7.5).font('Helvetica-Bold').text(r.email, colX[2] + 4, currentY + 5, { width: 130, lineBreak: false })
    doc.fillColor('#0f172a').fontSize(8).font('Helvetica-Bold').text(r.pass, colX[3] + 4, currentY + 5, { width: 70, lineBreak: false })
    doc.fillColor('#64748b').fontSize(7.5).font('Helvetica').text(r.branch, colX[4] + 4, currentY + 5, { width: 45, lineBreak: false })

    currentY += 18
  })
}

doc.end()

writeStream.on('finish', () => {
  console.log('PDF generated successfully at:', outputPath)
})
