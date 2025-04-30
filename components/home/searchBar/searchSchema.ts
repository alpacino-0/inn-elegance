import { z } from "zod"

export const searchSchema = z
  .object({
    region: z.string().optional(),
    date: z
      .object({
        from: z.date().optional(),
        to: z.date().optional(),
      })
      .optional(),
    guests: z.number().optional(),
  })
  .refine(
    (data) => data.region || data.date?.from || data.date?.to || data.guests,
    {
      message: "En az bir filtre alanı doldurulmalıdır.",
      path: ["region"], // Hangi alanda hatayı gösterelim
    }
  )

export type SearchFormValues = z.infer<typeof searchSchema>
