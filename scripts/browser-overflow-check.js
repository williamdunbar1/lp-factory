(() => {
  const doc = document.documentElement;
  const elements = [...document.querySelectorAll('h1,h2,h3,p,button,a,[role="button"]')];
  const issues = [];
  if (doc.scrollWidth > doc.clientWidth) {
    issues.push({ type: 'doc-x-overflow', element: 'document', detail: `scrollWidth=${doc.scrollWidth}, clientWidth=${doc.clientWidth}` });
  }
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const label = (element.innerText || element.getAttribute('aria-label') || element.tagName).trim().replace(/\s+/g, ' ').slice(0, 100);
    if (rect.right > doc.clientWidth + 1) issues.push({ type: 'offscreen-right', element: label, right: Math.round(rect.right) });
    if (element.scrollWidth > element.clientWidth + 1 && ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowX)) {
      issues.push({ type: 'clip-x', element: label, scrollWidth: element.scrollWidth, clientWidth: element.clientWidth });
    }
    if (element.scrollHeight > element.clientHeight + 1 && ['hidden', 'clip', 'auto', 'scroll'].includes(style.overflowY)) {
      issues.push({ type: 'clip-y', element: label, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight });
    }
  }
  const result = { viewport: { width: doc.clientWidth, height: window.innerHeight }, issues };
  console.log('browser-overflow-check', result);
  return result;
})();
