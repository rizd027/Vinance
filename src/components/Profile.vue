<template>
  <div class="space-y-6 pb-4">
    <!-- EDIT PROFILE VIEW -->
    <div v-if="profileView === 'edit'" class="space-y-6 pb-4">
      <div class="flex items-center gap-4 mb-2">
        <button
          @click="closeEditProfile"
          class="w-10 h-10 rounded-lg bg-bg-main border-0 flex items-center justify-center hover:bg-bg-main/80 transition-colors shadow-none"
        >
          <ArrowLeft class="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h2 class="text-xl font-black text-text-primary tracking-tight">Edit Profil</h2>
          <p class="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Pengaturan Akun &amp; Keamanan</p>
        </div>
      </div>

      <div class="bg-transparent p-0 border-0 space-y-6">
        <div v-if="editStep === 1">
          <div class="flex flex-col items-center gap-3">
            <div class="relative group">
              <div class="w-24 h-24 rounded-lg overflow-hidden border-4 border-bg-main bg-bg-main shadow-xl">
                <img v-if="editPhoto" :src="editPhoto" alt="Preview" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                  <span class="text-3xl font-black text-white">{{ editName[0]?.toUpperCase() || '?' }}</span>
                </div>
                <div v-if="savingProfile" class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw class="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <label class="absolute -bottom-2 -right-2 w-10 h-10 bg-accent rounded-lg flex items-center justify-center border-4 border-card-bg shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <Palette class="w-5 h-5 text-white" />
                <input type="file" accept="image/*" class="hidden" @change="handlePhotoUpload" :disabled="savingProfile" />
              </label>
            </div>
            <div class="text-center">
              <p class="text-sm font-bold text-text-primary">Foto Profil</p>
              <p class="text-[10px] text-text-secondary mt-0.5">PNG, JPG maks. 2MB</p>
            </div>
          </div>

          <div class="h-px bg-border-ui/50 my-6" />

          <div class="space-y-2">
            <span class="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] px-1">Nama Lengkap</span>
            <div class="relative">
              <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                v-model="editName"
                class="w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border-0 outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div class="h-px bg-border-ui/50 my-6" />

          <div class="space-y-2.5">
            <div class="flex items-center gap-2 px-1">
              <Mail class="w-3.5 h-3.5 text-blue-500" />
              <span class="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Ganti Email</span>
              <span class="ml-auto text-[9px] font-bold text-text-secondary/50 bg-border-ui/50 px-2 py-0.5 rounded-full">Opsional</span>
            </div>
            <div class="space-y-2">
              <div class="relative">
                <Mail class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50" />
                <input
                  type="email"
                  :value="user.email"
                  readonly
                  class="w-full pl-11 pr-20 py-3.5 bg-bg-main/30 rounded-lg border-0 outline-none text-sm font-bold text-text-secondary cursor-not-allowed"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-text-secondary/50 uppercase tracking-widest bg-border-ui/70 px-2 py-0.5 rounded-full">Aktif</span>
              </div>
              <div class="relative">
                <ArrowRight class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                <input
                  type="email"
                  v-model="editNewEmail"
                  class="w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border-0 outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50"
                  placeholder="Masukkan email baru"
                />
              </div>
            </div>
          </div>

          <div class="h-px bg-border-ui/50 my-6" />

          <div class="space-y-2.5">
            <div class="flex items-center gap-2 px-1">
              <Lock class="w-3.5 h-3.5 text-rose-500" />
              <span class="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">Ganti Password</span>
              <span class="ml-auto text-[9px] font-bold text-text-secondary/50 bg-border-ui/50 px-2 py-0.5 rounded-full">Opsional</span>
            </div>
            <div class="space-y-2">
              <div class="relative">
                <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="password"
                  v-model="editPassword"
                  :class="[
                    'w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border-0 outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50',
                    isSensitiveChange && !editPassword && 'border-rose-500/50 bg-rose-500/5'
                  ]"
                  placeholder="Masukkan password lama"
                />
              </div>
              <div class="relative">
                <ArrowRight class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                <input
                  type="password"
                  v-model="editNewPassword"
                  class="w-full pl-11 pr-4 py-3.5 bg-bg-main/60 rounded-lg border-0 outline-none text-sm font-bold text-text-primary transition-all placeholder:font-normal placeholder:text-text-secondary/50"
                  placeholder="Masukkan password baru"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-4 space-y-6">
          <div class="text-center space-y-3">
            <div class="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto border-0">
              <ShieldCheck class="w-8 h-8 text-accent" />
            </div>
            <div>
              <h4 class="text-base font-black text-text-primary tracking-tight">Verifikasi OTP</h4>
              <p class="text-[11px] text-text-secondary font-medium leading-relaxed max-w-xs mx-auto mt-1">
                Kode 6-digit telah dikirim ke <span class="text-accent font-bold">{{ user.email }}</span>.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <input
              type="text"
              maxlength="6"
              v-model="editCode"
              @input="editCode = editCode.replace(/\D/g, '')"
              class="w-full py-5 bg-bg-main rounded-lg border-0 outline-none text-2xl font-black tracking-[0.6em] text-center text-text-primary transition-all"
              placeholder="••••••"
              autofocus
            />
          </div>
        </div>

        <button
          @click="handleUpdateProfile"
          :disabled="savingProfile || !editName || (editStep === 2 && editCode.length < 6)"
          class="w-full py-4 bg-gradient-to-r from-accent to-secondary text-white rounded-lg font-black shadow-lg shadow-accent/20 hover:shadow-accent/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 text-sm"
        >
          <RefreshCw v-if="savingProfile" class="w-5 h-5 animate-spin" />
          <template v-else>
            <span>
              {{ editStep === 1
                ? (isSensitiveChange
                    ? 'Lanjut ke Verifikasi OTP'
                    : 'Simpan Perubahan')
                : 'Verifikasi &amp; Perbarui'
              }}
            </span>
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>
      </div>
    </div>



    <!-- CONTACT VIEW -->
    <div v-else-if="profileView === 'contact'" class="space-y-6 pb-4">
      <div class="flex items-center gap-4 mb-2">
        <button
          @click="profileView = 'main'"
          class="w-10 h-10 rounded-lg bg-bg-main border-0 flex items-center justify-center hover:bg-bg-main/80 transition-colors shadow-none"
        >
          <ArrowLeft class="w-5 h-5 text-text-primary" />
        </button>
        <div>
          <h2 class="text-xl font-black text-text-primary tracking-tight">Hubungi Kami</h2>
          <p class="text-[10px] font-bold text-teal-500 uppercase tracking-widest mt-0.5">Bantuan &amp; Dukungan Teknis</p>
        </div>
      </div>

      <div class="grid gap-3">
        <a
          href="https://instagram.com/rizd027"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-4 p-4 bg-bg-main rounded-lg border-0 hover:border-rose-500/50 hover:bg-rose-500/[0.02] transition-all group"
        >
          <div class="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-text-primary">Instagram</p>
            <p class="text-[10px] text-text-secondary">Update fitur &amp; tips keuangan</p>
          </div>
          <ExternalLink class="w-4 h-4 text-text-secondary" />
        </a>
      </div>

      <div class="pt-4 border-t border-border-ui/35">
        <div class="flex items-center justify-center gap-6">
          <a href="#" class="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-secondary hover:text-text-primary">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </a>
          <a href="#" class="p-2 hover:bg-bg-main rounded-lg transition-colors text-text-secondary hover:text-text-primary">
            <Globe class="w-5 h-5" />
          </a>
        </div>
        <p class="text-[9px] text-center text-text-secondary font-black uppercase tracking-[0.2em] mt-4">
          Vinance v2.4.0 • Made with ❤️
        </p>
      </div>
    </div>

    <!-- MAIN VIEW -->
    <div v-else class="space-y-8 pb-10">
      <!-- Title Header (Desktop only) -->
      <div class="hidden lg:flex flex-col gap-1 mb-2">
        <h2 class="text-2xl font-black text-text-primary tracking-tight leading-none">Manajemen Akun</h2>
        <p class="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">Profil &amp; Konfigurasi Sistem</p>
        <div class="h-1 w-12 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
      </div>

      <!-- Hero Profile Section -->
      <div class="relative text-center pb-6 border-b border-border-ui/35">
        <!-- Cover Image banner -->
        <div class="h-28 w-full bg-gradient-to-br from-[#1A2C5B] via-[#2d4992] to-[#15254e] rounded-2xl relative overflow-hidden shadow-inner">
          <div class="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
          <div class="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
          
          <img v-if="user.coverUrl" :src="user.coverUrl" class="w-full h-full object-cover" alt="Cover" />
          <div v-else class="absolute inset-0 bg-[url('/doodle_wallpaper.png')] bg-repeat bg-[length:150px_150px] opacity-10 mix-blend-soft-light" />
          
          <label class="absolute top-3 right-3 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-xl border-0 text-[9px] font-black text-white/90 uppercase tracking-widest cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 z-10 group">
            <Palette class="w-3 h-3 group-hover:rotate-12 transition-transform" />
            Ganti Sampul
            <input type="file" accept="image/*" class="hidden" @change="handleCoverUpload" />
          </label>
        </div>

        <!-- Avatar overlaps cover -->
        <div class="relative -mt-12 mb-4 inline-block">
          <div class="w-24 h-24 rounded-full ring-4 ring-bg-main bg-gradient-to-br from-accent to-secondary flex items-center justify-center overflow-hidden shadow-xl relative">
            <img v-if="user.photoUrl" :src="user.photoUrl" :alt="user.name" class="w-full h-full object-cover" />
            <span v-else class="text-3xl font-black text-white">{{ user.name[0].toUpperCase() }}</span>
            <div v-if="savingProfile" class="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
              <RefreshCw class="w-5 h-5 text-white animate-spin" />
            </div>
          </div>
          <button
            @click="openEditProfile"
            class="absolute bottom-0 right-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center border-3 border-bg-main shadow-lg hover:scale-110 active:scale-90 transition-all text-white"
          >
            <Camera class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- User Info -->
        <div>
          <h3 class="text-xl font-black text-text-primary tracking-tight leading-none">{{ user.name }}</h3>
          <p class="text-xs text-text-secondary mt-1.5 font-semibold tracking-wide">{{ user.email }}</p>
          <div class="mt-3 flex items-center justify-center gap-1.5 text-amber-500 font-black text-[10px] uppercase tracking-widest">
            <span>✦ Member Premium</span>
          </div>
        </div>
      </div>

      <!-- Settings List -->
      <div class="divide-y divide-border-ui/35">
        <!-- Edit Profil -->
        <button
          @click="openEditProfile"
          class="w-full flex items-center gap-4 py-4 px-1 hover:bg-accent/5 active:bg-accent/10 transition-all group text-left"
        >
          <div class="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-105 transition-transform">
            <UserIcon class="w-4.5 h-4.5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-text-primary tracking-tight">Edit Profil</p>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">Ubah nama, email, dan kata sandi Anda</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary transition-colors" />
        </button>

        <!-- Kunci PIN -->
        <button
          @click="$emit('togglePin')"
          class="w-full flex items-center gap-4 py-4 px-1 hover:bg-rose-500/5 active:bg-rose-500/10 transition-all group text-left"
        >
          <div class="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
            <Lock class="w-4.5 h-4.5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-text-primary tracking-tight">{{ $t('pinLock') }}</p>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('pinLockDesc') }}</p>
          </div>
          <span :class="[
            'text-[9px] font-black px-2.5 py-1 rounded-full border-0 tracking-wider',
            appPin ? 'bg-accent/10 text-accent' : 'bg-bg-main text-text-secondary'
          ]">
            {{ appPin ? $t('pinActive') : $t('pinInactive') }}
          </span>
        </button>



        <!-- Bahasa / Language -->
        <div class="py-3 px-1">
          <button
            @click="showLangPicker = !showLangPicker"
            class="w-full flex items-center gap-4 py-1 hover:bg-indigo-500/5 active:bg-indigo-500/10 transition-all group text-left rounded-lg"
          >
            <div class="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-105 transition-transform">
              <Globe class="w-4.5 h-4.5" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-text-primary tracking-tight">{{ $t('language') }}</p>
              <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('languageDesc') }}</p>
            </div>
            <div class="flex items-center gap-1.5 bg-bg-main border-0 px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary">
              <span>{{ languages.find(l => l.code === appSettings.language)?.flag }}</span>
              <span>{{ languages.find(l => l.code === appSettings.language)?.code.toUpperCase() }}</span>
            </div>
          </button>
          <!-- Language Picker Dropdown -->
          <div v-if="showLangPicker" class="mt-2 ml-13 space-y-1 pl-1">
            <button
              v-for="lang in languages"
              :key="lang.code"
              @click="setLanguage(lang.code)"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-semibold border-0',
                appSettings.language === lang.code
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'hover:bg-bg-main text-text-secondary hover:text-text-primary'
              ]"
            >
              <span class="text-base">{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
              <Check v-if="appSettings.language === lang.code" class="w-3.5 h-3.5 ml-auto text-indigo-500" />
            </button>
          </div>
        </div>
        <!-- Tema Warna -->
        <button
          @click="$emit('toggleTheme')"
          class="w-full flex items-center gap-4 py-4 px-1 hover:bg-blue-500/5 active:bg-blue-500/10 transition-all group text-left"
        >
          <div class="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
            <Palette class="w-4.5 h-4.5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-text-primary tracking-tight">{{ $t('themeColor') }}</p>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('themeColorDesc') }}</p>
          </div>
          <div class="flex items-center gap-1.5 bg-bg-main border-0 px-3 py-1 rounded-full text-[10px] font-bold text-text-secondary">
            <span>{{ isDark ? $t('themeDark') : $t('themeLight') }}</span>
          </div>
        </button>

        <!-- URL Apps Script -->
        <div class="py-4 px-1">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
              <ExternalLink class="w-4.5 h-4.5" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-text-primary tracking-tight">URL Apps Script</p>
              <p class="text-[10px] text-text-secondary font-medium mt-0.5">Integrasikan data keuangan Anda dengan Google Sheets</p>
            </div>
            <button
              @click="showScriptInfo = !showScriptInfo"
              :class="[
                'w-7 h-7 rounded-full flex items-center justify-center border-0 transition-all',
                showScriptInfo
                  ? 'bg-accent/15 text-accent'
                  : 'bg-bg-main text-text-secondary hover:text-accent'
              ]"
            >
              <Info class="w-3.5 h-3.5" />
            </button>
          </div>

          <div v-if="showScriptInfo" class="mt-3">
            <div class="bg-bg-main border-0 rounded-xl p-4 space-y-2.5">
              <p class="text-[11px] text-text-secondary leading-relaxed font-medium">
                Hubungkan Google Sheets pribadi Anda untuk menyinkronkan seluruh data transaksi, anggaran, target, dan catatan.
              </p>
              <div class="flex gap-2 p-2.5 bg-warning/5 border-0 rounded-lg">
                <span class="text-warning mt-0.5 flex-shrink-0">⚠</span>
                <p class="text-[11px] text-text-secondary leading-relaxed font-medium">
                  <span class="text-warning font-bold">Penting:</span> Data kredensial login dan profil tetap diamankan di sistem pusat kami.
                </p>
              </div>
              <button
                @click="showSetupGuide = true"
                class="inline-flex items-center gap-1 text-[11px] font-bold text-accent hover:underline md:hover:no-underline"
              >
                <Info class="w-3 h-3" /> Cara setup database spreadsheet
              </button>
            </div>
          </div>

          <div class="flex gap-2 mt-3">
            <input
              type="text"
              :value="user.scriptUrl || ''"
              @blur="updateScriptUrl($event)"
              placeholder="https://script.google.com/macros/s/.../exec"
              class="flex-1 px-4 py-2.5 rounded-xl border-0 bg-bg-main/60 text-[11px] text-text-primary outline-none transition-all placeholder:text-text-secondary/40"
            />
            <button
              @click="testConnection"
              :disabled="!user.scriptUrl || testingConnection"
              class="px-4 py-2.5 bg-gradient-to-r from-accent to-secondary text-white rounded-xl text-[11px] font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              {{ testingConnection ? 'Testing...' : 'Tes' }}
            </button>
          </div>
        </div>

        <!-- Hubungi Kami -->
        <button
          @click="profileView = 'contact'"
          class="w-full flex items-center gap-4 py-4 px-1 hover:bg-teal-500/5 active:bg-teal-500/10 transition-all group text-left"
        >
          <div class="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500 group-hover:scale-105 transition-transform">
            <Phone class="w-4.5 h-4.5" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-text-primary tracking-tight">{{ $t('contactUs') }}</p>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('contactUsDesc') }}</p>
          </div>
          <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-text-primary transition-colors" />
        </button>

        <!-- Saran & Masukan -->
        <div class="py-4 px-1">
          <div class="flex items-center gap-4">
            <div class="w-9 h-9 rounded-xl bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-500">
              <MessageSquare class="w-4.5 h-4.5" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-text-primary tracking-tight">{{ $t('feedback') }}</p>
              <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('feedbackDesc') }}</p>
            </div>
          </div>
          <div class="mt-3 space-y-2.5">
            <textarea
              v-model="feedback"
              :placeholder="$t('feedbackPlaceholder')"
              class="w-full px-4 py-3 bg-bg-main/60 rounded-xl border-0 outline-none text-xs font-semibold text-text-primary transition-all resize-none min-h-[80px] placeholder:text-text-secondary/40"
            />
            <button
              @click="sendFeedback"
              :disabled="!feedback.trim() || sendingFeedback"
              class="w-full py-2.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white rounded-xl text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw v-if="sendingFeedback" class="w-4 h-4 animate-spin" />
              <Send v-else class="w-4 h-4" />
              <span>{{ sendingFeedback ? $t('sending') : $t('send') }}</span>
            </button>
          </div>
        </div>

        <!-- Traktir Eskrim (Saweria) -->
        <div class="py-4 px-1">
          <a
            href="https://saweria.co/frd027"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full relative overflow-hidden p-4 rounded-xl flex items-center justify-between group transition-all duration-300 hover:bg-bg-main/20 active:scale-[0.98] block border-0"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-accent/5 via-emerald-500/5 to-secondary/5" />
            <div class="relative flex items-center gap-3">
              <div class="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                <img src="/cat-sticker.png" alt="Cat" class="w-full h-full object-cover" />
              </div>
              <div>
                <h4 class="text-sm font-black text-text-primary leading-none">Traktir Eskrim 🍦</h4>
                <p class="text-[9px] text-text-secondary font-black uppercase tracking-widest mt-1">Dukung Developer Lokal</p>
              </div>
            </div>
            <div class="relative flex items-center gap-1.5 px-3 py-1.5 bg-accent text-white rounded-lg text-[9px] font-black uppercase tracking-wider">
              <span>saweria</span>
              <ExternalLink class="w-3 h-3" />
            </div>
          </a>
        </div>

        <!-- Keluar Akun -->
        <div class="py-4 px-1">
          <button
            @click="$emit('logout')"
            class="w-full flex items-center gap-4 py-3.5 px-2 hover:bg-danger/5 active:bg-danger/10 rounded-xl transition-all group text-left"
          >
            <div class="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center text-danger group-hover:scale-105 transition-transform">
              <LogOut class="w-4.5 h-4.5" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-danger tracking-tight">{{ $t('logout') }}</p>
              <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('logoutDesc') }}</p>
            </div>
            <ChevronRight class="w-4 h-4 text-text-secondary/60 group-hover:text-danger transition-colors" />
          </button>
        </div>
      </div>
    </div>

    <!-- Apps Script Setup Guide Modal -->
    <Teleport to="body">
      <div v-if="showSetupGuide" class="fixed inset-0 z-[10000] flex sm:p-4 items-center justify-center">
        <div @click="showSetupGuide = false" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
        <div class="relative w-full h-[100dvh] sm:h-auto sm:max-w-2xl bg-bg-main sm:rounded-2xl shadow-lg border-0 flex flex-col max-h-full sm:max-h-[85vh] overflow-hidden z-10 my-auto">
          <!-- Modal Header -->
          <div class="flex justify-between items-center px-8 py-6 border-0 shrink-0">
            <div>
              <h3 class="text-lg font-black text-text-primary tracking-tight">Panduan Setup Database</h3>
              <p class="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">Langkah-langkah Konfigurasi</p>
            </div>
            <button @click="showSetupGuide = false" class="p-2 hover:bg-bg-main rounded-lg transition-colors">
              <X class="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <!-- Modal Content -->
          <div class="flex-1 overflow-y-auto p-8 space-y-8 text-sm text-text-secondary leading-relaxed custom-scrollbar pb-12">
            <section>
              <h4 class="font-bold text-text-primary mb-2">1. Buat Google Sheet Baru</h4>
              <p>Buka Google Sheets dan buat spreadsheet baru. Beri nama misalnya "Database Keuangan".</p>
            </section>

            <section>
              <h4 class="font-bold text-text-primary mb-2">2. Buka Apps Script</h4>
              <p>Di Google Sheet, klik menu <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</p>
            </section>

            <section>
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-bold text-text-primary">3. Copy &amp; Paste Kode</h4>
                <button
                  @click="copyAppsScriptCode"
                  class="flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent rounded-lg text-[10px] font-bold hover:bg-accent/20 transition-colors"
                >
                  <Check v-if="copied" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3" />
                  <span>{{ copied ? 'Tersalin!' : 'Salin Kode' }}</span>
                </button>
              </div>
              <p class="mb-3">Hapus semua kode yang ada di editor Apps Script, lalu paste kode backend di bawah ini:</p>
              <div class="bg-bg-main/50 p-4 rounded-lg border-0 font-mono text-[10px] overflow-x-auto max-h-40 no-scrollbar">
                <pre>{{ appsScriptCode }}</pre>
              </div>
            </section>

            <section>
              <h4 class="font-bold text-text-primary mb-2">4. Deploy sebagai Web App</h4>
              <ul class="list-disc ml-5 space-y-1">
                <li>Klik tombol <strong>Deploy</strong> &gt; <strong>New Deployment</strong>.</li>
                <li>Pilih type: <strong>Web App</strong>.</li>
                <li>Description: "Backend Keuangan".</li>
                <li>Execute as: <strong>Me</strong>.</li>
                <li>Who has access: <strong>Anyone</strong> (Penting agar aplikasi bisa mengaksesnya).</li>
                <li>Klik <strong>Deploy</strong> dan copy <strong>Web App URL</strong> yang dihasilkan.</li>
              </ul>
            </section>

            <section>
              <h4 class="font-bold text-text-primary mb-2">5. Masukkan URL ke Aplikasi</h4>
              <p>Paste URL tersebut ke kolom "Konfigurasi Database" di tab Profil aplikasi ini.</p>
            </section>

            <div class="bg-accent/5 p-4 rounded-lg border-0">
              <p class="text-xs text-accent font-medium">
                <strong>Catatan:</strong> Dengan database sendiri, semua data Anda akan tersimpan aman di Google Drive pribadi Anda dan tidak dapat diakses oleh orang lain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  LogOut, Palette, ExternalLink, Info, X, Copy, Check, Lock, ShieldCheck,
  User as UserIcon, Mail, MessageSquare, Send, ChevronRight, Phone, Globe, ArrowLeft, Camera, ArrowRight, RefreshCw
} from '@lucide/vue';
import type { User } from '../types';
import { api } from '../lib/api';
import { uploadToCloudinary } from '../lib/cloudinary';

interface Props {
  user: User;
  appPin: string | null;
  isDark: boolean;
  appSettings: { language: string; notifBudgets: boolean; notifSync: boolean; };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'updateUser': [updatedUser: User];
  'togglePin': [];
  'toggleTheme': [];
  'logout': [];
  'showToast': [msg: string, type?: 'success' | 'error' | 'info' | 'warning'];
  'updateScriptUrl': [url: string];
  'updateSettings': [settings: { language: string; notifBudgets: boolean; notifSync: boolean; }];
}>();

useI18n();

const showLangPicker = ref(false);

const languages = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh', label: '中文 (Simplified)', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

const setLanguage = (code: string) => {
  emit('updateSettings', { ...props.appSettings, language: code });
  showLangPicker.value = false;
};

const profileView = ref<'main' | 'contact' | 'edit'>('main');

// Edit temp states
const editName = ref('');
const editEmail = ref('');
const editNewEmail = ref('');
const editPassword = ref('');
const editNewPassword = ref('');
const editPhoto = ref('');
const savingProfile = ref(false);
const editStep = ref(1);
const editCode = ref('');
const selectedPhotoFile = ref<File | null>(null);

const feedback = ref('');
const sendingFeedback = ref(false);
const showScriptInfo = ref(false);
const showSetupGuide = ref(false);
const copied = ref(false);
const testingConnection = ref(false);



const isSensitiveChange = computed(() => 
  (editNewEmail.value && editNewEmail.value !== props.user.email) || editNewPassword.value !== ''
);

const openEditProfile = () => {
  editName.value = props.user.name;
  editEmail.value = props.user.email;
  editNewEmail.value = '';
  editPassword.value = '';
  editNewPassword.value = '';
  editPhoto.value = props.user.photoUrl || '';
  editCode.value = '';
  editStep.value = 1;
  profileView.value = 'edit';
};

const closeEditProfile = () => {
  profileView.value = 'main';
  editStep.value = 1;
  selectedPhotoFile.value = null;
};

const handlePhotoUpload = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      emit('showToast', 'Ukuran file maksimal 2MB', 'error');
      return;
    }
    selectedPhotoFile.value = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      editPhoto.value = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const handleCoverUpload = async (e: Event) => {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      emit('showToast', 'Ukuran file maksimal 2MB', 'error');
      return;
    }
    savingProfile.value = true;
    try {
      emit('showToast', 'Mengunggah sampul ke Cloudinary...', 'info');
      const cloudinaryUrl = await uploadToCloudinary(file);
      await api.updateUser(props.user.id, { coverUrl: cloudinaryUrl });
      const updated = { ...props.user, coverUrl: cloudinaryUrl };
      emit('updateUser', updated);
      emit('showToast', 'Sampul profil diperbarui & tersimpan', 'success');
    } catch (err: any) {
      emit('showToast', err.message || 'Gagal mengunggah sampul ke Cloudinary', 'error');
    } finally {
      savingProfile.value = false;
    }
  }
};

const handleUpdateProfile = async () => {
  if (isSensitiveChange.value && !editPassword.value) {
    emit('showToast', 'Masukkan password lama untuk mengonfirmasi perubahan', 'warning');
    return;
  }

  if (isSensitiveChange.value && editStep.value === 1) {
    savingProfile.value = true;
    try {
      const res = await api.sendUpdateCode(props.user.email);
      if (res.success) {
        editStep.value = 2;
        emit('showToast', 'Kode OTP dikirim ke email lama Anda', 'info');
      } else {
        emit('showToast', res.error || 'Gagal mengirim kode verifikasi', 'error');
      }
    } catch {
      emit('showToast', 'Terjadi kesalahan jaringan', 'error');
    } finally {
      savingProfile.value = false;
    }
    return;
  }

  savingProfile.value = true;
  try {
    let photoUrlToSave = editPhoto.value;
    if (selectedPhotoFile.value) {
      emit('showToast', 'Mengunggah foto profil ke Cloudinary...', 'info');
      photoUrlToSave = await uploadToCloudinary(selectedPhotoFile.value);
      selectedPhotoFile.value = null;
    }

    const updates: any = {
      name: editName.value,
      photoUrl: photoUrlToSave,
    };
    if (editNewEmail.value) updates.email = editNewEmail.value;
    if (editNewPassword.value) updates.password = editNewPassword.value;

    const result = await api.updateUser(props.user.id, updates, editCode.value, editPassword.value);
    if (result.success) {
      const updatedUser: User = {
        ...props.user,
        name: editName.value,
        photoUrl: photoUrlToSave,
      };
      if (editNewEmail.value) updatedUser.email = editNewEmail.value;
      emit('updateUser', updatedUser);
      emit('showToast', 'Profil berhasil diperbarui!', 'success');
      closeEditProfile();
    } else {
      emit('showToast', result.error || 'Gagal memperbarui profil', 'error');
    }
  } catch (err: any) {
    emit('showToast', err.message || 'Terjadi kesalahan jaringan', 'error');
  } finally {
    savingProfile.value = false;
  }
};



const sendFeedback = async () => {
  if (!feedback.value.trim()) return;
  sendingFeedback.value = true;
  try {
    const res = await api.sendFeedback(props.user.id, props.user.name, feedback.value);
    if (res.success) {
      emit('showToast', 'Masukan berhasil dikirim. Terima kasih!', 'success');
      feedback.value = '';
    } else {
      emit('showToast', res.error || 'Gagal mengirim masukan', 'error');
    }
  } catch {
    emit('showToast', 'Gagal mengirim masukan (offline)', 'error');
  } finally {
    sendingFeedback.value = false;
  }
};

const updateScriptUrl = (e: Event) => {
  const target = e.target as HTMLInputElement;
  emit('updateScriptUrl', target.value);
};

const testConnection = async () => {
  if (!props.user.scriptUrl) return;
  testingConnection.value = true;
  try {
    await api.getData(props.user.id);
    emit('showToast', 'Koneksi Berhasil! Database terhubung dengan baik.', 'success');
  } catch {
    emit('showToast', 'Koneksi Gagal! Pastikan URL benar dan Apps Script di-deploy dengan benar.', 'error');
  } finally {
    testingConnection.value = false;
  }
};

const appsScriptCode = `/**
 * Google Apps Script for Vinance
 * Deploy as Web App with:
 * - Execute as: Me
 * - Who has access: Anyone
 */

function doGet(e) {
  const action = e.parameter.action;
  const userId = e.parameter.userId;
  if (action === 'getData') return handleGetData(userId);
  return createResponse({ error: 'Invalid action' });
}

function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); } catch (err) { return createResponse({ error: 'Invalid JSON' }); }
  const action = data.action;
  
  // Auth & Verification
  if (action === 'login') return handleLogin(data);
  if (action === 'register') return handleRegister(data);
  if (action === 'sendRegisterCode') return handleSendCode(data.email, 'REG');
  if (action === 'verifyRegisterAndCreate') return handleVerifyRegister(data);
  if (action === 'sendResetCode') return handleSendCode(data.email, 'RESET');
  if (action === 'resetPasswordWithCode') return handleResetPassword(data);
  if (action === 'sendUpdateCode') return handleSendCode(data.email, 'UPDATE');
  if (action === 'updateUser') return handleUpdateUser(data);
  
  // Transactions
  if (action === 'addTransaction') return handleAddTransaction(data);
  if (action === 'updateTransaction') return handleUpdateTransaction(data);
  if (action === 'deleteTransaction') return handleDeleteTransaction(data);
  
  // Budgets
  if (action === 'updateBudget') return handleUpdateBudget(data);
  if (action === 'deleteBudget') return handleDeleteBudget(data);
  
  // Goals
  if (action === 'updateGoal') return handleUpdateGoal(data);
  if (action === 'deleteGoal') return handleDeleteGoal(data);
  
  // Notes
  if (action === 'updateNote') return handleUpdateNote(data);
  if (action === 'deleteNote') return handleDeleteNote(data);
  if (action === 'sendFeedback') return handleSendFeedback(data);

  return createResponse({ error: 'Invalid action: ' + action });
}`;

const copyAppsScriptCode = () => {
  navigator.clipboard.writeText(appsScriptCode);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};
</script>
