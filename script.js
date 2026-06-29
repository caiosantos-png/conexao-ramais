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

function listar(lista = ramais) {

    tabela.innerHTML = "";

    const ehAdmin = (perfilAtual === "admin");

    lista.forEach((item) => {
        tabela.innerHTML += `
        <tr>

        <td>${item.nome}</td>

        <td>${item.setor}</td>

        <td>${item.ramal}</td>

        <td>
            ${ehAdmin ? `
            <button class="editar" onclick="editar(${item.id})">
            ✏️
            </button>

            <button class="excluir" onclick="excluir(${item.id})">
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
                ramal: ramal.value
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
                ramal: ramal.value
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
