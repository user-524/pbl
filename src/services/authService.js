import { login } from '../api/services.js'

export const loginUser = async ({ username, password }) => {
  return login(username, password)
}
