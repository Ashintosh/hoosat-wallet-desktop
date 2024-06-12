<script setup>
import { ref, defineComponent, defineOptions, defineEmits, onMounted } from "vue";

import PrimaryButton from '@/components/PrimaryButton.vue';
import LogoBlock from "@/components/LogoBlock.vue";

defineOptions({ name: 'StartWallet' });
defineComponent([ PrimaryButton, LogoBlock ]);
const emit = defineEmits([ 'childSwitch' ]);

const showPage = ref(false);

onMounted(() => {
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
    <transition name="slide"> <LogoBlock v-if="showPage"/> </transition>
    <transition name="fade">
      <div class="fields" v-if="showPage">
        <PrimaryButton class="primary-btn" value="Create Wallet" @click="switchComponent('CreateWallet')"/>
        <PrimaryButton class="secondary-btn" value="Restore Wallet" @click="switchComponent('RestoreWallet')"/>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.logo {
  position: absolute;
  top: 130px;
  left: 381px;
}
.logo img {
  max-width: 140px;
  max-height: 140px;
  -webkit-user-drag: none;
}

.fields {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-self: center;
  margin-top: 50px;
  gap: 20px;
}

.slide-leave-active {
  transition: transform 0.5s ease;
}

.slide-leave-to {
  transform: translateY(-95px);
}

</style>