const path = require('path')
const projectRoot = process.cwd();
const alias = path.resolve(projectRoot);

module.exports = {
  title: 'Dungeons & Devving',
  description: 'Follow the story of a self-trained code-venturer battling the challenges of this crazy world.',
  dest: 'dist',
  theme: '', // OR shortcut: @vuepress/blog,
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
    sidebar: {
      directoryIds: ['post'],
      profile: {
        avatarUrl: 'https://media-exp1.licdn.com/dms/image/C4D03AQHHRiVP4Z7Sdg/profile-displayphoto-shrink_400_400/0/1609506405269?e=1616025600&v=beta&t=nk8Tzmk2l97SJeWgY_rnRvw8tcd83PvhJuvUhofbml0',
        name: 'Joel Rainwater',
        subTitle: 'Full Stack Developer',
        descriptionHtml: 'Just another nerdy developer who enjoys Dungeons & Dragons as much as web development.',
      },
      hotTags: 10,
      recentPosts: 5,
      // additionalBlocks: [
      //   {
      //     title: 'Pages',
      //     links: [
      //       { label: 'About', path: '/about' },
      //       { label: 'Contact', path: '/contact' },
      //       { label: 'External Page', url: 'https://example.com'}
      //     ],
      //   },
      // ],
    },
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#footer
     */
    footer: {
      contact: [
        {
          type: 'github',
          title: 'Github',
          link: 'https://github.com/rain2o',
        },
        {
          type: 'twitter',
          title: 'Twitter',
          link: 'https://twitter.com/Joel_Rain2o',
        },
        {
          type: 'linkedin',
          title: 'LinkedIn',
          link: 'https://www.linkedin.com/in/joelrainwater/'
        },
        {
          type: 'instagram',
          title: 'Instagram',
          link: 'https://www.instagram.com/rain2o/'
        }
      ],
      copyright: [
        // {
        //   text: 'Privacy Policy',
        //   link: 'https://policies.google.com/privacy?hl=en-US',
        // },
        // {
        //   text: ' | ',
        //   link: '',
        // },
        {
          text: 'MIT Licensed | Copyright © 2020-present Joel Rainwater',
          link: '',
        },
      ],
    },
  },
  configureWebpack(config) {
    // Solely to speed up Vuepress, reenable if you need to debug your setup
    config.devtool = false;
    // Match standard Vue CLI aliasing
    config.resolve.alias['@'] = alias;
  },
  plugins: [
    ['@vuepress/search', {
      searchMaxSuggestions: 10
    }]
  ],
  chainWebpack: config => {
    config.module
      .rule('md')
      .test(/\.md$/)
      .use(path.resolve(__dirname, './vuepress-plugin-liquid-tags'))
      .loader(path.resolve(__dirname, './vuepress-plugin-liquid-tags'))
      .end()
  },
}
