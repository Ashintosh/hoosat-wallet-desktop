<template>
  <div class="content">
    <transition name="slide">
      <div class="logo" v-if="show">
        <img src="@/assets/images/logo.png" alt="Hoosat Logo">
      </div>
    </transition>
    <transition name="fade">
      <div class="fields" v-if="show">
        <div class="fields-left">
          <button>f</button>
        </div>
        <div class="fields-right">
          <button>f</button>
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
  top: 35px;
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
  margin-top: 120px;
}

.fields-left {
  align-self: flex-start;
}

.fields-right {
  align-self: flex-end;
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
  transform: translateY(95px);
}
</style>