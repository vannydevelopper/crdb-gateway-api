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

const createOne = async (
        paymentReference,
        token,
        institutionID,
        payerName,
        amount,
        amountType,
        currency,
        paymentType,
        paymentDesc,
        payerID,
        ID_CRDB_USERS
) => {
        try {
                return query(
                        "INSERT INTO crdb_verification_data(paymentReference, token, institutionID, payerName, amount, amountType, currency, paymentType, paymentDesc,payerID, ID_CRDB_USERS)  VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                                paymentReference,
                                token,
                                institutionID,
                                payerName,
                                amount,
                                amountType,
                                currency,
                                paymentType,
                                paymentDesc,
                                payerID,
                                ID_CRDB_USERS
                        ]
                );
        } catch (error) {
                throw error;
        }
};

const findByPayementTnxid = async (paymentReference) => {
        try {
                var sqlQuery = `
                  SELECT crdb.*
      FROM crdb_verification_data crdb
      WHERE crdb.paymentReference = ?
                  `;
                return query(sqlQuery, [paymentReference]);
        } catch (error) {
                throw error;
        }
};

const createConfimationPayement = async (
        payerName,
        amount,
        amountType,
        currency,
        paymentReference,
        paymentType,
        payerMobile,
        paymentDesc,
        payerID,
        transactionRef,
        transactionChannel,
        transactionDate,
        token,
        checksum,
        institutionID,
        CODE_RECEIPT
) => {
        try {
                return query(
                        "INSERT INTO crdb_confirmation_data(payerName,amount,amountType,currency,paymentReference,paymentType,payerMobile,paymentDesc,payerID,transactionRef,transactionChannel,transactionDate,token,checksum,institutionID,CODE_RECEIPT)  VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        [
                                payerName,
                                amount,
                                amountType,
                                currency,
                                paymentReference,
                                paymentType,
                                payerMobile,
                                paymentDesc,
                                payerID,
                                transactionRef,
                                transactionChannel,
                                transactionDate,
                                token,
                                checksum,
                                institutionID,
                                CODE_RECEIPT
                        ]
                );
        } catch (error) {
                throw error;
        }
};

const findByPayementCodeReference = async (paymentReference) => {
        try {
                var sqlQuery = `
                  SELECT crdb.*
      FROM  crdb_verification_data crdb
      WHERE crdb.paymentReference = ?
                  `;
                return query(sqlQuery, [paymentReference]);
        } catch (error) {
                throw error;
        }
};


module.exports = {
        getApplication,
        createOne,
        findByPayementTnxid,
        createConfimationPayement,
        findByPayementCodeReference
}