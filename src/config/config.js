// require("dotenv").config();
exports.dbconfig = {
    username: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'mysql',
}

exports.commonConfig = {
    jwtSecret: process.env.JWT_SECRET ?? "HH5u6mKP9sljSVi",
    bucketName: process.env.AWS_BUCKET_NAME,
    bucketRegion: process.env.AWS_REGION_NAME,
    secretKeyID: process.env.AWS_SECRET_KEY_ID,
    accessKeyID: process.env.AWS_ACCESS_KEY_ID,
    allowedCors: process.env.ALLOWED_CORS
}