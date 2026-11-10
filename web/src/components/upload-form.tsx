'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = (await response.json()) as { ok: boolean; asset?: { filename: string }; error?: string }
      setResult(response.ok ? `Uploaded: ${data.asset?.filename}` : `Error: ${data.error}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="file">Image file (JPEG, PNG, WebP — max 5 MB)</label>
      <input
        id="file"
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
      />
      <button type="submit" disabled={loading || !file}>
        {loading ? 'Uploading…' : 'Upload'}
      </button>
      {result ? <p>{result}</p> : null}
    </form>
  )
}
