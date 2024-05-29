<template>
  <div>
    <!-- Display the currently active component -->
    <component @childSwitch="switchComponent" :is="currentComponent"/>
  </div>
</template>

<script>
// Import components here
import StartWallet from '@/components/StartView/StartWallet.vue'
import CreateWallet from '@/components/StartView/CreateWallet.vue'
import RestoreWallet from '@/components/StartView/RestoreWallet.vue'

export default {
  name: 'StartView',
  components: {
    // Register components here
    StartWallet,
    CreateWallet,
    RestoreWallet
  },
  data() {
    return {
      // Default component
      currentComponent: 'StartWallet'
    };
  },
  methods: {
    // Logic to switch to another component
    // For example, switch to a different component named 'CreateWallet'
    switchComponent(component) {
      console.log('Switch');
      this.currentComponent = component;
    }
  }
}
</script>


<style>
.content {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  background: #272727;
  height: 100vh;
  font-family: WorkSans-Regular, serif;
}

button {
  background: transparent;
  border-radius: 42px;
  display: inline-block;
  cursor: pointer;
  font-family: WorkSans-Regular, serif;
  font-size: 17px;
  font-weight: bold;
  padding: 10px 41px;
  text-decoration: none;
  transition: all .1s ease-in;
  margin: 0 8px;
  width: 208px;
}
button:active {
  position: relative;
  top: 1px;
}
.primary-btn {
  border: 1px solid #1ab08e;
  text-shadow: 0 1px 7px #2f6627;
  color: #ffffff;
}
.primary-btn:hover {
  background-color: #04a061;
}
.secondary-btn {
  border: 1px solid #79938f;
  text-shadow: 0 1px 7px #2f6627;
  color: #ffffff;
}
.secondary-btn:hover {
  background-color: #6e8582;
}

input {

}

/* Transitions */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Fonts */
@font-face {
  font-family: WorkSans-Regular;
  src: url('@/assets/fonts/Work_Sans/WorkSans-Regular.ttf');
}
@font-face {
  font-family: PoetsenOne-Regular;
  src: url('@/assets/fonts/Poetsen_One/PoetsenOne-Regular.ttf');
}
</style>