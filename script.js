let ramais = [];

const tabela = document.getElementById("listaRamais");
const modal = document.getElementById("modal");
const tituloModal = document.getElementById("tituloModal");

let editandoId = null;

// ---------- FAVORITOS (localStorage) ----------

function getFavoritos() {
    try {
        return JSON.parse(localStorage.getItem("ramais_favoritos") || "[]");
    } catch { return []; }
}

function toggleFavorito(id) {
    let favs = getFavoritos();
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id);
    } else {
        favs.push(id);
    }
    localStorage.setItem("ramais_favoritos", JSON.stringify(favs));
    listar();
}

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

// ---------- HELPERS ----------

function iniciais(nome) {
    const partes = nome.trim().split(" ").filter(Boolean);
    const primeira = partes[0]?.[0] || "";
    const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
    return (primeira + ultima).toUpperCase();
}

function badgeCargo(cargo) {
    if (!cargo) return "";
    const classes = {
        "Gestor":     "badge-gestor",
        "Supervisor": "badge-supervisor",
        "Monitor":    "badge-monitor"
    };
    const classe = classes[cargo] || "badge-neutro";
    return `<span class="badge-cargo ${classe}">${cargo}</span>`;
}

function linhaRamal(item, ehAdmin, favs) {
    const favoritado = favs.includes(item.id);
    const rotuloFav = favoritado ? "Remover dos favoritos" : "Adicionar aos favoritos";
    return `
    <tr>
        <td class="celula-nome-td">
            <div class="celula-nome">
                <span class="avatar-iniciais">${iniciais(item.nome)}</span>
                <span class="nome-texto">${item.nome}</span>
                ${badgeCargo(item.cargo)}
            </div>
        </td>
        <td class="coluna-setor" data-rotulo="Setor">${item.setor}</td>
        <td class="coluna-ramal" data-rotulo="Ramal">
            <span class="chip-ramal"><i class="fa-solid fa-phone"></i>${item.ramal}</span>
        </td>
        <td>
            <div class="celula-acoes">
                <button class="btn-favorito ${favoritado ? "favoritado" : ""}"
                    onclick="toggleFavorito(${item.id})"
                    title="${rotuloFav}" aria-label="${rotuloFav}">
                    <i class="${favoritado ? "fa-solid" : "fa-regular"} fa-star"></i>
                </button>
                ${ehAdmin ? `
                <button class="editar" onclick="editar(${item.id})" title="Editar" aria-label="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="excluir" onclick="excluir(${item.id})" title="Excluir" aria-label="Excluir">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                ` : ""}
            </div>
        </td>
    </tr>
    `;
}

// ---------- LISTAR NA TELA ----------

function listar(lista = ramais) {

    const ehAdmin = (perfilAtual === "admin");
    const favs = getFavoritos();

    // Atualiza contador
    const contador = document.getElementById("contador");
    if (contador) {
        const total = ramais.length;
        contador.textContent = total === 1 ? "1 ramal" : `${total} ramais`;
    }

    // Seção de favoritos
    const secaoFavs = document.getElementById("secaoFavoritos");
    const tabelaFavs = document.getElementById("listaFavoritos");

    const itensFavoritados = ramais.filter(r => favs.includes(r.id));

    if (itensFavoritados.length > 0) {
        secaoFavs.style.display = "block";
        tabelaFavs.innerHTML = itensFavoritados
            .map(item => linhaRamal(item, ehAdmin, favs))
            .join("");
    } else {
        secaoFavs.style.display = "none";
        tabelaFavs.innerHTML = "";
    }

    // Tabela principal
    tabela.innerHTML = "";

    if (lista.length === 0) {
        tabela.innerHTML = `
        <tr class="tabela-vazia">
            <td colspan="4">
                <span class="vazio-icone"><i class="fa-regular fa-address-book"></i></span>
                <span class="vazio-titulo">Nenhum ramal encontrado</span>
                <span class="vazio-dica">Tente outro nome, setor ou número.</span>
            </td>
        </tr>
        `;
        return;
    }

    lista.forEach(item => {
        tabela.innerHTML += linhaRamal(item, ehAdmin, favs);
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
