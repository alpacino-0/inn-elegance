'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { searchSchema, type SearchFormValues } from "./searchSchema"  
import RegionSelect from "./RegionSelect"
import DateRangePicker from "./DateRangePicker"
import GuestCounter from "./GuestCounter"
import { toast } from "sonner"
import { useSearchParamsRouter } from "./useSearchParamsRouter"

export default function SearchForm() {
  const { redirectToSearch } = useSearchParamsRouter()
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      region: "",
      date: undefined,
      guests: 1,
    },
  })

  const onSubmit = (data: SearchFormValues) => {
    toast.success("Filtreleme uygulandı")
    console.log("Filtre verisi:", data)
    redirectToSearch(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col sm:flex-row gap-3"
    >
      <RegionSelect control={control} name="region" />
      <DateRangePicker control={control} name="date" />
      <GuestCounter control={control} name="guests" />
      <button
        type="submit"
        className="px-4 h-10 bg-black text-white rounded-lg text-sm"
      >
        Ara
      </button>

      {errors.region && (
        <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>
      )}
    </form>
  )
}
