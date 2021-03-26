const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const deployToDevTo = require('./dev-to')

function getNewPost() {
  const today = new Date()

  return (
    fs
      .readdirSync('blog/_posts')
      .map((slug) => {
        const post = matter(fs.readFileSync(path.join('blog/_posts', slug)))
        return { ...post, slug }
      })
      .filter((p) => {
        const created = new Date(p.data.date)

        return (
          !p.data.published_devto &&
          created.getDate() === today.getDate() &&
          created.getMonth() === today.getMonth() &&
          created.getFullYear() === today.getFullYear()
        )
      })
      .map(({ slug, data, content }) => {
        const id = slug.replace('.md', '')
        const date = new Date(data.date).toISOString().slice(0, 10).replace(/-/g, '/')
        const canonical = `https://blog.rainwater.io/${date}/${id}`
        const body = `***Original article: ${canonical}***\n${content}`

        return {
          body_markdown: body,
          canonical_url: canonical,
          date: data.date,
          description: data.description,
          cover_image: data.cover_image,
          published: true,
          slug,
          tags: data.tags.join(', '),
          title: data.title,
          lang: data.lang
        }
      })[0] || null
  )
}

async function deploy() {
  const post = getNewPost()

  if (!post) {
    console.log('No new post detected to publish.')
    process.exit()
  }

  await deployToDevTo(post)
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
