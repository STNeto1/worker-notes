import { planetscale } from '@lucia-auth/adapter-mysql'
import { discord } from '@lucia-auth/oauth/providers'
import { connect } from '@planetscale/database'
import { lucia } from 'lucia'
import { web } from 'lucia/middleware'

import { getEnvValue } from '~/lib/getConn'

export const auth = lucia({
  env: 'DEV',
  middleware: web(),
  sessionCookie: {
    expires: false
  },
  adapter: planetscale(
    connect({
      url: getEnvValue(null, 'DATABASE_URL')
    }),
    {
      user: 'auth_user',
      key: 'user_key',
      session: 'user_session'
    }
  ),
  getUserAttributes(databaseUser) {
    return {
      discordUsername: databaseUser.username
    }
  }
})

export const discordAuth = discord(auth, {
  clientId: process.env.DISCORD_CLIENT_ID ?? '',
  redirectUri: process.env.DISCORD_REDIRECT_URI ?? '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET ?? ''
})

export type Auth = typeof auth
