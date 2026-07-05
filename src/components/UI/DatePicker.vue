<template>
  <div :class="['relative', className]">
    <div 
      @click="toggleShow"
      class="w-full p-3 bg-bg-main rounded-xl border-0 cursor-pointer flex items-center justify-between transition-all group"
    >
      <span :class="['text-sm font-bold transition-colors', !value ? 'text-text-secondary' : 'text-text-primary group-hover:text-accent']">
        {{ value ? formatLocalDate(value) : placeholder }}
      </span>
      <CalendarIcon class="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
    </div>

    <template v-if="show">
      <div class="fixed inset-0 z-[60]" @click="show = false" />
      <div 
        :class="[
          'absolute z-[70] bg-bg-main rounded-2xl shadow-lg p-4 overflow-hidden min-w-[300px] border-0',
          dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
        ]"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-4 bg-bg-main/30 p-2 rounded-xl">
          <button 
            type="button"
            @click="navigatePeriod(-1)" 
            class="p-1.5 hover:bg-bg-main rounded-lg transition-colors"
          >
            <ChevronLeft class="w-4 h-4 text-text-secondary" />
          </button>
          
          <div 
            class="flex items-center gap-1 cursor-pointer hover:bg-bg-main px-2 py-1 rounded-lg transition-colors" 
            @click="cycleMode"
          >
            <span class="text-[11px] font-black text-text-primary uppercase tracking-widest">
              {{ headerText }}
            </span>
            <ChevronDown :class="['w-3 h-3 text-text-secondary transition-transform', mode !== 'calendar' && 'rotate-180']" />
          </div>

          <button 
            type="button"
            @click="navigatePeriod(1)" 
            class="p-1.5 hover:bg-bg-main rounded-lg transition-colors"
          >
            <ChevronRight class="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        <div v-if="mode === 'calendar'">
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="(d, i) in ['S', 'S', 'R', 'K', 'J', 'S', 'M']" :key="i" class="text-[9px] font-black text-text-secondary text-center py-1 opacity-50">{{ d }}</div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="(day, i) in days"
              :key="i"
              type="button"
              @click="selectDay(day)"
              :class="[
                'aspect-square rounded-lg flex items-center justify-center text-[11px] font-bold transition-all relative',
                !isSameMonth(day, viewDate) ? 'opacity-10' : 'hover:bg-accent/10 hover:text-accent',
                isSelected(day) ? 'bg-accent text-white shadow-lg shadow-accent/30 scale-110 z-10' : 'text-text-primary',
                isTodayDate(day) && !isSelected(day) ? 'text-accent ring-1 ring-accent/30' : ''
              ]"
            >
              {{ format(day, 'd') }}
            </button>
          </div>
        </div>

        <div v-if="mode === 'month'" class="grid grid-cols-3 gap-2">
          <button
            v-for="(m, i) in MONTHS"
            :key="m"
            type="button"
            @click="handleMonthSelect(i)"
            :class="[
              'py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all',
              i === viewDate.getMonth() ? 'bg-accent text-white shadow-lg' : 'bg-bg-main text-text-secondary hover:bg-accent/10 hover:text-accent'
            ]"
          >
            {{ m.substring(0, 3) }}
          </button>
        </div>

        <div v-if="mode === 'year'" class="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1 scrollbar-thin">
          <button
            v-for="y in years"
            :key="y"
            type="button"
            @click="handleYearSelect(y)"
            :class="[
              'py-3 rounded-xl text-[10px] font-black transition-all',
              y === getYear(viewDate) ? 'bg-accent text-white shadow-lg' : 'bg-bg-main text-text-secondary hover:bg-accent/10 hover:text-accent'
            ]"
          >
            {{ y }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown
} from '@lucide/vue';
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, 
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, parseISO,
  setMonth, setYear, getYear
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Props {
  value: string;
  placeholder?: string;
  className?: string;
  dropUp?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Pilih tanggal',
  className: '',
  dropUp: false,
});

const emit = defineEmits<{
  change: [val: string];
}>();

type PickerMode = 'calendar' | 'month' | 'year';

const show = ref(false);
const mode = ref<PickerMode>('calendar');
const viewDate = ref(props.value ? parseISO(props.value) : new Date());

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const toggleShow = () => {
  show.value = !show.value;
  if (show.value) mode.value = 'calendar';
};

const days = computed(() => {
  const start = startOfWeek(startOfMonth(viewDate.value), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(viewDate.value), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
});

const years = computed(() => {
  const currentYear = getYear(viewDate.value);
  const startYear = currentYear - 10;
  return Array.from({ length: 21 }, (_, i) => startYear + i);
});

const selectedDate = computed(() => props.value ? parseISO(props.value) : null);

const isSelected = (day: Date) => selectedDate.value && isSameDay(day, selectedDate.value);
const isTodayDate = (day: Date) => isSameDay(day, new Date());

const headerText = computed(() => {
  if (mode.value === 'year') {
    return `${years.value[0]} - ${years.value[years.value.length - 1]}`;
  }
  return format(viewDate.value, mode.value === 'month' ? 'yyyy' : 'MMMM yyyy', { locale: localeId });
});

const navigatePeriod = (dir: number) => {
  if (mode.value === 'year') {
    viewDate.value = addMonths(viewDate.value, dir * 120);
  } else {
    viewDate.value = addMonths(viewDate.value, dir);
  }
};

const cycleMode = () => {
  if (mode.value === 'calendar') mode.value = 'month';
  else if (mode.value === 'month') mode.value = 'year';
  else mode.value = 'calendar';
};

const handleMonthSelect = (mIdx: number) => {
  viewDate.value = setMonth(viewDate.value, mIdx);
  mode.value = 'calendar';
};

const handleYearSelect = (year: number) => {
  viewDate.value = setYear(viewDate.value, year);
  mode.value = 'month';
};

const selectDay = (day: Date) => {
  emit('change', format(day, 'yyyy-MM-dd'));
  show.value = false;
};

const formatLocalDate = (iso: string) => {
  return format(parseISO(iso), 'dd MMMM yyyy', { locale: localeId });
};
</script>
