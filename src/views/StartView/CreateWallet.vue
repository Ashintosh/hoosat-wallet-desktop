<script setup>
import { ref, defineComponent, defineOptions, defineEmits, onMounted } from "vue";

import BackButtonBlock from "@/components/BackButtonBlock.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";
import FileInput from "@/components/FileInput.vue";
import LogoBlock from "@/components/LogoBlock.vue";
import LoadingBlock from "@/components/LoadingBlock.vue";

import { saveConfig } from "@/utils/Config";
import { changeRoute } from "@/utils/Helpers";
import { validateFileData } from "@/utils/WalletFile";

defineOptions({ name: 'CreateWallet' });
defineComponent([ BackButtonBlock, LogoBlock, PrimaryButton, PrimaryInput, FileInput, LoadingBlock ]);
const emit = defineEmits([ 'childSwitch', 'gotoWalletView' ]);

const selected = ref('');
const password = ref('');
const errorMsg = ref('');

const showLogo     = ref(true);
const showPage     = ref(false);
const isLoading    = ref(false);
const showErrorMsg = ref(false);

onMounted(() => {
  showPage.value = true;
});


function switchComponent(component) {
  showPage.value = false;
  setTimeout(() => {
    emit('childSwitch', component, true);
  }, 500);
}

function togglePage() {
  // showLogo.value = !showLogo.value;
  showPage.value = !showPage.value;
}

function showError(msg) {
  errorMsg.value     = msg;
  showErrorMsg.value = true;
}

function hideError() {
  showErrorMsg.value = false;
  errorMsg.value     = '';
}

function handleChildUpdate(type, param) {
  switch (type) {
    case 'selected': selected.value = param; break;
    case 'password': password.value = param; break;
    default: break;
  }
}

async function createWallet() {
  hideError();

  // [LOADING]
  togglePage();
  await new Promise(resolve => setTimeout(resolve, 500));

  isLoading.value = true;

  const payload = {
    action: 'create',
    directory: selected.value,
    password: password.value,
  };

  const isValidWallet = await validateFileData(payload);
  if (!isValidWallet.status) {
    isLoading.value = false;
    await new Promise(resolve => setTimeout(resolve, 300));
    togglePage();

    switch (isValidWallet.error) {
      case 'no-directory-value': showError('Wallet directory must have a value');     return;
      case 'file-exists'       : showError('This file already exists');               return;
      case 'short-password'    : showError('Password must be at least 8 characters'); return;
      case 'no-file-name'      : showError('Directory must contain filename after');  return;
      case 'write-error'       : showError('Could not write wallet file');            return;
      default: showError('Unknown exception'); return;
    }
  }

  // If created successfully

  if (!await saveConfig(selected.value)) {
    console.log('App configuration file could not be saved.');
  }

  isLoading.value = false;
  await new Promise(resolve => setTimeout(resolve, 300));

  changeRoute('/wallet', isValidWallet);
}
</script>

<template>
  <div class="content">
    <transition name="fade">
      <LogoBlock v-if="showLogo" />
    </transition>
    <transition name="fade-3">
      <LoadingBlock v-if="isLoading" />
    </transition>
    <transition name="fade">
      <BackButtonBlock v-if="showPage && !isLoading" @click="switchComponent('StartWallet')" />
    </transition>
    <transition name="fade">
      <div class="fields" v-if="showPage && !isLoading">
        <h3>Choose Wallet Directory</h3>
        <FileInput
            type="protected"
            dialog="directory"
            :selected="selected"
            :password="password"
            @hideError="hideError"
            @childUpdate="handleChildUpdate"
        />
        <div class="message">
          <span :class="{ 'show': showErrorMsg }">{{ errorMsg }}</span>
        </div>
        <div class="fields-buttons-row">
          <PrimaryButton class="primary-btn" value="Create" @click="createWallet" />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fields {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120px;
}

.fields-buttons-row {
  display: flex;
  flex-direction: row;
  margin-top: 65px;
}

.message {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
span {
  display: flex;
  position: absolute;
  margin-top: 15px;
  opacity: 0;
  justify-content: center;
  width: 100vh;
  transition: opacity 0.3s;
  color: red;
}
span.show {
  opacity: 1;
}
</style>