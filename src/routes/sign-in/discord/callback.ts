import { OAuthRequestError } from '@lucia-auth/oauth'
import { APIEvent, parseCookie, redirect } from 'solid-start'
import { auth, discordAuth } from '~/lib/lucia'

export async function GET({ request }: APIEvent) {
  const authRequest = auth.handleRequest(request)
  const session = await authRequest.validate()
  if (session) {
    return redirect('/', 302) // redirect to profile page
  }

  const cookies = parseCookie(request.headers.get('Cookie') ?? '')
  const storedState = cookies.github_oauth_state
  const url = new URL(request.url)
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')

  if (!storedState || !state || storedState !== state || !code) {
    console.log({
      storedState,
      state,
      code
    })

    return new Response(null, {
      status: 400
    })
  }

  try {
    const { getExistingUser, discordUser, createUser } =
      await discordAuth.validateCallback(code)

    const getUser = async () => {
      const existingUser = await getExistingUser()
      if (existingUser) return existingUser
      const user = await createUser({
        attributes: {
          username: discordUser.username
        }
      })
      return user
    }

    const user = await getUser()
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {}
    })

    const sessionCookie = auth.createSessionCookie(session)
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': sessionCookie.serialize()
      }
    })
  } catch (e) {
    console.log(e)

    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400
      })
    }
    return new Response(null, {
      status: 500
    })
  }
}
