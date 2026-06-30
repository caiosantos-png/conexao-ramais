// ===========================================
// LOGIN FIXO - usuário único, senha diferencia o perfil
// ===========================================

const USUARIO_VALIDO = "conexao rastreadores";

const SENHA_ADMIN = "Ceu_Azul_03#Cafe*Rio";
const SENHA_COLABORADOR = "#Cafe*Rio";

const telaLogin = document.getElementById("telaLogin");
const appContainer = document.getElementById("appContainer");
const erroLogin = document.getElementById("erroLogin");

let perfilAtual = null; // "admin" ou "colaborador"

// Verifica se já tem login feito nesta aba (sessionStorage some ao fechar a aba/navegador)
function verificarSessao() {

    const perfilSalvo = sessionStorage.getItem("perfil");

    if (perfilSalvo === "admin" || perfilSalvo === "colaborador") {
        perfilAtual = perfilSalvo;
        liberarAcesso();
    }
}

function liberarAcesso() {

    telaLogin.style.display = "none";
    appContainer.style.display = "block";

    aplicarPermissoes();

    // carregarRamais() é definida no script.js; protegido caso a ordem de
    // carregamento dos arquivos varie.
    if (typeof carregarRamais === "function") {
        carregarRamais();
    }
}

// Mostra/esconde os botões de ação dependendo do perfil
function aplicarPermissoes() {

    const elementosAdmin = document.querySelectorAll(".somente-admin");

    elementosAdmin.forEach(el => {
        el.style.display = (perfilAtual === "admin") ? "" : "none";
    });
}

document.getElementById("btnEntrar").onclick = () => {

    const usuario = document.getElementById("loginUsuario").value.trim().toLowerCase();
    const senha = document.getElementById("loginSenha").value;

    erroLogin.textContent = "";

    if (usuario !== USUARIO_VALIDO) {
        erroLogin.textContent = "Usuário ou senha inválidos.";
        return;
    }

    if (senha === SENHA_ADMIN) {
        perfilAtual = "admin";
    } else if (senha === SENHA_COLABORADOR) {
        perfilAtual = "colaborador";
    } else {
        erroLogin.textContent = "Usuário ou senha inválidos.";
        return;
    }

    sessionStorage.setItem("perfil", perfilAtual);

    liberarAcesso();
}

// Permite logar apertando Enter no campo de senha
document.getElementById("loginSenha").addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        document.getElementById("btnEntrar").click();
    }
});

verificarSessao();

// ---------- SAIR (LOGOUT) ----------

document.getElementById("btnSair").onclick = () => {

    sessionStorage.removeItem("perfil");
    perfilAtual = null;

    document.getElementById("loginUsuario").value = "";
    document.getElementById("loginSenha").value = "";

    appContainer.style.display = "none";
    telaLogin.style.display = "flex";
}
