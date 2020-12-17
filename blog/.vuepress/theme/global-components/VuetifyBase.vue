<template>
    <v-app>
        <v-app-bar app elevate-on-scroll color="primary" dark>
            <v-toolbar-title v-show="$vuetify.breakpoint.smAndUp">
                <a href="/" class="link dark">Rain2o</a>
            </v-toolbar-title>
            <v-spacer v-show="$vuetify.breakpoint.smAndUp"></v-spacer>
            <v-toolbar-items>
                <v-btn text href="/about/">About</v-btn>
                <v-btn text href="/posts/">Posts</v-btn>
            </v-toolbar-items>
        </v-app-bar>

        <v-main>
            <v-container fluid>
                <v-row justify="center">
                    <v-col md="2" sm="0"/>
                    <v-col :md="contentWidth + 1" :xl="contentWidth" cols="12">
                        <slot />
                    </v-col>
                    <!-- <v-col md="2" sm="0">
                        <slot name="sidebarRight"/>
                    </v-col> -->
                </v-row>
            </v-container>
        </v-main>

        <v-footer padless class="mt-16">
            <v-card flat tile class="lighten-1 text-center" min-width="100%">
                <v-card-text>
                    <a href="https://github.com/rain2o" class="link" rel="noopener noreferrer">Github</a>
                    |
                    <a href="https://twitter.com/Joel_Rain2o/" class="link" rel="noopener noreferrer">Twitter</a>
                    |
                    <a href="https://www.linkedin.com/in/joel-rainwater/" class="link" rel="noopener noreferrer">LinkedIn</a>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-text class="">
                    	&copy; {{ new Date().getFullYear() }} &mdash; <strong>Joel Rainwater</strong>
                </v-card-text>
            </v-card>
        </v-footer>
    </v-app>
</template>

<script>
export default {
    props: {
        contentWidth: {
            type: Number,
            default: 5
        }
    }
}
</script>