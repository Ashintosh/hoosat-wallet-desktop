<script setup>
import { defineProps } from 'vue';
const props = defineProps(['value', 'class']);
</script>'

<template>
  <button :class="props.class">{{props.value}}</button>
</template>

<style scoped>
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
</style>