export function download(filename: string, content: string, type: string) {
  // BOM UTF-8 per far leggere correttamente gli accenti a Excel.
  const blob = new Blob([type === 'text/csv' ? '﻿' + content : content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
