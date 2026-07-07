<template>
  <div class="space-y-5 pb-4">

    <!-- ══════════════════════════════════════════
         MOBILE VIEW (lg:hidden)
        ══════════════════════════════════════════ -->
    <div class="lg:hidden">
      <!-- ══ Premium Hero Card ══ -->
      <div
        class="relative pt-5 pb-14 px-5 text-white overflow-hidden"
        style="background: linear-gradient(160deg, #0f1f4b 0%, #1A2C5B 45%, #1e3a8a 100%)"
      >
        <!-- Decorative ambient glows -->
        <div class="absolute top-0 right-0 w-72 h-72 bg-blue-400/8 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute -bottom-16 -left-12 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-blue-300/5 rounded-full blur-2xl pointer-events-none" />

        <div class="relative z-10">
          <!-- Top row: Greeting + controls -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <p class="text-[11px] font-semibold text-white/45 uppercase tracking-[0.2em] leading-none mb-1">
                {{ greeting() }},
              </p>
              <p class="text-[19px] font-black text-white tracking-tight leading-none">
                {{ userName ? userName.split(' ')[0] : $t('defaultUser') }} 👋
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="$emit('toggleTheme')"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all"
              >
                <Sun v-if="isDark" class="w-4 h-4 text-amber-300" />
                <Moon v-else class="w-4 h-4 text-white/80" />
              </button>
              <button
                @click.stop="$emit('bellClick')"
                class="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/15 active:scale-90 transition-all relative"
              >
                <Bell class="w-4 h-4 text-white/80" />
                <span v-if="notificationCount > 0" class="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full border border-[#1A2C5B] animate-pulse" />
              </button>
              <button
                @click="$emit('navigateToProfile')"
                class="w-10 h-10 rounded-full active:scale-90 transition-all focus:outline-none ring-2 ring-white/20"
              >
                <img v-if="userPhotoUrl" :src="userPhotoUrl" alt="profil" class="w-10 h-10 rounded-full object-cover" />
                <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400/40 to-indigo-500/40 border border-white/20 flex items-center justify-center">
                  <span class="text-white font-black text-sm">{{ userName ? userName[0].toUpperCase() : 'U' }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- ── Center Balance Display ── -->
          <div class="text-center mb-6">
            <p class="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2">{{ $t('totalBalance') }}</p>
            <p class="text-[38px] font-black text-white tracking-tight leading-none currency-font">
              {{ formatCurrency(allTimeBalance) }}
            </p>
            <div class="flex items-center justify-center gap-2 mt-3">
              <span :class="['text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1', allTimeBalance >= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25' : 'bg-rose-500/20 text-rose-400 border border-rose-500/25']">
                <component :is="allTimeBalance >= 0 ? ArrowUpRight : ArrowDownRight" class="w-3 h-3" />
                {{ allTimeBalance >= 0 ? $t('positiveBalance') : $t('deficitBalance') }}
              </span>
              <span class="text-[10px] text-white/30 font-medium">•</span>
              <span class="text-[11px] text-white/40 font-medium">{{ props.transactions.length }} {{ $t('transactionCount') }}</span>
            </div>
          </div>

          <!-- ── Income & Expense Cards ── -->
          <div class="grid grid-cols-2 gap-3">
            <div class="relative overflow-hidden bg-white/8 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-sm border-0">
              <div class="absolute -top-4 -right-4 w-10 h-10 bg-emerald-400/20 rounded-full blur-lg" />
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border-0">
                <ArrowUpRight class="w-4.5 h-4.5 text-emerald-400 stroke-[2.5]" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] font-bold text-white/45 uppercase tracking-widest leading-none mb-1.5">{{ $t('income') }}</span>
                <span class="text-[13px] font-black text-emerald-400 truncate currency-font">{{ formatCurrency(allTimeIncome) }}</span>
              </div>
            </div>
            <div class="relative overflow-hidden bg-white/8 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-sm border-0">
              <div class="absolute -top-4 -right-4 w-10 h-10 bg-rose-400/20 rounded-full blur-lg" />
              <div class="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0 border-0">
                <ArrowDownRight class="w-4.5 h-4.5 text-rose-400 stroke-[2.5]" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[9px] font-bold text-white/45 uppercase tracking-widest leading-none mb-1.5">{{ $t('expense') }}</span>
                <span class="text-[13px] font-black text-rose-400 truncate currency-font">{{ formatCurrency(allTimeExpense) }}</span>
              </div>
            </div>
          </div>

          <!-- ── Quick Actions ── -->
          <div class="flex justify-around mt-5 pt-4 border-t border-white/8">
            <button @click="$emit('addClick')" class="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
              <div class="w-11 h-11 rounded-2xl bg-white/15 border-0 flex items-center justify-center backdrop-blur-sm">
                <Send class="w-5 h-5 text-white" />
              </div>
              <span class="text-[10px] font-bold text-white/70">{{ $t('recordAction') }}</span>
            </button>
            <button @click="$emit('viewAll')" class="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
              <div class="w-11 h-11 rounded-2xl bg-white/15 border-0 flex items-center justify-center backdrop-blur-sm">
                <History class="w-5 h-5 text-white" />
              </div>
              <span class="text-[10px] font-bold text-white/70">{{ $t('historyAction') }}</span>
            </button>
            <button @click="$emit('navigateToBudget')" class="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
              <div class="w-11 h-11 rounded-2xl bg-white/15 border-0 flex items-center justify-center backdrop-blur-sm">
                <CreditCard class="w-5 h-5 text-white" />
              </div>
              <span class="text-[10px] font-bold text-white/70">{{ $t('budgetAction') }}</span>
            </button>
            <button @click="$emit('navigateToGoals')" class="flex flex-col items-center gap-1.5 active:scale-90 transition-transform">
              <div class="w-11 h-11 rounded-2xl bg-white/15 border-0 flex items-center justify-center backdrop-blur-sm">
                <PiggyBank class="w-5 h-5 text-white" />
              </div>
              <span class="text-[10px] font-bold text-white/70">{{ $t('navGoals') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ══ Content Sheet ══ -->
      <div class="bg-bg-main rounded-t-[10px] mt-[-28px] relative z-10 px-4 pt-6 pb-24 min-h-[50vh] shadow-[0_-12px_40px_rgba(0,0,0,0.06)]">

        <!-- Section header -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-black text-text-primary tracking-tight">{{ $t('recentTransactions') }}</h3>
            <p class="text-[10px] text-text-secondary font-medium mt-0.5">{{ $t('currentMonth') }}</p>
          </div>
          <button
            @click="$emit('viewAll')"
            class="flex items-center gap-1 text-[11px] font-black text-accent bg-accent/8 border-0 px-3 py-1.5 rounded-full active:scale-95 transition-all"
          >
            {{ $t('viewAll') }} <ArrowRight class="w-3 h-3" />
          </button>
        </div>

        <!-- Filter Pills -->
        <div class="flex gap-2 mb-5 overflow-x-auto no-scrollbar">
          <button
            @click="txFilter = 'all'"
            :class="[
              'flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-black transition-all border-0 shrink-0',
              txFilter === 'all'
                ? 'bg-accent text-white shadow-none'
                : 'bg-card-bg text-text-secondary'
            ]"
          >
            {{ $t('allFilter') }}
          </button>
          <button
            @click="txFilter = 'Income'"
            :class="[
              'flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all border-0 shrink-0',
              txFilter === 'Income'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                : 'bg-card-bg text-text-secondary'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {{ $t('income') }}
          </button>
          <button
            @click="txFilter = 'Expense'"
            :class="[
              'flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black transition-all border-0 shrink-0',
              txFilter === 'Expense'
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                : 'bg-card-bg text-text-secondary'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {{ $t('expense') }}
          </button>
        </div>

        <!-- Transactions grouped list -->
        <div class="space-y-5">
          <div v-if="filteredRecent.length === 0" class="flex flex-col items-center gap-3 py-14 bg-transparent border-0">
            <div class="w-14 h-14 rounded-2xl bg-accent/8 border-0 flex items-center justify-center">
              <Sparkles class="w-6 h-6 text-accent" />
            </div>
            <div class="text-center">
              <p class="text-sm font-black text-text-primary">{{ $t('noTransactions') }}</p>
              <p class="text-xs text-text-secondary mt-1">{{ $t('startRecord') }}</p>
            </div>
          </div>
          <div v-else v-for="(txList, dateLabel) in groupedRecent" :key="dateLabel">
            <p class="text-[10px] font-black text-text-secondary/60 tracking-[0.2em] uppercase mb-2.5 px-1">{{ dateLabel }}</p>
            <div class="bg-transparent border-0 overflow-hidden shadow-none">
              <div
                v-for="(t, idx) in txList"
                :key="t.id"
                :class="['flex items-center gap-3 px-4 py-3.5 active:bg-bg-main/70 transition-colors', idx < txList.length - 1 && 'border-b border-border-ui/30 dark:border-border-ui/15']"
              >
                <div :class="['w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border-0', t.type === 'Income' ? 'bg-emerald-500/10' : 'bg-accent/8']">
                  <component :is="getCategoryIcon(t.category)" :class="['w-5 h-5', t.type === 'Income' ? 'text-emerald-500' : 'text-accent']" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-bold text-text-primary truncate">{{ t.category }}</p>
                  <p class="text-[11px] text-text-secondary/70 truncate mt-0.5">{{ t.note || '—' }}</p>
                </div>
                <div class="text-right flex-shrink-0">
                  <p :class="['text-[13px] font-black currency-font', t.type === 'Income' ? 'text-emerald-500' : 'text-danger']">
                    {{ t.type === 'Income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                  </p>
                  <p class="text-[9.5px] text-text-secondary/60 mt-0.5">{{ formatDateLabel(t.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         DESKTOP VIEW (hidden lg:block)
        ══════════════════════════════════════════ -->
    <div class="hidden lg:block space-y-5">
      <!-- Desktop Greeting -->
      <div>
        <p class="text-xs font-semibold text-text-secondary">{{ greeting() }},</p>
        <h2 class="text-2xl font-black text-text-primary tracking-tight leading-tight mt-0.5">
          {{ userName ? userName.split(' ')[0] : $t('defaultUser') }} 👋
        </h2>
        <p class="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mt-1">
          {{ $t('financialSummary') }}
        </p>
        <div class="h-0.5 w-10 bg-gradient-to-r from-accent to-secondary rounded-full mt-3 opacity-60" />
      </div>

      <!-- Top Overview & Stats Grid -->
      <div class="grid grid-cols-4 gap-5">
        <!-- Left Side: Balance Card -->
        <div class="col-span-2">
          <div class="relative rounded-lg overflow-hidden shadow-xl shadow-accent/20 h-full">
            <div class="absolute inset-0 bg-gradient-to-br from-accent via-emerald-500 to-secondary" />
            <div class="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
            <div class="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div class="relative p-6 pb-5 h-full flex flex-col justify-between">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <p class="text-[10px] font-bold text-white/70 uppercase tracking-[0.2em]">{{ $t('totalBalance') }}</p>
                  <p class="text-3xl font-black text-white tracking-tight mt-1 currency-font leading-none">{{ formatCurrency(allTimeBalance) }}</p>
                </div>
                <button @click="$emit('addClick')" class="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border-0 text-white text-xs font-bold hover:bg-white/30 active:scale-95 transition-all">
                  <Plus class="w-3.5 h-3.5" />{{ $t('recordAction') }}
                </button>
              </div>
              <div class="flex gap-4">
                <div class="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><ArrowUpRight class="w-3 h-3 text-white" /></div>
                    <p class="text-[9px] font-bold text-white/70 uppercase tracking-widest">{{ $t('income') }}</p>
                  </div>
                  <p class="text-sm font-black text-white currency-font">{{ formatCurrency(income) }}</p>
                </div>
                <div class="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <div class="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center"><ArrowDownRight class="w-3 h-3 text-white" /></div>
                    <p class="text-[9px] font-bold text-white/70 uppercase tracking-widest">{{ $t('expense') }}</p>
                  </div>
                  <p class="text-sm font-black text-white currency-font">{{ formatCurrency(expense) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Financial Health & Donut Chart -->
        <div class="col-span-2 grid grid-cols-3 gap-4 content-start">
          <div class="col-span-3 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              v-for="p in periods"
              :key="p"
              @click="period = p"
              :class="[
                'flex-1 min-w-[70px] px-2 py-2 rounded-lg text-[11px] font-bold transition-all border-0 text-center',
                period === p
                  ? 'bg-accent text-white shadow-none'
                  : 'bg-card-bg text-text-secondary hover:text-text-primary'
              ]"
            >
              {{ periodLabels[p] }}
            </button>
          </div>

          <!-- Savings Rate -->
          <div class="col-span-2 bg-transparent rounded-lg p-0 border-0 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest">{{ $t('financialHealth') }}</p>
              <span :class="[
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold border-0',
                savingsRate >= 20 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
              ]">
                <component :is="savingsRate >= 20 ? ShieldCheck : AlertCircle" class="w-2.5 h-2.5" />
                {{ savingsRate >= 20 ? $t('healthy') : $t('caution') }}
              </span>
            </div>
            <div class="space-y-3">
              <div>
                <div class="flex justify-between items-center mb-1.5">
                  <span class="text-[10px] font-semibold text-text-primary flex items-center gap-1">
                    <TrendingUp class="w-3 h-3 text-accent" /> {{ $t('savings') }}
                  </span>
                  <span :class="['text-xs font-black', savingsRate >= 20 ? 'text-success' : 'text-warning']">
                    {{ savingsRate.toFixed(0) }}%
                  </span>
                </div>
                <div class="h-2 bg-bg-main rounded-full overflow-hidden">
                  <div
                    :class="['h-full rounded-full', savingsRate >= 20 ? 'bg-gradient-to-r from-success to-emerald-400' : 'bg-gradient-to-r from-warning to-amber-400']"
                    :style="{ width: `${Math.min(savingsRate, 100)}%` }"
                  />
                </div>
              </div>
              <div v-if="totalBudget > 0">
                <div class="flex justify-between items-center mb-1.5">
                  <span class="text-[10px] font-semibold text-text-primary flex items-center gap-1">
                    <Zap class="w-3 h-3 text-warning" /> {{ $t('budget') }}
                  </span>
                  <span :class="['text-xs font-black', budgetUsage <= 90 ? 'text-text-primary' : 'text-danger']">
                    {{ budgetUsage.toFixed(0) }}%
                  </span>
                </div>
                <div class="h-2 bg-bg-main rounded-full overflow-hidden">
                  <div
                    :class="['h-full rounded-full', budgetUsage <= 90 ? 'bg-gradient-to-r from-accent to-secondary' : 'bg-gradient-to-r from-warning to-danger']"
                    :style="{ width: `${budgetUsage}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Donut Chart -->
          <div
            @click="$emit('navigateToBudget')"
            :class="[
              'col-span-1 bg-transparent rounded-lg p-0 border-0 flex flex-col items-center relative cursor-pointer hover:bg-accent/5 active:scale-95 transition-all group justify-between'
            ]"
          >
            <div class="w-full mb-1">
              <p class="text-[9px] font-black text-text-secondary uppercase tracking-widest text-center">{{ $t('budget') }}</p>
            </div>
            <div class="relative flex items-center justify-center">
              <svg width="76" height="76" viewBox="0 0 88 88" class="-rotate-90">
                <circle cx="44" cy="44" :r="radius" fill="none" stroke="currentColor" stroke-width="8" class="text-bg-main" />
                <circle
                  cx="44" cy="44" :r="radius" fill="none"
                  stroke="url(#dashGrad2)" stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="`${expenseDash} ${circ}`"
                />
                <defs>
                  <linearGradient id="dashGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#059669" />
                    <stop offset="100%" stop-color="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span class="text-xs font-black text-text-primary mt-0.5">{{ totalBudget > 0 ? `${budgetUsage.toFixed(0)}%` : '—' }}</span>
              </div>
            </div>
            <div class="mt-1">
              <p class="text-[8px] font-bold text-text-secondary uppercase tracking-wider text-center leading-tight group-hover:text-accent transition-colors">
                {{ $t('tapToSetup').split('\n')[0] }}<br />{{ $t('tapToSetup').split('\n')[1] }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Goals -->
      <div v-if="goals.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-black text-text-primary">{{ $t('goalsSection') }}</h3>
          <button @click="$emit('navigateToGoals')" class="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {{ $t('viewAll') }} <ArrowRight class="w-3 h-3" />
          </button>
        </div>
        <div class="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          <div
            v-for="goal in goals.slice(0, 3)"
            :key="goal.id"
            @click="$emit('navigateToGoals')"
            class="bg-transparent border-0 flex-shrink-0 w-[240px] p-0 flex flex-col gap-2 cursor-pointer hover:bg-bg-main/20 transition-all group"
          >
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm" :style="{ backgroundColor: getGoalColor(goal.color) }">
                <component :is="getGoalIcon(goal.icon)" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-bold text-text-primary truncate">{{ goal.name }}</p>
                <p class="text-[9px] text-text-secondary mt-0.5">{{ $t('goalTarget') }}: {{ formatCurrency(goal.targetAmount) }}</p>
              </div>
            </div>
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-[9px] font-bold" :style="{ color: getGoalColor(goal.color) }">
                  {{ getGoalPercentage(goal) }}%
                </span>
                <span class="text-[9px] text-text-secondary font-medium">{{ formatCurrency(goal.savedAmount) }}</span>
              </div>
              <div class="h-1.5 bg-bg-main rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :style="{ backgroundColor: getGoalColor(goal.color), width: `${Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)}%` }" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Expenses -->
      <div v-if="topExpenses.length > 0">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-black text-text-primary">{{ $t('topExpenses') }}</h3>
          <button @click="$emit('viewAll')" class="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {{ $t('viewAll') }} <ArrowRight class="w-3 h-3" />
          </button>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="([category, amount], i) in topExpenses"
            :key="category"
            class="bg-transparent p-0 border-0 hover:bg-bg-main/20 transition-all group"
          >
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center mb-3', categoryColors[i % categoryColors.length]]">
              <component :is="getCategoryIcon(category)" class="w-4.5 h-4.5" />
            </div>
            <p class="text-[10px] font-bold text-text-secondary uppercase tracking-wider truncate mb-0.5">{{ category }}</p>
            <p class="text-sm font-black text-text-primary currency-font">{{ formatCurrency(amount) }}</p>
            <div class="mt-2 h-1 bg-bg-main rounded-full overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-accent to-secondary" :style="{ width: `${expense > 0 ? (amount / expense) * 100 : 0}%` }" />
            </div>
            <p class="text-[9px] font-medium text-text-secondary mt-1">{{ (expense > 0 ? (amount / expense) * 100 : 0).toFixed(0) }}% {{ $t('ofTotal') }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Transactions (Desktop) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-black text-text-primary">{{ $t('latestTransactions') }}</h3>
          <button @click="$emit('viewAll')" class="text-[10px] font-bold text-accent flex items-center gap-0.5 hover:gap-1.5 transition-all">
            {{ $t('viewAll') }} <ArrowRight class="w-3 h-3" />
          </button>
        </div>

        <div class="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
          <button
            @click="txFilter = 'all'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold border-0 transition-all flex items-center gap-1.5 cursor-pointer',
              txFilter === 'all'
                ? 'bg-accent text-white shadow-none'
                : 'bg-card-bg text-text-secondary'
            ]"
          >
            {{ $t('allFilter') }}
          </button>
          <button
            @click="txFilter = 'Income'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold border-0 transition-all flex items-center gap-1.5 cursor-pointer',
              txFilter === 'Income'
                ? 'bg-accent text-white shadow-none'
                : 'bg-card-bg text-text-secondary'
            ]"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :style="{ backgroundColor: txFilter === 'Income' ? '#fff' : '#10b981' }"
            />
            {{ $t('income') }}
          </button>
          <button
            @click="txFilter = 'Expense'"
            :class="[
              'px-4 py-1.5 rounded-full text-xs font-bold border-0 transition-all flex items-center gap-1.5 cursor-pointer',
              txFilter === 'Expense'
                ? 'bg-accent text-white shadow-none'
                : 'bg-card-bg text-text-secondary'
            ]"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :style="{ backgroundColor: txFilter === 'Expense' ? '#fff' : '#f43f5e' }"
            />
            {{ $t('expense') }}
          </button>
        </div>

        <div class="bg-transparent border-0 overflow-hidden shadow-none">
          <div v-if="filteredRecent.length === 0" class="flex flex-col items-center gap-3 py-10">
            <div class="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center"><Sparkles class="w-6 h-6 text-accent" /></div>
            <p class="text-sm font-bold text-text-primary">{{ $t('startRecord') }}</p>
          </div>
          <div v-else>
            <div v-for="(txList, dateLabel) in groupedRecent" :key="dateLabel">
              <p class="py-2 px-4 text-[10px] font-bold text-text-secondary/70 tracking-widest uppercase bg-bg-main border-0">{{ dateLabel }}</p>
              <div class="divide-y divide-border-ui/40">
                <div v-for="t in txList" :key="t.id" class="flex items-center gap-3 px-4 py-3.5 hover:bg-bg-main/50 transition-colors">
                  <div class="w-10 h-10 rounded-full bg-[#f0f3fa] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <component :is="getCategoryIcon(t.category)" :class="['w-4.5 h-4.5', t.type === 'Income' ? 'text-success' : 'text-[#2D4DB5] dark:text-blue-400']" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-semibold text-text-primary truncate">{{ t.category }}</p>
                    <p class="text-[11px] text-text-secondary truncate">{{ t.note || '—' }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p :class="['text-[13px] font-black currency-font', t.type === 'Income' ? 'text-success' : 'text-danger']">
                      {{ t.type === 'Income' ? '+' : '-' }}{{ formatCurrency(t.amount) }}
                    </p>
                    <p class="text-[10px] text-text-secondary mt-0.5">{{ new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <button @click="$emit('addClick')" class="flex w-full bg-gradient-to-r from-accent to-secondary text-white py-3.5 rounded-lg text-xs font-black shadow-lg shadow-accent/20 items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all">
        <Plus class="w-4 h-4" /> {{ $t('addTransaction').toUpperCase() }}
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  ArrowRight, Plus, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  Utensils, Car, ShoppingBag, Receipt, Gamepad2, HeartPulse,
  ShieldCheck, AlertCircle, Zap, Sparkles, Target, Plane, Smartphone, GraduationCap, Camera, Globe, Briefcase, Coffee, Home,
  Send, CreditCard, PiggyBank, History, Bell, Sun, Moon
} from '@lucide/vue';
import type { Transaction, Budget, Goal } from '../types';
import { formatCurrency } from '../lib/utils';
import { isToday, isYesterday, isThisMonth, isThisWeek, format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  goals?: Goal[];
  isDark?: boolean;
  userName?: string;
  userPhotoUrl?: string;
  notificationCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  goals: () => [],
  notificationCount: 0,
});

defineEmits<{
  addClick: [];
  viewAll: [];
  navigateToBudget: [];
  navigateToGoals: [];
  navigateToProfile: [];
  toggleTheme: [];
  bellClick: [];
}>();

type FilterPeriod = 'today' | 'week' | 'month' | 'all';
type TxFilter = 'all' | 'Income' | 'Expense';

const period = ref<FilterPeriod>('month');
const txFilter = ref<TxFilter>('all');

const periods: FilterPeriod[] = ['today', 'week', 'month', 'all'];

const CATEGORY_ICONS: Record<string, any> = {
  'Makanan': Utensils,
  'Transportasi': Car,
  'Belanja': ShoppingBag,
  'Tagihan': Receipt,
  'Hiburan': Gamepad2,
  'Kesehatan': HeartPulse,
  'Lainnya': Wallet,
};

const getCategoryIcon = (category: string) => {
  const normalized = category.toLowerCase();
  const entry = Object.entries(CATEGORY_ICONS).find(([key]) => key.toLowerCase() === normalized);
  return entry ? entry[1] : Wallet;
};

const GOAL_ICONS: Record<string, any> = {
  'home': Home,
  'car': Car,
  'plane': Plane,
  'phone': Smartphone,
  'edu': GraduationCap,
  'health': HeartPulse,
  'shop': ShoppingBag,
  'game': Gamepad2,
  'camera': Camera,
  'world': Globe,
  'work': Briefcase,
  'coffee': Coffee,
};

const getGoalIcon = (id: string) => {
  return GOAL_ICONS[id] || Target;
};

const categoryColors = [
  'bg-violet-500/15 text-violet-500',
  'bg-sky-500/15 text-sky-500',
  'bg-amber-500/15 text-amber-500',
  'bg-emerald-500/15 text-emerald-500',
  'bg-rose-500/15 text-rose-500',
  'bg-fuchsia-500/15 text-fuchsia-500',
];

const { t } = useI18n();

const periodLabels = computed<Record<FilterPeriod, string>>(() => ({
  today: t('today'),
  week: t('thisWeek'),
  month: t('thisMonth'),
  all: t('allTime'),
}));

const filtered = computed(() => {
  return props.transactions.filter(t => {
    const d = new Date(t.date);
    if (period.value === 'today') return isToday(d);
    if (period.value === 'week') return isThisWeek(d, { weekStartsOn: 1 });
    if (period.value === 'month') return isThisMonth(d);
    return true;
  });
});

const income = computed(() => filtered.value.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0));
const expense = computed(() => filtered.value.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0));

const allTimeIncome = computed(() => props.transactions.filter(t => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0));
const allTimeExpense = computed(() => props.transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0));
const allTimeBalance = computed(() => allTimeIncome.value - allTimeExpense.value);

const totalBudget = computed(() => props.budgets.reduce((acc, b) => acc + Number(b.limit), 0));
const budgetUsage = computed(() => totalBudget.value > 0 ? Math.min((expense.value / totalBudget.value) * 100, 100) : 0);
const savingsRate = computed(() => income.value > 0 ? Math.max(((income.value - expense.value) / income.value) * 100, 0) : 0);

const recentTransactions = computed(() => {
  return [...props.transactions]
    .filter(t => isThisMonth(new Date(t.date)))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
});

const filteredRecent = computed(() => {
  return txFilter.value === 'all'
    ? recentTransactions.value
    : recentTransactions.value.filter(t => t.type === txFilter.value);
});

const groupedRecent = computed(() => {
  return filteredRecent.value.reduce((groups, tx) => {
    const d = new Date(tx.date);
    let label: string;
    if (isToday(d)) label = t('today').toUpperCase();
    else if (isYesterday(d)) label = t('yesterday').toUpperCase();
    else label = format(d, 'd MMM yyyy', { locale: localeId }).toUpperCase();
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
    return groups;
  }, {} as Record<string, Transaction[]>);
});

const expenseByCategory = computed(() => {
  return filtered.value
    .filter(t => t.type === 'Expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);
});

const topExpenses = computed(() => {
  return Object.entries(expenseByCategory.value)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
});

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return t('greeting_morning');
  if (h < 15) return t('greeting_afternoon');
  return t('greeting_evening');
};

const radius = 38;
const circ = 2 * Math.PI * radius;
const expenseDash = computed(() => circ * Math.min(budgetUsage.value / 100, 1));

const getGoalColor = (c?: string) => (c && c.startsWith('#')) ? c : '#059669';

const getGoalPercentage = (goal: Goal) => {
  const pct = (goal.savedAmount / goal.targetAmount) * 100;
  return pct > 0 && pct < 1 ? '< 1' : Math.round(pct);
};

const formatDateLabel = (dStr: string) => {
  return format(new Date(dStr), 'MMM d', { locale: localeId });
};
</script>

