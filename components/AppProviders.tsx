"use client"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import { useState } from "react"
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
const [queryClient] = useState(()=> new QueryClient());
  return(
  <QueryClientProvider client={queryClient}>
  <NextThemesProvider {...props}>
    {children}
  </NextThemesProvider>
  <ReactQueryDevtools/>
  </QueryClientProvider>
)}
