<template>
  <BaseLayout>
    <template #content>
      <PageList v-if="$pagination" :pagination="$pagination" />
      <Page v-else :page="$page" />
    </template>
    <template #sticky>
      <Sticky />
    </template>
  </BaseLayout>
</template>

<script>
import splitbee from '@splitbee/web'
export default {
  mounted() {
    splitbee.init()
  }
}
</script>
