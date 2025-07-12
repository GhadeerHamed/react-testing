import { PropsWithChildren } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import { Theme } from "@radix-ui/themes"
import "@radix-ui/themes/styles.css"
import { CartProvider } from "../src/providers/CartProvider"

const AllProviders = ({ children }: PropsWithChildren) => {
    const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      })
    return (
        <QueryClientProvider client={queryClient}>
            <Theme>
                <CartProvider>
                    {children}
                </CartProvider>
            </Theme>
        </QueryClientProvider>
    )
}

export default AllProviders