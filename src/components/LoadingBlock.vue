<template>
  <div class="svg_icon">
    <svg viewBox="0 0 100 100">
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" flood-color="#04a061" />
        </filter>
      </defs>
      <circle id="spinner" cx="50" cy="50" r="45"/>
    </svg>
  </div>
</template>

<style scoped>
.svg_icon {
  width: 100px;
  height: 100px;
}

circle {
  fill: transparent;
  stroke: #149578;
  stroke-width: 7px;
  stroke-linecap: round;
  filter: url(#shadow);
}

@keyframes animation {
  0% {
    stroke-dasharray: 1 98;
    stroke-dashoffset: -105;
  }
  50% {
    stroke-dasharray: 80 10;
    stroke-dashoffset: -160;
  }
  100% {
    stroke-dasharray: 1 98;
    stroke-dashoffset: -300;
  }
}

#spinner {
  transform-origin: center;
  animation-name: animation;
  animation-duration: 1.2s;
  animation-timing-function: cubic-bezier;
  animation-iteration-count: infinite;
}
</style>