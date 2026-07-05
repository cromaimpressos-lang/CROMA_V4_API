require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const upload = multer({ dest: "temp/" });

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
// UPLOAD PDF (FIXADO)
//=====================================================
app.post("/upload-pdf", upload.single("file"), async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ erro: "arquivo não enviado" });
        }

        const fileBuffer = fs.readFileSync(req.file.path);

        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;

        const { data, error } = await supabase
            .storage
            .from("pdfs")
            .upload(fileName, fileBuffer, {
                contentType: "application/pdf",
                upsert: true
            });

        fs.unlinkSync(req.file.path);

        if (error) {
            return res.status(500).json(error);
        }

        const { data: publicUrl } = supabase
            .storage
            .from("pdfs")
            .getPublicUrl(fileName);

        return res.json({
            arquivo: fileName,
            url: publicUrl.publicUrl
        });

    } catch (err) {
        return res.status(500).json({ erro: err.message });
    }
});

//=====================================================
// CLIENTES
//=====================================================
app.get("/clientes", async (req, res) => {
    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("id");

    if (error) return res.status(500).json(error);
    res.json(data);
});

app.get("/clientes/:id", async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) return res.status(404).json(error);
    res.json(data);
});

app.post("/clientes", async (req, res) => {
    const { data, error } = await supabase
        .from("clientes")
        .insert([req.body])
        .select()
        .single();

    if (error) return res.status(500).json(error);
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

    if (error) return res.status(500).json(error);
    res.json(data);
});

app.delete("/clientes/:id", async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

    if (error) return res.status(500).json(error);

    res.json({ sucesso: true });
});

//=====================================================
// PEDIDOS
//=====================================================
app.get("/pedidos", async (req, res) => {

    const { data: pedidos, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("id", { ascending: false });

    if (error) return res.status(500).json(error);

    const lista = [];

    for (const pedido of pedidos) {

        const { data: itens } = await supabase
            .from("pedido_itens")
            .select("*")
            .eq("pedido_id", pedido.id)
            .order("id");

        lista.push({ pedido, itens });
    }

    res.json(lista);
});

app.get("/pedidos/:numero", async (req, res) => {

    const { numero } = req.params;

    const { data: pedido, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("numero", numero)
        .single();

    if (error) return res.status(404).json(error);

    const { data: itens, error: erroItens } = await supabase
        .from("pedido_itens")
        .select("*")
        .eq("pedido_id", pedido.id)
        .order("id");

    if (erroItens) return res.status(500).json(erroItens);

    res.json({ pedido, itens });
});

app.post("/pedidos", async (req, res) => {

    const numero = req.body.numero;

    const { data: existente } = await supabase
        .from("pedidos")
        .select("id")
        .eq("numero", numero)
        .maybeSingle();

    if (existente) {

        const { data, error } = await supabase
            .from("pedidos")
            .update(req.body)
            .eq("id", existente.id)
            .select()
            .single();

        if (error) return res.status(500).json(error);

        await supabase
            .from("pedido_itens")
            .delete()
            .eq("pedido_id", existente.id);

        return res.json(data);
    }

    const { data, error } = await supabase
        .from("pedidos")
        .insert([req.body])
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
});

//=====================================================
// ITENS
//=====================================================
app.post("/pedido-itens", async (req, res) => {

    const { data, error } = await supabase
        .from("pedido_itens")
        .insert([req.body])
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
});

//=====================================================
app.get("/upload-pdf", (req, res) => {

    res.json({
        status: "OK",
        mensagem: "Endpoint ativo. Use POST para enviar PDF."
    });

});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("=================================");
    console.log(" CROMA V4 API ONLINE");
    console.log(" Porta:", PORT);
    console.log("=================================");
});