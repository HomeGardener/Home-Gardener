import 'dotenv/config';

const { DB_URL } = process.env;
const dbPassword = process.env.DB_PASSWORD ?? process.env.DB_password;

const DB_config = DB_URL
  ? {
      connectionString: DB_URL,
      ssl: {
        rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USER || 'postgres',
      password: dbPassword || '',
      database: process.env.DB_NAME || 'home_gardener_db',
      ssl: false,
    };

export default DB_config;
