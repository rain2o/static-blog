export default interface Page {
  title: string,
  frontmatter: any,
  regularPath: string,
  key: string,
  path: string,
  headers: {
    level: number,
    title: string,
    slug: string
  }[],
  _strippedContent?: string,
  summary?: string
}