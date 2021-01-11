import Vuetify from 'vuetify'
// import './styles/theme.styl'
import "vuetify/dist/vuetify.min.css";
import '@mdi/font/css/materialdesignicons.css'

/**
 * Client app enhancement file.
 *
 * https://v1.vuepress.vuejs.org/guide/basic-config.html#app-level-enhancements
 */

export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  Vue.use(Vuetify)
  // $darkblue: #3658BF;
  // $grey: #6C7073;
  // $black: #1F2426;
  // $lightblue: #07C7F2;
  // $white: #F2F2F2;
  options.vuetify = new Vuetify({
    theme: {
      themes: {
        light: {
          primary: '#3658BF',
          secondary: '#6C7073',
          accent: '#07C7F2',
          error: '#b71c1c',
        },
      },
      options: { customProperties: true },
    }
  })
}
