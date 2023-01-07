const { query } = require("../functions/db");
const axios = require("axios").default
const payementApplicationModel = require('../model/payementApplicationModel')

const checkApplicationsVerification = async (req, res) => {
        try {
                const { token, paymentReference, checksum, institutionID } = req.body
                const applications = (await payementApplicationModel.getApplication(token))[0]
                if (applications) {
                        const url_verification = applications.CHECK_URL
                        const codeVerifier = await axios.post(url_verification, {
                                paymentReference: paymentReference,
                                token: token,
                                checksum: checksum,
                                institutionID: institutionID
                        })
                        res.status(codeVerifier.data.status).json({
                                data: JSON.parse(JSON.stringify(codeVerifier.data))
                        })

                } else {
                        res.status(201).send({ message: "Le token n'existe pas" })
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
                        paymentDesc,
                        payerID,
                        transactionRef,
                        transactionChannel,
                        token,
                        checksum,
                        institutionID } = req.body
                const applications = (await payementApplicationModel.getApplication(token))[0]
                if (applications) {
                        const url_confirmation = applications.CONFIRMATION_URL
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
                        res.status(payementConfirmation.data.status).json({
                                data: JSON.parse(JSON.stringify(payementConfirmation.data))
                        })

                } else {
                        res.status(201).send({ message: "Le token n'existe pas" })
                }
        } catch (error) {
                console.log(error);
                res.status(500).send("Server error");
        }
};

module.exports = {
        checkApplicationsVerification,
        checkApplicationsConfirmation
}