<template>
  <v-card v-if="items.length > 1" class="mx-auto mb-8" max-width="500" title>
    <v-list>
      <v-subheader>Series: {{ this.name }}</v-subheader>
      <v-list-item-group color="primary">
        <v-list-item
          v-for="(item, i) in items"
          :key="item.path"
          :class="{
            'v-item--active v-list-item--active': item.path === $page.path,
          }"
          :to="item.path"
        >
          <v-list-item-icon>
            {{ i + 1 }}
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title v-text="item.title"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-card>
</template>

<script>
export default {
  name: "Series",
  props: {
    name: String,
  },
  computed: {
    items() {
      return this.seriesChildren();
    },
  },
  methods: {
    allChildren() {
      return this.$site.pages.sort((a, b) => {
        const aOrder = a.frontmatter && a.frontmatter.order;
        const bOrder = b.frontmatter && b.frontmatter.order;
        if (aOrder && bOrder) {
          return aOrder > bOrder ? 1 : -1;
        }
        return 0;
      });
    },
    seriesChildren() {
      return this.allChildren().filter((child) => {
        return (
          child.frontmatter?.series && child.frontmatter.series === this.name
        );
      });
    },
  },
};
</script>
