import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { User } from '../types';
import { LogIn, UserPlus, Wallet, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Sparkles, Sun, Moon, X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface AuthProps {
  onLogin: (user: User) => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

export default function Auth({ onLogin, isDark, toggleTheme }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  
  const [regStep, setRegStep] = useState(1);
  const [regCode, setRegCode] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await api.sendResetCode(forgotEmail);
      if (res.success) {
        setForgotStep(2);
      } else {
        setForgotError(res.error || 'Gagal mengirim kode.');
      }
    } catch (err) {
      setForgotError('Terjadi kesalahan koneksi.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await api.resetPasswordWithCode(forgotEmail, forgotCode, newResetPassword);
      if (res.success) {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotCode('');
        setNewResetPassword('');
        setError('Kata sandi berhasil diperbaharui. Silakan masuk.');
      } else {
        setForgotError(res.error || 'Gagal merubah sandi.');
      }
    } catch (err) {
      setForgotError('Terjadi kesalahan koneksi.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const res = await api.login(email, password);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setError(res.error || 'Login gagal. Periksa email dan password Anda.');
        }
      } else {
        // Registration now uses 2 steps
        if (regStep === 1) {
          const res = await api.sendRegisterCode(email);
          if (res.success) {
            setRegStep(2);
            setError(''); // clear any errors
          } else {
            setError(res.error || 'Gagal mengirim kode verifikasi.');
          }
        } else {
          const res = await api.verifyRegisterAndCreate(name, email, password, regCode);
          if (res.success) {
            setSuccess('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
            setIsLogin(true);
            setRegStep(1);
            setRegCode('');
            setPassword('');
          } else {
            setError(res.error || 'Verifikasi gagal.');
          }
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-linear-to-br from-bg-main to-sidebar-bg flex items-center justify-center p-4 sm:p-8 relative overflow-hidden transition-colors">
      {/* Theme Toggle Button */}
      {toggleTheme && (
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 z-50 p-2.5 bg-card-bg/80 backdrop-blur-md border border-border-ui rounded-full shadow-lg text-text-secondary hover:text-text-primary hover:scale-110 active:scale-95 transition-all"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      )}

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Doodle Pattern Layer */}
        <div 
          className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url('/finance-doodle.png')`,
            backgroundSize: '320px',
            backgroundRepeat: 'repeat',
            filter: isDark ? 'invert(1) brightness(2)' : 'none'
          }}
        />
        
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center z-10">
        {/* Left Side: Branding & Features */}
        <div className="hidden lg:flex flex-col space-y-6 pr-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-50 rounded-xl flex items-center justify-center shadow-lg border border-slate-200 dark:border-accent/10 p-1.5">
                <img src="/Logo-Vinance.png" alt="Vinance Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">Vinance</h1>
            </div>
            <h2 className="text-2xl xl:text-3xl font-bold text-text-primary leading-tight mb-2">
              Kelola Keuangan Keluarga <br />
              <span className="text-accent">Lebih Cerdas & Transparan.</span>
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
              Sistem manajemen keuangan modern yang terhubung langsung dengan Google Sheets pribadi Anda. Aman, cepat, dan mudah digunakan.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
              <Sparkles className="w-3 h-3 text-secondary" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Dukung Database Sheets Pribadi</span>
            </div>
          </motion.div>

          <div className="space-y-2">
            {[
              { icon: ShieldCheck, title: 'Privasi Terjamin', desc: 'Data tersimpan di Google Sheets pribadi Anda.' },
              { icon: Sparkles, title: 'Analisis Cerdas', desc: 'Visualisasi pengeluaran otomatis.' },
              { icon: Wallet, title: 'Budgeting Mudah', desc: 'Atur batas pengeluaran kategori.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-transparent hover:border-border-ui/50 hover:bg-card-bg/80 dark:hover:bg-card-bg/50 hover:shadow-lg hover:shadow-accent/5 hover:scale-[1.02] transition-all duration-300 group cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm group-hover:shadow-accent/20">
                  <feature.icon className="w-5 h-5 text-accent transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">{feature.title}</h4>
                  <p className="text-[11px] text-text-secondary leading-tight mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[400px] mx-auto lg:mx-0 lg:ml-auto"
        >
          <div className="bg-card-bg rounded-[2rem] border border-border-ui shadow-2xl overflow-hidden transition-colors max-h-[90vh] flex flex-col">
            {/* Mobile Header */}
            <div className="lg:hidden p-8 pb-0 flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-white dark:bg-slate-50 rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-slate-200 dark:border-accent/10 p-2">
                <img src="/Logo-Vinance.png" alt="Vinance Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-text-primary">Vinance</h1>
              <p className="text-sm text-text-secondary mt-1">Manajemen Keuangan Keluarga</p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                <Sparkles className="w-3 h-3 text-secondary" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Dukung Database Sheets Pribadi</span>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
              {/* Tab Switcher */}
              <div className="flex p-1 bg-bg-main/80 dark:bg-bg-main/20 rounded-2xl mb-6 border border-border-ui/50">
                <button
                  onClick={() => setIsLogin(true)}
                  className={cn(
                    "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300",
                    isLogin 
                      ? "bg-card-bg text-accent shadow-[0_4px_12px_rgba(0,0,0,0.1)] scale-[1.02]" 
                      : "text-text-secondary hover:text-text-primary hover:bg-white/40 dark:hover:bg-white/5"
                  )}
                >
                  Masuk
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={cn(
                    "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300",
                    !isLogin 
                      ? "bg-card-bg text-accent shadow-[0_4px_12px_rgba(0,0,0,0.1)] scale-[1.02]" 
                      : "text-text-secondary hover:text-text-primary hover:bg-white/40 dark:hover:bg-white/5"
                  )}
                >
                  Daftar
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xs text-emerald-500 font-medium leading-relaxed">
                          {success}
                        </p>
                      </motion.div>
                    )}

                    {!isLogin && regStep === 1 && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Nama Lengkap</label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all"
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                      </div>
                    )}

                    {!isLogin && regStep === 2 ? (
                      <div className="space-y-4 py-2">
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Mail className="w-6 h-6 text-accent" />
                          </div>
                          <p className="text-sm text-text-primary font-medium">Verifikasi Email Anda</p>
                          <p className="text-[11px] text-text-secondary mt-1">Kode dikirim ke <span className="text-accent font-bold">{email}</span></p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Kode Verifikasi</label>
                          <div className="relative group">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                              type="text"
                              required
                              maxLength={6}
                              value={regCode}
                              onChange={(e) => setRegCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm tracking-[0.5em] font-bold transition-all"
                              placeholder="XXXXXX"
                            />
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setRegStep(1)} 
                          className="text-[10px] font-bold text-accent hover:underline w-full text-center"
                        >
                          Ganti email atau kirim ulang
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-text-secondary uppercase tracking-wider ml-1">Email</label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all"
                              placeholder="email@contoh.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">Kata Sandi</label>
                            {isLogin && (
                              <button 
                                type="button" 
                                onClick={() => setShowForgotModal(true)}
                                className="text-[10px] font-bold text-accent hover:underline"
                              >
                                Lupa Sandi?
                              </button>
                            )}
                          </div>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-secondary hover:text-accent transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        </div>
                        <p className="text-xs text-rose-500 font-medium leading-relaxed">
                          {error}
                        </p>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      onClick={() => setSuccess('')}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-secondary text-white text-sm font-bold shadow-lg shadow-accent/25 hover:shadow-accent/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {isLogin ? 'Masuk Sekarang' : (regStep === 1 ? 'Lanjut Daftar' : 'Verifikasi & Buat Akun')}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </AnimatePresence>

              <div className="mt-6 text-center">
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Dengan melanjutkan, Anda menyetujui <br />
                  <button className="text-accent font-bold hover:underline">Syarat & Ketentuan</button> kami.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center space-y-3">
            <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-bold text-center">
              Securely Synced with Google Sheets
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-card-bg border border-border-ui flex items-center justify-center shadow-sm">
                <img src="https://www.gstatic.com/images/branding/product/1x/sheets_2020q4_48dp.png" alt="Sheets" className="w-4 h-4" referrerPolicy="no-referrer" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-card-bg border border-border-ui flex items-center justify-center shadow-sm">
                <img src="https://www.gstatic.com/images/branding/product/1x/apps_script_48dp.png" alt="Apps Script" className="w-4 h-4" referrerPolicy="no-referrer" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !forgotLoading && setShowForgotModal(false)}
          />
          <div
            className="bg-card-bg relative w-full max-w-sm rounded-[1.5rem] shadow-2xl p-6 border border-border-ui overflow-hidden z-10 text-center"
          >
            <div className="w-14 h-14 bg-linear-to-br from-accent to-secondary rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-accent/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Lupa Kata Sandi?</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-5">
              {forgotStep === 1 
                ? "Masukkan email Anda untuk menerima kode verifikasi pengaturan ulang kata sandi."
                : `Masukkan kode 6 digit yang dikirim ke email ${forgotEmail}.`
              }
            </p>
            
            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="relative group text-left">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all"
                    placeholder="Masukkan email Anda"
                  />
                </div>
                {forgotError && <p className="text-[10px] text-danger font-bold text-left px-1">{forgotError}</p>}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 bg-linear-to-r from-accent to-secondary text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Kirim Kode Verifikasi"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative group text-left">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm tracking-[0.5em] font-bold transition-all"
                      placeholder="XXXXXX"
                    />
                  </div>
                  <div className="relative group text-left">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-accent transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-border-ui bg-bg-main/50 text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm transition-all"
                      placeholder="Kata sandi baru"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-secondary hover:text-accent transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {forgotError && <p className="text-[10px] text-danger font-bold text-left px-1">{forgotError}</p>}
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 bg-linear-to-r from-accent to-secondary text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:shadow-accent/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Simpan Sandi Baru"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setForgotStep(1)} 
                  className="text-[10px] font-bold text-accent hover:underline"
                >
                  Ganti email atau kirim ulang
                </button>
              </form>
            )}

            <button
              onClick={() => !forgotLoading && setShowForgotModal(false)}
              className="w-full mt-4 py-3 bg-bg-main border border-border-ui text-text-secondary font-bold text-sm rounded-lg hover:text-text-primary hover:border-text-secondary/30 transition-all disabled:opacity-50"
              disabled={forgotLoading}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
