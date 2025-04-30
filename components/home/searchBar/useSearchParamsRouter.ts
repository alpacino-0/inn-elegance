"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { SearchFormValues } from "./searchSchema"

export const useSearchParamsRouter = () => {
  const router = useRouter()

  const buildQuery = (data: SearchFormValues) => {
    const params = new URLSearchParams()

    if (data.region) params.set("region", data.region)
    if (data.date?.from)
      params.set("from", format(data.date.from, "yyyy-MM-dd"))
    if (data.date?.to)
      params.set("to", format(data.date.to, "yyyy-MM-dd"))
    if (data.guests) params.set("guests", data.guests.toString())

    return `villa-kiralama/search?${params.toString()}`
  }

  const redirectToSearch = (values: SearchFormValues) => {
    const url = buildQuery(values)
    router.push(url)
  }

  return { redirectToSearch }
}
