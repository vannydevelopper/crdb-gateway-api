const { query } = require("../functions/db");
const axios = require("axios").default
const payementApplicationModel = require('../model/payementApplicationModel')
const moment = require("moment")
const crypto = require('crypto')
const Validation = require('../class/Validation');
const md5 = require('md5')

// const checkApplicationsVerification_old = async (req, res) => {
//         try {
//                 const { token, paymentReference, checksum, institutionID } = req.body
//                 const applications = (await payementApplicationModel.getApplication(token))[0]
//                 if (applications) {
//                         const url_verification = applications.CHECK_URL
//                         const codeVerifier = await axios.post(url_verification, {
//                                 paymentReference: paymentReference,
//                                 token: token,
//                                 checksum: checksum,
//                                 institutionID: institutionID
//                         })
//                         res.status(codeVerifier.status).json({
//                                 data: JSON.parse(JSON.stringify(codeVerifier.data))
//                         })

//                 } else {
//                         res.status(201).send({ message: "Le token n'existe pas" })
//                 }
//         } catch (error) {
//                 console.log(error);
//                 res.status(500).send("Server error");
//         }
// };

const checkApplicationsVerification = async (req, res) => {
        try {
                const { paymentReference, token, checksum, institutionID } = req.body;
                const validation = new Validation(req.body, {
                        paymentReference: {
                                required: true,
                        },
                        token: {
                                required: true,
                        },
                        checksum: {
                                required: true,
                        }
                })
                await validation.run()
                const isValid = await validation.isValidate()
                if (!isValid) {
                        const erros = await validation.getErrors()
                        return res.status(404).json({
                                message: "Data validation failled",
                                result: erros
                        })
                }

                const historiquePayement = (await payementApplicationModel.findByPayementTnxid(paymentReference))[0]
                if (historiquePayement) {
                        const systemToken = historiquePayement.token
                        if (token == systemToken) {
                                var shasum = crypto.createHash('sha1')
                                const systemChecksum = shasum.update(`${token}${md5(historiquePayement.paymentReference)}`).digest('hex')
                                console.log(systemChecksum)
                                if (checksum == systemChecksum) {
                                        res.status(200).json({
                                                "status": 200,
                                                "statusDesc": "success",
                                                "data": {
                                                        "payerName": `${historiquePayement.payerName}`,
                                                        "amount": parseInt(historiquePayement.amount),
                                                        "amountType": historiquePayement.amountType,
                                                        "currency": historiquePayement.currency,
                                                        "paymentReference": historiquePayement.paymentReference,
                                                        "paymentType": historiquePayement.paymentType,
                                                        "paymentDesc": historiquePayement.paymentDesc,
                                                        "payerID": historiquePayement.payerID
                                                }

                                        })
                                } else {
                                        res.status(202).json({
                                                message: "Invalid checksum"
                                        })
                                }
                        } else {
                                res.status(201).json({
                                        message: "Invalid Token"
                                })
                        }
                } else {
                        res.status(204).send({
                                message: "Invalid payment reference number"
                        })
                }


        } catch (error) {
                console.log(error);
                res.status(500).send("Server error");
        }
};

const checkApplicationsConfirmation = async (req, res) => {
        try {
                const { payerName,
                        amount,
                        amountType,
                        paymentReference,
                        currency,
                        paymentType,
                        payerMobile,
                        paymentDesc,
                        payerID,
                        transactionRef,
                        transactionChannel,
                        transactionDate,
                        token,
                        checksum,
                        institutionID } = req.body
                const applications = (await payementApplicationModel.getApplication(token))[0]

                if (applications) {
                        const url_confirmation = applications.CONFIRMATION_URL
                        const historiquePayement = (await payementApplicationModel.findByPayementCodeReference(paymentReference))[0]
                        if (historiquePayement) {
                                if (historiquePayement.STATUT_ID == 1) {
                                        return res.status(207).json({ message: "TransacSon reference number already paid post method" })
                                }
                                var shasum = crypto.createHash('sha1')
                                const systemChecksum = shasum.update(`${token}${md5(historiquePayement.paymentReference)}`).digest('hex')
                                console.log(systemChecksum)
                                if (checksum == systemChecksum) {
                                        const payementConfirmation = await axios.post(url_confirmation, {
                                                payerName: payerName,
                                                amount: amount,
                                                amountType: amountType,
                                                paymentReference: paymentReference,
                                                currency: currency,
                                                paymentType: paymentType,
                                                paymentDesc: paymentDesc,
                                                payerID: payerID,
                                                transactionRef: transactionRef,
                                                transactionChannel: transactionChannel,
                                                token: token,
                                                checksum: checksum,
                                                institutionID: institutionID
                                        })
                                        await query("UPDATE crdb_verification_data SET STATUT_ID = 1 WHERE ID_VERIFICATION_DATA=?", [historiquePayement.ID_VERIFICATION_DATA]);

                                        if (payementConfirmation) {
                                                const { insertId } = await payementApplicationModel.createConfimationPayement(
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
                                                        payementConfirmation.data.data.receipt
                                                )
                                        }
                                        res.status(payementConfirmation.status).json({
                                                data: JSON.parse(JSON.stringify(payementConfirmation.data))
                                        })

                                } else {
                                        res.status(202).json({
                                                message: "Invalid checksum"
                                        })
                                }
                        } else {
                                res.status(204).send({
                                        message: "Invalid payment reference number"
                                })
                        }
                } else {
                        res.status(201).send({ message: "Invalid token" })
                }
        } catch (error) {
                console.log(error);
                res.status(500).send("Server error");
        }
};

const checkApplications = async (req, res) => {
        try {
                const { token,
                        institutionID,
                        payerName,
                        amount,
                        amountType,
                        currency,
                        paymentType,
                        paymentDesc,
                        payerID
                } = req.body

                const validation = new Validation(req.body, {
                        payerName: {
                                required: true,
                        },
                        amount: {
                                required: true,
                        },
                        token: {
                                required: true,
                        },
                })
                await validation.run()
                const isValid = await validation.isValidate()
                if (!isValid) {
                        const erros = await validation.getErrors()
                        return res.status(404).json({
                                message: "Probleme de validation de donnees",
                                result: erros
                        })
                }
                const amountTypeInitial = "FIXED"
                const currencyInitial = "TZS"

                if (token) {
                        const applications = (await payementApplicationModel.getApplication(token))[0]
                        const paymentReference = `${moment().get("h")}${applications.ID_CRDB_USERS}${moment().get("M")}${moment().get("s")}`

                        if (applications) {
                                const { insertId } = await payementApplicationModel.createOne(
                                        paymentReference,
                                        token,
                                        institutionID,
                                        payerName,
                                        amount,
                                        amountType ? amountType : amountTypeInitial,
                                        currency ? currency : currencyInitial,
                                        paymentType ? paymentType : null,
                                        paymentDesc ? paymentDesc : null,
                                        payerID ? payerID : null,
                                        applications.ID_CRDB_USERS
                                );
                                res.status(200).send({
                                        success: true,
                                        message: "La referance du paiement a ete generer avec succes",
                                        paymentReference,
                                })

                        } else {
                                res.status(404).send({
                                        message: "Invalid application"
                                })
                        }
                } else {
                        res.status(201).json({
                                message: "Invalid Token"
                        })
                }

        } catch (error) {
                console.log(error);
                res.status(500).send("Server error");
        }
};

module.exports = {
        checkApplicationsVerification,
        checkApplicationsConfirmation,
        checkApplications
}