<template>
  <div id="app" >
    <BigScreen />
  </div>
</template>

<script>
import BigScreen from "./components/BigScreen.vue";

export default {
  name: "App",
  components: {
    BigScreen,
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

</style>
