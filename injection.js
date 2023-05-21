function inject(event) {
  if (event.isTrusted && event.target == event.currentTarget) {
    const path = event.target.getAttribute('v-url') || window.location.href
    let target = event.target
    if (event.target.hasAttribute('v-target')) {
      const targetid = event.target.getAttribute('v-target')
      target = document.getElementById(targetid)
    }

    const url = new URL(path, window.location.origin)

    if (event.target instanceof HTMLInputElement && typeof event.target.name == 'string') {
      const name = event.target.name
      const value = event.target.value
      url.searchParams.append(name, value)
    }

    const query = event.target.getAttribute('v-query')
    if (typeof query == 'string' && query.includes("=")) {
      const [qkey, qval] = query.split("=")
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set(qkey, qval)
      history.pushState(null, '', currentUrl.toString())
    }

    fetch(url.toString(), {
      method: "GET",
      headers: { "V-Request": "true" },
    })
    .then(async (res) => {
      if (res.status < 300 && res.headers.get("content-type")?.startsWith('text/html')) {
        const html = await res.text()
        if (target instanceof HTMLElement) {
          target.outerHTML = html
          const callback = event.target.getAttribute('v-callback')
          if (typeof callback == 'string' && typeof window[callback] == 'function') {
            window[callback]()
          }
        }
      }
    })
    .catch(console.error)
  }
  return false
}


function eject(event) {
  if (event.isTrusted && event.target == event.currentTarget) {
    let target = event.target
    if (event.target.hasAttribute('v-target')) {
      const targetid = event.target.getAttribute('v-target')
      target = document.getElementById(targetid)
    }
    const replacer = document.createElement(target.tagName)
    replacer.id = target.id
    target.replaceWith(replacer)

    const query = event.target.getAttribute('v-query')
    if (typeof query == 'string') {
      const url = new URL(window.location.href)
      url.searchParams.delete(query)
      history.pushState(null, '', url.toString())
    }
  }
  return false
}
