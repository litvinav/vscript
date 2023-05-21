function link() {
  for (const a of document.querySelectorAll('a')) {
    a.addEventListener('click', (event) => {
      if (event.isTrusted) {
        // Allow the link to open in a new tab or window
        if (event.ctrlKey || event.shiftKey) {
          return
        }
        event.preventDefault()
        let url = new URL(a.href)
        fetch(url.pathname, {
          method: "GET",
          headers: { "V-Request": "true" },
        })
        .then(async(res) => {
          if (res.status < 300) {
            const title = res.headers.get("title")
            if (typeof title == 'string') {
              document.title = title
            }
            window.history.pushState({}, "", url.pathname)
            const page = await res.text()
            document.head.parentElement.innerHTML = document.head.innerHTML + page
            link()
          }
        })
      }
    })
  }
}
link()

window.addEventListener('popstate', (event) => {
  if (event.isTrusted) {
    location.pathname = window.location.pathname
  }
})
