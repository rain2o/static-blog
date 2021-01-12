<template>
  <div>
    <v-footer class="component-footer d-flex flex-column justify-center">
      <v-container class="d-flex flex-column flex-sm-row">

        <ul v-if="contact" class="d-flex flex-wrap mr-auto my-4 my-sm-0">
          <li v-for="item in contact" class="d-flex flex-column justify-center" :key="item.type">
            <a :href="item.link" class="mx-3 text-decoration-none" :title="item.title">
              <v-icon size="24px">
                mdi-{{ item.type }}
              </v-icon>
            </a>
          </li>
        </ul>

        <v-spacer></v-spacer>

        <ul v-if="copyright" class="copyright d-flex flex-wrap mr-auto my-4 my-sm-0">
          <li v-for="item in copyright" :key="item.text" class="copyright-item d-flex flex-column justify-center">
            <a v-if="item.link" :href="item.link" class="mx-1 text-body-2">{{ item.text }}</a>
            <span v-else class="mx-1 text-body-2">{{ item.text }}</span>
          </li>
        </ul>

      </v-container>
    </v-footer>

  </div>
</template>

<script>
  import Vue from 'vue'
  export default {
    computed: {
      contact() {
        return (
          (this.$themeConfig.footer && this.$themeConfig.footer.contact) ||
          []
        )
      },

      copyright() {
        return (
          (this.$themeConfig.footer && this.$themeConfig.footer.copyright) || []
        )
      },
    },
  }
</script>
