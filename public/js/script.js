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

// Elementos do login
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const btnLogin = document.getElementById("btn-login");
const btnCadastro = document.getElementById("btn-cadastro");
const mensagem = document.getElementById("mensagem");
const linkEsqueciSenha = document.getElementById("esqueci-senha");
const btnGoogle = document.getElementById("btn-google");

// Função de validar e-mail
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

//Login
if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            mensagem.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        if (!validarEmail(email)) {
            mensagem.textContent = "E-mail inválido. Por favor, insira um e-mail válido.";
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, senha);
            mensagem.textContent = "Login realizado com sucesso!";
            window.location.href = "index.html";
        } catch (error) {
            mensagem.textContent = "Erro ao fazer login: " + mapErrorMessage(error.code);
        }
    });
}

//Cadastro
if (btnCadastro) {
    btnCadastro.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (!email || !senha) {
            mensagem.textContent = "Por favor, preencha todos os campos.";
            return;
        }

        if (!validarEmail(email)) {
            mensagem.textContent = "E-mail inválido. Por favor, insira um e-mail válido.";
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, senha);
            mensagem.textContent = "Cadastro realizado com sucesso!";
            window.location.href = "index.html";
        } catch (error) {
            mensagem.textContent = "Erro ao fazer cadastro: " + mapErrorMessage(error.code);
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
            mensagem.textContent = "Erro ao enviar e-mail: " + mapErrorMessage(error.code);
            console.error("Erro ao enviar e-mail de redefinição:", error);
        }
    });
}
//Login com Google

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
            mensagem.textContent = "Erro ao fazer login com Google: " + mapErrorMessage(error.code);
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
        alert("Erro ao adicionar item ao carrinho: " + mapErrorMessage(err.code));
    }
}

//Ativar botões de compra
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

// Finalizar compra
async function finalizarCompra(userId) {
    const userCarrinhoRef = collection(db, "carrinhos", userId, "itens");

    try {
        const snap = await getDocs(userCarrinhoRef);
        if (snap.empty) {
            alert("O seu carrinho está vazio. Adicione itens para comprar.");
            return;
        }

        const promises = snap.docs.map(docItem => {
            return deleteDoc(doc(db, "carrinhos", userId, "itens", docItem.id));
        });

        await Promise.all(promises);

        atualizarContador();
        alert("Compra finalizada! Obrigado por comprar conosco.");
        window.location.href = "index.html"; 
    } catch (err) {
        console.error("Erro ao finalizar a compra:", err);
        alert("Erro ao finalizar a compra: " + mapErrorMessage(err.code));
    }
}

//listener do botão finalizar
const btnFinalizar = document.getElementById("btn-finalizar");

if (btnFinalizar) {
    btnFinalizar.addEventListener("click", () => {
        const user = auth.currentUser;

        if (!user) {
            alert("Você precisa estar logado para finalizar a compra.");
            window.location.href = "login.html";
            return;
        }

        finalizarCompra(user.uid);
    });
}


//Carregar itens do carrinho
async function carregarCarrinho() {
    const lista = document.getElementById("lista-carrinho");
    const totalElement = document.getElementById("total-carrinho");
    if (!lista) return;

    const user = auth.currentUser;
    if (!user) return;

    lista.innerHTML = "<p>Carregando...</p>";

    try {
        const snap = await getDocs(collection(db, "carrinhos", user.uid, "itens"));
        lista.innerHTML = "";
        
        let total = 0;

        snap.forEach(docItem => {
            const item = docItem.data();
            total += item.preco;

            lista.innerHTML += `
                <div class="item-carrinho">
                    <img src="${item.imagem}">
                    <h3>${item.nome}</h3>
                    <p>R$ ${item.preco.toFixed(2)}</p>
                    <button class="btn-remover" data-id="${docItem.id}">Remover</button>
                </div>
            `;
        });
        
        if (totalElement) {
            totalElement.textContent = "Total: R$ " + total.toFixed(2);
        }

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


// Função para mapear os erros do Firebase
function mapErrorMessage(errorCode) {
    switch (errorCode) {
        // Erros de Autenticação
        case 'auth/invalid-email':
            return 'O formato do e-mail está incorreto. Por favor, insira um e-mail válido.';
        case 'auth/user-not-found':
            return 'Usuário não encontrado. Verifique o e-mail ou cadastre-se.'; 
        case 'auth/wrong-password':
            return 'Senha incorreta. Verifique a senha e tente novamente.';
        case 'auth/email-already-in-use':
            return 'Este e-mail já está em uso. Tente fazer login ou use outro e-mail.';
        case 'auth/weak-password':
            return 'A senha deve ter pelo menos 6 caracteres.';
        case 'auth/missing-email':
            return 'O e-mail não foi fornecido. Por favor, insira seu e-mail.';
        case 'auth/too-many-requests':
            return 'Muitas tentativas de login. Tente novamente mais tarde.';
        case 'auth/network-request-failed':
            return 'Falha na conexão. Verifique sua internet e tente novamente.';
        case 'auth/account-exists-with-different-credential':
            return 'Já existe uma conta com esse e-mail. Tente fazer login com outro método (ex.: Google).';
        // Erros de Firestore
        case 'firestore/permission-denied':
            return 'Você não tem permissão para acessar esse recurso.';
        case 'firestore/unavailable':
            return 'O banco de dados não está disponível. Tente novamente mais tarde.';
        case 'auth/operation-not-allowed':
            return 'A operação não é permitida. Entre em contato com o suporte.';
        default:
            return 'Ocorreu um erro desconhecido. Tente novamente.';
    }
}

//Logout global
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (err) {
        console.error("Erro ao sair:", err);
    }
};