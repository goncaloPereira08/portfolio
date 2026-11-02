<template>
  <div>
    <header>
      <h1 @click="$router.push('/home')" style="cursor:pointer;">FromU2Me</h1>
    </header>

    <div class="button-container">
      <button @click="goToCriarConta()">Criar Conta</button>
      <button @click="goToLogin()">Login</button>
    </div>


    <footer>
      <p>&copy; 2025 Loja Tech - Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script >
export default {
  name: 'InicioComponent',

 
  methods: {

    goToHome() {
      this.$router.push('/home'); // Redireciona para a página inicial
    },
  
  goToLogin() {
    this.$router.push('/login');
  },
  
  goToCriarConta() {
    this.$router.push('/criar_conta');
  }
}
};



</script>

<style scoped>
body {
    font-family: 'Poppins', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f8f9fa;
    color: #333;
}
header {
    background: #0d6efd;
    color: #fff;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
nav ul {
    list-style: none;
    padding: 0;
    display: flex;
    justify-content: center;
    gap: 20px;
}
nav ul li {
    display: inline;
}
nav ul li a {
    color: #fff;
    text-decoration: none;
    font-weight: bold;
}
.banner {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(to right, #0d6efd, #6610f2);
    color: #fff;
}
.produtos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
    
}


footer {
    background: #0d6efd;
    color: #fff;
    text-align: center;
    padding: 20px;
    margin-top: 40px;
    font-size: 14px;
}

form {
    border: 3px solid #f1f1f1;
  }
  
  /* Full-width inputs */
  input[type=text], input[type=password] {
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    display: inline-block;
    border: 1px solid #ccc;
    box-sizing: border-box;
  }
  
  /* Set a style for all buttons */
  button {
    background-color: #04AA6D;
    color: white;
    padding: 14px 20px;
    margin: 8px 0;
    border: none;
    cursor: pointer;
    width: 100%;
  }
  
  /* Add a hover effect for buttons */
  button:hover {
    opacity: 0.8;
  }
  
  /* Extra style for the cancel button (red) */
  .cancelbtn {
    width: auto;
    padding: 10px 18px;
    background-color: #f44336;
  }
  
  /* Center the avatar image inside this container */
  .imgcontainer {
    text-align: center;
    margin: 24px 0 12px 0;
  }
  
  /* Avatar image */
  img.avatar {
    width: 40%;
    border-radius: 50%;
  }
  
  /* Add padding to containers */
  .container {
    padding: 16px;
  }
  
  /* The "Forgot password" text */
  span.psw {
    float: right;
    padding-top: 16px;
  }
  
  /* Change styles for span and cancel button on extra small screens */
  @media screen and (max-width: 300px) {
    span.psw {
      display: block;
      float: none;
    }
    .cancelbtn {
      width: 100%;
    }
  }

 
  .button-container {
  display: flex;
  flex-direction: column; /* Coloca um botão em cima do outro */
  align-items: center;     /* Alinha horizontalmente ao centro */
  justify-content: center;
  margin: 40px 0;
  gap: 10px; /* Espaço entre os botões */
}

.button-container button {
  width: 200px; /* Largura fixa para os botões */
}
</style>
