<script setup>
import { ref, defineProps, defineComponent, defineOptions, defineEmits, onMounted } from "vue";

import PrimaryButton from '@/components/PrimaryButton.vue';
import LogoBlock from "@/components/LogoBlock.vue";

defineOptions({ name: 'StartWallet' });
defineComponent([ PrimaryButton, LogoBlock ]);
const props = defineProps([ 'showLogo' ]);
const emit = defineEmits([ 'childSwitch' ]);

const showLogo = ref(props.showLogo);
const showPage = ref(false);

onMounted(() => {
  showLogo.value = true;
  showPage.value = true;
});


function switchComponent(component) {
  showPage.value = false;
  setTimeout(() => {
    emit('childSwitch', component);
  }, 500);
}
</script>

<template>
  <div class="content">
    <transition name="fade">
      <LogoBlock v-if="showLogo" />
    </transition>
    <transition name="fade">
      <div class="fields" v-if="showPage">
        <PrimaryButton class="primary-btn" value="Create Wallet" @click="switchComponent('CreateWallet')"/>
        <PrimaryButton class="secondary-btn" value="Restore Wallet" @click="switchComponent('RestoreWallet')"/>
      </div>
    </transition>
  </div>
</template>

<style scoped>

.fields {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: center;
  margin-top: 50px;
  gap: 20px;
}
</style>