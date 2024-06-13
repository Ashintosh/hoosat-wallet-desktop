<script setup>
import { ref, defineComponent, defineOptions, /*defineEmits,*/ onMounted } from "vue";

import PrimaryButton from "@/components/PrimaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";
import LogoBlock from "@/components/LogoBlock.vue";
import BackButtonBlock from "@/components/BackButtonBlock.vue";

defineOptions({ name: 'WalletMain' });
defineComponent([ BackButtonBlock, LogoBlock, PrimaryButton, PrimaryInput ]);
//const emit = defineEmits([ 'childSwitch' ]);

const showPage = ref(false);

onMounted(() => {
  showPage.value = true;
});

/*
function switchComponent(component) {
  showPage.value = false;
  setTimeout(() => {
    emit('childSwitch', component);
  }, 1000);
}*/
</script>

<template>
<div class="content">
  <p>Test</p>
</div>
</template>

<style scoped>

</style>