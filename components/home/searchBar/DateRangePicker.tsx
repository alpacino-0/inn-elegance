'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Controller, type Control, type ControllerRenderProps } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import type { SearchFormValues } from './searchSchema'

type Props = {
  control: Control<SearchFormValues>
  name: 'date'
}

export default function DateRangePicker({ control, name }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full sm:w-1/3">
      <Controller
        control={control}
        name={name}
        render={({ field }: { field: ControllerRenderProps<SearchFormValues, 'date'> }) => {
          const value: DateRange | undefined = field.value as DateRange

          const label = value?.from
            ? value.to
              ? `${format(value.from, 'dd.MM.yyyy')} - ${format(value.to, 'dd.MM.yyyy')}`
              : `${format(value.from, 'dd.MM.yyyy')} -`
            : 'Tarih Seçiniz'

          return (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="w-full h-10 px-4 bg-white border border-gray-300 rounded-lg flex items-center justify-between text-sm"
                >
                  <span>{label}</span>
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                side="bottom"
                align="start"
                className="z-50 bg-white border border-gray-200 rounded-lg p-4 shadow-md"
              >
                <DayPicker
                  mode="range"
                  selected={value}
                  onSelect={(range) => field.onChange(range)}
                  numberOfMonths={2}
                  fromDate={new Date()}
                  className="flex flex-col gap-2"
                />
              </PopoverContent>
            </Popover>
          )
        }}
      />
    </div>
  )
}
