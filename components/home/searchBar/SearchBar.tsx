'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import RegionSelect from '@/components/home/searchBar/RegionSelect'
import DateRangePicker from '@/components/home/searchBar/DateRangePicker'
import GuestCounter from '@/components/home/searchBar/GuestCounter'
import { Button } from '@/components/ui/button'
import { searchSchema, type SearchFormValues } from './searchSchema'
import { useSearchParamsRouter } from './useSearchParamsRouter'

export default function SearchBar() {
  const { redirectToSearch } = useSearchParamsRouter()
  
  const { control, handleSubmit } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      region: '',
      date: undefined,
      guests: 1,
    },
  })

  const onSubmit = (data: SearchFormValues) => {
    redirectToSearch(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-5xl mx-auto p-4"
    >
      <RegionSelect control={control} name="region" />
      <DateRangePicker control={control} name="date" />
      <GuestCounter control={control} name="guests" />
      <Button type="submit" className="w-full sm:w-auto">Ara</Button>
    </form>
  )
}
