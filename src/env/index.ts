import {config} from 'dotenv'
import { z } from 'zod'

if(process.env.NODE_ENV === 'test'){
  console.log('test env loaded')
  config({ path: '.env.test'})
} else {
  console.log('developtment env')
  config()
}



const envSchema = z.object({
  NODE_ENV: z
    .enum(['developtment', 'test', 'production'])
    .default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

const _env = envSchema.safeParse(process.env)
console.log(_env)

if (_env.success === false) {
  console.error('Invalid enviroment variables =', _env.error.format())

  throw new Error('Invalidade enviroment variables')
}

export const env = _env.data
