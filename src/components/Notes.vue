<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header (Mobile only) -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 lg:hidden mb-4">
      <button
        @click="showAdd = true"
        class="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4" /> TAMBAH CATATAN BARU
      </button>
    </div>

    <!-- Notes count -->
    <p v-if="notes && notes.length > 0" class="text-[11px] font-bold text-text-secondary">{{ notes.length }} catatan tersimpan</p>

    <!-- Notes Grid -->
    <div v-if="!sortedNotes || sortedNotes.length === 0" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center relative">
        <StickyNote class="w-10 h-10 text-accent relative z-10" />
        <div class="absolute top-2 right-2 w-4 h-4 bg-secondary rounded-full animate-ping opacity-20" />
      </div>
      <div class="text-center">
        <p class="text-base font-black text-text-primary mb-1">Belum ada catatan</p>
        <p class="text-xs font-medium text-text-secondary">Simpan rencana keuangan, ide, atau pengingat di sini.</p>
      </div>
      <button @click="showAdd = true" class="mt-2 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-lg text-xs font-black shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 transition-all">
        Tulis Catatan Pertama
      </button>
    </div>
    <div v-else class="space-y-1">
      <div
        v-for="note in sortedNotes"
        :key="note.id"
        class="py-4 border-b border-border-ui/35 cursor-pointer group relative transition-all flex items-center justify-between gap-4"
        @click="startEdit(note)"
      >
        <div class="flex items-start gap-3 flex-1 min-w-0">
          <!-- Left side: Colored vertical tag representing note color -->
          <div class="w-1.5 h-10 rounded-full shrink-0" :style="{ backgroundColor: getColorDef(note.color).accent }" />
          
          <div class="flex-1 min-w-0 pr-12">
            <div class="flex items-center gap-2">
              <p class="text-sm text-text-primary font-bold truncate leading-snug">
                {{ note.content.split('\n')[0] }}
              </p>
              <span v-if="note.isPinned" class="flex items-center gap-0.5 text-[8px] font-black text-accent uppercase tracking-wide bg-accent/8 px-1.5 py-0.5 rounded">
                <Pin class="w-2 h-2 fill-accent" />
              </span>
            </div>
            <p v-if="note.content.split('\n').length > 1" class="text-xs text-text-secondary font-medium mt-1 truncate leading-relaxed">
              {{ note.content.substring(note.content.indexOf('\n') + 1).trim() }}
            </p>
            <p class="text-[9px] font-bold text-text-secondary/40 tracking-wider mt-1.5">
              {{ format(new Date(note.updatedAt), 'dd MMM yyyy, HH:mm', { locale: localeId }) }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            @click.stop="togglePin(note)"
            :class="[
              'p-2 rounded-lg transition-colors', 
              note.isPinned ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
            ]"
            :title="note.isPinned ? 'Lepas sematan' : 'Sematkan catatan'"
          >
            <Pin :class="['w-4 h-4', note.isPinned && 'fill-accent']" />
          </button>
          <button
            @click.stop="startEdit(note)"
            class="p-2 text-text-secondary hover:text-accent rounded-lg transition-colors"
            title="Edit catatan"
          >
            <Edit2 class="w-4 h-4" />
          </button>
          <button
            @click.stop="$emit('delete', note.id)"
            class="p-2 text-text-secondary hover:text-danger rounded-lg transition-colors"
            title="Hapus catatan"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add Note Modal (Full Screen) -->
    <Teleport to="body">
      <div v-if="showAdd" class="fixed inset-0 z-[9999] bg-bg-main flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div
          class="relative pt-6 pb-6 text-white overflow-hidden shrink-0"
          style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
        >
          <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div class="relative z-10 w-full max-w-xl mx-auto px-5">
            <div class="flex items-center gap-3">
              <button @click="showAdd = false" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
                <ChevronLeft class="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <div>
                <h1 class="text-[20px] font-black text-white tracking-tight leading-none">Tulis Catatan</h1>
                <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">Ide, Pengingat &amp; Catatan Keuangan</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 relative z-10 overflow-y-auto no-scrollbar bg-bg-main text-text-primary border-0">
          <div class="w-full max-w-xl mx-auto min-h-full px-5 pt-6 pb-12 flex flex-col justify-between">
            <div class="space-y-4">
              <!-- Color selector -->
              <div class="flex items-center gap-2">
                <button
                  v-for="c in NOTE_COLORS"
                  :key="c.value"
                  @click="newColor = c.value"
                  :class="['w-7 h-7 rounded-full transition-all hover:scale-110', newColor === c.value && 'scale-125 ring-2 ring-offset-2 ring-offset-card-bg']"
                  :style="{ backgroundColor: c.accent, boxShadow: newColor === c.value ? `0 0 0 2px ${c.accent}` : undefined }"
                />
              </div>

              <textarea
                autofocus
                v-model="newContent"
                placeholder="Tulis catatan keuangan Anda..."
                rows="6"
                class="w-full py-3 outline-none text-sm text-text-primary font-medium resize-none"
                @keydown.ctrl.enter="handleAdd"
              />

              <p class="text-[10px] text-text-secondary">Tekan Ctrl+Enter untuk menyimpan</p>

              <button @click="handleAdd" :disabled="!newContent.trim()" class="w-full py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-50 mt-2">
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Note Modal (Full Screen) -->
    <Teleport to="body">
      <div v-if="editingNote" class="fixed inset-0 z-[9999] bg-bg-main flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div
          class="relative pt-6 pb-6 text-white overflow-hidden shrink-0"
          style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
        >
          <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div class="relative z-10 w-full max-w-xl mx-auto px-5">
            <div class="flex items-center gap-3">
              <button @click="editingNote = null" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
                <ChevronLeft class="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <div>
                <h1 class="text-[20px] font-black text-white tracking-tight leading-none">Edit Catatan</h1>
                <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">Perbarui Catatan Keuangan Anda</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 relative z-10 overflow-y-auto no-scrollbar bg-bg-main text-text-primary border-0">
          <div class="w-full max-w-xl mx-auto min-h-full px-5 pt-6 pb-12 flex flex-col justify-between">
            <div class="space-y-4">
              <!-- Color selector -->
              <div class="flex items-center gap-2">
                <button
                  v-for="c in NOTE_COLORS"
                  :key="c.value"
                  @click="editingNote.color = c.value"
                  :class="['w-7 h-7 rounded-full transition-all hover:scale-110', editingNote.color === c.value && 'scale-125 ring-2 ring-offset-2 ring-offset-card-bg']"
                  :style="{ backgroundColor: c.accent, boxShadow: editingNote.color === c.value ? `0 0 0 2px ${c.accent}` : undefined }"
                />
              </div>

              <textarea
                autofocus
                v-model="editContent"
                placeholder="Tulis catatan keuangan Anda..."
                rows="6"
                class="w-full py-3 outline-none text-sm text-text-primary font-medium resize-none"
                @keydown.ctrl.enter="handleUpdate"
              />

              <p class="text-[10px] text-text-secondary">Tekan Ctrl+Enter untuk menyimpan</p>

              <button @click="handleUpdate" :disabled="!editContent.trim()" class="w-full py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black text-sm shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all disabled:opacity-50 mt-2">
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { registerModal, unregisterModal } from '../composables/useAppState';
import { Plus, Trash2, StickyNote, Pin, Edit2, ChevronLeft } from '@lucide/vue';
import type { Note } from '../types';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Props {
  notes: Note[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  add: [note: Omit<Note, 'id'>];
  update: [note: Note];
  delete: [id: string];
}>();

const showAdd = ref(false);
const newContent = ref('');
const newColor = ref('violet');
const editContent = ref('');
const editingNote = ref<Note | null>(null);

watch(showAdd, (newVal) => {
  if (newVal) {
    registerModal('notes-add', () => { showAdd.value = false; });
  } else {
    unregisterModal('notes-add');
  }
});

watch(editingNote, (newVal) => {
  if (newVal) {
    registerModal('notes-edit', () => { editingNote.value = null; });
  } else {
    unregisterModal('notes-edit');
  }
});

const NOTE_COLORS = [
  { bg: 'bg-card-bg border-violet-500/40', text: 'text-text-primary', value: 'violet', accent: '#8b5cf6' },
  { bg: 'bg-card-bg border-amber-500/40', text: 'text-text-primary', value: 'amber', accent: '#f59e0b' },
  { bg: 'bg-card-bg border-rose-500/40', text: 'text-text-primary', value: 'rose', accent: '#f43f5e' },
  { bg: 'bg-card-bg border-emerald-500/40', text: 'text-text-primary', value: 'emerald', accent: '#10b981' },
  { bg: 'bg-card-bg border-sky-500/40', text: 'text-text-primary', value: 'sky', accent: '#0ea5e9' },
  { bg: 'bg-card-bg border-fuchsia-500/40', text: 'text-text-primary', value: 'fuchsia', accent: '#d946ef' },
  { bg: 'bg-card-bg border-slate-500/40', text: 'text-text-primary', value: 'slate', accent: '#94a3b8' },
];

const getColorDef = (value: string) => {
  return NOTE_COLORS.find(c => c.value === value) || NOTE_COLORS[0];
};

const handleAdd = () => {
  if (!newContent.value.trim()) return;
  const now = new Date().toISOString();
  emit('add', {
    userId: '',
    content: newContent.value.trim(),
    color: newColor.value,
    createdAt: now,
    updatedAt: now,
    isPinned: false
  });
  newContent.value = '';
  newColor.value = 'violet';
  showAdd.value = false;
};

const startEdit = (note: Note) => {
  editingNote.value = note;
  editContent.value = note.content;
};

const handleUpdate = () => {
  if (!editingNote.value || !editContent.value.trim()) return;
  emit('update', { 
    ...editingNote.value, 
    content: editContent.value.trim(), 
    updatedAt: new Date().toISOString() 
  });
  editingNote.value = null;
};

const togglePin = (note: Note) => {
  emit('update', {
    ...note,
    isPinned: !note.isPinned
  });
};

const sortedNotes = computed(() => {
  return [...props.notes].sort((a, b) => {
    if (a.isPinned === b.isPinned) {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
    return a.isPinned ? -1 : 1;
  });
});
</script>
