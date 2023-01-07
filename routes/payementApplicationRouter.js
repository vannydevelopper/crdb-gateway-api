const express = require("express");
const payementApplicationController = require("../controller/payementApplicationController");

const payementApplicationRouter = express.Router();

payementApplicationRouter.post("/applications", payementApplicationController.checkApplications);

module.exports = payementApplicationRouter;
