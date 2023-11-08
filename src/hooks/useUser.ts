import { auth } from '~/lib/lucia'

export const useUser = async (req: Request) => {
  const authReq = auth.handleRequest(req)
  return await authReq.validate()
}
