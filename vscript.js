let State = {}

/**
 * @param {HTMLElement} root
 * @param {boolean} init
 */
async function walk(root, init) {
  for (const element of root.children) {
    if (element instanceof HTMLElement) {
      for (const attribute of element.attributes) {
        if (init) {
          if (attribute.name == 'v-data') {
            Object.assign(State, eval(`(${attribute.value})`))
          }
          if (attribute.name.startsWith('@')) {
            const attrs = attribute.name.substring(1).split('.')
            const isMouseEvent = ['click','dblclick', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup'].includes(attrs[0])
            if (attrs.length == 1) {
              if (attribute.name == '@boost') {
                element.addEventListener('click', (event) => {
                  if (event.isTrusted && event.target == event.currentTarget) {
                    // Allow the link to be opened in a new tab or window
                    if (event.ctrlKey || event.shiftKey) {
                      return
                    }
                    event.preventDefault()
                    const href = event.target.getAttribute('href')
                    const path = new URL(href, window.location.origin).pathname
                    fetch(path, {
                      method: "GET",
                      headers: { "v-request": "true" },
                    })
                    .then(async(res) => {
                      if (res.status < 300) {
                        const title = res.headers.get("title")
                        if (typeof title == 'string') {
                          document.title = title
                        }
                        window.history.pushState({}, "", path)
                        const body = await res.text()
                        document.body.innerHTML = body
                        walk(document.body, true)
                      }
                    })
                  }
                })
              }
              if (isMouseEvent) {
                element.addEventListener(attrs[0], (event) => {
                  if (event.isTrusted) {
                    eval(`with (State) { (${attribute.value}) }`)
                  }
                })
              }
            } else if (isMouseEvent) {
              switch (attrs[attrs.length-1]) {
                case 'inject':{
                  element.addEventListener(attrs[0], function(event) {
                    if (event.isTrusted && event.target == event.currentTarget) {
                      const path = attribute.value || window.location.href
                      let target = event.target
                      if (event.target.hasAttribute('v-target')) {
                        const targetid = event.target.getAttribute('v-target')
                        target = document.getElementById(targetid)
                      }
                      fetch(new URL(path, window.location.origin), {
                        method: "GET",
                        headers: { "v-request": "true" },
                      })
                      .then(async (res) => {
                        if (res.status < 300 && res.headers.get("content-type")?.startsWith('text/html')) {
                          const html = await res.text()
                          if (target instanceof HTMLElement) {
                            target.insertAdjacentHTML('beforebegin', html)
                            walk(target.previousSibling, true)
                            target.parentElement.removeChild(target)
                            const callback = event.target.getAttribute('v-callback')
                            if (typeof callback == 'string') {
                              eval(`with (State) { (${callback}) }`)
                            }
                          }
                        }
                      })
                    }
                  })
                  break;
                }
                case 'eject': {
                  element.addEventListener(attrs[0], function(event) {
                    if (event.isTrusted && event.target == event.currentTarget) {
                      let target = event.target
                      if (event.target.hasAttribute('v-target')) {
                        const targetid = event.target.getAttribute('v-target')
                        target = document.getElementById(targetid)
                      }
                      const replacer = document.createElement(target.tagName)
                      replacer.id = target.id
                      target.replaceWith(replacer)
                    }
                  })
                  break;
                }
              }
            }
          }
        }
        if (attribute.name == 'v-text') {
          element.innerText = eval(`with (State) { (${attribute.value}) }`)
        }
        if (attribute.name == 'v-show') {
          element.style.display = eval(`with (State) { (${attribute.value}) }`) ? 'revert' : 'none'
        }
      }
      if (element.children.length) walk(element, init)
    }
  }
}
walk(document.body, true)

State = new Proxy(State, {
  set(target, key, value) {
    target[key] = value
    walk(document.body, false)
  },
})

window.addEventListener('popstate', (event) => {
  if (event.isTrusted) {
    location.pathname = window.location.pathname
  }
})