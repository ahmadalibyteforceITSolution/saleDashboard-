<template>
  <!-- ============================================================
    GlassPanel — Standard glass-morphism card container.
    Wraps content with `glass-panel` class + optional extra classes.
    ============================================================ -->
  <div :class="['glass-panel', 'shadow-xl', extraClass]">
    <slot />
  </div>
</template>

<script setup>
/**
 * GlassPanel
 *
 * A reusable card wrapper with the ERP glass-panel visual style.
 *
 * Props:
 *  - extraClass (String) — Additional CSS classes (e.g. "p-6 space-y-4")
 *
 * Usage:
 *   <GlassPanel extra-class="p-6 space-y-4">
 *     <h3>Section Title</h3>
 *     <p>Content here</p>
 *   </GlassPanel>
 */
defineProps({
  extraClass: {
    type: String,
    default: 'p-6 space-y-4'
  }
})
</script>
