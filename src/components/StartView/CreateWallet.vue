<template>
  <div>
    <p>Create Wallet Test</p>
  </div>
</template>

<script>
export default {
  name: 'CreateWallet',
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
