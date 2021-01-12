<template>
  <v-app class="component-base-layout">
    <v-app-bar
      app
      fixed
      elevate-on-scroll
      class="primary"
    >
      <v-container class="d-flex align-center">
        <v-toolbar-title
          class="mr-auto d-flex align-center"
          style="cursor:pointer"
        >
          <div class="site-title">
            <router-link class="white--text text-decoration-none" to="/">
              {{ $site.title }}
            </router-link>
          </div>
        </v-toolbar-title>

        <v-app-bar-nav-icon
          @click="drawer = true"
          class="theme--dark d-md-none"
        ></v-app-bar-nav-icon>
      </v-container>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      right
      temporary
      fixed
      id="drawer"
      class="py-3"
    >
      <v-btn
        fab
        depressed
        x-small
        fixed
        right
        color="grey"
        @click="drawer = !drawer"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <Sidebar />
    </v-navigation-drawer>

    <v-main>
      <v-container>
        <v-row no-gutters>
          <v-col cols="12" sm="8">
            <div id="content">
              <slot name="content" />
            </div>
          </v-col>
          <v-col cols="12" sm="4">
            <aside id="sidebar" class="d-none d-md-block mt-4 ml-6">
              <Sidebar />
              <div id="sticky">
                <slot name="sticky" />
              </div>
            </aside>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <Footer />

  </v-app>
</template>

<script>
  import Sidebar from '@theme/components/Sidebar'
  import Footer from '@theme/components/Footer'
  export default {
    components: {
      Sidebar,
      Footer
    },
    mounted() {
      window.addEventListener('resize', e => {
        if (!(e instanceof UIEvent)) {
          this.drawer = false
        }
      })
    },
    data: () => ({
      drawer: false,
    })
  }
</script>

<style lang="stylus">
#sidebar {
  height: 100%;

  #sticky {
    margin-top: 2.5rem;
    position: sticky;
    top: 80px;
  }
}
</style>
