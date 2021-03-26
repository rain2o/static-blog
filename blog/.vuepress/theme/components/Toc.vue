<template>
  <div class="component-toc">
    <scrollactive
      v-if="page.headers"
      v-on:itemchanged="onItemChanged"
      :offset="0"
      :duration="0"
    >
      <v-navigation-drawer permanent right>
        <v-list-item v-for="header in page.headers" :class="`pl-${getPadding(header.level)}`">
          <v-list-item-content class="pl-3 text-body-2 py-1 font-weight-regular text--disabled">
            <v-list-item-title class="title">
              <router-link :to="`#${header.slug}`" class="scrollactive-item v-toc-link d-block transition-swing text-decoration-none text--disabled">
                {{ header.title }}
              </router-link>
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-navigation-drawer>
    </scrollactive>
  </div>
</template>

<script>
  export default {
    props: {
      page: Object,
    },
    methods: {
      getPadding(level) {
        return (parseInt(level) - 2) * 3
      },
      onItemChanged(event, currentItem, lastActiveItem) {
        if (lastActiveItem) {
          lastActiveItem.parentNode.classList.remove('primary--text')
          lastActiveItem.parentNode.classList.remove('router-link-active')
          lastActiveItem.parentNode.classList.add('text--disabled')
          lastActiveItem.classList.add('text--disabled')
          lastActiveItem.parentNode.parentNode.parentNode.classList.remove('is-active')
        }
        if (currentItem) {
          currentItem.parentNode.classList.add('primary--text')
          currentItem.parentNode.classList.add('router-link-active')
          currentItem.parentNode.classList.remove('text--disabled')
          currentItem.classList.remove('text--disabled')
          currentItem.parentNode.parentNode.parentNode.classList.add('is-active')
        }
      },
    },
  }
</script>

<style lang="stylus">
.component-toc {
  .v-list {
    &-item {
      border-left: 2px solid var(--v-secondary-lighten4);
      &.is-active {
        border-left-color: var(--v-primary-base);
      }
    }
  }
}
</style>
