require("dotenv").config();

const express = require("express");
const multer = require("multer");
const fs = require("fs");

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
// UPLOAD SIMPLES (COMPATÍVEL VBA)
//=====================================================
app.post("/upload-pdf", (req, res) => {

    const chunks = [];

    req.on("data", chunk => chunks.push(chunk));

    req.on("end", async () => {

        const buffer = Buffer.concat(chunks);

        const fileName = `pedidos/${Date.now()}.pdf`;

        const { error } = await supabase
            .storage
            .from("pdfs")
            .upload(fileName, buffer, {
                contentType: "application/pdf",
                upsert: true
            });

        if (error) {
            return res.status(500).json(error);
        }

        res.json({
            ok: true,
            file: fileName
        });

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
app.post("/pedido-itens", async (req, res) => {
    const { data, error } = await supabase
        .from("pedido_itens")
        .insert([req.body])
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
});

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

    const numero = req.params.numero;

    const { data: pedido, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("numero", numero)
        .single();

    if (error) {
        return res.status(404).json(error);
    }

    const { data: itens } = await supabase
        .from("pedido_itens")
        .select("*")
        .eq("pedido_id", pedido.id)
        .order("id");

    res.json({
        pedido,
        itens
    });

});

app.post("/pedidos", async (req, res) => {

    const { data, error } = await supabase
  .from("pedidos")
  .insert([req.body])
  .select("*")
  .single();

if (error) return res.status(500).json(error);

res.status(201).json(data);

});

//=====================================================
// UPLOAD SIMPLES (COMPATÍVEL VBA)
//=====================================================
app.post("/upload-pdf", upload.single("file"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ erro: "sem arquivo" });
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    const fileName = `pedidos/${Date.now()}.pdf`;

    const { data, error } = await supabase
        .storage
        .from("pdfs")
        .upload(fileName, fileBuffer, {
            contentType: "application/pdf",
            upsert: true
        });

    fs.unlinkSync(req.file.path);

    if (error) {
        console.log(error);
        return res.status(500).json(error);
    }

    res.json({
        ok: true,
        file: fileName
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("CROMA V4 ONLINE", PORT);
});