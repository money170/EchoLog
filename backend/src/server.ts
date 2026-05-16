import cors from 'cors'
import express from 'express'
import morgan from 'morgan'

const app = express()
const port = Number(process.env.PORT ?? 8787)
const allowedOrigin = process.env.CORS_ORIGIN
const isProduction = process.env.NODE_ENV === 'production'

app.use(
  cors({
    origin: allowedOrigin ?? (isProduction ? false : true),
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'SpeechJournal',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  })
})

app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Not Found',
  })
})

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err)
  res.status(500).json({
    ok: false,
    error: 'Internal Server Error',
  })
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`SpeechJournal backend running at http://localhost:${port}`)
})
