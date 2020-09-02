const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Aa123456!',
    database: 'obser_vacation'
});

pool.on('connection', (conn) => {
    console.log(`New connection id: ${conn.threadId}`);
});

pool.on('acquire', (conn) => {
    console.log(`Acquire connection id: ${conn.threadId}`);
});

pool.on('enqueue', () => {
    console.log('Waiting for available connection slot');
});

pool.on('release', (conn) => {
    console.log(`Connection ${conn.threadId} released`);
});

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        first_name CHAR(100) NOT NULL,
        last_name CHAR(100) NOT NULL,
        username CHAR(100) NOT NULL UNIQUE,
        password CHAR(100) NOT NULL,
        isAdmin BOOLEAN NOT NULL
    );
`, (err, results) => {
    if(err) throw err;
})

pool.query(`
    CREATE TABLE IF NOT EXISTS vacations (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(500) NOT NULL,
        destination CHAR(100) NOT NULL,
        image CHAR(200) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        price INT NOT NULL
    );
`, (err, results) => {
    if(err) throw err;
})

pool.query(`
    CREATE TABLE IF NOT EXISTS vacations_followers (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        id_vacation INT NOT NULL,
        id_follower INT NOT NULL,
        FOREIGN KEY (id_vacation) REFERENCES vacations(id),
        FOREIGN KEY (id_follower) REFERENCES users(id)
    );
`, (err, results) => {
if(err) throw err;
})

module.exports = {pool};
