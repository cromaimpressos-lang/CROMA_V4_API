const express = require("express");
const router = express.Router();

const clientes = require("../controllers/clientesController");
const pedidos = require("../controllers/pedidosController");
const itens = require("../controllers/pedidoItensController");

//=====================================================
// TESTE
//=====================================================

router.get("/", (req, res) => {

    res.json({
        sistema: "CROMA V4",
        status: "ONLINE"
    });

});

//=====================================================
// CLIENTES
//=====================================================

router.get("/clientes", clientes.listar);
router.get("/clientes/:id", clientes.buscar);
router.post("/clientes", clientes.salvar);
router.put("/clientes/:id", clientes.alterar);
router.delete("/clientes/:id", clientes.excluir);

//=====================================================
// PEDIDOS
//=====================================================

router.get("/pedidos", pedidos.listar);
router.get("/pedidos/:id", pedidos.buscar);
router.post("/pedidos", pedidos.salvar);
router.put("/pedidos/:id", pedidos.alterar);
router.delete("/pedidos/:id", pedidos.excluir);

//=====================================================
// ITENS
//=====================================================

router.get("/pedido-itens/:pedido", itens.listar);
router.post("/pedido-itens", itens.salvar);
router.put("/pedido-itens/:id", itens.alterar);
router.delete("/pedido-itens/:id", itens.excluir);

module.exports = router;