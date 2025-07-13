import { delay, http, HttpResponse } from "msw"
import { server } from "./mocks/server"

export const simulateDelay = async (path: string) => {
    server.use(
        http.get(path, async () => {
          await delay()
          return HttpResponse.json([])
        })
      )
}

export const simulateError = async (path: string) => {
    server.use(
        http.get(path, async () => {
          return HttpResponse.error()
        })
      )
}