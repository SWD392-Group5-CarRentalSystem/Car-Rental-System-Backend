import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET ="your_jwt_secret_key_here"

const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET || JWT_SECRET,
    PORT: process.env.PORT
}
export default config