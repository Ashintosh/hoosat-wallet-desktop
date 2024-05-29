<template>
  <div class="content">
    <transition name="slide">
      <div class="logo" v-if="show">
        <img src="@/assets/images/logo.png" alt="Hoosat Logo">
      </div>
    </transition>
    <transition name="fade">
      <div class="fields" v-if="show">
        <h3>Choose Wallet Directory</h3>
        <input type="text">
        <div class="fields-buttons">
          <button class="primary-btn">Browse</button>
          <button class="secondary-btn" @click="switchComponent('StartWallet')">Back</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'CreateWallet',
  data() {
    return {
      show: false,
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
      }, 1000);
    }
  }
}
</script>

<style scoped>
.logo {
  position: absolute;
  top: 50px;
  left: 381px;
}
.logo img {
  max-width: 140px;
  max-height: 140px;
  -webkit-user-drag: none;
}

.fields {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  margin-top: 50px;
}

.fields-buttons {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 35px;
}

.slide-leave-active {
  transition: transform 1s ease;
}

.slide-leave-to {
  transform: translateY(80px);
}
</style>