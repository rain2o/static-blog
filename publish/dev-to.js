const fetch = require('isomorphic-unfetch')
const path = require('path')
const fs = require('fs')

const createPost = async (article) => {
  console.log('----createPost---')
  try {
    const response = await fetch('https://dev.to/api/articles', {
      method: 'POST',
      headers: {
        'api-key': process.env.DEV_TO,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ article }),
    })
    const result = await response.json()
    console.log('dev.to -> OK', `https://dev.to/rain2o/${result.slug}`)
    return result.slug
  } catch (error) {
    console.log('dev.to -> KO', e)
  }
}

module.exports = {
  deployToDevTo: async (article) => {
    const devToId = await createPost(article)
  
    if (!devToId) return
  
    const postPath = path.join('blog/_posts', article.slug)
    const post = fs.readFileSync(postPath).toString()
    let occurrences = 0
  
    // Write 'published_devto' metadata before the second occourrence of ---
    fs.writeFileSync(
      postPath,
      post.replace(/---/g, (m) => {
        occurrences += 1
        if (occurrences === 2) return `published_devto: true\n${m}`
        return m
      })
    )
  }
}
