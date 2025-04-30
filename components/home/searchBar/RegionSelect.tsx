'use client'

import { useEffect, useState } from 'react'
import * as Select from '@radix-ui/react-select'
import { Controller, type Control, type ControllerRenderProps } from 'react-hook-form'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SearchFormValues } from './searchSchema'

// Region türünü tanımlama
interface Region {
  id: string
  name: string
  slug: string | null
  isMainRegion: boolean
  parentId: string | null
}

// Ana bölgeler ve alt bölgeleri içeren tip
interface RegionWithSubRegions extends Region {
  subRegions: Region[]
}

type Props = {
  control: Control<SearchFormValues>
  name: 'region'
}

export default function RegionSelect({ control, name }: Props) {
  const [regions, setRegions] = useState<RegionWithSubRegions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRegions() {
      try {
        setLoading(true)
        
        // Ana bölgeleri getir
        const mainRegionsResponse = await fetch('/api/regions?isMainRegion=true&isActive=true')
        
        if (!mainRegionsResponse.ok) {
          throw new Error('Ana bölgeler alınamadı')
        }
        
        const mainRegions: Region[] = await mainRegionsResponse.json()
        
        // Her ana bölge için alt bölgeleri getir
        const regionsWithSubs: RegionWithSubRegions[] = await Promise.all(
          mainRegions.map(async (region) => {
            const subRegionsResponse = await fetch(`/api/regions?parentId=${region.id}&isActive=true`)
            
            if (!subRegionsResponse.ok) {
              return { ...region, subRegions: [] }
            }
            
            const subRegions: Region[] = await subRegionsResponse.json()
            return { ...region, subRegions }
          })
        )
        
        setRegions(regionsWithSubs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bölgeler yüklenirken bir hata oluştu')
        console.error('Bölge yükleme hatası:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchRegions()
  }, [])

  return (
    <div className="w-full sm:w-1/3">
      <Controller
        control={control}
        name={name}
        render={({ field }: { field: ControllerRenderProps<SearchFormValues, 'region'> }) => (
          <Select.Root onValueChange={field.onChange} value={field.value || ''}>
            <Select.Trigger
              className="w-full h-10 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-between text-sm"
            >
              <Select.Value placeholder="Bölge Seçiniz" />
              <Select.Icon>
                {loading ? (
                  <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                )}
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className="bg-white border border-gray-200 rounded-lg shadow-md w-[var(--radix-select-trigger-width)]"
                side="bottom"
                position="popper"
                sideOffset={4}
              >
                <Select.ScrollUpButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                  <ChevronDown className="h-4 w-4 rotate-180" />
                </Select.ScrollUpButton>
                
                <Select.Viewport className="p-1">
                  {loading && (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 text-gray-500 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Yükleniyor...</span>
                    </div>
                  )}
                  
                  {error && (
                    <div className="p-2 text-sm text-red-500">
                      {error}
                    </div>
                  )}
                  
                  {!loading && !error && regions.length === 0 && (
                    <div className="p-2 text-sm text-gray-500">
                      Bölge bulunamadı
                    </div>
                  )}
                  
                  {!loading && !error && regions.map((mainRegion) => (
                    <div key={mainRegion.id}>
                      {/* Ana bölge seçeneği */}
                      <Select.Item
                        value={mainRegion.slug || mainRegion.id}
                        className={cn(
                          "px-4 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-gray-100 font-medium",
                          "data-[state=checked]:bg-gray-100"
                        )}
                      >
                        <Select.ItemText>{mainRegion.name}</Select.ItemText>
                        <Select.ItemIndicator>
                          <Check className="h-4 w-4 ml-auto text-green-500" />
                        </Select.ItemIndicator>
                      </Select.Item>
                      
                      {/* Alt bölge seçenekleri */}
                      {mainRegion.subRegions.length > 0 && (
                        <div className="pl-4">
                          {mainRegion.subRegions.map((subRegion) => (
                            <Select.Item
                              key={subRegion.id}
                              value={subRegion.slug || subRegion.id}
                              className={cn(
                                "px-4 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-gray-100",
                                "data-[state=checked]:bg-gray-100 text-gray-700"
                              )}
                            >
                              <Select.ItemText>— {subRegion.name}</Select.ItemText>
                              <Select.ItemIndicator>
                                <Check className="h-4 w-4 ml-auto text-green-500" />
                              </Select.ItemIndicator>
                            </Select.Item>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </Select.Viewport>
                
                <Select.ScrollDownButton className="flex items-center justify-center h-6 bg-white text-gray-700 cursor-default">
                  <ChevronDown className="h-4 w-4" />
                </Select.ScrollDownButton>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        )}
      />
    </div>
  )
}
