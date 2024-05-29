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
        <div class="fields-buttons-row">
          <input class="primary-input" type="text" v-model="selectedDirectory">
          <button class="browse-btn" @click="browseDirectory">Browse</button>
        </div>
        <div class="fields-buttons-column">
          <p>Password</p>
          <template v-if="showPassword">
            <svg xmlns="http://www.w3.org/2000/svg" class="svg_icon bi-eye-slash-fill" viewBox="0 0 16 16" @mousedown.prevent="togglePasswordVisibility">
              <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"></path>
              <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"></path>
            </svg>
          </template>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="svg_icon bi-eye-fill" viewBox="0 0 16 16" @mousedown.prevent="togglePasswordVisibility">
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"></path>
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"></path>
            </svg>
          </template>
          <input class="primary-input" ref="passwordInput" :type="showPassword ? 'text' : 'password'" v-model="password">
        </div>
        <div class="fields-buttons-row">
          <button class="primary-btn" @click="createWallet">Create</button>
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
      selectedDirectory: '',
      showPassword: false,
      password: ''
    };
  },
  mounted() {
    this.show = true;

    window.ipc.on('DIRECTORY_SELECTED', (selectedDirectory) => {
      this.selectedDirectory = selectedDirectory + '/wallet.hoosat';
    });

    window.ipc.on('WALLET_CREATED', (createdResult) => {
      alert(this.selectedDirectory + ' | ' + createdResult);
    });
  },
  methods: {
    switchComponent(component) {
      this.show = false;
      setTimeout(() => {
        this.$emit('childSwitch', component);
      }, 1000);
    },
    browseDirectory() {
      window.ipc.send('OPEN_DIRECTORY_DIALOG');
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    createWallet() {
      const payload = {
        directory: this.selectedDirectory,
        password: this.password
      };
      window.ipc.send('CREATE_WALLET', payload);
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
  margin-top: 120px;
}

.fields-buttons-row {
  display: flex;
  flex-direction: row;
  margin-top: 35px;
}

.fields-buttons-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 35px;
}

.slide-leave-active {
  transition: transform 1s ease;
}

.slide-leave-to {
  transform: translateY(80px);
}
</style>