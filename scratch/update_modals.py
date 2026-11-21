import re

# Update GlobalSaleModal.vue
with open(r'src/components/GlobalSaleModal.vue', 'r', encoding='utf-8') as f:
    sale_content = f.read()

# 1. Update onSaleProductInput
old_input_logic = """function onSaleProductInput(row, query) {
  row.productSearchText = query
  const q = String(query || '').trim().toLowerCase()
  if (!q) return
  const prod = (branchProducts.value || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q)
  ) || (dataStore.products || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q)
  )"""

new_input_logic = """function onSaleProductInput(row, query) {
  row.productSearchText = query
  const q = String(query || '').trim().toLowerCase()
  if (!q) return
  const prod = (branchProducts.value || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.sku && p.sku.toLowerCase().includes(q))
  ) || (dataStore.products || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.sku && p.sku.toLowerCase().includes(q))
  )"""

if old_input_logic in sale_content:
    sale_content = sale_content.replace(old_input_logic, new_input_logic)

# 2. Update default row creation in GlobalSaleModal.vue
# addSaleRow
old_add_row = """function addSaleRow() {
  const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
  saleRows.value.push({
    id: `srow_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    productId: defaultProd?.id || '',
    qty: 1,"""

new_add_row = """function addSaleRow() {
  const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
  saleRows.value.push({
    id: `srow_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    productId: defaultProd?.id || '',
    productSearchText: defaultProd?.name || '',
    productObj: defaultProd || null,
    qty: 1,"""

if old_add_row in sale_content:
    sale_content = sale_content.replace(old_add_row, new_add_row)

# In watch uiStore.showGlobalSaleModal
old_watch_row1 = """        const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
        saleRows.value = [
          {
            id: `srow_${Date.now()}`,
            productId: defaultProd?.id || '',
            qty: 1,"""

new_watch_row1 = """        const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
        saleRows.value = [
          {
            id: `srow_${Date.now()}`,
            productId: defaultProd?.id || '',
            productSearchText: defaultProd?.name || '',
            productObj: defaultProd || null,
            qty: 1,"""

if old_watch_row1 in sale_content:
    sale_content = sale_content.replace(old_watch_row1, new_watch_row1)

old_watch_row2 = """      const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
      saleRows.value = [
        {
          id: `srow_${Date.now()}`,
          productId: defaultProd?.id || '',
          qty: 1,"""

new_watch_row2 = """      const defaultProd = branchProducts.value[0] || dataStore.products?.[0]
      saleRows.value = [
        {
          id: `srow_${Date.now()}`,
          productId: defaultProd?.id || '',
          productSearchText: defaultProd?.name || '',
          productObj: defaultProd || null,
          qty: 1,"""

if old_watch_row2 in sale_content:
    sale_content = sale_content.replace(old_watch_row2, new_watch_row2)

with open(r'src/components/GlobalSaleModal.vue', 'w', encoding='utf-8') as f:
    f.write(sale_content)
print("Updated GlobalSaleModal.vue")


# Update GlobalPurchaseModal.vue
with open(r'src/components/GlobalPurchaseModal.vue', 'r', encoding='utf-8') as f:
    purch_content = f.read()

old_purch_input_logic = """function onPurchaseProductInput(row, query) {
  row.productSearchText = query
  const q = String(query || '').trim().toLowerCase()
  if (!q) return
  const prod = (allAvailableProducts.value || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q)
  ) || (dataStore.products || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q)
  )"""

new_purch_input_logic = """function onPurchaseProductInput(row, query) {
  row.productSearchText = query
  const q = String(query || '').trim().toLowerCase()
  if (!q) return
  const prod = (allAvailableProducts.value || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.sku && p.sku.toLowerCase().includes(q))
  ) || (dataStore.products || []).find(p => 
    p.name.toLowerCase() === q || 
    (p.sku && p.sku.toLowerCase() === q) || 
    p.name.toLowerCase().startsWith(q) ||
    p.name.toLowerCase().includes(q) ||
    (p.sku && p.sku.toLowerCase().includes(q))
  )"""

if old_purch_input_logic in purch_content:
    purch_content = purch_content.replace(old_purch_input_logic, new_purch_input_logic)

# In addRow
old_purch_add_row = """function addRow() {
  const defaultProd = dataStore.products?.[0]
  const skuClean = (defaultProd?.sku || 'WD').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'WD'
  rows.value.push({
    id: `row_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    productId: defaultProd?.id || '',
    isNewPart: false,"""

new_purch_add_row = """function addRow() {
  const defaultProd = dataStore.products?.[0]
  const skuClean = (defaultProd?.sku || 'WD').replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'WD'
  rows.value.push({
    id: `row_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    productId: defaultProd?.id || '',
    productSearchText: defaultProd?.name || '',
    productObj: defaultProd || null,
    isNewPart: false,"""

if old_purch_add_row in purch_content:
    purch_content = purch_content.replace(old_purch_add_row, new_purch_add_row)

# In default watch row
old_purch_default_row = """      const defaultProd = dataStore.products?.[0]
      rows.value = [
        {
          id: `row_${Date.now()}`,
          productId: defaultProd?.id || '',
          isNewPart: false,"""

new_purch_default_row = """      const defaultProd = dataStore.products?.[0]
      rows.value = [
        {
          id: `row_${Date.now()}`,
          productId: defaultProd?.id || '',
          productSearchText: defaultProd?.name || '',
          productObj: defaultProd || null,
          isNewPart: false,"""

if old_purch_default_row in purch_content:
    purch_content = purch_content.replace(old_purch_default_row, new_purch_default_row)

with open(r'src/components/GlobalPurchaseModal.vue', 'w', encoding='utf-8') as f:
    f.write(purch_content)
print("Updated GlobalPurchaseModal.vue")
