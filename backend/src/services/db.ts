import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    user: process.env.PG_USER, 
    host: process.env.PG_HOST, 
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD, 
    port: Number(process.env.PG_PORT), 
  });

const query = async (text: string, params?: any[]) => {
    const res = await pool.query(text, params);
    return res
}

export default {
    query,
};