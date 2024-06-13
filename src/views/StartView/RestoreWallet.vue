<script setup>
import { ref, defineComponent, defineOptions, defineEmits, onMounted } from "vue";

import BackButtonBlock from "@/components/BackButtonBlock.vue";
import PrimaryButton from "@/components/PrimaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";
import FileInput from "@/components/FileInput.vue";
import PrimarySeedInput from "@/components/PrimarySeedInput.vue";
import LogoBlock from "@/components/LogoBlock.vue";
import LoadingBlock from "@/components/LoadingBlock.vue";

import { saveConfig } from "@/utils/Config";
import { validateFileData, validateSeed } from "@/utils/WalletFile";
import { changeRoute } from "@/utils/Helpers";


defineOptions({ name: 'RestoreWallet' });
defineComponent([ BackButtonBlock, LogoBlock, PrimaryButton, PrimaryInput, FileInput, PrimarySeedInput ]);
const emit = defineEmits([ 'childSwitch', 'gotoWalletView', 'hideError' ]);

const selected = ref('');
const seed     = ref('');
const password = ref('');
const errorMsg = ref('');

const showLogo     = ref(true);
const showPage     = ref(false);
const isLoading    = ref(false);
const useFile      = ref(true);
const useSeed      = ref(false);
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
  //showLogo.value = !showLogo.value;
  showPage.value = !showPage.value;
}

async function toggleSubPage(subpage) {
  switch (subpage) {
    case 'use-file':
      useSeed.value = false;
      await new Promise(resolve => setTimeout(resolve, 500));
      useFile.value = true;
      break;
    case 'use-seed':
      useFile.value = false;
      await new Promise(resolve => setTimeout(resolve, 500));
      useSeed.value = true;
      break;
    case 'save-seed':
      useFile.value = true;
      await new Promise(resolve => setTimeout(resolve, 500));
      useSeed.value = true;
      break;
    case 'go-back':
      if (useFile.value && useSeed.value) {
        showPage.value = false;

        await new Promise(resolve => setTimeout(resolve, 500));
        await toggleSubPage('use-seed');

        showPage.value = true;
        await new Promise(resolve => setTimeout(resolve, 500));
      } else if (useSeed.value && !useFile.value) {
        await toggleSubPage('use-file');
      } else if (useFile.value && !useSeed.value) {
        switchComponent('StartWallet');
      }
      break;
  }
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
    case 'seed':     seed.value     = param; break;
    default: break;
  }
}

async function restoreWallet() {
  hideError();

  // [LOADING]
  togglePage();
  await new Promise(resolve => setTimeout(resolve, 500));
  isLoading.value = true;

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
      isLoading.value = false;
      await new Promise(resolve => setTimeout(resolve, 300));
      togglePage();

      switch (isValidWallet.error) {
        case 'no-directory-value': showError('Wallet directory must have a value');     return;
        case 'file-not-found'    : showError('File could not be found here');           return;
        case 'short-password'    : showError('Password must be at least 8 characters'); return;
        case 'no-file-name'      : showError('Directory must contain filename after');  return;
        case 'read-error'        : showError('Could not read wallet file');             return;
        case 'no-data'           : showError('No data in file');                        return;
        case 'crypt-error'       : showError('Invalid wallet password or file');        return;
        case 'not-valid-wallet'  : showError('Wallet file must end in .hoosat');        return;
        default: showError('Unknown exception'); return;
      }
    }

    // If restored successfully

    if (!await saveConfig(selected.value)) {
      console.log('App configuration file could not be saved.');
    }

    isLoading.value = false;
    await new Promise(resolve => setTimeout(resolve, 300));

    changeRoute('/wallet', isValidWallet);
  } else if (useSeed.value) {
    const isValidWallet = await new Promise((resolve) => {
      window.ipc.send('CREATE_WALLET', payload);
      window.ipc.once('WALLET_CREATED', (isValid) => {
        resolve(JSON.parse(isValid));
      });
    });

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

    // If restored successfully

    if (!await saveConfig(selected.value)) {
      console.log('App configuration file could not be saved.');
    }

    isLoading.value = false;
    await new Promise(resolve => setTimeout(resolve, 300));

    changeRoute('/wallet', isValidWallet);
  }
}

async function checkSeed() {
  hideError();

  togglePage();
  await new Promise(resolve => setTimeout(resolve, 500));
  isLoading.value = true;

  const isValid = await validateSeed(seed.value);

  if (!isValid.status) {
    isLoading.value = false;
    await new Promise(resolve => setTimeout(resolve, 300));
    togglePage();

    switch (isValid.error) {
      case 'not-twelve-words': showError('Seed phrase must be 12 words');   return;
      case 'invalid-seed'    : showError('Seed phrase uses invalid words'); return;
      default: showError('Unknown exception'); return;
    }
  }

  await toggleSubPage('save-seed');
  await new Promise(resolve => setTimeout(resolve, 300));



  isLoading.value = false;
  await new Promise(resolve => setTimeout(resolve, 300));

  togglePage();
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
      <BackButtonBlock
          v-if="(showPage && !isLoading)"
          @click="toggleSubPage('go-back')"
      />
    </transition>
    <transition name="fade" v-show="useFile || (useFile && useSeed)">
      <div class="fields" v-if="showPage && !isLoading">
        <h3>{{ useSeed ? 'Choose where to Save Wallet' : 'Restore from File' }}</h3>
        <FileInput
            type="protected"
            :dialog="useFile ? 'file' : 'directory'"
            :selected="selected"
            :password="password"
            @hideError="hideError"
            @childUpdate="handleChildUpdate"
        />
        <div class="message">
          <span :class="{ 'show': showErrorMsg }">{{ errorMsg }}</span>
        </div>
        <div class="fields-row">
          <PrimaryButton class="primary-btn" value="Restore" @click="restoreWallet"/>
          <PrimaryButton class="secondary-btn" value="Use Seed" @click="toggleSubPage('use-seed')" v-if="!useSeed" />
        </div>
      </div>
    </transition>
    <transition name="fade" v-show="useSeed && !useFile">
      <div class="fields" v-if="showPage && !isLoading">
        <h3>Restore from Seed</h3>
        <div class="fields-seed-input">
          <PrimarySeedInput
              :seed="seed"
              @childUpdate="handleChildUpdate"
          />
        </div>
        <div class="message">
          <span :class="{ 'show': showErrorMsg }">{{ errorMsg }}</span>
        </div>
        <div class="fields-row">
          <PrimaryButton class="primary-btn" value="Next" @click="checkSeed"/>
          <PrimaryButton class="secondary-btn" value="Use File" @click="toggleSubPage('use-file')"/>
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
  position: absolute;
}

.fields-row {
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
</style>