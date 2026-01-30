// js/auth.js

// --- CONFIGURAÇÃO DO SUPABASE ---
// Cole suas chaves aqui dentro das aspas:
const SUPABASE_URL = "https://jbrkmuduyaibduwopxqn.supabase.co"; // Ex: https://xyz.supabase.co
const SUPABASE_KEY = "sb_publishable_TUL_4vjHuNL6O4KBUpOGrA_kh8ZmJJ4"; // Ex: eyJhbGciOi...

// Verifica se a biblioteca foi carregada no HTML
if (typeof supabase === 'undefined') {
    console.error("ERRO CRÍTICO: A biblioteca do Supabase não foi carregada. Adicione o script no HTML antes do auth.js.");
}

// Inicializa o cliente Supabase (Global para usar em outros arquivos)
const sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const Auth = {
    // Tenta fazer Login (Email + Senha)
    login: async (email, senha) => {
        try {
            const { data, error } = await sbClient.auth.signInWithPassword({
                email: email,
                password: senha,
            });

            if (error) throw error;
            return true; // Sucesso

        } catch (erro) {
            console.error("Erro Login:", erro.message);
            return false;
        }
    },

    // Cria conta nova (Usado no cadastro.html)
    criarConta: async (email, senha, nome) => {
        const { data, error } = await sbClient.auth.signUp({
            email: email,
            password: senha,
            options: { data: { full_name: nome } }
        });
        if (error) throw error;
        return data;
    },

    // Verifica se tem alguém logado agora
    estaLogado: async () => {
        const { data: { session } } = await sbClient.auth.getSession();
        return session ? session.user : null;
    },

    // Faz Logout
    logout: async () => {
        await sbClient.auth.signOut();
        window.location.href = "index.html";
    },

    // Bloqueia acesso a páginas internas
    protegerPagina: async () => {
        const usuario = await Auth.estaLogado();
        if (!usuario) {
            window.location.href = "index.html";
        }
        return usuario;
    }
};