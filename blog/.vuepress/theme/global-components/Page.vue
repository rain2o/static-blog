<template>
  <article :key="page.key" class="component-page">
    <header class="mb-12">
      <div v-if="page.frontmatter.cover_image" class="cover">
        <v-img
          :src="page.frontmatter.cover_image"
          max-width="1000"
          max-height="420"
          :aspect-ratio="1000/420"
          contain
          :alt="`Cover image for ${page.title}`"></v-img>
      </div>
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

      <h1 class="mt-2 mb-3 text-h3 font-weight-bold">{{ page.title }}</h1>

      <div v-if="this.tags.length" class="tags">
        <BlogTag v-for="tag in this.tags" :key="tag.key" :tag="tag" :small="true" />
      </div>

      <div v-if="page.frontmatter.showThumbnail || ($themeConfig.showThumbnail && page.frontmatter.showThumbnail === undefined) && page.frontmatter.image" class="mt-4 thumbnail">
        <img :src="page.frontmatter.image" :alt="page.title">
      </div>
    </header>

    <section>
      <Series v-if="page.frontmatter.series" :name="page.frontmatter.series" />
      <Content :page-key="page.key" />
      <Series v-if="page.frontmatter.series" :name="page.frontmatter.series" />
    </section>
  </article>
</template>

<script>
  import Vue from 'vue'
  import dayjs from 'dayjs'
  import Series from '../components/Series.vue'
  
  export default {
    props: {
      page: Object,
    },
    components: { Series },
    computed: {
      tags() {
        return this.page.frontmatter.tags
          ? this.page.frontmatter.tags.map(tag => this.$tag._metaMap[tag])
          : []
      },
    },
    methods: {
      resolvePostDate(date) {
        return dayjs(date).format(this.$themeConfig.dateFormat || 'YYYY/MM/DD')
      },
    },
  }
</script>

<style lang="stylus">
@import '~prismjs/themes/prism-tomorrow.css';

code[class*="language-"], pre[class*="language-"] {
  border-radius: 5px;
}
code:not([class*="language-"]) {
  word-break: break-word;
}
hr {
  width: 25%;
  opacity: 0.1;
  border: 1px solid $textColor;
  margin: 3rem auto;
}
.content {
  &__default {
    img {
      width: 100%;
    }

    h2[id] {
      position: relative;
      scroll-margin-top: 65px;

      a.header-anchor {
        position: absolute;
        left: -20px;
        padding-right: 7px;
        display: none;
        text-decoration: none;
        &:hover, &:focus {
          text-decoration: underline;}
      }

      &:hover, &:focus {
        a.header-anchor {
          display: inline-block;
        }}
    }
  }
}
</style>
