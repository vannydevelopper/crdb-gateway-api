const { query } = require("../functions/db");

const getApplication = async (token) => {
        try {
                  var sqlQuery = " SELECT crdb.* FROM crdb_users_applications crdb ";
                  sqlQuery += " WHERE  crdb.TOKEN = ? ";
                  return query(sqlQuery, [token]);
        } catch (error) {
                  throw error;
        }
};

module.exports={
        getApplication
}