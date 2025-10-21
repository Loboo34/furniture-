import express from "express"
import cors from "cors"
import * as dotenv from "dotenv"
dotenv.config()

import { connectDB } from "./config/db"
import { httpLogger, logger } from "./utils/logger"

import authRoutes from "./routes/auth.routes"
import produRoutes from "./routes/product.routes"
import cartRoutes from "./routes/cart.routes"
import orderRoutes from "./routes/order.routes"
import reviewRoutes from "./routes/review.routes"



const app = express()
app.use(express.json())
app.use(cors({
  origin: '*'
}))
app.use(httpLogger)

//routes
const apiVersion = `/api/${process.env.API_VERSION}`

app.use(`${apiVersion}/auth`, authRoutes)
app.use(`${apiVersion}/products`, produRoutes)
app.use(`${apiVersion}/cart`, cartRoutes)
app.use(`${apiVersion}/order`, orderRoutes)
app.use(`${apiVersion}/review`, reviewRoutes)





const PORT = process.env.PORT || 3000

connectDB()
.then(() => {
app.listen(3000 , '0.0.0.0', () => {
	logger.info(`Server is running on port ${PORT}`);
});
})
.catch((error) => {
  logger.error("DB connection failed", error)
})

;