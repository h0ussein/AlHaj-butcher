import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import dotenv from 'dotenv'

// Import routes
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import orderRoutes from './routes/orders.js'
import settingsRoutes from './routes/settings.js'
import uploadRoutes from './routes/upload.js'
import meatTypeRoutes from './routes/meatTypes.js'
import whatsappRoutes from './routes/whatsapp.js'
import userRoutes from './routes/users.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()
const PORT = process.env.PORT || 5001
const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5001'],
  credentials: true
}))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../../frontend/dist')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/meat-types', meatTypeRoutes)
app.use('/api/whatsapp', whatsappRoutes)
app.use('/api/users', userRoutes)

// API route
app.get("/api", (req, res) =>{
    res.send("Butcher Shop API is running")
})

// Catch all handler: send back React's index.html file for any non-API routes
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'))
})

connectDB().then(()=> {
    app.listen(PORT,  () => {
    console.log("Server started on PORT:", PORT);
    })
})
