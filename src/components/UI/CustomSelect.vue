<template>
  <div :class="['relative w-full', className]" ref="container">
    <button
      type="button"
      @click="isOpen = !isOpen"
      :class="[
        'w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-bg-main text-sm transition-all text-left outline-none border-0',
        !value && 'text-text-secondary'
      ]"
    >
      <div class="flex items-center gap-2.5 truncate">
        <component v-if="value" :is="getIcon(selectedOption?.label || '')" class="w-3.5 h-3.5" />
        <span class="truncate">{{ selectedOption?.label || placeholder }}</span>
      </div>
      <ChevronDown :class="['w-4 h-4 text-text-secondary transition-transform', isOpen && 'rotate-180']" />
    </button>

    <div
      v-if="isOpen"
      class="absolute z-[100] w-full mt-2 bg-bg-main/95 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden border-0"
    >
      <div class="max-h-60 overflow-y-auto no-scrollbar py-1.5">
        <button
          v-for="opt in normalizedOptions"
          :key="opt.value"
          type="button"
          @click="selectOption(opt.value)"
          :class="[
            'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-xs font-bold transition-all text-left hover:bg-accent/10 group',
            value === opt.value ? 'text-accent bg-accent/5' : 'text-text-primary hover:text-accent'
          ]"
        >
          <div class="flex items-center gap-2.5">
            <div :class="[
              'p-1.5 rounded-lg transition-colors',
              value === opt.value ? 'bg-accent/20 text-accent' : 'bg-bg-main group-hover:bg-accent/20 group-hover:text-accent'
            ]">
              <component :is="getIcon(opt.label)" class="w-3.5 h-3.5" />
            </div>
            {{ opt.label }}
          </div>
          <Check v-if="value === opt.value" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <input
      v-if="required"
      tabindex="-1"
      autocomplete="off"
      style="opacity: 0; position: absolute; width: 0; height: 0;"
      :value="value"
      required
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  ChevronDown, Check,
  Utensils, Car, ShoppingBag, Receipt,
  Heart, PlusCircle, Wallet, TrendingUp, HelpCircle,
  Gem, Briefcase, Zap, PartyPopper
} from '@lucide/vue';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: (string | Option)[];
  value: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih...',
  className: '',
  required: false,
});

const emit = defineEmits<{
  change: [val: string];
}>();

const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

const normalizedOptions = computed<Option[]>(() => 
  props.options.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  )
);

const selectedOption = computed(() => 
  normalizedOptions.value.find(opt => opt.value === props.value)
);

const getIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes('makanan') || l.includes('food')) return Utensils;
  if (l.includes('transport')) return Car;
  if (l.includes('belanja') || l.includes('shopping')) return ShoppingBag;
  if (l.includes('tagihan') || l.includes('bill')) return Receipt;
  if (l.includes('hiburan') || l.includes('entertainment')) return PartyPopper;
  if (l.includes('kesehatan') || l.includes('health')) return Heart;
  if (l.includes('gaji') || l.includes('salary')) return Briefcase;
  if (l.includes('bonus')) return Gem;
  if (l.includes('invest')) return TrendingUp;
  if (l.includes('dompet') || l.includes('wallet')) return Wallet;
  if (l.includes('utilitas')) return Zap;
  if (l.includes('pilih')) return PlusCircle;
  return HelpCircle;
};

const selectOption = (val: string) => {
  emit('change', val);
  isOpen.value = false;
};

const handleClickOutside = (event: MouseEvent) => {
  if (container.value && !container.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
