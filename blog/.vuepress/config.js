const path = require('path')
const projectRoot = process.cwd();
const alias = path.resolve(projectRoot);

module.exports = {
  title: 'Joel Rainwater\'s Blog',
  description: 'Follow the story of a self-trained code-venturer battling the challenges of this crazy world.',
  head: [
    ['link', { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@Joel_Rain2o' }],
    ['meta', { name: 'twitter:creator', content: '@Joel_Rain2o' }],
    ['meta', { property: 'og:type', content: 'article' }],
    ['meta', { property: 'og:title', content: 'Joel Rainwater\'s Blog' }],
    ['meta', { property: 'og:site_name', content: 'Joel Rainwater\'s Blog' }],
    ['meta', { property: 'og:url', content: 'https://blog.rainwater.io' }],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/164153/acdb4505-57a2-4da1-b0ff-9ac1438873d5.jpeg',
      },
    ],
  ],
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
        avatarUrl: 'https://dev-to-uploads.s3.amazonaws.com/uploads/user/profile_image/164153/acdb4505-57a2-4da1-b0ff-9ac1438873d5.jpeg',
        name: 'Joel Rainwater',
        subTitle: 'Software Engineer & Indie Hacker',
        descriptionHtml: 'I build things and try to write about what I\'ve learned along the way.',
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
