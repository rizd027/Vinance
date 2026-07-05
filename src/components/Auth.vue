<template>
  <div class="h-screen bg-gradient-to-br from-bg-main to-sidebar-bg flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
    <!-- Theme toggle -->
    <button
      v-if="isDark !== undefined"
      @click="$emit('toggleTheme')"
      class="absolute top-4 right-4 z-50 p-2.5 bg-card-bg/80 backdrop-blur-md border-0 rounded-full shadow-none text-text-secondary hover:text-text-primary hover:scale-110 active:scale-95 transition-all"
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

    <div class="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center z-10">
      <!-- Left panel (desktop only) -->
      <div class="hidden lg:flex flex-col space-y-6 pr-8">
        <div>
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-white dark:bg-slate-50 rounded-xl flex items-center justify-center shadow-none border-0 p-1.5">
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
          <div class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border-0 rounded-full">
            <Sparkles class="w-3 h-3 text-secondary" />
            <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">Dukung Database Sheets Pribadi</span>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="(feature, i) in features"
            :key="i"
            class="flex items-start gap-3 p-3 rounded-xl border-0 hover:bg-bg-main/50 hover:scale-[1.02] transition-all duration-300 group cursor-default"
          >
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-none">
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
      <div class="w-full flex flex-col items-center">
        <div class="w-full max-w-[400px] bg-transparent rounded-2xl border-0 shadow-none overflow-hidden max-h-[90vh] flex flex-col">
          <!-- Mobile logo header -->
          <div class="lg:hidden p-8 pb-0 flex flex-col items-center text-center">
            <div class="w-14 h-14 bg-white dark:bg-slate-50 rounded-xl flex items-center justify-center mb-4 shadow-none border-0 p-2">
              <img src="/Logo-Vinance.png" alt="Vinance Logo" class="w-full h-full object-contain" />
            </div>
            <h1 class="text-2xl font-bold text-text-primary">Vinance</h1>
            <p class="text-sm text-text-secondary mt-1">Manajemen Keuangan</p>
            <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border-0 rounded-full">
              <Sparkles class="w-3 h-3 text-secondary" />
              <span class="text-[10px] font-bold text-secondary uppercase tracking-wider">Dukung Database Sheets Pribadi</span>
            </div>
          </div>

          <div class="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
            <!-- Tab switcher -->
            <div class="flex p-1 bg-bg-main/80 dark:bg-bg-main/20 rounded-xl mb-6 border-0">
              <button
                @click="isLogin = true"
                :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300', isLogin ? 'bg-card-bg text-accent shadow-none' : 'text-text-secondary']"
              >Masuk</button>
              <button
                @click="isLogin = false"
                :class="['flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300', !isLogin ? 'bg-card-bg text-accent shadow-none' : 'text-text-secondary']"
              >Daftar</button>
            </div>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Success alert -->
              <div v-if="success" class="p-3.5 rounded-xl bg-emerald-500/10 border-0 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck class="w-4 h-4 text-emerald-500" />
                </div>
                <p class="text-xs text-emerald-500 font-medium leading-relaxed">{{ success }}</p>
              </div>
 
              <!-- Name field (register step 1) -->
              <div v-if="!isLogin && regStep === 1" class="space-y-2">
                <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Nama Lengkap</label>
                <div class="relative group">
                  <UserIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input
                    type="text" required v-model="name"
                    class="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              <!-- Register Step 2: OTP verification -->
              <template v-if="!isLogin && regStep === 2">
                <div class="space-y-4 py-2">
                  <div class="text-center mb-4">
                    <div class="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MailIcon class="w-6 h-6 text-accent" />
                    </div>
                    <p class="text-sm text-text-primary font-medium">Verifikasi Email Anda</p>
                    <p class="text-[11px] text-text-secondary mt-1">Kode dikirim ke <span class="text-accent font-bold">{{ email }}</span></p>
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Kode Verifikasi</label>
                    <div class="relative group">
                      <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="text" required :maxlength="6" v-model="regCode"
                        @input="regCode = regCode.replace(/\D/g, '')"
                        class="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm tracking-[0.5em] font-bold transition-all"
                        placeholder="XXXXXX"
                      />
                    </div>
                  </div>
                  <button type="button" @click="regStep = 1" class="text-[10px] font-bold text-accent hover:underline w-full text-center">Ganti email atau kirim ulang</button>
                </div>
              </template>

              <!-- Email & password fields -->
              <template v-else>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email</label>
                  <div class="relative group">
                    <MailIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      type="email" required v-model="email"
                      class="w-full pl-11 pr-4 py-3.5 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm transition-all"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between items-center ml-1">
                    <label class="text-xs font-bold text-text-secondary uppercase tracking-wider">Kata Sandi</label>
                    <button v-if="isLogin" type="button" @click="showForgotModal = true" class="text-[10px] font-bold text-accent hover:underline">Lupa Sandi?</button>
                  </div>
                  <div class="relative group">
                    <LockIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                      :type="showPassword ? 'text' : 'password'" required v-model="password"
                      class="w-full pl-11 pr-12 py-3.5 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" @click="showPassword = !showPassword" class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-accent">
                      <EyeOff v-if="showPassword" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </template>

              <!-- Error message -->
              <div v-if="error" class="p-3.5 rounded-xl bg-rose-500/10 border-0 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle class="w-4 h-4 text-rose-500" />
                </div>
                <p class="text-xs text-rose-500 font-medium leading-relaxed">{{ error }}</p>
              </div>

              <button
                type="submit" :disabled="loading"
                class="w-full py-4 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {{ loading ? 'Memproses...' : (isLogin ? 'Masuk' : (regStep === 1 ? 'Lanjutkan' : 'Verifikasi & Daftar')) }}
              </button>

              <p v-if="!isLogin && regStep === 1" class="text-[10px] text-text-secondary text-center leading-relaxed">
                Dengan mendaftar, Anda menyetujui <button type="button" @click="showTermsModal = true" class="text-accent font-bold hover:underline">Syarat &amp; Ketentuan</button> layanan kami.
              </p>
            </form>

            <div class="mt-6 text-center">
              <p class="text-[11px] text-text-secondary leading-relaxed">
                Dengan melanjutkan, Anda menyetujui <br />
                <button type="button" @click="showTermsModal = true" class="text-accent font-bold hover:underline">Syarat &amp; Ketentuan</button> Vinance
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6 flex flex-col items-center space-y-3">
          <p class="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold text-center">Securely Synced with Google Sheets</p>
          <div class="flex gap-4">
            <div class="w-8 h-8 rounded-lg bg-bg-main border-0 flex items-center justify-center shadow-none">
              <img src="https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png" alt="Sheets" class="w-4 h-4" />
            </div>
            <div class="w-8 h-8 rounded-lg bg-bg-main border-0 flex items-center justify-center shadow-none">
              <img src="https://www.gstatic.com/images/branding/product/1x/apps_script_48dp.png" alt="Apps Script" class="w-4 h-4" />
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
              <MailIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input type="email" required v-model="forgotEmail" class="w-full pl-11 pr-4 py-3 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm transition-all" placeholder="Masukkan email Anda" />
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
                <ShieldCheck class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input type="text" required :maxlength="6" v-model="forgotCode" @input="forgotCode = forgotCode.replace(/\D/g, '')" class="w-full pl-11 pr-4 py-3 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm tracking-[0.5em] font-bold" placeholder="XXXXXX" />
              </div>
              <div class="relative group text-left">
                <LockIcon class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input :type="showPassword ? 'text' : 'password'" required v-model="newResetPassword" class="w-full pl-11 pr-12 py-3 rounded-xl border-0 bg-bg-main/50 text-text-primary outline-none focus:border-accent text-sm" placeholder="Kata sandi baru" />
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
import { ref } from 'vue';
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
const regCode = ref('');
const showPassword = ref(false);

const handleSendResetCode = async () => {
  forgotLoading.value = true;
  forgotError.value = '';
  try {
    const res = await api.sendResetCode(forgotEmail.value);
    if (res.success) {
      forgotStep.value = 2;
    } else {
      forgotError.value = res.error || 'Gagal mengirim kode.';
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
          error.value = res.error || 'Gagal mengirim kode verifikasi.';
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
