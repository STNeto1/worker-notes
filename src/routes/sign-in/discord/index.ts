import { APIEvent, redirect, serializeCookie } from 'solid-start'
import { auth, discordAuth } from '~/lib/lucia'

export async function GET({ request }: APIEvent) {
  const authRequest = auth.handleRequest(request)
  const session = await authRequest.validate()
  if (session) {
    return redirect('/', 302) // redirect to profile page
  }

  const [url, state] = await discordAuth.getAuthorizationUrl()
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Set-Cookie': serializeCookie('github_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60
      })
    }
  })
}
