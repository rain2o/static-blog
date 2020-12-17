const path = require('path')
module.exports = {
  title: 'Blogwater',
  description: 'A collection of lessons I have learned and experiences I have had as a self-taught developer.',
  dest: 'dist',
  theme: '@vuepress/theme-blog', // OR shortcut: @vuepress/blog,
  themeConfig: {
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#modifyblogpluginoptions
     */
    modifyBlogPluginOptions(blogPluginOptions) {
      return blogPluginOptions
    },
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#nav
     */
    nav: [
      {
        text: 'Blog',
        link: '/',
      },
      {
        text: 'Tags',
        link: '/tag/',
      },
    ],
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#footer
     */
    footer: {
      contact: [
        {
          type: 'github',
          link: 'https://github.com/rain2o',
        },
        {
          type: 'twitter',
          link: 'https://twitter.com/Joel_Rain2o',
        },
        {
          type: 'linkedin',
          link: 'https://www.linkedin.com/in/joelrainwater/'
        },
        {
          type: 'instagram',
          link: 'https://www.instagram.com/rain2o/'
        }
      ],
      copyright: [
        {
          text: 'Privacy Policy',
          link: 'https://policies.google.com/privacy?hl=en-US',
        },
        {
          text: 'MIT Licensed | Copyright © 2020-present Joel Rainwater',
          link: '',
        },
      ],
    },
  },
  chainWebpack: config => {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use(path.resolve(__dirname, './vuepress-plugin-liquid-tags'))
      .loader(path.resolve(__dirname, './vuepress-plugin-liquid-tags'))
      .end()
  },
}
