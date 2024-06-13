<script>
import StartWallet from '@/views/StartView/StartWallet.vue'
import CreateWallet from '@/views/StartView/CreateWallet.vue'
import RestoreWallet from '@/views/StartView/RestoreWallet.vue'
import LogoBlock from "@/components/LogoBlock.vue";

export default {
  name: 'StartView',
  components: {
    LogoBlock,
    // StartView
    StartWallet,
    CreateWallet,
    RestoreWallet,
  },
  data() {
    return {
      // Default component
      currentComponent: 'StartWallet',
      showLogo: false
    };
  },
  methods: {
    // Logic to switch to another component
    // For example, switch to a different component named 'CreateWallet'
    switchComponent(component, showLogo) {
      this.showLogo = showLogo;
      this.currentComponent = component;
    }
  }
}
</script>

<template>
  <div>
    <!-- Display the currently active component -->
    <component @childSwitch="switchComponent" :is="currentComponent" :showLogo="showLogo"/>
  </div>
</template>

