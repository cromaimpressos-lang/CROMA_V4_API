const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        sistema: "CROMA V4 API",
        status: "ONLINE"
    });
});

router.get("/clientes", async (req, res) => {
    res.json({
        mensagem: "Rota clientes funcionando"
    });
});

module.exports = router;