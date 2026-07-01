let ramais = [];

const tabela = document.getElementById("listaRamais");
const modal = document.getElementById("modal");
const tituloModal = document.getElementById("tituloModal");

let editandoId = null; // null = criando um ramal novo / com valor = editando

// ---------- CARREGAR DADOS DO SUPABASE ----------

async function carregarRamais() {

    const { data, error } = await supabase
        .from("ramais")
        .select("*")
        .order("nome");

    if (error) {
        console.log(error);
        alert("Erro ao carregar ramais: " + error.message);
        return;
    }

    ramais = data;
    listar();
}

// carregarRamais() é chamado pelo auth.js, depois que o login é confirmado.

// ---------- LISTAR NA TELA ----------

function iniciais(nome) {
    const partes = nome.trim().split(" ").filter(Boolean);
    const primeira = partes[0]?.[0] || "";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
}

function badgeCargo(cargo) {
    if (!cargo) return "";
    const cores = {
        "Gestor":     { bg:"#EDE9FE", cor:"#6D28D9" },
        "Supervisor": { bg:"#E0F7FA", cor:"#0090AD" },
        "Monitor":    { bg:"#FFF3E0", cor:"#E65100" }
    };
    const c = cores[cargo] || { bg:"#F3F4F6", cor:"#6B7686" };
    return `<span class="badge-cargo" style="background:${c.bg};color:${c.cor};">${cargo}</span>`;
}

function listar(lista = ramais) {

    tabela.innerHTML = "";

    const ehAdmin = (perfilAtual === "admin");

    // Atualiza contador
    const contador = document.getElementById("contador");
    if (contador) {
        const total = ramais.length;
        contador.textContent = total === 1 ? "1 ramal" : `${total} ramais`;
    }

    if (lista.length === 0) {
        tabela.innerHTML = `
        <tr class="tabela-vazia">
            <td colspan="4">Nenhum ramal encontrado.</td>
        </tr>
        `;
        return;
    }

    lista.forEach((item) => {
        tabela.innerHTML += `
        <tr>

        <td>
            <span class="avatar-iniciais">${iniciais(item.nome)}</span>
            ${item.nome}
            ${badgeCargo(item.cargo)}
        </td>

        <td>${item.setor}</td>

        <td class="coluna-ramal">${item.ramal}</td>

        <td>
            ${ehAdmin ? `
            <button class="editar" onclick="editar(${item.id})" title="Editar">
            ✏️
            </button>

            <button class="excluir" onclick="excluir(${item.id})" title="Excluir">
            🗑️
            </button>
            ` : ""}
        </td>

        </tr>
        `;
    });
}

// ---------- ABRIR MODAL (NOVO) ----------

document.getElementById("novo").onclick = () => {
    editandoId = null;
    tituloModal.textContent = "Novo Ramal";

    nome.value = "";
    setor.value = "";
    ramal.value = "";
    cargo.value = "";

    modal.style.display = "flex";
}

// ---------- CANCELAR ----------

document.getElementById("cancelar").onclick = () => {
    modal.style.display = "none";
}

// ---------- SALVAR (INSERE OU ATUALIZA) ----------

document.getElementById("salvar").onclick = async () => {

    if (perfilAtual !== "admin") {
        alert("Você não tem permissão para esta ação.");
        modal.style.display = "none";
        return;
    }

    if (!nome.value || !setor.value || !ramal.value) {
        alert("Preencha todos os campos.");
        return;
    }

    if (editandoId === null) {

        // INSERIR novo ramal no Supabase
        const { error } = await supabase
            .from("ramais")
            .insert({
                nome: nome.value,
                setor: setor.value,
                ramal: ramal.value,
                cargo: cargo.value || null
            });

        if (error) {
            console.log(error);
            alert("Erro ao salvar: " + error.message);
            return;
        }

    } else {

        // ATUALIZAR ramal existente no Supabase
        const { error } = await supabase
            .from("ramais")
            .update({
                nome: nome.value,
                setor: setor.value,
                ramal: ramal.value,
                cargo: cargo.value || null
            })
            .eq("id", editandoId);

        if (error) {
            console.log(error);
            alert("Erro ao atualizar: " + error.message);
            return;
        }
    }

    await carregarRamais();

    modal.style.display = "none";

    nome.value = "";
    setor.value = "";
    ramal.value = "";
    cargo.value = "";
    editandoId = null;
}

// ---------- EXCLUIR ----------

async function excluir(id) {

    if (perfilAtual !== "admin") {
        alert("Você não tem permissão para excluir ramais.");
        return;
    }

    if (confirm("Excluir este ramal?")) {

        const { error } = await supabase
            .from("ramais")
            .delete()
            .eq("id", id);

        if (error) {
            console.log(error);
            alert("Erro ao excluir: " + error.message);
            return;
        }

        await carregarRamais();
    }
}

// ---------- EDITAR ----------

function editar(id) {

    if (perfilAtual !== "admin") {
        alert("Você não tem permissão para editar ramais.");
        return;
    }

    const item = ramais.find(r => r.id === id);
    if (!item) return;

    editandoId = id;
    tituloModal.textContent = "Editar Ramal";

    nome.value = item.nome;
    setor.value = item.setor;
    ramal.value = item.ramal;
    cargo.value = item.cargo || "";

    modal.style.display = "flex";
}

// ---------- PESQUISA ----------

document.getElementById("pesquisa").addEventListener("keyup", function () {

    const texto = this.value.toLowerCase();

    const resultado = ramais.filter(r =>
        r.nome.toLowerCase().includes(texto) ||
        r.setor.toLowerCase().includes(texto) ||
        r.ramal.includes(texto)
    );

    listar(resultado);
});
