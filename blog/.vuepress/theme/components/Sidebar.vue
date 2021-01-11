<template>
  <div class="component-sidebar px-3">
    <SearchBox class="mb-5" />

    <section v-if="profile.name" class="block profile mb-8">
      <h3 class="mt-0 mb-5">Profile</h3>
      <div class="d-flex">
        <v-avatar v-if="profile.avatarUrl" class="mr-3">
          <img :src="profile.avatarUrl" alt="avatar">
        </v-avatar>
        <div v-if="profile.name" class="d-flex flex-column justify-center">
          <p class="my-0"><strong class="name">{{ profile.name }}</strong></p>
          <p class="my-0 grey--text" style="font-size:0.9em">{{ profile.subTitle }}</p>
        </div>
      </div>
      <p v-html="profile.descriptionHtml" class="mt-4 mb-0" />
    </section>

    <section v-if="hotTags.length" class="block tags mb-8">
      <div class="d-flex align-center mb-5">
        <h3 class="ma-0">Hot Tags</h3>
        <router-link to="/tag/" class="ml-3">See all</router-link>
      </div>
      <BlogTag v-for="tag in hotTags" :key="tag.key" :tag="tag" :small="true" />
    </section>

    <section v-if="recentPosts.length" class="block recent-posts">
      <h3 class="mt-0 mb-1">Recent Posts</h3>
      <v-list>
        <template v-for="post in recentPosts">
          <v-list-item class="pl-0">
            <v-list-item-content>
              <v-list-item-title>
                <router-link :to="post.path" class="font-weight-medium text-decoration-none">
                  {{ post.title }}
                </router-link>
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </template>
      </v-list>
    </section>

    <section v-for="block in additionalBlocks" class="block additional-block">
      <h3 class="mt-0 mb-5">{{ block.title }}</h3>
      <ul>
        <li v-for="link in block.links">
          <router-link v-if="link.path" :to="link.path">{{ link.label }}</router-link>
          <a v-else-if="link.url" :href="link.url" target="link.target">{{ link.label }}</a>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
  import Vue from 'vue'
  import dayjs from 'dayjs'
  import SearchBox from '@SearchBox'
  export default {
    components: {
      SearchBox
    },
    created() {
      // profile
      this.profile = this.$themeConfig.sidebar.profile

      // hot tags
      const tagMap = this.$tag._metaMap
      this.hotTags = Object.keys(tagMap)
        .map(tag => tagMap[tag])
        .sort((a, b) => b.pages.length - a.pages.length)
        .slice(0, this.$themeConfig.sidebar.hotTags)

      // recent posts
      let posts = []
      this.$site.pages.forEach(page => {
        if (this.$themeConfig.sidebar.directoryIds.includes(page.id) && page.frontmatter.date) {
          posts.push(page)
        }
      })

      // order by date desc
      posts.sort((prev, next) => {
        return dayjs(next.frontmatter.date) - dayjs(prev.frontmatter.date)
      })
      this.recentPosts = posts.slice(0, this.$themeConfig.sidebar.recentPosts)

      // additional blocks
      this.additionalBlocks = this.$themeConfig.sidebar.additionalBlocks
    },
    data: () => ({
      profile: {},
      hotTags: [],
      recentPosts: [],
      additionalBlocks: []
    }),
  }
</script>

<style lang="stylus">
.search-box {
  width: 100%;
  input {
    width: 100%;
    border-color: var(--v-secondary-lighten3);
    @media (max-width: 960px) {
      width: 80%;
      left: 0;
      &:focus {
        width: 80%;
      }
    }
  }
}
.recent-posts {

  .v-list-item {

    &__title {
      overflow: visible;
      word-break: break-word;
      white-space: normal;

      a {
        color: var(--v-secondary-darken);
        &:hover, &:focus {
          color: var(--v-primary-base);
        }
      }
    }
  }
}
</style>
