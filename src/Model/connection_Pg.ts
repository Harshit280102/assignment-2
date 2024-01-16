import { Pool } from 'pg';

const pool = new Pool({
  user:"75way",
  host:"localhost",
  port:3000,
  database:"social_mediadb",
  password:"1234",
});

const databaseConnection = () => {
  pool.connect((err, client, done) => {
    if (err) {
      console.error('Connection error', err.stack);
      return;
    }
    if (!client) {
      console.error('Client is undefined');
      return;
    }
    console.log('Database connected');
    const createTableText = `CREATE TABLE IF NOT EXISTS users (
        username VARCHAR(50) PRIMARY KEY,
        password VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        fullname VARCHAR(100) NOT NULL
      );
    `;
    client.query(createTableText, (err, res) => {
      done();
      if (err) {
        console.error('Error creating table', err.stack);
        return;
      }
      console.log('Table created');
    });
  });
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
};
export { pool,databaseConnection };