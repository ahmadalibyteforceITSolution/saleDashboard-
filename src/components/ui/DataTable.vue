<template>
  <!-- ============================================================
    DataTable — A scrollable table with standard ERP styling.
    Pass column headers via the `columns` prop.
    Pass rows via the default slot (use <tr> elements).
    ============================================================ -->
  <div class="table-container">
    <table class="table-lined">
      <!-- Table header — renders column names from props -->
      <thead>
        <tr>
          <th v-for="col in columns" :key="col">{{ col }}</th>
        </tr>
      </thead>

      <!-- Table body — use the slot to pass <tr> elements -->
      <tbody>
        <slot />
      </tbody>
    </table>

    <!-- Empty state shown when no rows are provided -->
    <div v-if="empty" class="py-12 text-center text-slate-400 text-sm">
      <slot name="empty">
        {{ emptyMessage }}
      </slot>
    </div>
  </div>
</template>

<script setup>
/**
 * DataTable
 *
 * A scrollable table with standard ERP styling.
 *
 * Props:
 *  - columns      (Array, required)  — Array of column header strings
 *                                      e.g. ['Invoice #', 'Date', 'Customer', 'Amount']
 *  - empty        (Boolean)          — If true, shows the empty state instead of the table body
 *  - emptyMessage (String)           — Message to show when empty is true
 *
 * Slots:
 *  - default — Place <tr> rows here
 *  - empty   — Custom empty state content (overrides emptyMessage)
 *
 * Usage:
 *   <DataTable :columns="['Invoice #', 'Date', 'Customer', 'Total']" :empty="rows.length === 0">
 *     <tr v-for="row in rows" :key="row.id">
 *       <td>{{ row.invoice }}</td>
 *       <td>{{ row.date }}</td>
 *       <td>{{ row.customer }}</td>
 *       <td>{{ row.total }}</td>
 *     </tr>
 *   </DataTable>
 */
defineProps({
  columns: {
    type: Array,
    required: true
  },
  empty: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No records found.'
  }
})
</script>
