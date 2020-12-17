const axios = require('axios')
const filter = '!bNaUlw5Ce-igr9'
const api_base = 'https://api.stackexchange.com/2.2'

module.exports = {
  /**
   * Render the Stack Exchange widget.
   * For now this is just a link. Might improve this later.
   *
   * @param {number} id Post ID
   * @param {string|null} site optional site name
   */
  async render(id, site = null) {
    // if no site name provided, just use stackoverflow
    if (site === null) {
      site = 'stackoverflow'
    }
    // get post data from stack exchange
    let res = await axios.get(`${api_base}/posts/${id}?site=${site}&order=desc&sort=activity&filter=${filter}`)
    if (res.data && res.data.items && res.data.items.length > 0) {
      const data = res.data.items[0]
      return `[${data.title}](${data.link})`
    }
    return null
  }
}