// ===========================================
// ALTERNADOR DE TEMA (claro / escuro)
// A preferência fica salva no navegador do usuário.
// O tema inicial já é aplicado por um script no <head>,
// antes da primeira pintura, para não piscar.
// ===========================================

(function () {

    const raiz = document.documentElement;

    function temaAtual() {
        return raiz.getAttribute("data-tema") === "claro" ? "claro" : "escuro";
    }

    function atualizarIcones() {
        const claro = temaAtual() === "claro";

        document.querySelectorAll(".js-tema-icone").forEach(icone => {
            icone.classList.toggle("fa-moon", claro);
            icone.classList.toggle("fa-sun", !claro);
        });

        document.querySelectorAll(".js-tema").forEach(botao => {
            const rotulo = claro ? "Mudar para o tema escuro" : "Mudar para o tema claro";
            botao.setAttribute("title", rotulo);
            botao.setAttribute("aria-label", rotulo);
        });

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", claro ? "#EEF2F9" : "#070C16");
    }

    function alternar() {
        const novo = temaAtual() === "claro" ? "escuro" : "claro";
        raiz.setAttribute("data-tema", novo);

        try { localStorage.setItem("tema", novo); } catch (e) { }

        atualizarIcones();
    }

    document.querySelectorAll(".js-tema").forEach(botao => {
        botao.addEventListener("click", alternar);
    });

    atualizarIcones();

})();
