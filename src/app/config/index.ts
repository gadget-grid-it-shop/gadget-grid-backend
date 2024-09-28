import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: [path.join(process.cwd(), ".env")] });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  cloud_name: process.env.CLOUD_NAME,
  cloud_api: process.env.CLOUD_API_KEY,
  cloud_secret: process.env.CLOUD_API_SECRET,
  bcrypt_hash_rounds: process.env.BCRYPT_HASH_ROUNDS,
  access_secret: process.env.ACCESS_SECRET,
  node_environment: process.env.ENVIRONMENT
};
