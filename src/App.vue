<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { readConfig } from "@/utils/Config";

const router = useRouter();

onMounted(async () => {
  const isConfig = await readConfig();
  if (isConfig) {
    handleChangeRoute(JSON.stringify({
      route: '/wallet',
      data: isConfig
    }));
  }

  window.ipc.on('CHANGE_ROUTE', handleChangeRoute);
});

function handleChangeRoute(routePayload) {
  const parsedRoutePayload = JSON.parse(routePayload);

  router.push({
    path: parsedRoutePayload.route,
    params : {
      data: parsedRoutePayload.data
    }
  });
}
</script>

<template>
  <router-view />
</template>

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
  border-radius: 42px;
}
.primary-btn:hover {
  background-color: #04a061;
}
.secondary-btn {
  border: 1px solid #79938f;
  text-shadow: 0 1px 7px #2f6627;
  color: #ffffff;
  border-radius: 42px;
}
.secondary-btn:hover {
  background-color: #6e8582;
}
.browse-btn {
  border: 1px solid #1ab08e;
  text-shadow: 0 1px 7px #2f6627;
  color: #ffffff;
  border-radius: 5px;
}
.browse-btn:hover {
  background-color: #6e8582;
}

.primary-input {
  font-size: 18px;
  padding: 5px 10px;
  width: 100%;
  outline: none;
  background: #6E8582;
  color: #1ecda5;
  border: 1px solid #1ecda5;
  border-radius: 5px;
  transition: .3s ease;
}
.primary-input:focus {
  background: #B9DFDA;
  border: 1px solid #149578;
  border-radius: 10px;
  color: #149578;
}

.readonly-input {
  font-size: 18px;
  padding: 5px 10px;
  width: 100%;
  outline: none;
  background: #6E8582;
  color: #1cc59e;
  border: 1px solid #1AB08E;
  border-radius: 5px;
  transition: .3s ease;
}

input, button, svg, img, p, b, h1, h2, h3, h4, h5, h6 {
  user-select: none;
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

.fade-3-enter-active,
.fade-3-leave-active {
  transition: opacity 0.3s;
}

.fade-3-enter-from,
.fade-3-leave-to {
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