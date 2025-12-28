<template>
  <div class="flex flex-col gap-1.5 font-display">
    <label v-if="label" :for="id" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative group">
      <!-- Left Icon -->
      <div v-if="icon" class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors duration-300">
        <span class="material-symbols-outlined text-[20px]" :class="error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-blue-500'">{{ icon }}</span>
      </div>

      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :class="[
          'w-full py-3 bg-slate-50 dark:bg-slate-900 border transition-all duration-300 rounded-xl text-sm font-bold shadow-sm placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800',
          icon ? 'pl-12 pr-4' : 'px-4',
          error 
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 text-red-900 dark:text-red-100 placeholder:text-red-300' 
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white',
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : 'hover:border-blue-300 dark:hover:border-slate-600'
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Right Icon (e.g. for password toggle or status) -->
      <div v-if="$slots.append" class="absolute inset-y-0 right-0 flex items-center pr-4">
        <slot name="append"></slot>
      </div>
    </div>
    <span v-if="error" class="text-xs font-bold text-red-500 ml-1 animate-fade-in-down flex items-center gap-1">
       <span class="material-symbols-outlined text-[14px]">error</span>
       {{ error }}
    </span>
    <span v-else-if="hint" class="text-xs font-medium text-slate-400 ml-1">
      {{ hint }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label?: string;
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  icon?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  id?: string;
  min?: string | number;
  max?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  required: false,
  id: () => `input-${Math.random().toString(36).substr(2, 9)}`,
});

defineEmits(['update:modelValue', 'blur', 'focus']);
</script>
