import type { ReactNode } from 'react'

// Schema.org JSON-LD veri tipini tanımlama
type SchemaValue = string | number | boolean | null | undefined | SchemaObject | SchemaValue[]
interface SchemaObject {
  '@context'?: string
  '@type'?: string
  [key: string]: SchemaValue
}

interface JsonLdProps {
  data: SchemaObject
}

export default function JsonLd({ data }: JsonLdProps): ReactNode {
  // Nesne doğrudan metin içeriğine dönüştürülür
  // ve güvenli bir şekilde bir script etiketi olarak sunulur
  return (
    <script
      type="application/ld+json"
      id={`jsonld-${Object.values(data).join('-').substring(0, 20)}`}
      key={`jsonld-${Object.values(data).join('-').substring(0, 20)}`}
    >
      {JSON.stringify(data)}
    </script>
  )
} 