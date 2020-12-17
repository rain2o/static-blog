const tags = require('./tags')
// looking for {% tagname arg1[ arg2] %}
const tagRegex = /{% ([^}]*) %}/im

/**
 * Using a webpack chain to perform this instead of
 * a markdown extension because the markdown plugin
 * doesn't have async capabilities, and we need to wait
 * for an API call to replace the content.
 *
 * @param {string} source Source content
 */
module.exports = async function (source) {
  // look for our tag regex 
  let rendered = source
  const match = tagRegex.exec(source)
  if (match) {
    const [all, group] = match
    // split all words as separate arguments
    let args = group.trim().split(' ')
    // tag name is always first
    const tag = args[0]
    args.splice(0, 1)
    const data = await tags[tag].render(...args)
    // replace the tag found with the rendered data
    rendered = source.replace(all, data)
  }
  return rendered
}