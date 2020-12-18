const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const deployToDevTo = require('./dev-to')
// const deployToLinkedin = require('./linkedin')
// const deployToTwitter = require('./twitter')

function getNewPost() {
  const today = new Date()

  return fs
    .readdirSync('_posts')
    .map((slug) => {
      const post = matter(fs.readFileSync(path.join('_posts', slug)))
      return { ...post, slug }
    })
    .filter((p) => {
      const created = new Date(p.data.created)

      return (
        !p.data.dev_to && // Is empty only when is unpublished
        created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
      )
    })
    .map(({ slug, data, content }) => {
      const id = slug.replace('.md', '')
      const img = data.cover_image || ''
      const canonical = `https://blog.rainwater.io/${id}`
      const body =
        `***Original article: ${canonical}***\n` +
        content
          .replace(/src="\//g, 'src="https://blog.rainwater.io/')
          .replace(/href="\//g, 'href="https://blog.rainwater.io/')
          .replace(/\[.*\]\(\/.*\)/g, (r) =>
            r.replace('(/', '(https://blog.rainwater.io/')
          )

      return {
        body_markdown: body,
        canonical_url: canonical,
        created: data.created,
        description: data.description,
        main_image: img.startsWith('http') ? img : `https://blog.rainwater.io${img}`,
        published: false,
        series: data.series,
        slug,
        tags: data.tags,
        title: data.title,
      }
    })[0]
}

async function deploy() {
  const post = getNewPost()

  if (!post) {
    console.log('No new post detected to publish.')
    process.exit()
  }

  const devToLink = await deployToDevTo(post)

//   await Promise.all([
//     deployToLinkedin(post, devToLink),
//     deployToTwitter(post),
//   ])
}

console.log('Start publishing')
deploy()
  .then(() => {
    console.log('Published!')
    process.exit()
  })
  .catch((e) => {
    console.log('ERROR publishing:', e)
    process.exit()
  })