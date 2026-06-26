// Protegido contra carregamento duplicado do script.
// Usa "var" + window para nunca dar "Identifier already declared".
if (!window.supabaseClient) {

    window.supabaseClient = window.supabase.createClient(
        "https://jocabqghxqghdwnjvuxi.supabase.co",
        "sb_publishable_eT1zeVu3qlibjcfUbLfnTg_zksKVSec"
    );
}

var supabase = window.supabaseClient;