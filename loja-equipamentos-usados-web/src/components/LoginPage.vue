<template>
  <div>
    <header>
  

  <!-- Botão fora do retângulo -->
  <button class="top-create-btn" @click="$router.push('/criar_conta')">
    Criar Conta
  </button>

</header>

    <section>
      <div id="login">
        <form @submit.prevent="handleLogin">
          <div class="imgcontainer">
            <img src="/Images/smile.jpg" alt="Avatar" class="avatar" />
            <h1>Login</h1>
          </div>

          <div class="container">
            <span v-if="errorMessage" class="error">{{ errorMessage }}</span>

            <label for="username"><b>Username</b></label>
            <input
              type="text"
              placeholder="Enter Username"
              id="username"
              v-model="username"
              required
            />

            <label for="password"><b>Password</b></label>
            <input
              type="password"
              placeholder="Enter Password"
              id="password"
              v-model="password"
              required
            />

            <button type="submit">Login</button>

            <label>
              <input type="checkbox" checked="checked" name="remember" />
              Remember me
            </label>
          </div>

          <div
            class="container"
            style="background-color:#f1f1f1; display: flex; justify-content: space-between; align-items: center;"
          >
            <span class="psw">
              <router-link to="/recuperar_senha"
                >Esqueceste-te da tua palavra-passe?</router-link
              >
            </span>
          </div>
        </form>
      </div>
    </section>

    <footer>
      <p>&copy; 2025 Loja Tech - Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<script>
import { API_URL } from '@/config';
export default {
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {

    


    async handleLogin() {
      this.errorMessage = "";

      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.username,
            password: this.password,
          }),
        });

        const data = await response.json();
        console.log("API Response:", data);

        if (response.ok && data.token) {
        const userData = {
          token: data.token,
          email: data.user?.email || '',
          nome: data.user?.nome || '',
          id: data.user?.id || ''
        };
        localStorage.setItem('user', JSON.stringify(userData));
        this.$router.push("/home");
      } else {
        this.errorMessage = data.message || "Usuário ou senha incorretos.";
      }

      } catch (error) {
        this.errorMessage = "Erro ao conectar com o servidor.";
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>

header {
  background: #0d6efd;
  padding: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 0 0 10px 10px;
  margin-bottom: 30px;
}

h1 {
  margin: 10;
  font-weight: 700;
  font-size: 1.8rem;
  color: #ffffff;
}

/* Botão "Criar Conta" fora da barra central */
.top-create-btn {
  position: absolute;
  top: auto;
  right: 20px;
  background-color: white;
  color: #0d6efd;
  border: 2px solid white;
  padding: 8px 16px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  width: auto !important;
}

.top-create-btn:hover {
  background-color: #0d6efd;
  color: white;
  border-color: #ffffff;
}


/* Barra central de navegação */
nav.nav-container {
  max-width: max-content;
  margin: 0 auto 40px auto;
  background: #0d6efd;
  border: 2px solid white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  box-sizing: border-box;
}

ul.nav-center {
  list-style: none;
  display: flex;
  gap: auto;
  margin: 0;
  padding: 0;
  flex-grow: 1;
  justify-content: center;
}

ul.nav-center li a {
  color: white;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 10px 15px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

ul.nav-center li a:hover {
  background-color: #084298;
  cursor: pointer;
}





.nav-right {
  margin-left: auto;
}

.nav-right button {
  background-color: white;
  color: #0d6efd;
  border: 3px solid #0d6efd;
  padding: 12px 25px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-right button:hover {
  background-color: #0d6efd;
  color: white;
  border-color: white;
}

/* Login Form */
.imgcontainer {
  text-align: center;
  margin: 20px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  max-width: 400px;
  margin: auto;
  margin-bottom: 10px;
}

button {
  background-color: #04aa6d;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
}

button:hover {
  opacity: 0.8;
}

.imgcontainer img.avatar {
  width: 40%;
  border-radius: 50%;
}

form {
  border: 3px solid #f1f1f1;
}


input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.error {
  color: red;
  font-size: 0.85rem;
  margin-top: -8px;
  margin-bottom: 10px;
  display: block;
}

footer {
  background: #0d6efd;
  color: #fff;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  font-size: 14px;
}

.psw {
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
}

.psw router-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  margin-left: 4px;
}

.psw router-link:hover {
  text-decoration: underline;
}

/* Responsivo */
@media (max-width: 600px) {
  nav.nav-container {
    flex-direction: column;
    gap: 10px;
  }

  ul.nav-center {
    justify-content: center;
  }

  .nav-right {
    margin-left: 0;
  }

  .nav-right button {
    width: 100%;
  }
}
</style>