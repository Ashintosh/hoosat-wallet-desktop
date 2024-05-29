<template>
  <div class="content">
    <transition name="slide">
      <div class="logo" v-if="show">
        <img src="@/assets/images/logo.png" alt="Hoosat Logo">
      </div>
    </transition>
    <transition name="fade">
      <div class="fields" v-if="show">
        <button class="primary-btn" @click="switchComponent('CreateWallet')">Create Wallet</button>
        <button class="secondary-btn" @click="switchComponent('RestoreWallet')">Restore Wallet</button>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'StartWallet',
  data() {
    return {
      show: false
    };
  },
  mounted() {
    this.show = true;
  },
  methods: {
    switchComponent(component) {
      this.show = false;
      setTimeout(() => {
        this.$emit('childSwitch', component);
      }, 500);
    }
  }
}
</script>

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
  transform: translateY(-80px);
}

</style>