import { useEffect } from 'react'

const DEFAULT_DESCRIPTION = 'Earnova helps Indian businesses start, run and grow through AI-powered business tools, trusted professional services and sustainable energy solutions.'

export default function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  noIndex = false,
  path,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Earnova` : 'Earnova | Run and grow your business'
    document.title = fullTitle

    const setMeta = (selector, attribute, value) => {
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement('meta')
        const [key, name] = attribute === 'property'
          ? ['property', selector.match(/\[property="(.+)"\]/)?.[1]]
          : ['name', selector.match(/\[name="(.+)"\]/)?.[1]]
        element.setAttribute(key, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', value)
    }

    setMeta('meta[name="description"]', 'name', description)
    setMeta('meta[property="og:title"]', 'property', fullTitle)
    setMeta('meta[property="og:description"]', 'property', description)
    setMeta('meta[name="robots"]', 'name', noIndex ? 'noindex,nofollow' : 'index,follow')

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    const canonicalPath = path || window.location.pathname
    canonical.href = `https://www.earnova.in${canonicalPath === '/' ? '' : canonicalPath}`
  }, [description, noIndex, path, title])

  return null
}

