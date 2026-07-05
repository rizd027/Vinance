<template>
  <div class="fixed inset-0 z-[100] bg-bg-main flex flex-col items-center justify-center p-6 text-text-primary">
    <button
      v-if="mode === 'setup'"
      @click="$emit('cancel')"
      class="absolute top-8 right-8 p-3 hover:bg-card-bg rounded-2xl transition-colors"
    >
      <X class="w-6 h-6" />
    </button>

    <div class="max-w-xs w-full flex flex-col items-center">
      <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6">
        <Lock class="w-8 h-8 text-accent" />
      </div>

      <h2 class="text-xl font-black tracking-tight mb-2">{{ displayTitle }}</h2>
      <p class="text-xs text-text-secondary mb-8 text-center px-4 leading-relaxed font-medium">
        {{ displayDesc }}
      </p>

      <!-- PIN Indicators -->
      <div class="flex gap-4 mb-12 h-6">
        <div
          v-for="index in [0, 1, 2, 3]"
          :key="index"
          :class="[
            'w-4 h-4 rounded-full transition-all duration-200',
            pin.length > index ? 'bg-accent scale-110' : 'bg-bg-main border-2 border-border-ui',
            hasError && 'bg-danger border-danger animate-bounce'
          ]"
        />
      </div>

      <!-- Numpad -->
      <div class="grid grid-cols-3 gap-6 w-full max-w-[260px]">
        <button
          v-for="num in ['1','2','3','4','5','6','7','8','9']"
          :key="num"
          @click="handleKeyPress(num)"
          class="h-16 w-16 mx-auto rounded-full bg-card-bg hover:bg-bg-main border border-border-ui text-2xl font-black active:scale-90 transition-all shadow-sm"
        >
          {{ num }}
        </button>

        <div class="h-16 w-16 mx-auto flex flex-col items-center justify-center text-accent">
          <Fingerprint class="w-8 h-8 opacity-20" />
        </div>

        <button
          @click="handleKeyPress('0')"
          class="h-16 w-16 mx-auto rounded-full bg-card-bg hover:bg-bg-main border border-border-ui text-2xl font-black active:scale-90 transition-all shadow-sm"
        >
          0
        </button>

        <button
          @click="handleDelete"
          class="h-16 w-16 mx-auto rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-card-bg active:scale-90 transition-all"
        >
          <Delete class="w-8 h-8" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Lock, Delete, Fingerprint, X } from '@lucide/vue';

interface Props {
  correctPin?: string;
  mode: 'unlock' | 'setup';
  title?: string;
  description?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  unlock: [];
  complete: [pin: string];
  cancel: [];
}>();

const pin = ref('');
const hasError = ref(false);

const displayTitle = computed(() =>
  props.title || (props.mode === 'unlock' ? 'Aplikasi Terkunci' : 'Atur PIN Baru')
);
const displayDesc = computed(() =>
  props.description ||
  (props.mode === 'unlock'
    ? 'Masukkan 4 digit PIN Anda untuk membuka Vinance.'
    : 'Buat 4 digit PIN untuk mengamankan data keuangan Anda.')
);

const handleKeyPress = (num: string) => {
  if (pin.value.length < 4) {
    pin.value += num;
    hasError.value = false;
  }
};

const handleDelete = () => {
  pin.value = pin.value.slice(0, -1);
  hasError.value = false;
};

watch(pin, (val) => {
  if (val.length === 4) {
    if (props.mode === 'unlock') {
      if (val === props.correctPin) {
        emit('unlock');
      } else {
        hasError.value = true;
        setTimeout(() => {
          pin.value = '';
          hasError.value = false;
        }, 500);
      }
    } else {
      emit('complete', val);
    }
  }
});
</script>
