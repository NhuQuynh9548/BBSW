const { Client } = require('pg');

const client = new Client({
    user: 'thuchi',
    host: '124.158.13.158',
    database: 'bluebolt',
    password: 'thuchibluebolt',
    port: 30350,
});

async function testConnection() {
    try {
        console.log('Connecting to remote database...');
        await client.connect();
        console.log('Connected successfully!');
        const res = await client.query('SELECT version()');
        console.log('Postgres version:', res.rows[0].version);

        console.log('Checking for payment_methods table...');
        const tableCheck = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_methods')");
        console.log('Table exists:', tableCheck.rows[0].exists);

    } catch (err) {
        console.error('Connection error:', err.stack);
    } finally {
        await client.end();
    }
}

testConnection();
