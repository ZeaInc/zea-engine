const decodeText = (chars) => {
  if (window.TextDecoder) return new TextDecoder('utf-8').decode(chars)
  else {
    let result = ''
    for (let i = 0; i < chars.length; i++) result += String.fromCharCode(chars[i])
    return result
  }
}
export { decodeText }
