<template>
  <article :key="page.key" class="component-page-summary">
    <header class="mb-1">
      <router-link v-if="page.frontmatter.cover_image" class="cover" :to="page.path">
        <v-img
          :src="page.frontmatter.cover_image"
          max-width="1000"
          max-height="420"
          :aspect-ratio="1000/420"
          contain
          :alt="`Cover image for ${page.title}`"></v-img>
      </router-link>
      <div class="metadata">
        <div class="d-flex">
          <div v-if="page.frontmatter.date" class="published-at">
            <v-icon size="12px">mdi-clock</v-icon>
            <time :datetime="page.frontmatter.date" class="text-caption">
              {{ resolvePostDate(page.frontmatter.date) }}
            </time>
          </div>
          <div v-if="page.frontmatter.update" class="updated-at ml-3">
            <v-icon size="12px">mdi-sync</v-icon>
            <time :datetime="page.frontmatter.update" class="text-caption">
              {{ resolvePostDate(page.frontmatter.update) }}
            </time>
          </div>

          <!-- Keeping in case I decide to bring back -->
          <!-- <div v-if="page.frontmatter.author" class="author ml-3">
            <span class="name">
              <v-icon size="12px">mdi-account</v-icon>
              <router-link :to="`/author/${page.frontmatter.author}`" class="text-caption">
                {{ page.frontmatter.author }}
              </router-link>
            </span>
            <span v-if="page.frontmatter.location" class="location">
              in {{ page.frontmatter.location }}
            </span>
          </div> -->
        </div>
      </div>


      <h2 class="mt-1 mb-2">
        <router-link class="post-title text-decoration-none" :to="page.path">
          {{ page.title }}
        </router-link>
      </h2>
    </header>

    <section>
      <div v-if="page.frontmatter.summary">
        {{ page.frontmatter.summary }}
      </div>
      <div v-else v-html="page.summary" />
    </section>

    <div v-if="this.tags.length" class="tags">
      <BlogTag v-for="tag in this.tags" :key="tag.key" :tag="tag" :small="true" />
    </div>

    <v-divider class="my-4"></v-divider>
  </article>
</template>

<script>
  import dayjs from 'dayjs'
  export default {
    props: {
      page: Object,
    },
    methods: {
      resolvePostDate(date) {
        return dayjs(date).format('MMM DD, YYYY')
      },
    },
    computed: {
      tags() {
        return this.page.frontmatter.tags
          ? this.page.frontmatter.tags.map(tag => this.$tag._metaMap[tag])
          : []
      },
    },
  }
</script>

<style lang="stylus" scoped>
a.post-title {
  color: var(--v-secondary-darken);

  &:hover, &:focus {
    color: var(--v-primary-base);
  }
}
</style>
