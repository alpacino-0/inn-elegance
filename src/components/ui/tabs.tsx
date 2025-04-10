"use client"

import type * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  children,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  orientation?: "vertical" | "horizontal"
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs-root"
      orientation={orientation === "vertical" ? "vertical" : "horizontal"}
      className={cn(
        "data-[orientation=vertical]:flex",
        orientation === "vertical" && "data-[orientation=vertical]:flex-row",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-muted rounded-lg p-1 text-muted-foreground shrink-0 data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md py-1.5 px-3 text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-base",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
