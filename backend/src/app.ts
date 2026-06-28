import cors from 'cors'
import express, { type Request, type Response, type NextFunction } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config'
import './config/firebase'
import { errorHandler } from './middleware/errorHandler'
import { assignRequestId } from './middleware/requestId'
import { rateLimiter } from './middleware/rateLimiter'
import adminRoutes from './modules/admin/admin.routes'
import analyticsRoutes from './modules/analytics/analytics.routes'
import productRoutes from './modules/products/product.routes'
import { healthResponse, notFound } from './utils/apiResponse'

export const app = express()

app.use(assignRequestId)
app.use(morgan('combined'))
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  next()
})
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

app.use('/api/products', productRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/admin', adminRoutes)

app.get('/health', (_req, res) => {
  healthResponse(res)
})

app.use((req, res) => {
  notFound(res, 'Not found', req)
})

app.use(errorHandler)
