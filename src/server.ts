import express from 'express'
import cors from 'cors'
import connectDB from './config/db'
import router from './modules/user/routes/auth.route'
import config from './config/config'


const app = express()
const apiRouter = express.Router()
connectDB()

app.use(express.json())
app.use(cors())

apiRouter.use('/auth', router)

app.use("api/v1", apiRouter)

const PORT = config.PORT
app.listen(PORT,()=>{
    console.log(`Server is running at port: ${PORT}`, )
})
//abc 