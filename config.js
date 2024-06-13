// read .env files and make environmental variables
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret";
const BCRYPT_WORK_FACTOR = 12;

const DB_URI = process.env.DATABASE_URL || 
               (process.env.NODE_ENV === "test"
                 ? "postgresql:///messagely_test"
                 : "postgresql:///messagely");

module.exports = {
  DB_URI,
  SECRET_KEY,
  BCRYPT_WORK_FACTOR,
};
