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
.body {
  color: #ffffff;
  /*background: linear-gradient(to bottom right, #00363e, #028b54) no-repeat;*/
  background: #272727;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  gap: 0 0;
  justify-content: center;
}

.logo {
  font-family: PoetsenOne-Regular, serif;
  grid-column: 2;
  grid-row: 2;
  justify-self: center;
  /* border: 1px solid white; Remove in prod */

}
.logo img {
  width: 160px;
  height: 160px;
  -webkit-user-drag: none;
}

.start-buttons {
  grid-column: 2;
  grid-row: 3;
  justify-self: center;
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: 0;
  padding-top: 50px;
  text-align: center;
  /* border: 1px solid white; Remove in prod */

}
.button-col {
  display: table-cell;
  text-align: center;
  padding-left: 3px;
  padding-right: 3px;
  /* border: 1px solid white; Remove in prod */
}

button {
  background: transparent;
  border-radius: 42px;
  border: 1px solid #1ab08e;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: WorkSans-Regular, serif;
  font-size: 17px;
  font-weight: bold;
  padding: 10px 41px;
  text-decoration: none;
  text-shadow: 0 1px 7px #2f6627;
  transition: all .1s ease-in;
  margin: 0 8px;
  width: 208px;
}
button:hover {
  background-color: #04a061;
}
button:active {
  position: relative;
  top: 1px;
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