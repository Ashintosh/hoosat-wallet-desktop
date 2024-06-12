<script setup>
import { ref, defineComponent, defineOptions, defineEmits, onMounted } from "vue";

import PrimaryButton from "@/components/PrimaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";
import LogoBlock from "@/components/LogoBlock.vue";
import BackButtonBlock from "@/components/BackButtonBlock.vue";

defineOptions({ name: 'CreateWallet' });
defineComponent([ BackButtonBlock, LogoBlock, PrimaryButton, PrimaryInput ]);
const emit = defineEmits([ 'childSwitch' ]);

const showPage     = ref(false);
const selected     = ref('');
const password     = ref('');
const showErrorMsg = ref(false);
const errorMsg     = ref('');

onMounted(() => {
  showPage.value = true;
});


function switchComponent(component) {
  showPage.value = false;
  setTimeout(() => {
    emit('childSwitch', component);
  }, 1000);
}

function showError(msg) {
  errorMsg.value     = msg;
  showErrorMsg.value = true;
}

function hideError() {
  showErrorMsg.value = false;
  errorMsg.value     = '';
}

async function browseDialog(type='file') {
  hideError();

  selected.value = await new Promise((resolve) => {
    window.ipc.send(`OPEN_${type.toUpperCase()}_DIALOG`);
    window.ipc.once(`${type.toUpperCase()}_SELECTED`, (selected) => {
      if (type === 'file') resolve(selected);
      else if (type === 'directory') resolve(selected + '/wallet.hoosat');
    });
  });
}

async function createWallet() {
  hideError();

  const payload = {
    action: 'create',
    directory: selected.value,
    password: password.value,
  };

  const isValidWallet = await validateFileData(payload);
  if (!isValidWallet.status) {
    switch (isValidWallet.error) {
      case 'no-directory-value': showError('Wallet directory must have a value');     return;
      case 'file-exists'       : showError('This file already exists');               return;
      case 'short-password'    : showError('Password must be at least 8 characters'); return;
      case 'no-file-name'      : showError('Directory must contain filename after');  return;
      case 'write-error'       : showError('Could not write wallet file');            return;
      default: showError('Unknown exception'); return;
    }
  }
}

function validateFileData(payload) {
  return new Promise((resolve) => {
    window.ipc.send('CREATE_WALLET', payload);
    window.ipc.once('WALLET_CREATED', (isValid) => {
      resolve(JSON.parse(isValid));
    });
  });
}
</script>

<template>
  <div class="content">
    <transition name="fade">
      <BackButtonBlock v-if="showPage" @click="switchComponent('StartWallet')" />
    </transition>
    <transition name="slide"> <LogoBlock v-if="showPage"/> </transition>
    <transition name="fade">
      <div class="fields" v-if="showPage">
        <h3>Choose Wallet Directory</h3>
        <div class="fields-row">
          <PrimaryInput class="primary-input" type="text" v-model="selected" />
          <PrimaryButton class="browse-btn" value="Browse" @click="browseDialog('directory')" />
        </div>
        <div class="fields-column">
          <p>Password</p>
          <PrimaryInput class="primary-input" action="visibleToggle" ref="passwordInput" v-model="password" />
        </div>
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
.fields-row {
  display: flex;
  flex-direction: row;
  margin-top: 35px;
}
.fields-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
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

/* Logo Slide Transition */
.slide-leave-active {
  transition: transform 1s ease;
}
.slide-leave-to {
  transform: translateY(95px);
}
</style>