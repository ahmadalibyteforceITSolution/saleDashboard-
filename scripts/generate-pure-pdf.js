import fs from 'fs'
import path from 'path'

// Pure Node.js PDF 1.4 generator for SuperAdmin & Sales Person Exclusive Hierarchy
function buildPdf() {
  const content = []
  
  function addText(text, x, y, size = 10, font = 'F1', r = 0, g = 0, b = 0) {
    const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
    content.push(`BT /${font} ${size} Tf ${r} ${g} ${b} rg ${x} ${y} Td (${escaped}) Tj ET`)
  }

  function addRect(x, y, w, h, r = 0.9, g = 0.9, b = 0.9, fill = true, stroke = false) {
    if (fill && stroke) {
      content.push(`${r} ${g} ${b} rg 0.8 0.8 0.8 RG ${x} ${y} ${w} ${h} re B`)
    } else if (fill) {
      content.push(`${r} ${g} ${b} rg ${x} ${y} ${w} ${h} re f`)
    } else {
      content.push(`0.8 0.8 0.8 RG ${x} ${y} ${w} ${h} re S`)
    }
  }

  // Header Banner
  addRect(40, 740, 515, 60, 0.12, 0.11, 0.29) // #1e1b4b
  addText('MEDICAL EQUIPMENT ERP SOFTWARE', 55, 775, 16, 'F2', 1, 1, 1)
  addText('Exclusive Two-Tier System Directory: 1 SuperAdmin (Peshawar HQ) & Multi-City Sales Force', 55, 755, 8.5, 'F1', 0.7, 0.75, 1)

  // Section 1: Peshawar HQ (Sole SuperAdmin)
  addText('1. PESHAWAR HEAD OFFICE — SOLE SUPERADMIN MASTER HQ', 40, 710, 11, 'F2', 0.5, 0.15, 0.8)
  addText('Central command authority over all city depots, financial reconciliations & governance.', 40, 698, 8, 'F1', 0.4, 0.4, 0.4)

  // Peshawar Table
  addRect(40, 665, 515, 18, 0.92, 0.9, 0.98)
  addText('STAFF NAME', 45, 670, 8, 'F2', 0.2, 0.2, 0.3)
  addText('SYSTEM ROLE', 160, 670, 8, 'F2', 0.2, 0.2, 0.3)
  addText('OFFICIAL EMAIL', 310, 670, 8, 'F2', 0.2, 0.2, 0.3)
  addText('PASSWORD', 435, 670, 8, 'F2', 0.2, 0.2, 0.3)
  addText('BRANCH', 505, 670, 8, 'F2', 0.2, 0.2, 0.3)

  addRect(40, 645, 515, 20, 1, 1, 1, true, true)
  addText('Alexander Sterling', 45, 650, 8.5, 'F2', 0.1, 0.1, 0.1)
  addText('Sole SuperAdmin & Global COO', 160, 650, 8, 'F1', 0.3, 0.3, 0.3)
  addText('superadmin@nexis.com', 310, 650, 8, 'F2', 0.5, 0.15, 0.8)
  addText('superadmin123', 435, 650, 8.5, 'F2', 0.1, 0.1, 0.1)
  addText('Peshawar HQ', 505, 650, 8, 'F1', 0.4, 0.4, 0.4)

  // Section 2: Lahore Branch Sales Persons
  addText('2. LAHORE BRANCH DEPOT — SALES FORCE (EQUAL RIGHTS)', 40, 615, 11, 'F2', 0.15, 0.35, 0.9)
  addText('Punjab North regional sales team with full POS & inventory rights.', 40, 603, 8, 'F1', 0.4, 0.4, 0.4)

  addRect(40, 575, 515, 18, 0.9, 0.93, 0.98)
  addText('STAFF NAME', 45, 580, 8, 'F2', 0.2, 0.2, 0.3)
  addText('SYSTEM ROLE', 160, 580, 8, 'F2', 0.2, 0.2, 0.3)
  addText('OFFICIAL EMAIL', 310, 580, 8, 'F2', 0.2, 0.2, 0.3)
  addText('PASSWORD', 435, 580, 8, 'F2', 0.2, 0.2, 0.3)
  addText('BRANCH', 505, 580, 8, 'F2', 0.2, 0.2, 0.3)

  const lahoreRows = [
    { name: 'Marcus Vance', role: 'Sales Person / Sales Executive', email: 'sales@nexis.com', pass: 'sales123', branch: 'Lahore' },
    { name: 'Usman Tariq', role: 'Sales Person / Sales Executive', email: 'sales.lahore2@nexis.com', pass: 'sales123', branch: 'Lahore' }
  ]

  let yL = 555
  lahoreRows.forEach((r, i) => {
    addRect(40, yL, 515, 20, i % 2 === 0 ? 1 : 0.97, i % 2 === 0 ? 1 : 0.98, i % 2 === 0 ? 1 : 1, true, true)
    addText(r.name, 45, yL + 5, 8.5, 'F2', 0.1, 0.1, 0.1)
    addText(r.role, 160, yL + 5, 8, 'F1', 0.3, 0.3, 0.3)
    addText(r.email, 310, yL + 5, 8, 'F2', 0.15, 0.35, 0.9)
    addText(r.pass, 435, yL + 5, 8.5, 'F2', 0.1, 0.1, 0.1)
    addText(r.branch, 505, yL + 5, 8, 'F1', 0.4, 0.4, 0.4)
    yL -= 20
  })

  // Section 3: Multan Branch Sales Persons
  addText('3. MULTAN BRANCH DEPOT — SALES FORCE (EQUAL RIGHTS)', 40, yL - 15, 11, 'F2', 0.05, 0.6, 0.4)
  addText('Punjab South regional sales team with full POS & inventory rights.', 40, yL - 27, 8, 'F1', 0.4, 0.4, 0.4)

  yL -= 50
  addRect(40, yL, 515, 18, 0.9, 0.97, 0.93)
  addText('STAFF NAME', 45, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('SYSTEM ROLE', 160, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('OFFICIAL EMAIL', 310, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('PASSWORD', 435, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('BRANCH', 505, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)

  const multanRows = [
    { name: 'Bilal Khan', role: 'Sales Person / Sales Executive', email: 'sales.multan@nexis.com', pass: 'sales123', branch: 'Multan' },
    { name: 'Farhan Ali', role: 'Sales Person / Sales Executive', email: 'sales.multan2@nexis.com', pass: 'sales123', branch: 'Multan' }
  ]

  yL -= 20
  multanRows.forEach((r, i) => {
    addRect(40, yL, 515, 20, i % 2 === 0 ? 1 : 0.96, i % 2 === 0 ? 1 : 0.99, i % 2 === 0 ? 1 : 0.97, true, true)
    addText(r.name, 45, yL + 5, 8.5, 'F2', 0.1, 0.1, 0.1)
    addText(r.role, 160, yL + 5, 8, 'F1', 0.3, 0.3, 0.3)
    addText(r.email, 310, yL + 5, 8, 'F2', 0.05, 0.6, 0.4)
    addText(r.pass, 435, yL + 5, 8.5, 'F2', 0.1, 0.1, 0.1)
    addText(r.branch, 505, yL + 5, 8, 'F1', 0.4, 0.4, 0.4)
    yL -= 20
  })

  // Section 4: Karachi & Islamabad Sales Persons
  addText('4. COASTAL & CAPITAL BRANCH DEPOTS — SALES FORCE (EQUAL RIGHTS)', 40, yL - 15, 11, 'F2', 0.05, 0.5, 0.75)
  addText('Karachi & Islamabad sales representatives with full POS & inventory rights.', 40, yL - 27, 8, 'F1', 0.4, 0.4, 0.4)

  yL -= 50
  addRect(40, yL, 515, 18, 0.9, 0.95, 0.98)
  addText('STAFF NAME', 45, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('SYSTEM ROLE', 160, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('OFFICIAL EMAIL', 310, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('PASSWORD', 435, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)
  addText('BRANCH', 505, yL + 5, 8, 'F2', 0.2, 0.2, 0.3)

  const otherRows = [
    { name: 'Zubair Ahmed', role: 'Sales Person / Sales Executive', email: 'sales.karachi@nexis.com', pass: 'sales123', branch: 'Karachi' },
    { name: 'Haris Nawaz', role: 'Sales Person / Sales Executive', email: 'sales.islamabad@nexis.com', pass: 'sales123', branch: 'Islamabad' }
  ]

  yL -= 20
  otherRows.forEach((r, i) => {
    addRect(40, yL, 515, 20, i % 2 === 0 ? 1 : 0.95, i % 2 === 0 ? 1 : 0.98, i % 2 === 0 ? 1 : 1, true, true)
    addText(r.name, 45, yL + 5, 8.5, 'F2', 0.1, 0.1, 0.1)
    addText(r.role, 160, yL + 5, 8, 'F1', 0.3, 0.3, 0.3)
    addText(r.email, 310, yL + 5, 8, 'F2', 0.05, 0.5, 0.75)
    addText(r.pass, 435, yL + 5, 8.5, 'F2', 0.1, 0.1, 0.1)
    addText(r.branch, 505, yL + 5, 8, 'F1', 0.4, 0.4, 0.4)
    yL -= 20
  })

  // Footer Note
  addRect(40, 40, 515, 25, 0.95, 0.96, 0.98)
  addText('Exclusively 1 SuperAdmin in Peshawar HQ & Equal-Rights Sales Persons in Lahore, Multan, Karachi, Islamabad', 55, 48, 7.5, 'F1', 0.4, 0.45, 0.55)

  const streamContent = content.join('\n')
  const streamLength = Buffer.byteLength(streamContent)

  const objects = [
    `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
    `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
    `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`
  ]

  let offset = 9
  const xref = ['0000000000 65535 f ']

  let body = '%PDF-1.4\n'
  objects.forEach(obj => {
    xref.push(String(offset).padStart(10, '0') + ' 00000 n ')
    body += obj + '\n'
    offset = Buffer.byteLength(body)
  })

  const xrefStart = Buffer.byteLength(body)
  body += `xref\n0 ${objects.length + 1}\n${xref.join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  const outPdf = path.resolve(process.cwd(), 'Medical_Equipment_ERP_Logins.pdf')
  fs.writeFileSync(outPdf, body)
  console.log('Successfully generated pure PDF at:', outPdf)
}

buildPdf()
