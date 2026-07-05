require("dotenv").config();

const express = require("express");
const cors = require("cors");

const routes = require("./routes/routes");

const app = express();

app.use(cors({
    origin: "*"
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));

app.use("/", routes);

app.get("/", (req, res) => {
    res.json({
        sistema: "CROMA V4",
        status: "ONLINE"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log(" CROMA V4 API ONLINE");
    console.log(" Porta:", PORT);
    console.log("=================================");
    console.log("");

});