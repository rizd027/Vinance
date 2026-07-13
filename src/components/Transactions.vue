<template>
  <div class="space-y-4">
    <!-- Title Header -->
    <div class="hidden flex-col gap-1 lg:flex mb-2">
      <h2 class="text-2xl font-black text-text-primary tracking-tight leading-none">Riwayat Transaksi</h2>
      <p class="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Pencatatan &amp; Arus Kas</p>
      <div class="h-1 w-12 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
    </div>

    <div class="flex flex-col gap-3">
      <!-- Search, Filter & Actions Bar -->
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            v-model="searchQuery"
            class="w-full !pl-10 pr-4 py-2.5 rounded-lg border-0 bg-bg-main text-xs text-text-primary outline-none placeholder:text-text-secondary/50 shadow-none focus:ring-2 focus:ring-accent/10 focus:bg-card-bg transition-all duration-300"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="showFilters = true"
            :class="[
              'flex items-center justify-center gap-2 px-4 h-10 rounded-lg transition-all font-bold text-xs border-0',
              isFilterActive
                ? 'bg-accent text-white shadow-none'
                : 'bg-bg-main text-text-secondary hover:bg-bg-main'
            ]"
          >
            <SlidersHorizontal class="w-3.5 h-3.5" />
            <span v-if="!isMobile">Opsi</span>
          </button>
          <button
            @click="$emit('addClick')"
            class="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-accent to-secondary text-white rounded-lg shadow-lg shadow-accent/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
            title="Tambah Transaksi"
          >
            <Plus class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Filter & Settings Modal (Full Screen) -->
      <Teleport to="body">
        <div v-if="showFilters" class="fixed inset-0 z-[9999] bg-bg-main flex flex-col overflow-hidden">
          <!-- Modal Header -->
          <div
            class="relative pt-6 pb-6 text-white overflow-hidden shrink-0"
            style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
          >
            <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
            <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div class="relative z-10 w-full max-w-xl mx-auto px-5">
              <div class="flex items-center gap-3">
                <button @click="showFilters = false" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
                  <ChevronLeft class="w-5 h-5 stroke-[2.5] text-white" />
                </button>
                <div>
                  <h1 class="text-[20px] font-black text-white tracking-tight leading-none">Filter &amp; Opsi</h1>
                  <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">Atur Tampilan &amp; Transaksi</p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex-1 relative z-10 overflow-y-auto no-scrollbar bg-bg-main text-text-primary border-0">
            <div class="w-full max-w-xl mx-auto min-h-full px-5 pt-6 pb-12 flex flex-col justify-between">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <!-- View Mode Toggle -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Tampilan</label>
                  <div class="flex bg-bg-main p-1 rounded-lg border-0">
                    <button
                      @click="viewMode = 'list'"
                      :class="[
                        'flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-0',
                        viewMode === 'list' ? 'bg-card-bg text-accent shadow-none' : 'text-text-secondary'
                      ]"
                    >
                      <ListIcon class="w-4 h-4" /> Daftar
                    </button>
                    <button
                      @click="viewMode = 'calendar'"
                      :class="[
                        'flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border-0',
                        viewMode === 'calendar' ? 'bg-card-bg text-accent shadow-none' : 'text-text-secondary'
                      ]"
                    >
                      <CalendarIcon class="w-4 h-4" /> Kalender
                    </button>
                  </div>
                </div>

                <!-- Type Filter -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Tipe Transaksi</label>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      v-for="t in [
                        { id: 'All', label: 'Semua' },
                        { id: 'Income', label: 'Masuk' },
                        { id: 'Expense', label: 'Keluar' }
                      ]"
                      :key="t.id"
                      @click="filterType = t.id"
                      :class="[
                        'py-2.5 rounded-lg text-[10px] font-bold border transition-all',
                        filterType === t.id
                          ? 'bg-accent/10 text-accent border-0'
                          : 'bg-bg-main text-text-secondary border-0'
                      ]"
                    >
                      {{ t.label }}
                    </button>
                  </div>
                </div>

                <!-- Sort Order -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Urutkan</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="s in [
                        { id: 'date-desc', label: 'Terbaru', icon: ArrowUpDown },
                        { id: 'date-asc', label: 'Terlama', icon: ArrowUpDown },
                        { id: 'amount-desc', label: 'Terbesar', icon: TrendingUp },
                        { id: 'amount-asc', label: 'Terkecil', icon: TrendingUp }
                      ]"
                      :key="s.id"
                      @click="sortOrder = s.id"
                      :class="[
                        'py-2.5 px-3 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-2',
                        sortOrder === s.id
                          ? 'bg-accent/10 text-accent border-0'
                          : 'bg-bg-main text-text-secondary border-0'
                      ]"
                    >
                      <component :is="s.icon" class="w-3 h-3 opacity-50" />
                      {{ s.label }}
                    </button>
                  </div>
                </div>

                <!-- Category Filter -->
                <div class="space-y-3">
                  <label class="block text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Kategori</label>
                  <CustomSelect
                    :value="filterCategory"
                    @change="filterCategory = $event"
                    :options="allAvailableCategories"
                    placeholder="Semua Kategori"
                    className="rounded-lg border-border-ui"
                  />
                </div>
              </div>

              <div class="space-y-6 pt-6 border-t border-border-ui mt-6">
                <!-- Export/Import Button -->
                <button
                  type="button"
                  @click="triggerExport"
                  class="w-full flex items-center justify-center gap-2 py-3 bg-bg-main border-0 rounded-lg text-[10px] font-black text-text-primary hover:bg-border-ui transition-all"
                >
                  <FileDown class="w-4 h-4 text-accent" /> EXPORT / IMPORT DATA
                </button>
   
                <div class="flex gap-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 py-4 bg-bg-main text-text-secondary rounded-lg text-xs font-black hover:bg-danger/5 hover:text-danger transition-all border-0"
                  >
                    RESET
                  </button>
                  <button
                    @click="showFilters = false"
                    class="flex-[2] py-4 bg-gradient-to-r from-accent to-secondary text-white rounded-lg text-xs font-black shadow-lg shadow-accent/20 hover:scale-[1.02] transition-all"
                  >
                    TERAPKAN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
    
    <ExportImportModal
      :is-open="showExportModal"
      @close="showExportModal = false"
      :transactions="transactions"
      @import="$emit('import', $event)"
    />

    <!-- List view -->
    <div v-if="viewMode === 'list'" class="bg-transparent border-0 overflow-hidden shadow-none">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr class="bg-bg-main text-text-secondary border-b border-border-ui/35 text-[9px] font-bold uppercase tracking-widest">
              <th class="px-4 py-2">Tanggal</th>
              <th class="px-4 py-2">Kategori</th>
              <th class="px-4 py-2">Keterangan</th>
              <th class="px-4 py-2 text-right">Jumlah</th>
              <th class="px-4 py-2 text-center w-10">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border-ui/35">
            <template v-if="loading">
              <tr v-for="i in 8" :key="i" class="animate-pulse">
                <td class="px-4 py-3.5">
                  <div class="h-4 w-20 bg-slate-200 dark:bg-white/5 rounded animate-pulse"></div>
                  <div class="h-3 w-12 bg-slate-200 dark:bg-white/5 rounded mt-1 animate-pulse"></div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/5 animate-pulse"></div>
                    <div class="h-4 w-16 bg-slate-200 dark:bg-white/5 rounded animate-pulse"></div>
                  </div>
                </td>
                <td class="px-4 py-3.5">
                  <div class="h-4 w-28 bg-slate-200 dark:bg-white/5 rounded animate-pulse"></div>
                </td>
                <td class="px-4 py-3.5 text-right">
                  <div class="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded ml-auto animate-pulse"></div>
                </td>
                <td class="px-4 py-3.5 text-center">
                  <div class="w-6 h-6 bg-slate-200 dark:bg-white/5 rounded-md mx-auto animate-pulse"></div>
                </td>
              </tr>
            </template>
            <tr v-else-if="filteredTransactions.length === 0">
              <td colSpan="5" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 bg-bg-main rounded-lg flex items-center justify-center text-text-secondary/30">
                    <Search class="w-6 h-6" />
                  </div>
                  <div>
                    <p class="text-sm font-bold text-text-primary">Transaksi tidak ditemukan</p>
                    <p class="text-xs text-text-secondary">Coba ubah filter atau kata kunci pencarian Anda.</p>
                  </div>
                  <button
                    v-if="searchQuery || filterType !== 'All' || filterCategory"
                    @click="clearFilters"
                    class="mt-2 text-xs font-bold text-accent hover:underline"
                  >
                    Hapus Semua Filter
                  </button>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="t in filteredTransactions"
              :key="t.id"
              @click="handleEditClick(t)"
              class="hover:bg-bg-main transition-colors group cursor-pointer"
            >
              <td class="px-4 py-2 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-[10px] font-medium text-text-primary">
                    {{ new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
                  </span>
                  <span class="text-[9px] text-text-secondary mt-0.5">
                    {{ new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-2">
                  <div :class="[
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm',
                    t.type === 'Income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  ]">
                    <component :is="getCategoryIcon(t.category)" class="w-4 h-4" />
                  </div>
                  <span class="text-[10px] font-bold text-text-primary uppercase tracking-tight">{{ t.category }}</span>
                </div>
              </td>
              <td class="px-4 py-2 text-[10px] text-text-secondary italic max-w-[120px] truncate">
                <div class="flex items-center gap-1.5">
                  <span v-if="t.imageUrl" @click.stop="viewFullImage(t.imageUrl)" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/10 hover:bg-accent/20 text-accent font-black text-[9px] uppercase cursor-pointer transition-all shadow-none">
                    <Paperclip class="w-2.5 h-2.5" />
                    Struk
                  </span>
                  <span>{{ t.note || '-' }}</span>
                </div>
              </td>
              <td :class="[
                'px-4 py-2 text-right text-xs font-bold tracking-tight currency-font',
                t.type === 'Income' ? 'text-success' : 'text-danger'
              ]">
                <div class="flex items-center justify-end gap-1">
                  <ArrowUpRight v-if="t.type === 'Income'" class="w-3 h-3" />
                  <ArrowDownRight v-else class="w-3 h-3" />
                  <span>{{ t.type === 'Income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}</span>
                </div>
              </td>

              <td class="px-4 py-2 text-center" @click.stop>
                <button
                  @click="$emit('delete', t.id)"
                  class="p-1.5 text-text-secondary/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                  title="Hapus Transaksi"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Calendar View -->
    <div v-else class="space-y-4">
      <div class="bg-transparent border-0 overflow-hidden shadow-none">
        <div class="p-4 border-b border-border-ui/35 flex items-center justify-between bg-bg-main/20">
          <h3 class="text-sm font-bold text-text-primary uppercase tracking-widest">
            {{ format(currentMonth, 'MMMM yyyy', { locale: localeId }) }}
          </h3>
          <div class="flex items-center gap-2">
            <button @click="currentMonth = subMonths(currentMonth, 1)" class="p-1.5 hover:bg-bg-main rounded-lg transition-colors text-text-secondary">
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button @click="currentMonth = new Date()" class="px-2 py-1 text-[10px] font-bold text-accent hover:bg-accent/10 rounded-lg transition-colors">
              HARI INI
            </button>
            <button @click="currentMonth = addMonths(currentMonth, 1)" class="p-1.5 hover:bg-bg-main rounded-lg transition-colors text-text-secondary">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-7 border-b border-border-ui/35 bg-bg-main/10">
          <div v-for="day in ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']" :key="day" class="py-2 text-center text-[9px] font-medium text-text-secondary uppercase tracking-widest">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7">
          <button
            v-for="(day, idx) in calendarDays"
            :key="idx"
            @click="selectedDate = isSelectedDate(day) ? null : day"
            :class="[
              'min-h-[70px] p-2 border-r border-b border-border-ui/35 text-left transition-all relative group overflow-hidden',
              !isSameMonth(day, currentMonth) ? 'bg-bg-main/20' : '',
              isSelectedDate(day) ? 'bg-accent/5 ring-1 ring-inset ring-accent/30' : 'hover:bg-bg-main/10',
              idx % 7 === 6 ? 'border-r-0' : ''
            ]"
          >
            <span :class="[
              'text-[10px] font-medium',
              !isSameMonth(day, currentMonth) ? 'text-text-secondary/30' : 'text-text-secondary',
              isToday(day) ? 'text-accent' : ''
            ]">
              {{ format(day, 'd') }}
            </span>

            <div class="mt-1 space-y-0.5">
              <div v-if="getDayIncome(day) > 0" class="h-1 w-full bg-success/40 rounded-full" />
              <div v-if="getDayExpense(day) > 0" class="h-1 w-full bg-danger/40 rounded-full" />
            </div>

            <div v-if="getDayTransactions(day).length > 0" class="mt-auto pt-1">
              <p class="text-[8px] font-medium text-text-primary truncate">
                {{ getDayTransactions(day).length }} tx
              </p>
            </div>

            <div v-if="isToday(day)" class="absolute top-1 right-1 w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_rgba(192,132,252,1)]" />
          </button>
        </div>
      </div>

      <!-- Selected Date Details -->
      <div v-if="selectedDate" class="bg-transparent border-0 overflow-hidden shadow-none">
        <div class="p-3 border-b border-border-ui/35 bg-bg-main/20 flex justify-between items-center">
          <h4 class="text-[10px] font-bold text-text-primary uppercase tracking-widest">
            Transaksi {{ format(selectedDate, 'dd MMMM yyyy', { locale: localeId }) }}
          </h4>
          <button @click="selectedDate = null" class="text-text-secondary hover:text-text-primary">
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
        <div class="divide-y divide-border-ui/35">
          <div v-if="getDayTransactions(selectedDate).length === 0" class="p-8 text-center text-[10px] text-text-secondary font-medium">
            Tidak ada transaksi pada tanggal ini
          </div>
          <div
            v-else
            v-for="t in getDayTransactions(selectedDate)"
            :key="t.id"
            class="p-3 flex items-center justify-between hover:bg-bg-main/10 transition-colors"
          >
            <div class="flex flex-col">
              <span :class="['text-[9px] font-medium uppercase tracking-wider mb-0.5', t.type === 'Income' ? 'text-success' : 'text-danger']">
                {{ t.category }}
              </span>
              <span class="text-[10px] text-text-secondary italic">{{ t.note || 'Tanpa keterangan' }}</span>
            </div>
            <div class="flex items-center gap-4">
              <span :class="['text-xs font-bold tracking-tight currency-font flex items-center gap-1', t.type === 'Income' ? 'text-success' : 'text-danger']">
                <ArrowUpRight v-if="t.type === 'Income'" class="w-3 h-3" />
                <ArrowDownRight v-else class="w-3 h-3" />
                {{ t.type === 'Income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
              </span>
              <div class="flex items-center gap-1.5">
                <button @click="handleEditClick(t)" class="p-2.5 text-text-secondary/40 hover:text-accent hover:bg-accent/10 rounded-lg transition-all">
                  <Edit2 class="w-4 h-4" />
                </button>
                <button @click="$emit('delete', t.id)" class="p-2.5 text-text-secondary/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-all">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal (Full Screen) -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[9999] bg-bg-main flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div
          class="relative pt-6 pb-6 text-white overflow-hidden shrink-0"
          style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
        >
          <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div class="relative z-10 w-full max-w-xl mx-auto px-5">
            <div class="flex items-center gap-3">
              <button @click="handleCloseModal" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
                <ChevronLeft class="w-5 h-5 stroke-[2.5] text-white" />
              </button>
              <div>
                <h1 class="text-[20px] font-black text-white tracking-tight leading-none">
                  {{ editId ? 'Edit Transaksi' : 'Catat Transaksi Baru' }}
                </h1>
                <div class="flex items-center gap-2 mt-1">
                  <div :class="['w-1.5 h-1.5 rounded-full', isListening ? 'bg-emerald-400 animate-pulse' : (isProcessingAI ? 'bg-accent/60 animate-pulse' : 'bg-white/30')]" />
                  <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em]">
                    {{ isListening ? 'Mendengarkan...' : (isProcessingAI ? 'AI sedang memproses...' : 'Input Data Manual atau AI') }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 relative z-10 overflow-y-auto no-scrollbar bg-bg-main text-text-primary border-0">
          <div class="w-full max-w-xl mx-auto min-h-full px-5 pt-6 pb-[192px] md:pb-12 flex flex-col justify-between">
            <div v-if="notify" :class="['flex items-start justify-between gap-3 px-4 py-3 mb-4 rounded-xl border-0', notify.type === 'error' ? 'bg-red-500/8 text-red-500' : 'bg-accent/8 text-accent']">
              <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <div :class="['w-1.5 h-1.5 rounded-full shrink-0 mt-0.5', notify.type === 'error' ? 'bg-red-500' : 'bg-accent']" />
                <p class="text-xs font-semibold leading-snug">{{ notify.message }}</p>
              </div>
              <button type="button" @click="notify = null" class="shrink-0 opacity-50 hover:opacity-100 transition-opacity">
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
 
            <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col justify-between mt-2">
              <div class="space-y-5 md:space-y-8 flex-1">
                <div class="flex gap-3 bg-bg-main p-1.5 rounded-lg border-0">
                  <button
                    type="button"
                    @click="type = 'Expense'"
                    :class="['flex-1 py-3 transition-all items-center justify-center gap-2 flex h-[50px] rounded-[8px] text-[12px] font-[900]', type === 'Expense' ? 'bg-danger/10 text-danger border-2 border-danger shadow-none' : 'text-text-secondary hover:text-text-primary border-2 border-border-ui/50']"
                  >
                    <ArrowDownRight class="w-4 h-4" /> Pengeluaran
                  </button>
                  <button
                    type="button"
                    @click="type = 'Income'"
                    :class="['flex-1 py-3 transition-all items-center justify-center gap-2 flex h-[50px] rounded-[8px] text-[12px] font-[900]', type === 'Income' ? 'bg-success/10 text-success border-2 border-success shadow-none' : 'text-text-secondary hover:text-text-primary border-2 border-border-ui/50']"
                  >
                    <ArrowUpRight class="w-4 h-4" /> Pemasukan
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div class="space-y-2">
                    <label class="block text-[10px] font-black text-text-secondary mb-1 uppercase tracking-widest px-1">Kategori</label>
                    <CustomSelect
                      required
                      :value="category"
                      @change="category = $event"
                      :options="categories"
                      placeholder="Pilih Kategori"
                      className="h-[52px] rounded-lg border-0"
                    />
                    <div v-if="category === 'Lainnya'" class="mt-3">
                      <input
                        type="text"
                        required
                        v-model="customCategory"
                        class="w-full h-[52px] px-4 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-sm rounded-xl shadow-sm transition-all duration-300"
                        placeholder="Ketik kategori kustom..."
                        ref="customCategoryInput"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-black text-text-secondary mb-1 uppercase tracking-widest px-1">Jumlah (RP)</label>
                    <div class="relative group">
                      <div class="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-text-secondary/50 group-focus-within:text-accent transition-colors">Rp</div>
                      <input
                        type="text"
                        required
                        v-model="amount"
                        @input="amount = formatInputNumber(amount)"
                        class="w-full h-[52px] !pl-11 pr-4 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary font-bold outline-none text-sm rounded-xl shadow-sm transition-all duration-300"
                        placeholder="0"
                        inputmode="decimal"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-black text-text-secondary mb-1 uppercase tracking-widest px-1">Tanggal Transaksi</label>
                    <DatePicker 
                      :value="date" 
                      @change="date = $event" 
                      placeholder="Pilih Tanggal"
                      className="w-full h-[52px] rounded-lg border-0"
                      :dropUp="!isMobile"
                    />
                  </div>

                  <div class="space-y-2">
                    <label class="block text-[10px] font-black text-text-secondary mb-1 uppercase tracking-widest px-1">Keterangan (Opsional)</label>
                    <input
                      type="text"
                      v-model="note"
                      class="w-full h-[52px] px-4 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-sm rounded-xl shadow-sm transition-all duration-300"
                      placeholder="Contoh: Belanja bulanan ke pasar"
                    />
                  </div>
                </div>

                <div class="h-px bg-border-ui/30 my-6" />

                <!-- Upload/Scan Struk -->
                <div class="space-y-2.5">
                  <span class="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Bukti Transaksi (Opsional)</span>
                  
                  <!-- Preview/Status if exists -->
                  <div v-if="receiptPreviewUrl || imageUrl" class="relative group rounded-xl overflow-hidden border border-border-ui/40 bg-bg-main p-3 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <!-- Thumbnail with centered eye overlay -->
                      <div
                        class="w-14 h-14 rounded-lg overflow-hidden border border-border-ui/30 bg-black/5 flex-shrink-0 relative cursor-pointer"
                        @click="viewFullImage(receiptPreviewUrl || imageUrl)"
                        title="Lihat Detail"
                      >
                        <img :src="receiptPreviewUrl || imageUrl" alt="Struk Preview" class="w-full h-full object-cover" />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye class="w-5 h-5 text-white drop-shadow" />
                        </div>
                      </div>
                      <div class="min-w-0">
                        <p class="text-xs font-bold text-text-primary truncate">Bukti Struk Transaksi</p>
                        <p class="text-[10px] text-text-secondary truncate mt-0.5">
                          {{ selectedReceiptFile ? 'Baru terpilih (unggah saat simpan)' : 'Sudah tersimpan di awan' }}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      @click="removeReceiptImage"
                      class="p-2 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition-colors flex items-center justify-center shrink-0"
                      title="Hapus Bukti"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>


                  <!-- Upload button if not exists -->
                  <div v-else>
                    <button
                      type="button"
                      @click="triggerReceiptUpload"
                      class="w-full py-4 px-4 bg-bg-main/60 hover:bg-bg-main rounded-xl border border-dashed border-border-ui/50 hover:border-accent/40 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer text-text-secondary hover:text-accent"
                    >
                      <div class="w-10 h-10 rounded-full bg-accent/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Camera class="w-5 h-5 text-text-secondary group-hover:text-accent" />
                      </div>
                      <div class="text-center">
                        <span class="text-xs font-bold">Ambil Foto atau Unggah Bukti Struk</span>
                        <p class="text-[9px] text-text-secondary/60 mt-0.5">PNG, JPG, JPEG (maks. 5MB)</p>
                      </div>
                    </button>
                    <input 
                      type="file" 
                      ref="receiptUploadInputRef" 
                      @change="handleReceiptUpload" 
                      accept="image/*" 
                      class="hidden" 
                    />
                  </div>
                </div>
              </div>

              <div :class="['bg-bg-main shrink-0 z-20 transition-all', isMobile ? 'fixed bottom-0 left-0 right-0 p-4 border-0 shadow-none backdrop-blur-md bg-bg-main/95' : 'pt-6 mt-auto']">
                <div class="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3">
                  <!-- Delete button — only in edit mode -->
                  <button
                    v-if="editId"
                    type="button"
                    @click="() => { emit('delete', editId!); handleCloseModal(); }"
                    class="w-full sm:w-auto h-[56px] px-5 rounded-lg bg-danger/10 border-0 text-danger font-black text-sm hover:bg-danger/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0"
                  >
                    <Trash2 class="w-4 h-4" />
                    <span class="uppercase tracking-wide">Hapus</span>
                  </button>

                  <button
                    type="submit"
                    class="w-full sm:flex-1 bg-gradient-to-r from-accent to-secondary text-white h-[56px] rounded-lg font-black text-sm shadow-none hover:shadow-none hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <component :is="editId ? Edit2 : Plus" class="w-4 h-4" />
                    {{ editId ? 'SIMPAN PERUBAHAN' : 'SIMPAN TRANSAKSI' }}
                  </button>
                  <div v-if="!editId" class="flex items-center gap-3 w-full sm:w-auto">
                    <button 
                      type="button" 
                      @click="toggleVoiceInput"
                      :disabled="isProcessingAI"
                      :class="[
                        'h-[56px] flex-1 sm:flex-none px-6 rounded-lg transition-all border-0 flex items-center justify-center gap-2 group select-none touch-none',
                        isListening 
                          ? 'bg-accent/20 text-accent animate-pulse shadow-none' 
                          : 'bg-accent/10 text-accent hover:bg-accent/20'
                      ]"
                    >
                      <Mic class="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span class="text-[10px] font-black sm:hidden uppercase">
                        {{ isListening ? 'Stop' : 'Rekam' }}
                      </span>
                    </button>
                    <button 
                      type="button" 
                      @click="triggerReceiptScan" 
                      :disabled="isProcessingAI"
                      class="h-[56px] flex-1 sm:flex-none px-6 rounded-lg bg-accent/10 border-0 text-accent hover:bg-accent/20 transition-all flex items-center justify-center gap-2 group"
                    >
                      <Loader2 v-if="isProcessingAI" class="w-5 h-5 animate-spin" />
                      <Camera v-else class="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span class="text-[10px] font-black sm:hidden uppercase">Scan</span>
                    </button>
                    <input 
                      type="file" 
                      ref="fileInputRef" 
                      @change="handleReceiptScan" 
                      accept="image/*" 
                      class="hidden" 
                      capture="environment"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Lightbox Modal for Receipt Image -->
    <Teleport to="body">
      <div v-if="showLightbox" class="fixed inset-0 z-[20000] flex items-center justify-center p-4">
        <div @click="showLightbox = false" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />
        <div class="relative max-w-full max-h-[90vh] z-10 flex flex-col items-center">
          <button 
            @click="showLightbox = false" 
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all shadow-lg"
          >
            <X class="w-6 h-6" />
          </button>
          <img 
            :src="lightboxImageUrl" 
            alt="Struk Fullscreen" 
            class="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/5" 
          />
          <p class="text-xs text-white/60 font-semibold mt-4 tracking-wider uppercase">Bukti Struk Transaksi</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  Plus, Trash2, X, Search, Edit2,
  Calendar as CalendarIcon, List as ListIcon, ChevronLeft, ChevronRight,
  ArrowUpRight, ArrowDownRight, Utensils, Car, ShoppingBag, Receipt,
  Gamepad2, HeartPulse, Wallet, SlidersHorizontal, ArrowUpDown, FileDown,
  TrendingUp, Mic, Camera, Loader2, Paperclip, Eye
} from '@lucide/vue';
import { aiService } from '../lib/ai';
import { uploadToCloudinary } from '../lib/cloudinary';
import type { Transaction, Budget } from '../types';
import { registerModal, unregisterModal } from '../composables/useAppState';
import { formatCurrency, formatInputNumber, parseInputNumber } from '../lib/utils';
import CustomSelect from './UI/CustomSelect.vue';
import DatePicker from './UI/DatePicker.vue';
import ExportImportModal from './ExportImportModal.vue';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday
} from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  userId: string;
  showAddModal: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});
const emit = defineEmits<{
  add: [t: Omit<Transaction, 'id'>];
  update: [t: Transaction];
  delete: [id: string];
  import: [data: Omit<Transaction, 'id'>[]];
  closeAddModal: [];
  addClick: [];
}>();

const showExportModal = ref(false);
const showFilters = ref(false);
const isMobile = ref(false);

const searchQuery = ref('');
const filterType = ref<'All' | 'Income' | 'Expense'>('All');
const filterCategory = ref('');
const viewMode = ref<'list' | 'calendar'>('list');
const sortOrder = ref<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
const currentMonth = ref(new Date());
const selectedDate = ref<Date | null>(null);

const editId = ref<string | null>(null);

// Form Add/Edit States
const type = ref<'Income' | 'Expense'>('Expense');
const category = ref('');
const customCategory = ref('');
const amount = ref('');
const note = ref('');
const date = ref(new Date().toISOString());
const imageUrl = ref('');
const selectedReceiptFile = ref<File | null>(null);
const receiptPreviewUrl = ref('');
const receiptUploadInputRef = ref<HTMLInputElement | null>(null);
const showLightbox = ref(false);
const lightboxImageUrl = ref('');

watch(showExportModal, (newVal) => {
  if (newVal) {
    registerModal('transactions-export', () => { showExportModal.value = false; });
  } else {
    unregisterModal('transactions-export');
  }
});

watch(showFilters, (newVal) => {
  if (newVal) {
    registerModal('transactions-filters', () => { showFilters.value = false; });
  } else {
    unregisterModal('transactions-filters');
  }
});

watch(showLightbox, (newVal) => {
  if (newVal) {
    registerModal('transactions-lightbox', () => { showLightbox.value = false; });
  } else {
    unregisterModal('transactions-lightbox');
  }
});


const isListening = ref(false);
const isProcessingAI = ref(false);
const notify = ref<{ type: 'info' | 'error'; message: string } | null>(null);

const fileInputRef = ref<HTMLInputElement | null>(null);
const mediaRecorderRef = ref<MediaRecorder | null>(null);
const audioChunksRef = ref<Blob[]>([]);
const pressStartTimeRef = ref<number>(0);
const isPressingRef = ref<boolean>(false);
const activeStreamRef = ref<MediaStream | null>(null);

const CATEGORY_ICONS: Record<string, any> = {
  'Makanan': Utensils,
  'Transportasi': Car,
  'Belanja': ShoppingBag,
  'Tagihan': Receipt,
  'Hiburan': Gamepad2,
  'Kesehatan': HeartPulse,
  'Lainnya': Wallet,
};

const getCategoryIcon = (cat: string) => {
  const normalized = cat.toLowerCase();
  const entry = Object.entries(CATEGORY_ICONS).find(([key]) => key.toLowerCase() === normalized);
  return entry ? entry[1] : Wallet;
};

const clearFilters = () => {
  searchQuery.value = '';
  filterType.value = 'All';
  filterCategory.value = '';
  sortOrder.value = 'date-desc';
};

const isFilterActive = computed(() => 
  filterType.value !== 'All' || filterCategory.value !== '' || sortOrder.value !== 'date-desc'
);

const allAvailableCategories = computed(() => 
  Array.from(new Set(props.transactions.map(t => t.category)))
);

const filteredTransactions = computed(() => {
  return props.transactions
    .filter(t => {
      const noteMatch = t.note.toLowerCase().includes(searchQuery.value.toLowerCase());
      const catMatch = t.category.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchesSearch = noteMatch || catMatch;
      const matchesType = filterType.value === 'All' || t.type === filterType.value;
      const matchesCategory = !filterCategory.value || t.category === filterCategory.value;
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOrder.value === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder.value === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder.value === 'amount-desc') return b.amount - a.amount;
      if (sortOrder.value === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
});

// Calendar Calculations
const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  return eachDayOfInterval({ start: startDate, end: endDate });
});

const isSelectedDate = (day: Date) => selectedDate.value && isSameDay(day, selectedDate.value);

const getDayTransactions = (day: Date) => {
  return props.transactions.filter(t => isSameDay(new Date(t.date), day));
};

const getDayIncome = (day: Date) => {
  return getDayTransactions(day).filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
};

const getDayExpense = (day: Date) => {
  return getDayTransactions(day).filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
};

const categories = computed(() => 
  type.value === 'Income'
    ? ['Gaji', 'Bonus', 'Investasi', 'Lainnya']
    : ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']
);

const handleEditClick = (t: Transaction) => {
  editId.value = t.id;
  type.value = t.type;
  if (categories.value.includes(t.category)) {
    category.value = t.category;
    customCategory.value = '';
  } else {
    category.value = 'Lainnya';
    customCategory.value = t.category;
  }
  amount.value = formatInputNumber(t.amount.toString());
  note.value = t.note || '';
  date.value = t.date;
  imageUrl.value = t.imageUrl || '';
  selectedReceiptFile.value = null;
  receiptPreviewUrl.value = '';
  emit('addClick');
};

const handleCloseModal = () => {
  emit('closeAddModal');
  setTimeout(() => {
    editId.value = null;
    imageUrl.value = '';
    selectedReceiptFile.value = null;
    receiptPreviewUrl.value = '';
  }, 200);
};

const triggerExport = () => {
  showExportModal.value = true;
  showFilters.value = false;
};

const toggleVoiceInput = () => {
  if (isListening.value) {
    stopVoiceInput();
  } else {
    startVoiceInput();
  }
};

const startVoiceInput = () => {
  if (isListening.value || isProcessingAI.value) return;
  notify.value = null;
  pressStartTimeRef.value = performance.now();
  isPressingRef.value = true;
  isListening.value = true;

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      activeStreamRef.value = stream;
      if (!isPressingRef.value) {
        stream.getTracks().forEach(track => track.stop());
        activeStreamRef.value = null;
        return;
      }

      try {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.value = mediaRecorder;
        audioChunksRef.value = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.value.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.value, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          activeStreamRef.value = null;

          const duration = performance.now() - pressStartTimeRef.value;
          if (duration < 500) {
            notify.value = { type: 'info', message: 'Durasi rekaman terlalu singkat.' };
            return;
          }

          isProcessingAI.value = true;
          try {
            const text = await aiService.transcribeAudio(audioBlob);
            if (!text) {
              notify.value = { type: 'error', message: 'Gagal mentranskripsi suara. Pastikan mikrofon berfungsi dan coba lagi.' };
              return;
            }

            const result = await aiService.parseVoiceCommand(text);
            if (result) {
              type.value = result.type;
              const matchedCategory = categories.value.find(c => c.toLowerCase() === result.category.toLowerCase());
              if (matchedCategory) {
                category.value = matchedCategory;
                customCategory.value = '';
              } else {
                category.value = 'Lainnya';
                customCategory.value = result.category;
              }
              amount.value = formatInputNumber(result.amount.toString());
              note.value = result.note;
            } else {
              notify.value = { type: 'error', message: 'AI gagal mengekstrak rincian transaksi.' };
            }
          } catch {
            notify.value = { type: 'error', message: 'Terjadi kesalahan memproses suara.' };
          } finally {
            isProcessingAI.value = false;
          }
        };

        mediaRecorder.start();
      } catch {
        stream.getTracks().forEach(track => track.stop());
        activeStreamRef.value = null;
        isListening.value = false;
        isPressingRef.value = false;
        notify.value = { type: 'error', message: 'Gagal memulai rekaman.' };
      }
    })
    .catch(() => {
      isListening.value = false;
      isPressingRef.value = false;
      notify.value = { type: 'error', message: 'Izin akses mikrofon ditolak.' };
    });
};

const stopVoiceInput = () => {
  isPressingRef.value = false;
  isListening.value = false;
  if (mediaRecorderRef.value && mediaRecorderRef.value.state !== 'inactive') {
    try {
      mediaRecorderRef.value.stop();
    } catch {}
  }
};

const triggerReceiptScan = () => {
  fileInputRef.value?.click();
};

const handleReceiptScan = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  notify.value = null;
  if (file.size > 10 * 1024 * 1024) {
    notify.value = { type: 'error', message: 'Ukuran gambar terlalu besar. Maksimal 10MB.' };
    return;
  }

  isProcessingAI.value = true;
  const reader = new FileReader();
  reader.onloadend = async () => {
    try {
      const base64 = reader.result as string;
      const result = await aiService.scanReceipt(base64);
      if (result) {
        type.value = result.type;
        const matchedCategory = categories.value.find(c => c.toLowerCase() === result.category.toLowerCase());
        if (matchedCategory) {
          category.value = matchedCategory;
          customCategory.value = '';
        } else {
          category.value = 'Lainnya';
          customCategory.value = result.category;
        }
        amount.value = formatInputNumber(result.amount.toString());
        note.value = result.note;
        
        // Save scanned file and set local preview url
        selectedReceiptFile.value = file;
        receiptPreviewUrl.value = URL.createObjectURL(file);
      } else {
        notify.value = { type: 'error', message: 'AI gagal memindai struk.' };
      }
    } catch {
      notify.value = { type: 'error', message: 'Gagal memproses gambar struk.' };
    } finally {
      isProcessingAI.value = false;
      if (fileInputRef.value) fileInputRef.value.value = '';
    }
  };
  reader.readAsDataURL(file);
};

const triggerReceiptUpload = () => {
  receiptUploadInputRef.value?.click();
};

const handleReceiptUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    notify.value = { type: 'error', message: 'Ukuran gambar terlalu besar. Maksimal 5MB.' };
    return;
  }

  selectedReceiptFile.value = file;
  receiptPreviewUrl.value = URL.createObjectURL(file);
};

const removeReceiptImage = () => {
  imageUrl.value = '';
  selectedReceiptFile.value = null;
  receiptPreviewUrl.value = '';
  if (receiptUploadInputRef.value) receiptUploadInputRef.value.value = '';
};

const viewFullImage = (url: string) => {
  lightboxImageUrl.value = url;
  showLightbox.value = true;
};

const handleSubmit = async () => {
  isProcessingAI.value = true;
  try {
    let finalImageUrl = imageUrl.value;
    if (selectedReceiptFile.value) {
      notify.value = { type: 'info', message: 'Mengunggah gambar struk ke Cloudinary...' };
      finalImageUrl = await uploadToCloudinary(selectedReceiptFile.value);
      selectedReceiptFile.value = null;
    }

    const finalCategory = category.value === 'Lainnya' && customCategory.value.trim() !== '' ? customCategory.value.trim() : category.value;
    const txData: any = {
      userId: props.userId,
      type: type.value,
      category: finalCategory,
      amount: Number(parseInputNumber(amount.value)),
      date: editId.value ? new Date(date.value).toISOString() : date.value,
      note: note.value,
      imageUrl: finalImageUrl || ''
    };

    if (editId.value) {
      emit('update', { id: editId.value, ...txData });
    } else {
      emit('add', txData);
    }
    handleCloseModal();
  } catch (err: any) {
    notify.value = { type: 'error', message: err.message || 'Gagal menyimpan transaksi.' };
  } finally {
    isProcessingAI.value = false;
  }
};

watch(() => props.showAddModal, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    if (!editId.value) {
      type.value = 'Expense';
      category.value = '';
      customCategory.value = '';
      amount.value = '';
      note.value = '';
      date.value = new Date().toISOString();
      imageUrl.value = '';
      selectedReceiptFile.value = null;
      receiptPreviewUrl.value = '';
    }
  } else {
    document.body.style.overflow = '';
  }
});

const updateMobileStatus = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  updateMobileStatus();
  window.addEventListener('resize', updateMobileStatus);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateMobileStatus);
  if (mediaRecorderRef.value && mediaRecorderRef.value.state !== 'inactive') {
    try { mediaRecorderRef.value.stop(); } catch {}
  }
  if (activeStreamRef.value) {
    try { activeStreamRef.value.getTracks().forEach(t => t.stop()); } catch {}
  }
});
</script>
