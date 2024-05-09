<template>
  <div class="body">
    <div class="logo">
      <img src="@/assets/images/logo.png" alt="Hoosat Logo">
    </div>
    <div class="start-buttons">
      <div class="button-col">
        <button @click="switchComponent('CreateWallet')">Create Wallet</button>
      </div>
      <div class="button-col">
        <button @click="switchComponent('RestoreWallet')">Restore Wallet</button>
      </div>
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: 'StartWallet',
  methods: {
    // Logic to switch to another component
    // For example, switch to a different component named 'CreateWallet'
    switchComponent(component) {
      console.log('Emit');
      this.$emit('childSwitch', component);
    }
  }
}
</script>
