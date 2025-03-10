import pg from "pg";
const { Client } = pg;

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: 5432,
  database: process.env.DB_DATABASE,
});

const connectToDb = async () => {
  try {
    await client.connect();
    const result = await client.query(`SELECT NOW() as current_time`);

    console.log(`Connected to database: ${result.rows[0].current_time}`);
  } catch (error) {
    console.error(error);
  }
};

export { client, connectToDb };
