<script>
// StartView imports
import StartWallet from '@/views/StartView/StartWallet.vue'
import CreateWallet from '@/views/StartView/CreateWallet.vue'
import RestoreWallet from '@/views/StartView/RestoreWallet.vue'

// WalletView imports
import WalletMain from '@/views/WalletView/WalletMain.vue'

export default {
  name: 'WalletView',
  components: {
    // StartView
    StartWallet,
    CreateWallet,
    RestoreWallet,

    // WalletView
    WalletMain
  },
  data() {
    return {
      // Default component
      currentComponent: 'WalletMain'
    };
  },
  methods: {
    // Logic to switch to another component
    switchComponent(component) {
      this.currentComponent = component;
    }
  }
}
</script>
<template>
  <div>
    <!-- Display the currently active component -->
    <component @childSwitch="switchComponent" :is="currentComponent"/>
  </div>
</template>