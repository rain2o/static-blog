import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import './theme/styles/vuetify.css'
// import './theme/styles/prism-material-dark.css'

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
  // ...apply enhancements to the app
  Vue.use(Vuetify)
  options.vuetify = new Vuetify({
    theme: {
      themes: {
        // light: {
        //   primary: '#00adef',
        //   secondary: '#414042',
        //   accent: '#3F51B5',
        // },
        light: {
          primary: '#1E90FF',
          secondary: '#805CA5',
          // accent: '#82B1FF',
          error: '#F97369',
          // info: '#2196F3',
          success: '#00D2BB',
          // warning: '#FFC107',
        },
        // dark: {
        //   primary: '#00ADEF',
        //   secondary: '#745CB2',
        //   accent: '#82B1FF',
        //   error: '#F97369',
        //   info: '#2196F3',
        //   success: '#00D2BB',
        //   warning: '#FFC107',
        // }
      },
    }
  })
}
