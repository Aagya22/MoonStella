// Set before any src module loads. dotenv.config() does not override existing
// process.env, so these test values win over the real .env for the fields we
// care about, and env.ts validation passes without touching real services.
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-suite'
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/moonstella-test'
process.env.CLOUDINARY_CLOUD = 'test-cloud'
process.env.CLOUDINARY_KEY = 'test-key'
process.env.CLOUDINARY_SECRET = 'test-secret'
process.env.CLIENT_URL = 'http://localhost:3000'
process.env.EMAIL_USER = ''
process.env.EMAIL_PASS = ''
