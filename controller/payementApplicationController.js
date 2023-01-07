const { query } = require("../functions/db");
const axios = require("axios").default
const payementApplicationModel = require('../model/payementApplicationModel')

const checkApplications = async (req, res) => {
        try {
                const {token, paymentReference, checksum, institutionID, transactionRef} = req.body
                const applications = (await payementApplicationModel.getApplication(token))[0]
                if(applications){
                        const codeVerifier = await axios.post('http://localhost:8000/payements/crdb/verifications',{
                                paymentReference:paymentReference,
                                token:token,
                                checksum:checksum,
                                institutionID:institutionID
                        }) 
                        const codeReponse = codeVerifier.data
                        if(codeReponse){
                                const payementConfirmation = await axios.post('http://localhost:8000/payements/crdb/confirmations',{
                                        payerName:codeReponse.data.payerName,
                                        amount:codeReponse.data.amount,
                                        amountType:codeReponse.data.amountType,
                                        paymentReference:codeReponse.data.paymentReference,
                                        currency:codeReponse.data.currency,
                                        paymentType:codeReponse.data.paymentType,
                                        paymentDesc:codeReponse.data.paymentDesc,
                                        payerID:codeReponse.data.payerID,
                                        transactionRef:"D1425A",
                                        transactionChannel:"D1425A",
                                        token:token,
                                        checksum:checksum,
                                        institutionID:institutionID
                                })  
                                console.log(payementConfirmation)  
                        }else{
                                res.status(404).send("Server error")
                        }
                }else{
                        res.status(201).send({message:"Le token n'esxiste pas"})
                }
                res.status(200).json(applications)
        } catch (error) {
                  console.log(error);
                  res.status(500).send("Server error");
        }
};

module.exports={
        checkApplications
}