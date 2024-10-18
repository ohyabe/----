<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/header.vue'
// import SurveyList from './components/SurveyList.vue';
</script>

<template>

<!-- <div class="header"></div> -->
<Header />

  <!-- <main> -->
    <!-- <SurveyList/> -->
  <RouterView />
  <!-- <Fillin />
  <Statistics />
  <Question /> -->
<!-- </main> -->


</template>

<style>
*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* main{
  width: 70%;
  margin: 0 auto;
} */

.header{
  width:  100dvw;
}
 


</style>

