<template>
  <router-link class="blog-tag" :to="tag.path">
    <v-chip
      class="ma-2"
      :color="color"
      label
      :text-color="text"
      :x-small="small"
    >
      <v-icon left>
        mdi-label
      </v-icon>
      {{ tag.name || tag.key }} ({{ tag.pages.length }})
    </v-chip>
  </router-link>
</template>

<script>
export default {
  props: {
    tag: {
      type: Object,
      required: true
    },
    small: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    color () {
      return this.small ? 'white' : 'primary'
    },
    text () {
      return this.small ? 'primary' : 'white'
    }
  }
}
</script>

<style lang="stylus">
.v-chip {
  &.v-size--x-small {
    padding: 0;
  }

  &:hover {
    cursor: pointer;
  }
}
</style>
