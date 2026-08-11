<template>
  <!-- ============================================================
    SelectInput — A styled dropdown select.
    v-model compatible. Used in forms across the ERP.
    ============================================================ -->
  <select
    :value="modelValue"
    class="form-input"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <!-- Optional placeholder option -->
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>

    <!-- Render options from array of strings or { value, label } objects -->
    <option
      v-for="opt in options"
      :key="typeof opt === 'object' ? opt.value : opt"
      :value="typeof opt === 'object' ? opt.value : opt"
    >
      {{ typeof opt === 'object' ? opt.label : opt }}
    </option>
  </select>
</template>

<script setup>
/**
 * SelectInput
 *
 * A styled <select> dropdown, v-model compatible.
 *
 * Props:
 *  - modelValue  (String)         — Bound value (v-model)
 *  - options     (Array, required) — Options as strings or { value, label } objects
 *                                    e.g. ['Peshawar', 'Multan', 'Lahore']
 *                                    or   [{ value: 'psh', label: 'Peshawar HO' }]
 *  - placeholder (String)         — Disabled first option as a prompt (e.g. 'Select Branch')
 *
 * Events:
 *  - update:modelValue — Emitted when selection changes
 *
 * Usage:
 *   <SelectInput v-model="branch" :options="['Peshawar', 'Multan', 'Lahore']" placeholder="Select Branch" />
 *
 *   <SelectInput
 *     v-model="paymentMethod"
 *     :options="[{ value: 'cash', label: 'Cash Payment' }, { value: 'bank', label: 'Bank Transfer' }]"
 *   />
 */
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>
