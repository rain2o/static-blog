<template>
    <div>
        <h1 class="text-h2 mb-16 ml-4">
            {{ $frontmatter.title }}
        </h1>

        <div v-if="$pagination" itemscope itemtype="http://schema.org/Blog">
            <ol>
                <PostSummary v-for="page of $pagination.pages" :key="page.key" :page="page" />
            </ol>
        </div>

        <p v-else>
            There seems to be no pages here...
        </p>

        <v-pagination v-if="$pagination.length > 1" v-model="pageNumber" :length="$pagination.length" @input="changePage" class="my-12">
        </v-pagination>
    </div>
</template>

<script>
import PostSummary from '../components/PostSummary.vue'
export default {
    components: {
        PostSummary
    },
    data() {
        return {
            pageNumber: 1
        }
    },
    created() {
        this.pageNumber = this.$pagination.paginationIndex + 1
    },
    methods: {
        changePage() {
            const path = this.$pagination.getSpecificPageLink(this.pageNumber - 1)    // - 1 for index
            this.$router.push(path).catch(e => {
                if (e.name !== 'NavigationDuplicated') {
                    throw e
                }
            })
        }
    },
}
</script>

<style>
</style>