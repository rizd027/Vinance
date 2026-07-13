<template>
  <!-- PIN LOCK SCREEN -->
  <PinLock
    v-if="appPin && !isUnlocked"
    mode="unlock"
    :correct-pin="appPin"
    @unlock="isUnlocked = true"
  />

  <!-- PIN SETUP SCREEN -->
  <PinLock
    v-else-if="isSettingPin"
    mode="setup"
    @complete="handleFinishPinSetup"
    @cancel="isSettingPin = false"
  />

  <!-- AUTH SCREEN -->
  <Auth
    v-else-if="!user"
    :is-dark="isDark"
    @login="handleLogin"
    @toggle-theme="isDark = !isDark"
  />

  <!-- MAIN APP -->
  <Layout
    v-else
    :active-tab="activeTab"
    :user="user"
    :is-dark="isDark"
    :transactions="data.transactions"
    :budgets="data.budgets"
    :syncing="syncing"
    :toasts="toasts"
    :active-dialog="activeDialog"
    @tab-change="handleTabChange"
    @toggle-theme="isDark = !isDark"
    @logout="handleLogout"
    @add-click="showAddModal = true"
  >
    <Dashboard
      v-if="activeTab === 'home'"
      :loading="loading"
      :transactions="data.transactions"
      :budgets="data.budgets"
      :goals="data.goals"
      :is-dark="isDark"
      :user-name="user.name"
      :user-photo-url="user.photoUrl"
      @add-click="showAddModal = true"
      @view-all="handleTabChange('transactions')"
      @navigate-to-budget="handleTabChange('budgets')"
      @navigate-to-goals="handleTabChange('goals')"
      @navigate-to-profile="handleTabChange('profile')"
      @toggle-theme="isDark = !isDark"
    />

    <Transactions
      v-show="activeTab === 'transactions'"
      :loading="loading"
      :transactions="data.transactions"
      :budgets="data.budgets"
      :user-id="user.id"
      :show-add-modal="showAddModal"
      @add-click="showAddModal = true"
      @close-add-modal="showAddModal = false"
      @add="handleAddTransaction"
      @update="handleUpdateTransaction"
      @delete="handleDeleteTransaction"
      @import="handleImportTransactions"
    />

    <Budgets
      v-if="activeTab === 'budgets'"
      :transactions="data.transactions"
      :budgets="data.budgets"
      @update="handleUpdateBudget"
      @delete="handleDeleteBudget"
    />

    <Reports
      v-else-if="activeTab === 'reports'"
      :transactions="data.transactions"
      :budgets="data.budgets"
    />

    <Goals
      v-else-if="activeTab === 'goals'"
      :goals="data.goals"
      :userId="user?.id || ''"
      :transactions="data.transactions"
      @add="handleAddGoal"
      @update="handleUpdateGoal"
      @delete="handleDeleteGoal"
      @add-savings="handleAddGoalSavings"
    />

    <Notes
      v-else-if="activeTab === 'notes'"
      :notes="data.notes"
      @add="handleAddNote"
      @update="handleUpdateNote"
      @delete="handleDeleteNote"
    />

    <Profile
      v-else-if="activeTab === 'profile'"
      :user="user"
      :app-pin="appPin"
      :app-settings="appSettings"
      :is-dark="isDark"
      :show-export-modal="showExportModal"
      :transactions="data.transactions"
      :budgets="data.budgets"
      :goals="data.goals"
      :notes="data.notes"
      @update-user="handleUpdateUser"
      @toggle-pin="handleTogglePin"
      @update-settings="appSettings = $event"
      @toggle-export-modal="showExportModal = !showExportModal"
      @clear-data="handleClearAllData"
      @logout="handleLogout"
      @show-toast="showToast"
      @update-script-url="handleUpdateScriptUrl"
    />

    <MenuPage
      v-else-if="activeTab === 'menu'"
      @navigate="handleTabChange"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onErrorCaptured } from 'vue';

import Auth from './components/Auth.vue';
import Layout from './components/Layout.vue';
import PinLock from './components/PinLock.vue';

// Page components (will be added progressively)
import Dashboard from './components/Dashboard.vue';
import Transactions from './components/Transactions.vue';
import Budgets from './components/Budgets.vue';
import Reports from './components/Reports.vue';
import Goals from './components/Goals.vue';
import Notes from './components/Notes.vue';
import Profile from './components/Profile.vue';
import MenuPage from './components/MenuPage.vue';

import { useAppState } from './composables/useAppState';
import { api } from './lib/api';

const {
  user,
  data,
  syncing,
  loading,
  isDark,
  appPin,
  isUnlocked,
  isSettingPin,
  toasts,
  activeDialog,
  showExportModal,
  appSettings,
  init,
  showToast,
  handleLogin,
  handleLogout,
  handleAddTransaction,
  handleUpdateTransaction,
  handleDeleteTransaction,
  handleUpdateBudget,
  handleDeleteBudget,
  handleImportTransactions,
  handleAddGoal,
  handleUpdateGoal,
  handleDeleteGoal,
  handleAddGoalSavings,
  handleAddNote,
  handleUpdateNote,
  handleDeleteNote,
  handleTogglePin,
  handleFinishPinSetup,
  handleClearAllData,
  registerModal,
  unregisterModal,
} = useAppState();

const activeTab = ref('home');
const showAddModal = ref(false);

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  window.history.pushState({ tab, modal: false }, '');
};

const handleUpdateScriptUrl = (url: string) => {
  if (!user.value) return;
  const updatedUser = { ...user.value, scriptUrl: url };
  user.value = updatedUser;
  api.setBaseUrl(url);
  localStorage.setItem('kb_user', JSON.stringify(updatedUser));
};

const handleUpdateUser = (updatedUser: any) => {
  user.value = updatedUser;
  localStorage.setItem('kb_user', JSON.stringify(updatedUser));
};

// Navigation history support
onMounted(() => {
  init();

  if (!window.history.state) {
    window.history.replaceState({ tab: activeTab.value, modal: false }, '');
  }

  window.addEventListener('popstate', (event: PopStateEvent) => {
    const state = event.state;
    if (state && state.tab) {
      activeTab.value = state.tab;
    }
  });

  // Visibility change hack for repaint on mobile
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      document.body.style.display = 'none';
      void document.body.offsetHeight;
      document.body.style.display = '';
    }
  });
});

watch(showAddModal, (val) => {
  if (val) {
    registerModal('add-transaction', () => { showAddModal.value = false; });
  } else {
    unregisterModal('add-transaction');
  }
});

onErrorCaptured((err, _instance, info) => {
  console.error('[App Error]', err, info);
  return false;
});



</script>
