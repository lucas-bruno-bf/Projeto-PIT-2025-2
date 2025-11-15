// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Config Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDEbyETr4NPS2Lhqfv2HlB7R-Iko5rB100",
    authDomain: "pit-lucas-2025.firebaseapp.com",
    projectId: "pit-lucas-2025",
    storageBucket: "pit-lucas-2025.firebasestorage.app",
    messagingSenderId: "163672497703",
    appId: "1:163672497703:web:366a1fb824b8928a21f802"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos do login (só existem em login.html)
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btn-login");
const btnCadastro = document.getElementById("btn-cadastro");
const mensagem = document.getElementById("mensagem");
const linkEsqueciSenha = document.getElementById("esqueci-senha");

//Login
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const email = emailInput.value;
        const senha = senhaInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            mensagem.textContent = "Login realizado com sucesso!";
            window.location.href = "index.html";
        } catch (error) {
            mensagem.textContent = "Erro ao fazer login: " + error.message;
        }
    });
}

//Cadastro
if (btnCadastro) {
    btnCadastro.addEventListener("click", async () => {
        const email = emailInput.value;
        const senha = senhaInput.value;

        try {
            await createUserWithEmailAndPassword(auth, email, senha);
            mensagem.textContent = "Cadastro realizado com sucesso!";
            window.location.href = "index.html";
        } catch (error) {
            mensagem.textContent = "Erro ao fazer cadastro: " + error.message;
        }
    });
}

//Redefinir senha
if (linkEsqueciSenha) {
    linkEsqueciSenha.addEventListener("click", async () => {
        const email = emailInput.value;
        if (!email) {
            mensagem.textContent = "Por favor, informe seu e-mail para redefinir a senha.";
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            mensagem.textContent = "E-mail de redefinição enviado! Verifique sua caixa de entrada.";
        } catch (error) {
            mensagem.textContent = "Erro ao enviar e-mail: " + error.message;
            console.error("Erro ao enviar e-mail de redefinição:", error);
        }
    });
}
//Login com Google
const btnGoogle = document.getElementById("btn-google");

if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            mensagem.textContent = `Bem-vindo(a) ${user.displayName || user.email}!`;
            window.location.href = "index.html";
        })
        .catch((error) => {
            console.error("Erro no login com Google:", error);
            mensagem.textContent = "Erro ao fazer login com Google: " + error.message;
        });
    });
}

//Carrinho
async function adicionarAoCarrinho(nome, preco, imagem) {
    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado para comprar.");
        window.location.href = "login.html";
        return;
    }

    try {
        await addDoc(collection(db, "carrinhos", user.uid, "itens"), {
            nome,
            preco,
            imagem,
            timestamp: Date.now()
        });
        alert("Item adicionado ao carrinho!");
        atualizarContador();
    } catch (err) {
        console.error("Erro ao adicionar item:", err);
    }
}

function ativarBotoesDeCompra() {
    const botoes = document.querySelectorAll(".btn-comprar");
    botoes.forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".card");
            const nome = card.dataset.nome;
            const preco = parseFloat(card.dataset.preco);
            const imagem = card.querySelector("img").src;
            adicionarAoCarrinho(nome, preco, imagem);
        });
    });
}
ativarBotoesDeCompra();

//Carregar itens do carrinho
async function carregarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    if (!lista) return;

    const user = auth.currentUser;
    if (!user) return;

    lista.innerHTML = "<p>Carregando...</p>";

    try {
        const snap = await getDocs(collection(db, "carrinhos", user.uid, "itens"));
        lista.innerHTML = "";

        snap.forEach(docItem => {
            const item = docItem.data();
            lista.innerHTML += `
                <div class="item-carrinho">
                    <img src="${item.imagem}">
                    <h3>${item.nome}</h3>
                    <p>R$ ${item.preco.toFixed(2)}</p>
                    <button class="btn-remover" data-id="${docItem.id}">Remover</button>
                </div>
            `;
        });

        ativarRemover();
    } catch (err) {
        console.error("Erro ao carregar carrinho:", err);
        lista.innerHTML = "<p>Erro ao carregar itens.</p>";
    }
}

//Remover itens do carrinho
function ativarRemover() {
    const user = auth.currentUser;
    const botoes = document.querySelectorAll(".btn-remover");
    botoes.forEach(btn => {
        btn.addEventListener("click", async () => {
            try {
                await deleteDoc(doc(db, "carrinhos", user.uid, "itens", btn.dataset.id));
                carregarCarrinho();
                atualizarContador();
            } catch (err) {
                console.error("Erro ao remover item:", err);
            }
        });
    });
}

//Contador do carrinho
async function atualizarContador() {
    const contador = document.getElementById("contador-carrinho");
    if (!contador) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
        const snap = await getDocs(collection(db, "carrinhos", user.uid, "itens"));
        contador.textContent = snap.size;
    } catch (err) {
        console.error("Erro ao atualizar contador:", err);
    }
}

//Monitorar login
onAuthStateChanged(auth, (user) => {
    const pagina = window.location.pathname;

    const emailSpan = document.getElementById("usuario-email");
    const blocoUsuario = document.getElementById("usuario-info");
    const btnLoginMenu = document.getElementById("btn-ir-login");

    if (user) {
        if (emailSpan) emailSpan.textContent = user.email;
        if (blocoUsuario) blocoUsuario.style.display = "block";
        if (btnLoginMenu) btnLoginMenu.style.display = "none";

        atualizarContador();
        if (document.getElementById("lista-carrinho")) {
            carregarCarrinho();
        }
    } else {
        // Redireciona usuário não logado do carrinho
        if (pagina.includes("carrinho.html")) {
            window.location.href = "login.html";
        }
    }
});

//Logout global
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (err) {
        console.error("Erro ao sair:", err);
    }
};
