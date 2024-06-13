<script setup>
import { ref, watchEffect, defineProps, defineEmits } from 'vue';

const props = defineProps([ 'seed' ])
const emit = defineEmits([ 'childUpdate' ]);
const seed = ref(props.seed.split(' '));

watchEffect(() => {
  const seedPhrase = seed.value.join(' ');
  if (seedPhrase.trim() !== '') {
    emit('childUpdate', 'seed', seedPhrase.trim());
  }
});

const handleKeyDown = (index, event) => {
  if (event.key === ' ' || event.key === 'Enter') {  // Space or Enter
    event.preventDefault();
    if (index < 11) {
      const nextIndex = index + 1;
      const nextInput = document.querySelector(`.word-input:nth-child(${nextIndex + 1}) input`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  } else if (event.key === 'Backspace') {  // Backspace
    if (index > 0 && !seed.value[index]) {
      event.preventDefault(); // Prevent default only when input is empty
      const lastIndex = index - 1;
      const lastInput = document.querySelector(`.word-input:nth-child(${lastIndex + 1}) input`);
      if (lastInput) {
        lastInput.focus();
      }
    }
  }
};

const handlePaste = (event) => {
  event.preventDefault();
  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData('text').trim();

  const wordArray = pastedText.split(/\s+/);
  for (let i = 0; i < Math.min(wordArray.length, 12); i++) {
    seed.value[i] = wordArray[i];
  }
};
</script>

<template>
  <div class="seed-input">
    <div class="word-input" v-for="(word, index) in 12" :key="index">
      <p>#{{ index + 1 }}</p>
      <input
          type="text"
          class="primary-input"
          v-model="seed[index]"
          @paste.prevent="handlePaste($event)"
          @keydown="handleKeyDown(index, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.primary-input {
  display: flex;
  flex-wrap: wrap;
  font-size: 18px;
  padding: 5px 10px;
  width: 15vh;
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

.seed-input {
  flex-flow: row wrap;
  display: flex;
  flex-direction: row;
  margin-top: 35px;
  justify-content: center;
  align-items: center;
  margin-left: 65px;
  margin-right: 65px;
}

.word-input {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 25%;
}
.word-input p {
  margin-right: 10px;
}
</style>
