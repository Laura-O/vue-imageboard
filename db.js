const Pool = require("pg-pool");

// TODO: make this work for Heroku & localhost without (un)commenting
// const url = require("url");
// const params = url.parse(
//     process.env.DATABASE_URL || "postgres://petition:petition@localhost:5432/petition"
// );
// const auth = params.auth ? params.auth.split(":") : {};

// const config = {
//     user: auth[0],
//     password: auth[1],
//     host: params.hostname,
//     port: params.port,
//     database: params.pathname.split("/")[1],
//     ssl: true
// };

// console.log(config);

const config = {
    host: "localhost",
    port: 5432,
    database: "imageboard"
};

const pool = new Pool(config);
pool.on("error", err => {
    console.log(err);
});

/**
 * Generic method for db queries
 * @param sql SQL query
 * @param params array with parameters
 */
const query = (sql, params) => {
    return new Promise((resolve, reject) => {
        pool.connect().then(client => {
            client
                .query(sql, params)
                .then(results => {
                    resolve(results);
                    client.release();
                })
                .catch(err => {
                    reject(err);
                    client.release();
                    console.error("query error", err.message, err.stack);
                });
        });
    });
};

module.exports = {
    query,
    pool
};
