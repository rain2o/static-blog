<template>
    <v-row class="mt-6">

        <v-col cols="3" v-show="$vuetify.breakpoint.smAndUp">
            <p text-subtitle-1>
                {{ resolvePostDate(page.frontmatter.date) }}
            </p>
        </v-col>

        <v-spacer v-show="$vuetify.breakpoint.smAndUp"></v-spacer>

        <v-col cols="3" v-show="page.frontmatter.image && $vuetify.breakpoint.smAndUp">
            <v-img :src="page.frontmatter.image" :alt="page.frontmatter.title" contain max-width="100%" />
        </v-col>

        <v-col sm="6" xs="12">
            <p v-if="this.page.frontmatter.tag" text-subtitle-2 class="font-weight-light mb-0">
                <!-- <TagSpan :page-tags="this.page.frontmatter.tag" /> -->
                <!-- {{ page.frontmatter.tag }} -->
            </p>
            <h2><a :href="page.path" class="link blueHover"> {{ page.title }} </a></h2>
            <p class="ui-post-summary" itemprop="description">
                {{ page.frontmatter.summary || page.summary }}
            </p>
        </v-col>
    </v-row>
</template>

<script>
import dayjs from 'dayjs'
// import TagSpan from '../components/TagSpan.vue'

export default {
    // components: {
    //     TagSpan
    // },
    props: {
        page: Object
    },
    methods: {
      resolvePostDate(date) {
        return dayjs(date).format('YYYY-MM-DD')
      },
    },

}
</script>

<style scoped>
    .blueHover:hover { color: #1867c0; }
</style>