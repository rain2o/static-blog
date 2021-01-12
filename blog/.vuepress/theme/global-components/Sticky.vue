<template>
  <div class="component-sticky">
    <Toc v-if="page" :page="page" />
  </div>
</template>

<script>
import Vue from 'vue'
import Toc from '@theme/components/Toc'
export default {
  components: {
    Toc,
  },
  props: {
    page: Object,
    require: false,
  }
}
</script>
