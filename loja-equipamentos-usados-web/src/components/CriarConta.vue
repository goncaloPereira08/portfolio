<template>
  <div>
      <header>
  <h1 @click="$router.push('/home')" style="cursor:pointer;">FromU2Me</h1>

  <!-- Botão fora do retângulo -->
  <button class="top-create-btn" @click="$router.push('/login')">
    Login
  </button>

  
</header>

    <section>
      <div id="login">
        <form @submit.prevent="submitForm">
          <div class="imgcontainer">
            <img src="/Images/smile.jpg" alt="Avatar" class="avatar" />
            <h1>Criar Conta</h1>
          </div>

          <div class="container">

            <!-- Mensagens de sucesso e erro -->
            <div v-if="successMessage" class="success">{{ successMessage }}</div>
            <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

            <label for="nome"><b>Nome</b></label>
            <input
              type="text"
              placeholder="Enter your name"
              name="nome"
              v-model="form.nome"
              required
            />

            <label for="senha"><b>Password</b></label>
            <input
              type="password"
              placeholder="Enter password"
              name="senha"
              v-model="form.senha"
              required
            />

            <label for="email"><b>Email</b></label>
            <input
              type="email"
              placeholder="Enter email"
              name="email"
              v-model="form.email"
            />
            <span v-if="errors.email" class="error">{{ errors.email }}</span>

            <label for="telefone"><b>Telefone</b></label>
            <input
              type="text"
              placeholder="Introduza um número de Telefone"
              name="telefone"
              v-model="form.telefone"
              maxlength="9"
              @input="limitarNumeros('telefone')"
            />
            <span v-if="errors.telefone" class="error">{{ errors.telefone }}</span>

            <label for="nif"><b>NIF</b></label>
            <input
              type="text"
              placeholder="Introduza um NIF"
              name="nif"
              v-model="form.nif"
              maxlength="9"
              @input="limitarNumeros('nif')"
              required
            />

            <label for="nic"><b>NIC</b></label>
            <input
              type="number"
              placeholder="Introduza um NIC"
              name="nic"
              v-model="form.nic"
              required
            />

            <label for="morada"><b>Morada</b></label>
            <input
              type="text"
              placeholder="Introduza uma morada"
              name="morada"
              v-model="form.morada"
              required
            />
            <span v-if="errors.morada" class="error">{{ errors.morada }}</span>

            <label for="genero">Gênero</label>
            <select id="genero" name="genero" v-model="form.genero">
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>

            <button type="submit">Criar Conta</button>
          </div>

          <div class="container" style="background-color:#ffffff">
            
            
            
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
  name: "CriarConta",
  data() {
    return {
      form: {
        nome: "",
        senha: "",
        email: "",
        telefone: "",
        nif: "",
        nic: "",
        morada: "",
        genero: "Masculino",
      },
      errors: {},
      successMessage: "",
      errorMessage: "",
    };
  },
  methods: {
    limitarNumeros(field) {
      this.form[field] = this.form[field].replace(/\D/g, "").slice(0, 9);
    },

    validateForm() {
      this.errors = {};

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email || !emailRegex.test(this.form.email)) {
        this.errors.email = "Email inválido. Ex: nome@dominio.com";
      }

      if (!this.form.telefone || !/^\d{9}$/.test(this.form.telefone)) {
        this.errors.telefone = "Telefone deve conter exatamente 9 dígitos.";
      }

      if (!this.form.morada || this.form.morada.trim().length === 0) {
        this.errors.morada = "Morada não pode estar vazia.";
      }

      return Object.keys(this.errors).length === 0;
    },

    async submitForm() {

     

      if (!this.validateForm()) {
        return;
      }

      this.successMessage = "";
      this.errorMessage = "";

      try {
        const response = await fetch(`${API_URL}/criar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });

        const text = await response.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Resposta inválida do servidor");
        }

        if (!response.ok) {
          throw new Error(data.error || "Erro ao registrar utilizador");
        }


        console.log("Utilizador salvo no MongoDB:", data);
        this.successMessage = "Utilizador registrado com sucesso!";
        this.resetForm();

        setTimeout(() => {
          this.$router.push("/");
        }, 1500);

      } catch (error) {
        console.error("Erro:", error);
        this.errorMessage = "Erro ao registrar Utilizador: " + error.message;
      }
    },

    cancelForm() {
      this.$router.push("/");
    },

    resetForm() {
      this.form = {
        nome: "",
        senha: "",
        email: "",
        telefone: "",
        nif: "",
        nic: "",
        morada: "",
        genero: "Masculino",
      };
      this.errors = {};
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

/* restante CSS existente */

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

.cancelbtn {
  width: auto;
  padding: 10px 18px;
  background-color: #f44336;
}

.imgcontainer img.avatar {
  width: 40%;
  border-radius: 50%;
}

form {
  border: 3px solid #f1f1f1;
}

input[type="text"],
input[type="password"],
input[type="email"],
input[type="number"],
select {
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

.success {
  color: green;
  font-weight: bold;
  margin-bottom: 10px;
}

footer {
  background: #0d6efd;
  color: #fff;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
  font-size: 14px;
}
</style>
