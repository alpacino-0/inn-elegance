'use client'

import { Controller, type Control, type ControllerRenderProps } from 'react-hook-form'
import { MinusIcon, PlusIcon, UsersIcon } from 'lucide-react'
import type { SearchFormValues } from './searchSchema'

type Props = {
  control: Control<SearchFormValues>
  name: 'guests'
}

export default function GuestCounter({ control, name }: Props) {
  return (
    <div className="w-full sm:w-1/3">
      <Controller
        name={name}
        control={control}
        defaultValue={1}
        render={({ field }: { field: ControllerRenderProps<SearchFormValues, 'guests'> }) => (
          <div className="flex items-center justify-between border border-gray-300 rounded-lg px-4 h-10 bg-white text-sm">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4 text-gray-500" />
              <span>Kişi: {field.value || 1}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                className="text-gray-600 hover:text-black"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => field.onChange((field.value || 1) + 1)}
                className="text-gray-600 hover:text-black"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      />
    </div>
  )
}
