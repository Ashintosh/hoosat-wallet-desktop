<script setup>
import { ref, defineComponent, defineOptions, defineEmits, onMounted } from "vue";

import PrimaryButton from "@/components/PrimaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";
import PrimarySeedInput from "@/components/PrimarySeedInput.vue";
import LogoBlock from "@/components/LogoBlock.vue";
import BackButtonBlock from "@/components/BackButtonBlock.vue";

defineOptions({ name: 'RestoreWallet' });
defineComponent([ BackButtonBlock, LogoBlock, PrimaryButton, PrimaryInput, PrimarySeedInput ]);
const emit = defineEmits([ 'childSwitch' ]);

const showPage     = ref(false);
const useFile      = ref(true);
const useSeed      = ref(false);
const selected     = ref('');
const seed         = ref('');
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

function toggleImportType() {
  useFile.value = !useFile.value;
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

function handleSeedUpdate(seedPhrase) {
  seed.value = seedPhrase;
}

async function restoreWallet() {
  hideError();

  const payload = {
    action:    'restore',
    useFile:   useFile.value,
    directory: selected.value,
    seed:      seed.value,
    password:  password.value
  };

  if (useFile.value) {
    const isValidWallet = await validateFileData(payload);

    if (!isValidWallet.status) {
      switch (isValidWallet.error) {
        case 'no-directory-value': showError('Wallet directory must have a value');     return;
        case 'file-not-found'    : showError('File could not be found here');           return;
        case 'short-password'    : showError('Password must be at least 8 characters'); return;
        case 'no-file-name'      : showError('Directory must contain filename after');  return;
        case 'read-error'        : showError('Could not read wallet file');             return;
        case 'no-data'           : showError('No data in file');                        return;
        case 'crypt-error'       : showError('Invalid wallet password or file');        return;
        default: showError('Unknown exception'); return;
      }
    }

    // If restored successfully
    JSON.stringify(isValidWallet)
    alert(JSON.stringify(isValidWallet))
    await navigator.clipboard.writeText(JSON.stringify(isValidWallet));

  } else if (useSeed.value) {
    const isValidWallet = await new Promise((resolve) => {
      window.ipc.send('CREATE_WALLET', payload);
      window.ipc.once('WALLET_CREATED', (isValid) => {
        resolve(JSON.parse(isValid));
      });
    });

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

    // If restored successfully
  }
}

async function validateSeed() {
  hideError();

  const parsedIsValid = await new Promise((resolve) => {
    window.ipc.send('VALIDATE_SEED', seed.value);
    window.ipc.once('SEED_VALIDATED', (isValid) => {
      resolve(JSON.parse(isValid));
    });
  });

  if (!parsedIsValid.status) {
    switch (parsedIsValid.error) {
      case 'not-twelve-words': showError('Seed phrase must be 12 words');   return;
      case 'invalid-seed'    : showError('Seed phrase uses invalid words'); return;
      default: showError('Unknown exception'); return;
    }
  }

  useSeed.value = true;
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
    <transition name="slide">
      <LogoBlock v-if="showPage" />
    </transition>
    <transition name="fade" v-show="useFile || useSeed">
      <div class="fields" v-if="showPage">
        <h3 v-if="useFile">Restore from File</h3>
        <h3 v-if="useSeed">Select Wallet Directory</h3>
        <div class="fields-row">
          <PrimaryInput class="primary-input" type="text" v-model="selected" />
          <PrimaryButton v-if="useFile" class="browse-btn" value="Browse" @click="browseDialog('file')" />
          <PrimaryButton v-if="useSeed" class="browse-btn" value="Browse" @click="browseDialog('directory')" />
        </div>
        <div class="fields-column">
          <p>Password</p>
          <PrimaryInput class="primary-input" action="visibleToggle" ref="passwordInput"  v-model="password"/>
        </div>
        <div class="message">
          <span :class="{ 'show': showErrorMsg }">{{ errorMsg }}</span>
        </div>
        <div class="fields-buttons-row">
          <PrimaryButton class="primary-btn" value="Restore" @click="restoreWallet"/>
          <PrimaryButton class="secondary-btn" value="Use Seed" @click="toggleImportType" v-if="!useSeed" />
        </div>
      </div>
    </transition>
    <transition name="fade" v-show="!useFile && !useSeed">
      <div class="fields" v-if="showPage">
        <h3>Restore from Seed</h3>
        <div class="fields-seed-input">
          <PrimarySeedInput @restoreSeedUpdated="handleSeedUpdate" />
        </div>
        <div class="message">
          <span :class="{ 'show': showErrorMsg }">{{ errorMsg }}</span>
        </div>
        <div class="fields-buttons-row">
          <PrimaryButton class="primary-btn" value="Next" @click="validateSeed"/>
          <PrimaryButton class="secondary-btn" value="Use File" @click="toggleImportType"/>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.logo {
  position: absolute;
  top: 35px;
  left: 381px;
}
.logo img {
  max-width: 140px;
  max-height: 140px;
  -webkit-user-drag: none;
}

.fields {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120px;
  position: absolute;
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
  margin-top: 20px;
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