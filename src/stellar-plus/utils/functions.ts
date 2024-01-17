import { Buffer } from 'buffer'

export const generateRandomSalt = (): Buffer => {
  let salt = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' // Base64 characters
  const charactersLength = characters.length

  for (let i = 0; i < 32; i++) {
    salt += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return Buffer.from(salt)
}
