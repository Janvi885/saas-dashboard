import { app } from './app'
import { config } from './config'
import { log } from './utils/logger'

app.listen(config.port, () => {
  log(
    'info',
    `🚀 Server running on port ${config.port} in ${config.nodeEnv} environment`,
  )
})

process.on('uncaughtException', (err: Error) => {
  log('error', 'Uncaught exception', {
    error: err.message,
    stack: err.stack,
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  log('error', 'Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  })
  process.exit(1)
})
