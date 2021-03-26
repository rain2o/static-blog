<template>
  <div class="component-page-list pb-12">

    <div v-for="page in pages" :key="page.key">
      <PageSummary :page="page" class="page-summary" />
    </div>

    <Pagination v-if="$pagination.length > 1" />
  </div>
</template>

<script>
  import PageSummary from '@theme/components/PageSummary'
  import Pagination from '@theme/components/Pagination'
  export default {
    components: {
      PageSummary,
      Pagination
    },
    props: {
      pagination: Object,
    },
    computed: {
      pages() {
        return this.pagination.pages
      },
    }
  }
</script>
