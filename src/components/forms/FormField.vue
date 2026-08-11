<template>
  <!-- ============================================================
    FormField — A labeled input wrapper used in all forms.
    Wraps: label, input (slot), and error message.
    ============================================================ -->
  <div class="form-field space-y-1.5">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
      {{ label }}
      <span v-if="required" class="text-red-400 ml-0.5">*</span>
    </label>

    <!-- Input slot — place any <input>, <select>, or <textarea> here -->
    <slot />

    <!-- Error message -->
    <p v-if="error" class="text-red-400 text-xs mt-1 flex items-center gap-1">
      <svg class="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>

    <!-- Helper text -->
    <p v-else-if="hint" class="text-slate-500 text-xs">{{ hint }}</p>
  </div>
</template>

<script setup>
/**
 * FormField
 *
 * A labeled form field wrapper with error and hint support.
 * Place any <input>, <select>, or <textarea> inside the default slot.
 *
 * Props:
 *  - label    (String)  — Label text shown above the input
 *  - inputId  (String)  — The `for` attribute on the label (match input's `id`)
 *  - required (Boolean) — If true, shows a red asterisk after the label
 *  - error    (String)  — Error message shown below the input (red)
 *  - hint     (String)  — Helper text shown below the input (grey, only if no error)
 *
 * Usage:
 *   <FormField label="Customer Name" input-id="customer" required error="Customer is required">
 *     <input id="customer" v-model="customer" class="form-input" placeholder="Enter customer name" />
 *   </FormField>
 *
 *   <FormField label="Branch" input-id="branch" hint="Select the branch handling this sale">
 *     <select id="branch" v-model="branch" class="form-input">
 *       <option>Peshawar</option>
 *       <option>Multan</option>
 *     </select>
 *   </FormField>
 */
defineProps({
  label: {
    type: String,
    default: ''
  },
  inputId: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  }
})
</script>
