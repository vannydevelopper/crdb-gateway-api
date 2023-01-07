const express = require("express");
const cors = require("cors");
const ip = require('ip');

const payementApplicationRouter = require("./routes/payementApplicationRouter");


const app = express();

var corsOptions = {
        origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
        res.json({ message: "Welcome to bezkoder application." });
});

app.use("/payements", payementApplicationRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
});