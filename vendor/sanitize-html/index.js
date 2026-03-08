const entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

const pattern = /[&<>"']/g

const sanitizeHtml = (value = '') => String(value).replace(pattern, (char) => entities[char])

export default sanitizeHtml
