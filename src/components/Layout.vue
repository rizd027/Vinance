<template>
  <div class="h-[100dvh] bg-bg-main flex overflow-hidden relative" @click="showNotifications = false">



    <!-- ── Sidebar (Desktop Only) ── -->
    <aside class="hidden lg:flex flex-col sticky top-0 h-screen border-0 transition-all duration-500 ease-in-out z-40 bg-sidebar-bg group/sidebar overflow-hidden w-20 hover:w-64">
      <div class="px-5 py-6 border-0 flex items-center gap-4 h-[89px] shrink-0">
        <button @click="$emit('tabChange', 'home')" class="flex items-center gap-3.5 flex-1 hover:bg-sidebar-text-primary/5 transition-colors text-left group rounded-lg -ml-1 pl-1 py-1">
          <div class="relative flex-shrink-0">
            <div class="absolute -inset-2 bg-accent/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition duration-500" />
            <div class="relative w-10 h-10 bg-white dark:bg-slate-50 rounded-lg flex items-center justify-center shadow-xl border border-slate-200 dark:border-accent/10 p-1.5 transition-transform group-hover:scale-105 duration-300">
              <img src="/Logo-Vinance.png" alt="Vinance Logo" class="w-full h-full object-contain" />
            </div>
          </div>
          <div class="flex flex-col opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <span class="text-xl font-black tracking-tight text-sidebar-text-primary leading-none">Vinance</span>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="h-[1.5px] w-3 bg-gradient-to-r from-accent to-secondary rounded-full" />
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-secondary/80">Ecosystem</span>
            </div>
          </div>
        </button>
        <div class="flex-shrink-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
          <RefreshCw v-if="syncing" class="w-3.5 h-3.5 text-accent animate-spin" />
          <div v-else :class="['w-2 h-2 rounded-full shadow-sm', isOnline ? 'bg-success shadow-success/40' : 'bg-danger shadow-danger/40']" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto no-scrollbar py-6 px-3.5 space-y-8">
        <div class="space-y-1.5">
          <p class="px-3.5 mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-text-secondary/40 whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">{{ $t('navMenu') }}</p>
          <nav class="space-y-1">
            <button
              v-for="tab in mainTabs" :key="tab.id"
              @click="handleTabClick(tab.id)"
              :class="[
                'w-full flex items-center gap-3.5 px-3.5 py-3 text-sm transition-all rounded-lg font-bold relative group',
                activeTab === tab.id
                  ? 'text-accent bg-accent/10 shadow-inner'
                  : 'text-sidebar-text-secondary hover:text-sidebar-text-primary hover:bg-bg-main/40'
              ]"
            >
              <component :is="tab.icon" :class="['w-5 h-5 shrink-0 transition-all duration-300', activeTab === tab.id ? 'scale-110' : 'group-hover:translate-x-0.5']" />
              <span class="flex-1 text-left tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">{{ tab.label }}</span>
              <span v-if="tab.id === 'transactions' && transactionBadge" :class="['flex-shrink-0 w-5 h-5 bg-gradient-to-r from-accent to-secondary text-white text-[10px] font-bold rounded-lg flex items-center justify-center shadow-lg shadow-accent/20 transition-all', 'group-hover/sidebar:scale-100 scale-0 group-hover/sidebar:opacity-100 opacity-0']">{{ transactionBadge }}</span>
            </button>
          </nav>
        </div>
      </div>

      <div class="p-3.5 border-0 space-y-1 shrink-0">
        <button @click="handleTabClick('profile')" :class="['w-full flex items-center gap-3.5 px-3.5 py-3 text-sm transition-all rounded-lg font-medium group', activeTab === 'profile' ? 'text-accent bg-accent/10 shadow-inner' : 'text-sidebar-text-secondary hover:text-sidebar-text-primary hover:bg-bg-main/40']">
          <User :class="['w-5 h-5 shrink-0 transition-all', activeTab === 'profile' && 'scale-110']" />
          <span class="tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">{{ $t('navProfile') }}</span>
        </button>
        <button @click="$emit('logout')" class="w-full flex items-center gap-3.5 px-3.5 py-3 text-sm font-medium text-danger/80 hover:text-danger hover:bg-danger/5 transition-all rounded-lg group">
          <div class="w-5 h-5 shrink-0 flex items-center justify-center transition-transform group-hover:-translate-x-0.5">
            <LogOut class="w-5 h-5" />
          </div>
          <span class="tracking-wide opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 whitespace-nowrap">{{ $t('logout') }}</span>
        </button>
      </div>
    </aside>

    <!-- ── Main Content Area ── -->
    <div class="flex-1 flex flex-col h-[100dvh] overflow-y-auto pb-[62px] lg:pb-0 min-w-0 no-scrollbar sm:custom-scrollbar relative transition-colors">



      <!-- Desktop Header -->
      <header :class="['bg-card-bg/80 backdrop-blur-xl border-0 px-4 sm:px-6 py-4 flex items-center justify-between z-20 sticky top-0 transition-all', isMobile && 'hidden']">
        <div class="relative z-10 w-full flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button @click="$emit('tabChange', 'home')" class="flex lg:hidden items-center gap-2.5 active:scale-95 transition-transform">
              <div class="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-lg p-1.5 border border-accent/20">
                <img src="/Logo-Vinance.png" alt="Vinance Logo" class="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div class="flex flex-col items-start">
                <span class="text-lg font-black text-text-primary tracking-tight leading-none">Vinance</span>
                <span class="text-[9px] text-text-secondary font-bold uppercase tracking-widest mt-1">Ecosystem</span>
              </div>
            </button>

            <div v-if="activeTabDef" class="hidden lg:flex items-center gap-3">
              <div class="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center border border-accent/20 shadow-inner">
                <component :is="activeTabDef.icon" class="w-5 h-5 text-accent" />
              </div>
              <div class="flex flex-col justify-center">
                <h1 class="text-lg font-black text-text-primary leading-none tracking-tight">{{ activeTabDef.label }}</h1>
                <p class="text-[10px] text-text-secondary font-bold mt-1.5 uppercase tracking-widest">{{ tabSubtitle }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-2.5 relative">
            <!-- Online/Sync Status -->
            <div class="relative">
              <button
                @click.stop="showNotifications = !showNotifications"
                :class="[
                  'flex items-center justify-center h-8 sm:h-10 px-3 sm:px-4 rounded-lg border transition-all duration-300 relative group overflow-hidden shadow-sm',
                  syncing ? 'bg-accent/10 border-accent/30 text-accent'
                    : isOnline ? 'bg-accent/5 border-accent/25 text-accent hover:border-accent/40 hover:bg-accent/10'
                    : 'bg-danger/10 border-danger/20 text-danger',
                  showNotifications && 'ring-2 ring-accent/30 border-accent/50 bg-accent/5'
                ]"
              >
                <div class="flex items-center gap-2.5 relative z-10">
                  <RefreshCw v-if="syncing" class="w-4 h-4 animate-spin shrink-0" />
                  <div v-else-if="isOnline" class="relative">
                    <Cloud class="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 duration-300" />
                    <div class="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full border-2 border-white dark:border-slate-800 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                  </div>
                  <div v-else class="relative">
                    <CloudOff class="w-4 h-4 shrink-0" />
                    <div class="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full border-2 border-white dark:border-slate-800" />
                  </div>
                  <div class="flex flex-col items-start leading-none hidden sm:flex">
                    <span class="text-[10px] font-black uppercase tracking-widest">{{ syncing ? 'Sinkronisasi' : isOnline ? 'Online' : 'Offline' }}</span>
                  </div>
                  <div v-if="notificationCount > 0" class="w-4 h-4 bg-accent text-white text-[9px] font-black rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">{{ notificationCount }}</div>
                </div>
              </button>

              <!-- Notifications Dropdown (Desktop) -->
              <div v-if="showNotifications" @click.stop class="absolute right-0 mt-3 w-80 bg-card-bg/95 backdrop-blur-2xl border border-border-ui rounded-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                <div class="flex items-center justify-between px-4 pt-4 pb-2">
                  <h4 class="text-xs font-black text-text-primary uppercase tracking-widest">Pemberitahuan</h4>
                  <div class="flex items-center gap-2">
                    <span v-if="notifCount > 0" class="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{{ notifCount }} Aktivitas</span>
                    <button v-if="notifCount > 0" @click.stop="clearAllNotifs" class="text-[9px] font-bold text-text-secondary hover:text-danger transition-colors uppercase tracking-wide">Hapus Semua</button>
                  </div>
                </div>
                <div class="space-y-1.5 max-h-[420px] overflow-y-auto no-scrollbar px-3 pb-3">
                  <div v-if="notifCount === 0" class="flex flex-col items-center justify-center py-10 text-text-secondary/40">
                    <Bell class="w-8 h-8 mb-2 stroke-[1.5]" />
                    <p class="text-[10px] font-bold uppercase tracking-widest">Tidak ada notifikasi</p>
                  </div>
                  <div
                    v-for="notif in notifications"
                    :key="notif.id"
                    :class="['p-3 rounded-xl flex items-start gap-3 border transition-all group', notifClass(notif.type)]"
                  >
                    <div class="w-7 h-7 rounded-lg bg-current/10 flex items-center justify-center shrink-0 border-0 mt-0.5">
                      <CheckCircle2 v-if="notif.type === 'success'" class="w-4 h-4" />
                      <AlertOctagon v-else-if="notif.type === 'error'" class="w-4 h-4" />
                      <AlertTriangle v-else-if="notif.type === 'warning'" class="w-4 h-4" />
                      <Info v-else class="w-4 h-4" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-[11px] font-bold leading-snug">{{ notif.message }}</p>
                      <p class="text-[9px] text-text-secondary/60 mt-0.5 font-medium">{{ formatRelativeTime(notif.timestamp) }}</p>
                    </div>
                    <button @click.stop="removeNotif(notif.id)" class="opacity-0 group-hover:opacity-100 shrink-0 p-0.5 rounded hover:bg-current/10 transition-all">
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Theme toggle -->
            <button @click="$emit('toggleTheme')" :class="['flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-md transition-all border backdrop-blur-md shadow-inner', isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-bg-main border-border-ui text-text-secondary hover:bg-border-ui']">
              <Sun v-if="isDark" class="w-4 h-4" />
              <Moon v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <!-- Main slot content -->
      <main :class="['flex-1 max-w-[1600px] mx-auto w-full relative z-10', isMobile ? 'p-0' : 'p-5']">
        <template v-if="isMobile && activeTab !== 'home'">
          <div>
            <!-- ══ Mobile Page Header ══ -->
            <div
              class="relative pt-4 pb-12 px-5 text-white overflow-hidden"
              style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
            >
              <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
              <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div class="relative z-10">
                <div class="flex items-center justify-between">
                  <!-- Page title + icon pill -->
                  <div class="flex items-center gap-3">
                    <div v-if="activeTabDef" class="w-9 h-9 rounded-xl bg-white/12 border border-white/15 flex items-center justify-center">
                      <component :is="activeTabDef.icon" class="w-4.5 h-4.5 text-white/90" />
                    </div>
                    <div>
                      <p class="text-[20px] font-black text-white tracking-tight leading-none">{{ activeTabDef?.label || 'Vinance' }}</p>
                      <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">{{ mobileTabSubtitle }}</p>
                    </div>
                  </div>

                  <!-- Controls -->
                  <div class="flex items-center gap-2">
                    <button v-if="activeTabDef?.id !== 'profile'" @click="$emit('toggleTheme')" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:scale-90 transition-all">
                      <Sun v-if="isDark" class="w-4 h-4 text-amber-300" />
                      <Moon v-else class="w-4 h-4 text-white/80" />
                    </button>
                    <button @click.stop="showNotifications = !showNotifications" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:scale-90 transition-all relative">
                      <Bell class="w-4 h-4 text-white/80" />
                      <span v-if="notifCount > 0" class="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full border-0 animate-pulse" />
                    </button>
                    <button v-if="activeTabDef?.id !== 'profile'" @click="handleTabClick('profile')" class="w-10 h-10 rounded-full active:scale-90 transition-all focus:outline-none ring-2 ring-white/20">
                      <img v-if="user?.photoUrl" :src="user.photoUrl" alt="profil" class="w-10 h-10 rounded-full object-cover" />
                      <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/40 to-indigo-500/40 border-0 flex items-center justify-center">
                        <span class="text-white font-black text-sm">{{ user?.name ? user.name[0].toUpperCase() : 'U' }}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- ══ Content Sheet ══ -->
            <div class="bg-bg-main rounded-t-[10px] mt-[-28px] relative z-10 px-4 pt-6 pb-20 min-h-[calc(100dvh-120px)]">
              <slot />
            </div>
          </div>
        </template>
        <template v-else>
          <slot />
        </template>
      </main>

      <!-- Mobile Bottom Nav — Solid Full-Width Bar -->
      <div class="lg:hidden fixed bottom-0 left-0 right-0 w-full z-30 pointer-events-none" style="padding-bottom: env(safe-area-inset-bottom)">
        <!-- Solid bar background -->
        <div class="relative h-[62px] backdrop-blur-2xl bg-card-bg/98 border-t border-border-ui/20 pointer-events-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">

          <!-- Nav Tab Items — 5 columns -->
          <div class="absolute inset-0 flex items-stretch justify-around px-1">

            <button @click="handleTabClick('home')" class="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div :class="['absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300', activeTab === 'home' ? 'w-8 bg-accent' : 'w-0 bg-transparent']" />
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200', activeTab === 'home' ? 'bg-accent/10' : 'group-active:bg-bg-main']">
                <Home :class="['transition-all duration-300', activeTab === 'home' ? 'w-[22px] h-[22px] text-accent' : 'w-[20px] h-[20px] text-text-secondary/50']" />
              </div>
            </button>

            <!-- Transaksi -->
            <button @click="handleTabClick('transactions')" class="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div :class="['absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300', activeTab === 'transactions' ? 'w-8 bg-accent' : 'w-0 bg-transparent']" />
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200', activeTab === 'transactions' ? 'bg-accent/10' : 'group-active:bg-bg-main']">
                <List :class="['transition-all duration-300', activeTab === 'transactions' ? 'w-[22px] h-[22px] text-accent' : 'w-[20px] h-[20px] text-text-secondary/50']" />
              </div>
            </button>

            <!-- Tambah -->
            <button @click="$emit('addClick')" class="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-white active:scale-90 hover:scale-105 transition-all duration-200 shadow-lg shadow-accent/30" style="background: linear-gradient(145deg, #2D4DB5 0%, #1A2C5B 100%)">
                <Plus class="w-5 h-5 stroke-[2.5]" />
              </div>
            </button>

            <!-- Laporan -->
            <button @click="handleTabClick('reports')" class="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div :class="['absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300', activeTab === 'reports' ? 'w-8 bg-accent' : 'w-0 bg-transparent']" />
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200', activeTab === 'reports' ? 'bg-accent/10' : 'group-active:bg-bg-main']">
                <PieChart :class="['transition-all duration-300', activeTab === 'reports' ? 'w-[22px] h-[22px] text-accent' : 'w-[20px] h-[20px] text-text-secondary/50']" />
              </div>
            </button>

            <!-- Lainnya -->
            <button @click="handleTabClick('menu')" class="flex flex-col items-center justify-center flex-1 h-full relative group">
              <div :class="['absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300', ['menu','profile','budgets','goals','notes'].includes(activeTab) ? 'w-8 bg-accent' : 'w-0 bg-transparent']" />
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200', ['menu','profile','budgets','goals','notes'].includes(activeTab) ? 'bg-accent/10' : 'group-active:bg-bg-main']">
                <LayoutGrid :class="['transition-all duration-300', ['menu','profile','budgets','goals','notes'].includes(activeTab) ? 'w-[22px] h-[22px] text-accent' : 'w-[20px] h-[20px] text-text-secondary/50']" />
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>

    <!-- Global Toast Container -->
    <Teleport to="body">
      <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts" :key="toast.id"
            :class="['p-3 rounded-xl flex items-center gap-3 border shadow-xl backdrop-blur-xl pointer-events-auto w-full', toastSolidClass(toast.type)]"
          >
            <div class="shrink-0 bg-white/20 p-1.5 rounded-lg">
              <CheckCircle2 v-if="toast.type === 'success'" class="w-4 h-4" />
              <AlertOctagon v-else-if="toast.type === 'error'" class="w-4 h-4" />
              <AlertTriangle v-else-if="toast.type === 'warning'" class="w-4 h-4" />
              <Info v-else class="w-4 h-4" />
            </div>
            <p class="text-xs font-bold leading-tight flex-1">{{ toast.message }}</p>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- Global Dialog Modal -->
    <Teleport to="body">
      <div v-if="activeDialog" class="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div class="relative w-full max-w-sm bg-card-bg rounded-2xl shadow-2xl border border-border-ui p-6">
          <div class="flex flex-col items-center text-center space-y-4">
            <div class="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <AlertCircle v-if="activeDialog.type === 'confirm'" class="w-8 h-8" />
              <Info v-else class="w-8 h-8" />
            </div>
            <div>
              <h3 class="text-xl font-black text-text-primary tracking-tight">{{ activeDialog.title }}</h3>
              <p class="text-sm text-text-secondary mt-2 leading-relaxed">{{ activeDialog.message }}</p>
            </div>
            <div class="flex gap-3 w-full pt-4">
              <button v-if="activeDialog.type === 'confirm'" @click="activeDialog.onCancel()" class="flex-1 py-3.5 bg-bg-main text-text-secondary rounded-xl text-xs font-bold border border-border-ui hover:bg-border-ui transition-colors">
                {{ (activeDialog.cancelText || 'Batal').toUpperCase() }}
              </button>
              <button @click="activeDialog.onConfirm()" class="flex-1 py-3.5 bg-accent text-white rounded-xl text-xs font-black shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-95 transition-all">
                {{ (activeDialog.confirmText || 'Oke').toUpperCase() }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Mobile Notification Panel -->
    <Teleport to="body">
      <div v-if="isMobile && showNotifications" class="fixed inset-0 z-[10000] bg-bg-main flex flex-col overflow-hidden" @click.stop>
        <div
          class="relative pt-4 pb-12 px-5 text-white overflow-hidden shrink-0"
          style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
        >
          <div class="absolute top-0 right-0 w-56 h-56 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
          <div class="absolute -bottom-12 -left-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <button @click="showNotifications = false" class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all">
                  <ArrowLeft class="w-5 h-5 stroke-[2.5] text-white" />
                </button>
                <div>
                  <h1 class="text-[20px] font-black text-white tracking-tight leading-none">{{ $t('notifications') }}</h1>
                  <p class="text-[9.5px] font-semibold text-white/45 uppercase tracking-[0.2em] mt-1">Informasi &amp; Aktivitas</p>
                </div>
              </div>
              <span v-if="notifCount > 0" class="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/25">{{ notifCount }} Aktivitas</span>
            </div>
          </div>
        </div>
        <div class="flex-1 bg-bg-main rounded-t-[10px] mt-[-28px] relative z-10 px-5 pt-8 pb-12 overflow-y-auto no-scrollbar">
          <div class="space-y-3 max-w-lg mx-auto">
            <div v-if="notifCount === 0" class="flex flex-col items-center justify-center py-28 text-text-secondary/30">
              <div class="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center border border-accent/10 mb-4 animate-pulse">
                <Bell class="w-8 h-8 text-accent/60 stroke-[1.5]" />
              </div>
              <p class="text-xs font-bold uppercase tracking-widest text-center">{{ $t('noNotifications') }}</p>
            </div>
            <template v-else>
              <!-- Clear all button -->
              <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] text-text-secondary font-bold uppercase tracking-widest">{{ notifCount }} Aktivitas</p>
                <button @click="clearAllNotifs" class="text-[10px] font-black text-danger/70 hover:text-danger uppercase tracking-wide transition-colors">Hapus Semua</button>
              </div>
              <div
                v-for="notif in notifications"
                :key="notif.id"
                :class="['p-4 rounded-2xl flex items-start gap-3.5 border-0 transition-all group', toastClass(notif.type)]"
              >
                <div class="w-9 h-9 rounded-xl bg-current/10 flex items-center justify-center shrink-0 border-0">
                  <CheckCircle2 v-if="notif.type === 'success'" class="w-5 h-5" />
                  <AlertOctagon v-else-if="notif.type === 'error'" class="w-5 h-5" />
                  <AlertTriangle v-else-if="notif.type === 'warning'" class="w-5 h-5" />
                  <Info v-else class="w-5 h-5" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold leading-normal mt-0.5">{{ notif.message }}</p>
                  <p class="text-[10px] text-text-secondary/60 mt-1 font-medium">{{ formatRelativeTime(notif.timestamp) }}</p>
                </div>
                <button @click="removeNotif(notif.id)" class="shrink-0 p-1.5 rounded-lg hover:bg-current/10 transition-all opacity-60 hover:opacity-100">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { isToday, isYesterday, format, formatDistanceToNow } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useI18n } from 'vue-i18n';
import {
  Home, List, PieChart, Target, User, LogOut, Moon, Sun, Plus, RefreshCw,
  StickyNote, Flag, Cloud, CloudOff, LayoutGrid, Bell, X,
  AlertCircle, CheckCircle2, AlertOctagon, AlertTriangle, Info, ArrowLeft
} from '@lucide/vue';
import type { Transaction, Budget, User as UserType } from '../types';
import { useNotifications } from '../composables/useNotifications';

interface Props {
  activeTab: string;
  user: UserType;
  isDark: boolean;
  transactions: Transaction[];
  budgets: Budget[];
  syncing: boolean;
  toasts?: any[];
  activeDialog?: any;
}

const props = withDefaults(defineProps<Props>(), {
  toasts: () => [],
  activeDialog: null,
});

const emit = defineEmits<{
  tabChange: [tab: string];
  toggleTheme: [];
  logout: [];
  addClick: [];
}>();

const isOnline = ref(navigator.onLine);
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

const { t } = useI18n();

const mainTabs = computed(() => [
  { id: 'home', icon: Home, label: t('navHome') },
  { id: 'transactions', icon: List, label: t('navTransactions') },
  { id: 'budgets', icon: Target, label: t('navBudgets') },
  { id: 'reports', icon: PieChart, label: t('navReports') },
  { id: 'goals', icon: Flag, label: t('navGoals') },
  { id: 'notes', icon: StickyNote, label: t('navNotes') },
]);
const allTabs = computed(() => [...mainTabs.value, { id: 'profile', icon: User, label: t('navProfile') }, { id: 'menu', icon: LayoutGrid, label: t('navMenu') }]);

const transactionBadge = computed(() => {
  const count = (props.transactions || []).filter(t => isToday(new Date(t.date))).length;
  return count > 0 ? count : null;
});

const activeTabDef = computed(() => allTabs.value.find(t => t.id === props.activeTab));

const { notifications, removeNotif, clearAll: clearAllNotifs, isPanelOpen: showNotifications } = useNotifications();
const notifCount = computed(() => notifications.value.length);
const notificationCount = computed(() => notifCount.value);

const notifClass = (type: string) => {
  if (type === 'success') return 'text-success bg-success/5';
  if (type === 'error') return 'text-danger bg-danger/5';
  if (type === 'warning') return 'text-warning bg-warning/5';
  return 'text-accent bg-accent/5';
};

const formatRelativeTime = (ts: number) => {
  try {
    const date = new Date(ts);
    const timeStr = format(date, 'HH:mm');
    let dateStr = '';
    if (isToday(date)) {
      dateStr = `Hari ini, ${timeStr}`;
    } else if (isYesterday(date)) {
      dateStr = `Kemarin, ${timeStr}`;
    } else {
      dateStr = format(date, 'dd MMM yyyy, HH:mm', { locale: dateFnsLocaleId });
    }
    const relativeStr = formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocaleId });
    return `${dateStr} • ${relativeStr}`;
  } catch {
    return '';
  }
};

const tabSubtitle = computed(() => {
  const id = props.activeTab;
  return id === 'home' ? t('subHome')
    : id === 'transactions' ? t('subTransactions')
    : id === 'budgets' ? t('subBudgets')
    : id === 'reports' ? t('subReports')
    : id === 'goals' ? t('subGoals')
    : id === 'notes' ? t('subNotes')
    : t('subProfile');
});

const mobileTabSubtitle = computed(() => {
  const id = activeTabDef.value?.id;
  return id === 'transactions' ? t('subTransactions')
    : id === 'budgets' ? t('subBudgets')
    : id === 'reports' ? t('subReports')
    : id === 'goals' ? t('subGoals')
    : id === 'notes' ? t('subNotes')
    : id === 'menu' ? t('navMenu')
    : t('subProfile');
});



const toastClass = (type: string) => {
  if (type === 'success') return 'bg-success/5 border-0 text-success';
  if (type === 'error') return 'bg-danger/5 border-0 text-danger';
  if (type === 'warning') return 'bg-warning/5 border-0 text-warning';
  return 'bg-accent/5 border-0 text-accent';
};

const toastSolidClass = (type: string) => {
  if (type === 'success') return 'bg-success/90 border-0 text-white';
  if (type === 'error') return 'bg-danger/90 border-0 text-white';
  if (type === 'warning') return 'bg-warning/90 border-0 text-white';
  return 'bg-accent/90 border-0 text-white';
};

const handleTabClick = (tabId: string) => {
  if (props.activeTab === tabId) return;
  emit('tabChange', tabId);
};

const handleOnline = () => { isOnline.value = true; };
const handleOffline = () => { isOnline.value = false; };
const handleResize = () => { isMobile.value = window.innerWidth < 1024; };

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-12px); }
.toast-leave-to { opacity: 0; transform: translateY(-12px); }
</style>
