<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-bg-main to-sidebar-bg flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
    <!-- Theme toggle -->
    <button
      v-if="isDark !== undefined"
      @click="$emit('toggleTheme')"
      class="absolute top-4 right-4 z-50 p-2.5 bg-card-bg/85 backdrop-blur-md border border-border-ui/10 rounded-full shadow-md text-text-secondary hover:text-text-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
    >
      <Sun v-if="isDark" class="w-5 h-5 text-amber-500" />
      <Moon v-else class="w-5 h-5 text-slate-700" />
    </button>

    <!-- Background blobs -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style="animation-delay: 1s" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/5 rounded-full blur-[150px]" />
    </div>

    <!-- Doodle Art Pattern Overlay -->
    <div
      class="absolute inset-0 z-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none"
      style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%233b82f6' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 30 h35 a5 5 0 0 1 5 5 v20 a5 5 0 0 1 -5 5 h-35 a5 5 0 0 1 -5 -5 v-20 a5 5 0 0 1 5 -5 z'/%3E%3Cpath d='M15 42 h45'/%3E%3Cpath d='M48 40 h8 v8 h-8 z'/%3E%3Ccircle cx='150' cy='40' r='12'/%3E%3Cpath d='M150 33 v14 M147 37 c0-2 6-2 6 0 c0 3-6 3-6 6 c0 2 6 2 6 0'/%3E%3Cpath d='M30 140 l20 -20 l15 15 l30 -30'/%3E%3Cpath d='M85 105 h10 v10'/%3E%3Cpath d='M25 150 h80 M25 100 v50'/%3E%3Ccircle cx='160' cy='115' r='3'/%3E%3Ccircle cx='175' cy='130' r='3'/%3E%3Cpath d='M178 112 l-22 22'/%3E%3Crect x='110' y='150' width='40' height='26' rx='4'/%3E%3Cpath d='M110 157 h40'/%3E%3Crect x='116' y='165' width='8' height='6' rx='1'/%3E%3Cpath d='M95 30 l3 -3 l3 3 l-3 3 z'/%3E%3Cpath d='M40 85 l2 -2 l2 2 l-2 2 z'/%3E%3Cpath d='M120 85 l4 -4 l4 4 l-4 4 z'/%3E%3Cpath d='M80 170 q 15 -10, 30 0'/%3E%3C/g%3E%3C/svg%3E&quot;); background-repeat: repeat; background-size: 160px 160px;"
    />

    <div class="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center z-10 py-6">
      <!-- Left panel (desktop only) -->
      <div class="hidden lg:flex flex-col space-y-6 pr-8">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-white dark:bg-slate-50 rounded-xl flex items-center justify-center shadow-md border border-border-ui/10 p-1.5">
              <img src="/Logo-Vinance.png" alt="Vinance Logo" class="w-full h-full object-contain" />
            </div>
            <h1 class="text-2xl font-extrabold text-text-primary tracking-tight">Vinance</h1>
          </div>
          <h2 class="text-2xl xl:text-3xl font-bold text-text-primary leading-tight mb-2">
            Kelola Keuangan<br />
            <span class="text-accent">Lebih Cerdas &amp; Transparan.</span>
          </h2>
          <p class="text-sm text-text-secondary leading-relaxed max-w-sm">
            Sistem manajemen keuangan modern yang terhubung langsung dengan Google Sheets pribadi Anda. Aman, cepat, dan mudah digunakan.
          </p>
          <div class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
            <Sparkles class="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">Dukung Database Sheets Pribadi</span>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="(feature, i) in features"
            :key="i"
            class="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-border-ui/10 hover:bg-bg-main/50 hover:scale-[1.01] transition-all duration-300 group cursor-default"
          >
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm border border-accent/10">
              <component :is="feature.icon" class="w-5 h-5 text-accent transition-colors duration-300" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">{{ feature.title }}</h4>
              <p class="text-[11px] text-text-secondary leading-tight mt-0.5">{{ feature.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel (auth card) -->
      <div class="w-full flex flex-col items-center justify-center">
        <div class="w-full max-w-[390px] bg-transparent sm:bg-card-bg rounded-2xl border-0 sm:border border-border-ui/30 dark:border-border-ui/20 shadow-none sm:shadow-2xl overflow-hidden flex flex-col">
          <!-- Mobile logo header -->
          <div class="lg:hidden p-5 pb-0 flex flex-col items-center text-center">
            <div class="w-11 h-11 bg-white dark:bg-slate-50 rounded-2xl flex items-center justify-center mb-3 shadow-md border border-border-ui/10 p-2">
              <img src="/Logo-Vinance.png" alt="Vinance Logo" class="w-full h-full object-contain" />
            </div>
            <h1 class="text-lg font-black text-text-primary uppercase tracking-wider">Vinance</h1>
            <p class="text-[10px] text-text-secondary/80 font-medium uppercase tracking-widest mt-0.5">Manajemen Keuangan</p>
            <div class="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full shadow-xs">
              <Sparkles class="w-3 h-3 text-accent animate-pulse" />
              <span class="text-[8.5px] font-bold text-accent uppercase tracking-wider">Sheets Pribadi</span>
            </div>
          </div>

          <div class="p-5 sm:p-6 flex flex-col">
            <!-- Tab switcher -->
            <div class="flex p-0.5 bg-bg-main/80 dark:bg-bg-main/20 rounded-xl mb-4 border border-border-ui/30">
              <button
                type="button"
                @click="isLogin = true"
                :class="['flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer', isLogin ? 'bg-card-bg text-accent shadow-sm border border-border-ui/10 scale-[1.02] font-black' : 'text-text-secondary hover:text-text-primary']"
              >Masuk</button>
              <button
                type="button"
                @click="isLogin = false"
                :class="['flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer', !isLogin ? 'bg-card-bg text-accent shadow-sm border border-border-ui/10 scale-[1.02] font-black' : 'text-text-secondary hover:text-text-primary']"
              >Daftar</button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-5 auth-form-lines">
              <!-- Success alert -->
              <div v-if="success" class="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck class="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <p class="text-[11px] text-emerald-500 font-semibold leading-normal">{{ success }}</p>
              </div>
 
              <!-- Name field (register step 1) -->
              <div v-if="!isLogin && regStep === 1" class="space-y-1">
                <label class="text-[10px] font-bold text-text-secondary/80 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <div class="relative group">
                  <UserIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
                  <input
                    type="text" required v-model="name"
                    class="w-full pl-11 pr-4 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-xs transition-all duration-300 rounded-xl shadow-sm"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              <!-- Register Step 2: OTP verification -->
              <template v-if="!isLogin && regStep === 2">
                <div class="space-y-3.5 py-1">
                  <div class="text-center mb-2">
                    <div class="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MailIcon class="w-5 h-5 text-accent" />
                    </div>
                    <p class="text-xs text-text-primary font-bold">Verifikasi Email Anda</p>
                    <p class="text-[11px] text-text-secondary mt-1">Kode dikirim ke <span class="text-accent font-bold">{{ email }}</span></p>
                    <div class="text-[10px] text-amber-600 dark:text-amber-400 mt-2.5 bg-amber-500/10 py-2 px-3 rounded-xl border border-amber-500/20 leading-relaxed text-left">
                      <strong>Penting:</strong> Jika kode tidak muncul di kotak masuk utama, silakan periksa folder <strong>Spam/Junk</strong> atau tab <strong>Promosi/Update</strong>. Anda juga bisa menyalin kode langsung di tab spreadsheet <strong>VerificationCodes</strong> Anda.
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-text-secondary/80 uppercase tracking-widest text-center block w-full mb-1">Kode Verifikasi</label>
                    <div class="flex justify-between gap-2 max-w-[270px] mx-auto">
                      <input
                        v-for="(_, idx) in 6"
                        :key="idx"
                        :id="'otp-' + idx"
                        type="text"
                        maxlength="1"
                        v-model="otpDigits[idx]"
                        @input="handleOtpInput($event, idx)"
                        @keydown="handleOtpKeyDown($event, idx)"
                        @paste="handleOtpPaste($event)"
                        class="w-9 h-10 text-center font-bold text-sm border border-border-ui/30 focus:border-accent bg-card-bg text-text-primary outline-none transition-all duration-300 rounded-lg shadow-sm"
                        placeholder="•"
                      />
                    </div>
                  </div>
                  <button type="button" @click="regStep = 1" class="text-[10px] font-bold text-accent hover:underline w-full text-center mt-1 cursor-pointer">Ganti email atau kirim ulang</button>
                </div>
              </template>

              <!-- Email & password fields -->
              <template v-else>
                <div class="space-y-1">
                  <label class="text-[10px] font-bold text-text-secondary/80 uppercase tracking-widest ml-1">Email</label>
                  <div class="relative group">
                    <MailIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
                    <input
                      type="email" required v-model="email"
                      class="w-full pl-11 pr-4 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-xs transition-all duration-300 rounded-xl shadow-sm"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>
                <div class="space-y-1">
                  <div class="flex justify-between items-center ml-1">
                    <label class="text-[10px] font-bold text-text-secondary/80 uppercase tracking-widest">Kata Sandi</label>
                    <button v-if="isLogin" type="button" @click="showForgotModal = true" class="text-[10px] font-bold text-accent hover:underline cursor-pointer">Lupa Sandi?</button>
                  </div>
                  <div class="relative group">
                    <LockIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
                    <input
                      :type="showPassword ? 'text' : 'password'" required v-model="password"
                      class="w-full pl-11 pr-10 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-xs transition-all duration-300 rounded-xl shadow-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-accent cursor-pointer">
                      <EyeOff v-if="showPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </template>

              <!-- Error message -->
              <div v-if="error" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle class="w-3.5 h-3.5 text-rose-500" />
                </div>
                <p class="text-[11px] text-rose-500 font-semibold leading-normal">{{ error }}</p>
              </div>

              <button
                type="submit" :disabled="loading"
                class="w-full py-3 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 text-xs mt-2 cursor-pointer"
              >
                {{ loading ? 'Memproses...' : (isLogin ? 'Masuk' : (regStep === 1 ? 'Lanjutkan' : 'Verifikasi & Daftar')) }}
              </button>

              <p v-if="!isLogin && regStep === 1" class="text-[9px] text-text-secondary/70 text-center leading-relaxed mt-2">
                Dengan mendaftar, Anda menyetujui <button type="button" @click="showTermsModal = true" class="text-accent font-bold hover:underline cursor-pointer">Syarat &amp; Ketentuan</button> layanan kami.
              </p>
            </form>
          </div>
        </div>

        <div class="mt-4 hidden md:flex flex-col items-center space-y-2">
          <p class="text-[9px] text-text-secondary uppercase tracking-[0.15em] font-bold text-center">Securely Synced with Google Sheets</p>
          <div class="flex gap-3">
            <div class="w-7 h-7 rounded-lg bg-bg-main border border-border-ui/20 flex items-center justify-center shadow-xs">
              <img src="https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png" alt="Sheets" class="w-3.5 h-3.5" />
            </div>
            <div class="w-7 h-7 rounded-lg bg-bg-main border border-border-ui/20 flex items-center justify-center shadow-xs">
              <img src="https://www.gstatic.com/images/branding/product/1x/apps_script_48dp.png" alt="Apps Script" class="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forgot password modal -->
    <Teleport to="body">
      <div v-if="showForgotModal" class="fixed inset-0 z-[100] flex sm:p-4 items-center justify-center">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm hidden sm:block" @click="!forgotLoading && (showForgotModal = false)" />
        <div class="bg-bg-main relative w-full h-full sm:h-auto sm:max-w-sm sm:rounded-2xl shadow-lg p-6 border-0 overflow-hidden z-10 text-center flex flex-col justify-center">
          <div class="w-14 h-14 bg-gradient-to-br from-accent to-secondary rounded-full mx-auto mb-4 flex items-center justify-center shadow-none">
            <LockIcon class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">Lupa Kata Sandi?</h3>
          <p class="text-xs text-text-secondary mb-5">{{ forgotStep === 1 ? "Masukkan email Anda untuk menerima kode verifikasi." : `Masukkan kode 6 digit yang dikirim ke email ${forgotEmail}.` }}</p>

          <form v-if="forgotStep === 1" @submit.prevent="handleSendResetCode" class="space-y-4">
            <div class="relative group text-left">
              <MailIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
              <input type="email" required v-model="forgotEmail" class="w-full pl-11 pr-4 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-xs transition-all duration-300 rounded-xl shadow-sm" placeholder="Masukkan email Anda" />
            </div>
            <p v-if="forgotError" class="text-[10px] text-rose-500 font-bold text-left px-1">{{ forgotError }}</p>
            <button type="submit" :disabled="forgotLoading" class="w-full py-3.5 bg-gradient-to-r from-accent to-secondary text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              <div v-if="forgotLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <template v-else>Kirim Kode Verifikasi</template>
            </button>
          </form>

          <form v-else @submit.prevent="handleResetPassword" class="space-y-4">
            <div class="space-y-3">
              <div class="relative group text-left">
                <ShieldCheck class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
                <input type="text" required :maxlength="6" v-model="forgotCode" @input="forgotCode = forgotCode.replace(/\D/g, '')" class="w-full pl-11 pr-4 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-xs tracking-[0.5em] font-bold rounded-xl shadow-sm" placeholder="XXXXXX" />
              </div>
              <div class="relative group text-left">
                <LockIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors duration-300" />
                <input :type="showPassword ? 'text' : 'password'" required v-model="newResetPassword" class="w-full pl-11 pr-10 py-3 bg-card-bg border border-border-ui/30 focus:border-accent text-text-primary outline-none text-xs rounded-xl shadow-sm" placeholder="Kata sandi baru" />
                <button type="button" @click="showPassword = !showPassword" class="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-accent cursor-pointer">
                  <EyeOff v-if="showPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>
            <p v-if="forgotError" class="text-[10px] text-rose-500 font-bold text-left px-1">{{ forgotError }}</p>
            <button type="submit" :disabled="forgotLoading" class="w-full py-3.5 bg-gradient-to-r from-accent to-secondary text-white font-bold rounded-xl shadow-lg disabled:opacity-50">Simpan Sandi Baru</button>
            <button type="button" @click="forgotStep = 1" class="text-[10px] font-bold text-accent hover:underline">Ganti email atau kirim ulang</button>
          </form>

          <button @click="!forgotLoading && (showForgotModal = false)" class="w-full mt-4 py-3 bg-bg-main border-0 text-text-secondary font-bold text-sm rounded-lg">Tutup</button>
        </div>
      </div>
    </Teleport>

    <!-- Terms modal -->
    <Teleport to="body">
      <div v-if="showTermsModal" class="fixed inset-0 z-[120] flex sm:p-4 items-center justify-center">
        <div @click="showTermsModal = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm hidden sm:block" />
        <div class="relative w-full h-full sm:h-auto sm:max-w-lg bg-bg-main sm:rounded-2xl border-0 shadow-lg overflow-hidden flex flex-col max-h-full sm:max-h-[80vh] z-10">
          <div class="p-6 border-0 flex items-center justify-between bg-bg-main/50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <ShieldCheck class="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 class="text-sm font-black text-text-primary uppercase tracking-wider">Syarat &amp; Ketentuan</h3>
                <p class="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-0.5">Kebijakan Layanan Vinance</p>
              </div>
            </div>
            <button type="button" @click="showTermsModal = false" class="p-2 text-text-secondary"><X class="w-5 h-5" /></button>
          </div>
          <div class="p-6 overflow-y-auto space-y-6 text-sm text-text-secondary">
            <section class="space-y-3">
              <h4 class="text-xs font-black text-text-primary uppercase tracking-widest">1. Kepemilikan Data</h4>
              <p>Vinance menggunakan Google Sheets pribadi Anda sebagai database utama.</p>
            </section>
            <section class="space-y-3">
              <h4 class="text-xs font-black text-text-primary uppercase tracking-widest">2. Keamanan &amp; Privasi</h4>
              <p>Kami tidak mengumpulkan, menyimpan, atau menjual data keuangan Anda.</p>
            </section>
          </div>
          <div class="p-6 bg-bg-main/50 border-0">
            <button type="button" @click="showTermsModal = false" class="w-full py-3.5 rounded-xl bg-accent text-white text-xs font-bold">Saya Mengerti</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { api } from '../lib/api';
import type { User } from '../types';
import {
  Wallet, ShieldCheck, Mail as MailIcon, Lock as LockIcon,
  User as UserIcon, Sparkles, Sun, Moon, X, Eye, EyeOff, AlertCircle
} from '@lucide/vue';

interface Props {
  isDark?: boolean;
}
defineProps<Props>();
const emit = defineEmits<{
  login: [user: User];
  toggleTheme: [];
}>();

const features = [
  { icon: ShieldCheck, title: 'Privasi Terjamin', desc: 'Data tersimpan di Google Sheets pribadi Anda.' },
  { icon: Sparkles, title: 'Analisis Cerdas', desc: 'Visualisasi pengeluaran otomatis.' },
  { icon: Wallet, title: 'Budgeting Mudah', desc: 'Atur batas pengeluaran kategori.' }
];

const isLogin = ref(true);
const email = ref('');
const password = ref('');
const name = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');
const showForgotModal = ref(false);
const forgotStep = ref(1);
const showTermsModal = ref(false);
const forgotEmail = ref('');
const forgotCode = ref('');
const newResetPassword = ref('');
const forgotLoading = ref(false);
const forgotError = ref('');
const regStep = ref(1);
const otpDigits = ref(['', '', '', '', '', '']);

const regCode = computed({
  get: () => otpDigits.value.join(''),
  set: (val) => {
    const digits = val.split('').slice(0, 6);
    for (let i = 0; i < 6; i++) {
      otpDigits.value[i] = digits[i] || '';
    }
  }
});

const showPassword = ref(false);

const handleOtpInput = (e: Event, idx: number) => {
  const target = e.target as HTMLInputElement;
  let val = target.value.replace(/\D/g, ''); // only allow digits
  otpDigits.value[idx] = val ? val[val.length - 1] : '';

  if (otpDigits.value[idx] && idx < 5) {
    nextTick(() => {
      const nextInput = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    });
  }
};

const handleOtpKeyDown = (e: KeyboardEvent, idx: number) => {
  if (e.key === 'Backspace') {
    if (!otpDigits.value[idx] && idx > 0) {
      otpDigits.value[idx - 1] = '';
      nextTick(() => {
        const prevInput = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();
        }
      });
    } else {
      otpDigits.value[idx] = '';
    }
  } else if (e.key === 'ArrowLeft' && idx > 0) {
    nextTick(() => {
      const prevInput = document.getElementById(`otp-${idx - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    });
  } else if (e.key === 'ArrowRight' && idx < 5) {
    nextTick(() => {
      const nextInput = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    });
  }
};

const handleOtpPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const pasteData = e.clipboardData?.getData('text') || '';
  const digits = pasteData.replace(/\D/g, '').split('').slice(0, 6);
  
  for (let i = 0; i < 6; i++) {
    otpDigits.value[i] = digits[i] || '';
  }

  const nextFocusIdx = Math.min(digits.length, 5);
  nextTick(() => {
    const focusEl = document.getElementById(`otp-${nextFocusIdx}`) as HTMLInputElement;
    if (focusEl) focusEl.focus();
  });
};

const handleSendResetCode = async () => {
  forgotLoading.value = true;
  forgotError.value = '';
  try {
    const res = await api.sendResetCode(forgotEmail.value);
    if (res.success) {
      forgotStep.value = 2;
    } else {
      if (res.error === 'Invalid action') {
        forgotError.value = 'Gagal: "Invalid action". Silakan perbarui kode Google Apps Script Anda di Spreadsheet Anda.';
      } else {
        forgotError.value = res.error || 'Gagal mengirim kode.';
      }
    }
  } catch {
    forgotError.value = 'Terjadi kesalahan koneksi.';
  } finally {
    forgotLoading.value = false;
  }
};

const handleResetPassword = async () => {
  forgotLoading.value = true;
  forgotError.value = '';
  try {
    const res = await api.resetPasswordWithCode(forgotEmail.value, forgotCode.value, newResetPassword.value);
    if (res.success) {
      showForgotModal.value = false;
      forgotStep.value = 1;
      forgotCode.value = '';
      newResetPassword.value = '';
      error.value = 'Kata sandi berhasil diperbaharui. Silakan masuk.';
    } else {
      forgotError.value = res.error || 'Gagal merubah sandi.';
    }
  } catch {
    forgotError.value = 'Terjadi kesalahan koneksi.';
  } finally {
    forgotLoading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  try {
    if (isLogin.value) {
      const res = await api.login(email.value, password.value);
      if (res.success && res.user) {
        emit('login', res.user);
      } else {
        error.value = res.error || 'Login gagal. Periksa email dan password Anda.';
      }
    } else {
      if (regStep.value === 1) {
        const res = await api.sendRegisterCode(email.value);
        if (res.success) {
          regStep.value = 2;
        } else {
          if (res.error === 'Invalid action') {
            error.value = 'Gagal: "Invalid action". Silakan perbarui kode Google Apps Script di Spreadsheet Anda dengan kode dari docs/kode GS appscript.md lalu deploy sebagai "New Deployment".';
          } else {
            error.value = res.error || 'Gagal mengirim kode verifikasi.';
          }
        }
      } else {
        const res = await api.verifyRegisterAndCreate(name.value, email.value, password.value, regCode.value);
        if (res.success) {
          success.value = 'Pendaftaran berhasil! Silakan masuk dengan akun Anda.';
          isLogin.value = true;
          regStep.value = 1;
          regCode.value = '';
          password.value = '';
        } else {
          error.value = res.error || 'Verifikasi gagal.';
        }
      }
    }
  } catch {
    error.value = 'Terjadi kesalahan koneksi ke server.';
  } finally {
    loading.value = false;
  }
};
</script>
