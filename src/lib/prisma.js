import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {PrismaMariaDb} from "@prisma/adapter-mariadb"

const adapter = new PrismaMariaDb({
  host:process.env.DATABASE_HOST,
  user:process.env.DATABASE_USER,
  password:process.env.DATABASE_PASSWORD,
  database:process.env.DATABASE_NAME,
  connectionLimit:5,
})

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV == "development" ? ["query","info","error"] : ["error"]
});

export default prisma;