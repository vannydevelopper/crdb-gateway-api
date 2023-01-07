const mysql = require("mysql");
const util = require("util");

// Create a connection to the database

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crdb_gateway",
});

// open the MySQL connection
connection.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database  ! ");
});
const query = util.promisify(connection.query).bind(connection);

module.exports = {
  connection,
  query,
};