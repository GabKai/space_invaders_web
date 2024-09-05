// Login do Usuário
const login = () => {
    const email = document.getElementById('emailusu').value.trim();
    const senha = document.getElementById('password').value.trim();
    const lembrar = document.getElementById('lembrar').checked;
    
    const userData = JSON.parse(localStorage.getItem(email)) || {};
    const { senha: storedSenha } = userData;
    
    if (storedSenha === senha) {
        alert("Login bem-sucedido!");

        if (lembrar) {
            localStorage.setItem('loginUsu', email);
        } else {
            sessionStorage.setItem('loginUsu', email);
        }
        
        window.location.href = "home.html"; // Redireciona após login bem-sucedido
    } else {
        alert("Usuário e/ou senha inválidos");
    }
};

function logoff(){
    localStorage.removeItem('loginUsu')
    sessionStorage.removeItem('loginUsu')
    window.location.replace("login.html");
}

// Função para cadastrar um novo usuário
const registerUser = () => {
    //const usuario = document.getElementById('usu').value.trim();
    const email = document.getElementById('emailusu').value.trim();
    const senha = document.getElementById('password').value.trim();
    const nick = document.getElementById('nick').value.trim();

    const errorContainer = document.getElementById('mensagemErro-container');
    while (errorContainer.firstChild) {
        errorContainer.removeChild(errorContainer.firstChild);
    }
    
    if (!email || !senha || !nick) {
        displayFeedback("Todos os campos devem ser preenchidos!", true);
        return;
    }
    
    // Verifica se o usuário já está cadastrado
    const existingData = JSON.parse(localStorage.getItem(email)) || {};
    if (existingData.email) {
        displayFeedback("", false);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Este email já está cadastrado.";
        errorMessage.style.color = 'purple';
        errorContainer.appendChild(errorMessage);
        return;
    }
    
    // Armazena os dados do usuário
    const userData = {
        ...existingData,
        email,
        senha,
        nick
    };
    localStorage.setItem(email, JSON.stringify(userData));
    
    alert("Cadastro realizado com sucesso!");
    window.location.href = "login.html";
};

// Exibir mensagens de feedback no cadastro
const displayFeedback = (message, umErro = false) => {
    const feedback = document.getElementById('feedback');
    feedback.innerText = message;
    feedback.style.color = umErro ? 'red' : 'green';
};

const rankingList = [];
const rankingListNick = [];
const rankingListElement = document.getElementById('rankingList');

// pegar o score
window.onload = getScore();
function getScore() {
    if(sessionStorage.getItem("score")){
        let score = sessionStorage.getItem("score")
        sessionStorage.removeItem("score")

        if(localStorage.getItem("quant") == null){
            localStorage.setItem("quant", 0)
        }

        localStorage.setItem(localStorage.getItem("quant"), score)
        if(localStorage.getItem("loginUsu") != null){
            const parsedData = JSON.parse(localStorage.getItem(localStorage.getItem("loginUsu")));
            localStorage.setItem("n " + localStorage.getItem("quant"),parsedData.nick)
        }else{
            const parsedData = JSON.parse(localStorage.getItem(sessionStorage.getItem("loginUsu")));
            localStorage.setItem("n " + localStorage.getItem("quant"),parsedData.nick)
        }
        localStorage.setItem("quant", parseInt(localStorage.getItem("quant"))+1)

        
        alert("você fez " + score + " pontos!")
    }
    //localStorage.removeItem("quant")
    updateRankingList()
}

// ranking
function updateRankingList() {
    rankingListElement.innerHTML = ''; 
    for(let i = 0; i < parseInt(localStorage.getItem("quant")); i++){
        rankingList.push(parseInt(localStorage.getItem(i)))
        rankingListNick.push(localStorage.getItem("n " + i))
    }

    for(let i = 0; i < rankingList.length; i++){
        for(let j = i; j < rankingList.length; j++){
            if(rankingList[i] < rankingList[j]){
                let save = rankingList[i]
                rankingList[i] = rankingList[j]
                rankingList[j] = save

                let save2 = rankingListNick[i]
                rankingListNick[i] = rankingListNick[j]
                rankingListNick[j] = save2
            }
        }
    }

    for(let i = 0; i < rankingList.length; i++){
        const li = document.createElement('li');
        li.textContent = rankingListNick[i] + " ... " + rankingList[i];
        rankingListElement.appendChild(li);
    }
}