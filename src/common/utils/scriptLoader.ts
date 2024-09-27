const loadScript = (
  document: Document,
  scriptId: string,
  scriptSrc: string,
  onLoad?: (event: Event) => void,
  onError?: OnErrorEventHandler
) => {
  const existingScript = document.getElementsByTagName('script')[0]
  const script = document.createElement('script')
  script.id = scriptId
  script.src = scriptSrc
  if (existingScript && existingScript.parentNode) {
    existingScript.parentNode.insertBefore(script, existingScript)
  } else {
    document.head.appendChild(script)
  }
  if(onLoad) {
    script.onload = onLoad
  }
  if(onError) {
    script.onerror = onError
  }
}

export default loadScript;
