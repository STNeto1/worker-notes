import { redirect } from 'solid-start'
import {
  createHandler,
  renderStream,
  StartServer
} from 'solid-start/entry-server'
import { auth } from '~/lib/lucia'

const publicUrls = ['/sign-in', '/sign-in/discord', '/sign-in/discord/callback']

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      const url = new URL(event.request.url)
      if (!publicUrls.includes(url.pathname)) {
        const authReq = auth.handleRequest(event.request)
        const userSession = await authReq.validate()
        if (!userSession) {
          return redirect('/sign-in')
        }
      }

      return forward(event)
    }
  },
  renderStream((event) => {
    return <StartServer event={event} />
  })
)
