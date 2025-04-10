'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    console.error('Global hata:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 mx-auto">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="text-2xl font-bold">Bir Sorun Oluştu</h2>
        <p className="text-gray-600">
          Üzgünüz, uygulama yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.
        </p>
        <Button onClick={reset}>Tekrar Dene</Button>
      </div>
    </div>
  )
} 