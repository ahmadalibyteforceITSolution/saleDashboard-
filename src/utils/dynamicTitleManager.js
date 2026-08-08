/**
 * Dynamic Title & Favicon Manager
 * Handles real-time tab title changes and dynamic SVG favicon alert badges.
 */

/**
 * Generates an SVG Data URI for the brand logo, with an optional dynamic alert badge.
 * @param {number} badgeCount - e.g. 3 (low stock items or alerts)
 * @returns {string} data:image/svg+xml Data URI
 */
export function getFaviconSvgDataUri(badgeCount = 0) {
  const badgeSvg = badgeCount > 0 ? `
    <!-- Red Alert Badge Overlay -->
    <circle cx="390" cy="110" r="85" fill="#0f172a" />
    <circle cx="390" cy="110" r="72" fill="#ef4444" />
    <text x="390" y="132" fill="#ffffff" font-size="95" font-weight="900" font-family="system-ui, sans-serif" text-anchor="middle">${badgeCount > 99 ? '99+' : badgeCount}</text>
  ` : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="45%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>

  <rect x="112" y="56" width="288" height="400" rx="96" ry="96" fill="url(#brandGrad)" />

  <g fill="none" stroke="#ffffff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="256,165 344,209 256,253 168,209" />
    <polyline points="168,255 256,299 344,255" />
    <polyline points="168,301 256,345 344,301" />
  </g>
  ${badgeSvg}
</svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Sets document title dynamically with optional alert counter badge
 * @param {string} pageTitle - e.g. "Inventory & Storage"
 * @param {number} badgeCount - e.g. 3 (low stock items or alerts)
 */
export function setDynamicTitle(pageTitle, badgeCount = 0) {
  const baseAppName = 'Medical Equipment ERP'
  const titleText = pageTitle ? `${pageTitle} | ${baseAppName}` : baseAppName
  
  if (badgeCount > 0) {
    document.title = `(${badgeCount}) ${titleText}`
  } else {
    document.title = titleText
  }
}

/**
 * Dynamically updates the browser favicon with instant SVG Data URI
 * @param {number} count - Number of alerts or low stock items
 */
export function setDynamicFavicon(count = 0) {
  const dataUri = getFaviconSvgDataUri(count)

  let links = document.querySelectorAll("link[rel*='icon']")
  if (!links || links.length === 0) {
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    document.head.appendChild(link)
    links = [link]
  }

  links.forEach(link => {
    link.setAttribute('type', 'image/svg+xml')
    link.setAttribute('href', dataUri)
  })
}
