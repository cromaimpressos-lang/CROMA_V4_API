require("dotenv").config();

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

//=====================================================
// TESTE
//=====================================================

app.get("/", (req, res) => {

    res.json({
        sistema: "CROMA V4",
        status: "ONLINE"
    });

});

//=====================================================
// CLIENTES
//=====================================================

app.get("/clientes", async (req, res) => {

    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id");

    if (error)
        return res.status(500).json(error);

    res.json(data);

});

app.get("/clientes/:id", async (req, res) => {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

    if (error)
        return res.status(404).json(error);

    res.json(data);

});

app.post("/clientes", async (req, res) => {

    const { data, error } = await supabase
        .from("clientes")
        .insert([req.body])
        .select()
        .single();

    if (error)
        return res.status(500).json(error);

    res.status(201).json(data);

});

app.put("/clientes/:id", async (req, res) => {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("clientes")
        .update(req.body)
        .eq("id", id)
        .select()
        .single();

    if (error) {
    console.log(error);
    return res.status(500).json(error);
}

    res.json(data);

});

app.delete("/clientes/:id", async (req, res) => {

    const { id } = req.params;

    const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

    if (error)
        return res.status(500).json(error);

    res.json({
        sucesso: true
    });

});

//=====================================================
// PEDIDOS
//=====================================================

app.get("/pedidos", async (req, res) => {

    const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("id");

    if (error) {
    console.log(error);
    return res.status(500).json(error);
}
    res.json(data);

});

app.get("/pedidos/:id", async (req, res) => {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("id", id)
        .single();

    if (error)
        return res.status(404).json(error);

    res.json(data);

});

app.post("/pedidos", async (req, res) => {

	console.log("======================");
	console.log(req.body);

    const numero = req.body.numero;

    // Verifica se já existe
    const { data: existente } = await supabase
        .from("pedidos")
        .select("id")
        .eq("numero", numero)
        .maybeSingle();

    // Atualiza
    if (existente) {

        const { data, error } = await supabase
            .from("pedidos")
            .update(req.body)
            .eq("id", existente.id)
            .select()
            .single();

        if (error)
            return res.status(500).json(error);

        // Remove os itens antigos
        await supabase
            .from("pedido_itens")
            .delete()
            .eq("pedido_id", existente.id);

        return res.json(data);
    }

    // Insere novo
const { data, error } = await supabase
    .from("pedidos")
    .insert([req.body])
    .select()
    .single();

if (error)
    return res.status(500).json(error);

res.status(201).json(data);

});

app.put("/pedidos/:id", async (req, res) => {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("pedidos")
        .update(req.body)
        .eq("id", id)
        .select()
        .single();

    if (error)
        return res.status(500).json(error);

    res.json(data);

});

app.delete("/pedidos/:id", async (req, res) => {

    const { id } = req.params;

    const { error } = await supabase
        .from("pedidos")
        .delete()
        .eq("id", id);

    if (error)
        return res.status(500).json(error);

    res.json({
        sucesso: true
    });

});

//=====================================================
// ITENS DO PEDIDO
//=====================================================

app.get("/pedido-itens", async (req, res) => {

    const { data, error } = await supabase
        .from("pedido_itens")
        .select("*")
        .order("id");

    if (error)
        return res.status(500).json(error);

    res.json(data);

});

app.get("/pedido-itens/:pedido", async (req, res) => {

    const { pedido } = req.params;

    const { data, error } = await supabase
        .from("pedido_itens")
        .select("*")
        .eq("pedido_id", pedido)
        .order("id");

    if (error)
        return res.status(500).json(error);

    res.json(data);

});

app.post("/pedido-itens", async (req, res) => {

    const { data, error } = await supabase
        .from("pedido_itens")
        .insert([req.body])
        .select()
        .single();

    if (error)
        return res.status(500).json(error);

    res.status(201).json(data);

});

app.put("/pedido-itens/:id", async (req, res) => {

    const { id } = req.params;

    const { data, error } = await supabase
        .from("pedido_itens")
        .update(req.body)
        .eq("id", id)
        .select()
        .single();

    if (error)
        return res.status(500).json(error);

    res.json(data);

});

app.delete("/pedido-itens/:id", async (req, res) => {

    const { id } = req.params;

    const { error } = await supabase
        .from("pedido_itens")
        .delete()
        .eq("id", id);

    if (error)
        return res.status(500).json(error);

    res.json({
        sucesso: true
    });

});

//=====================================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log(" CROMA V4 API ONLINE");
    console.log(" Porta:", PORT);
    console.log("=================================");
    console.log("");

});