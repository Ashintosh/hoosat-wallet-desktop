<script setup>
import { ref, watch, defineComponent, defineProps, defineEmits } from "vue";

import PrimaryButton from "@/components/PrimaryButton.vue";
import PrimaryInput from "@/components/PrimaryInput.vue";

defineComponent([ PrimaryButton, PrimaryInput ]);

const props = defineProps([ 'type', 'dialog', 'selected', 'password' ]);
const emit = defineEmits( [ 'hideError', 'childUpdate' ]);

const selected = ref(props.selected);
const password = ref(props.password);

watch([selected, password], ([newSelected, newPassword]) => {
  emit('childUpdate', 'selected', newSelected);
  emit('childUpdate', 'password', newPassword);
});

async function browseDialog() {
  emit('hideError');

  selected.value = await new Promise(resolve => {
    window.ipc.send(`OPEN_${props.dialog.toUpperCase()}_DIALOG`);
    window.ipc.once(`${props.dialog.toUpperCase()}_SELECTED`, selected => {
      if (props.dialog === 'file') resolve(selected);
      else resolve(selected + '/wallet.hoosat');
    });
  });
}
</script>

<template>
  <div class="fields-row">
    <PrimaryInput class="primary-input" type="text" v-model="selected" />
    <PrimaryButton class="browse-btn" value="Browse" @click="browseDialog" />
  </div>
  <div v-if="type==='protected'" class="fields-column">
    <p>Password</p>
    <PrimaryInput class="primary-input" action="visibleToggle" ref="passwordInput" v-model="password" />
  </div>
</template>

<style scoped>
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
</style>