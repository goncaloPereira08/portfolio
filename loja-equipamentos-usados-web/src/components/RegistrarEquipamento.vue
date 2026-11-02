<template>
  <div>
    <header>
      <h1 @click="$router.push('/home')" style="cursor:pointer;">FromU2Me</h1>

      <button class="top-create-btn" @click="loginOrRegister">
        Login / Criar Conta
      </button>

      <nav class="nav-container">
        <ul class="nav-center">
          <li><a href="/home">Início</a></li>
          <li><a href="/home#produtos">Produtos</a></li>
          <li><a href="/home#contato">Contato</a></li>
          <li><a href="/addToCatalog">Adicionar Catálogo</a></li>
          <li><a href="/registroEquipamento" style="cursor:pointer;">Registar Equipamento</a></li>
        </ul>
        
      </nav>
    </header>

    <section>
      <div id="login">
        <form @submit.prevent="submitForm">
          <div class="imgcontainer">
            <img src="/Images/smile.jpg" alt="Avatar" class="avatar" />
            <h1>Registar Equipamento</h1>
          </div>

          <div class="container">
            <!-- Mensagens -->
            <div v-if="successMessage" class="success">{{ successMessage }}</div>
            <div v-if="errorMessage" class="error">{{ errorMessage }}</div>

            <!-- Nome -->
            <label for="nome">Nome</label>
            <input type="text" placeholder="Nome do equipamento" v-model="form.nome" required />

            <!-- Estado -->
            <label for="estado">Estado</label>
            <select required v-model="form.estado">
              <option disabled value="">Selecionar estado</option>
              <option value="novo">Novo</option>
              <option value="usado">Usado</option>
              <option value="avariado">Avariado</option>
            </select>

            <!-- Marca -->
            <label for="marca">Marca</label>
            <select required v-model="form.marca">
              <option disabled value="">Selecione uma marca</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Nokia">Nokia</option>
              <option value="Outra">Outra</option>
            </select>

            <!-- Modelo -->
            <label for="modelo">Modelo</label>
            <input type="text" placeholder="Introduza um modelo" v-model="form.modelo" required />

            <!-- Preço -->
            <label for="preco">Preço</label>
            <input type="number" placeholder="Introduza um preço" v-model="form.preco" required />

            <!-- Loja ID -->
            <label for="loja_id">Loja</label>
            <select v-model="form.loja_id" required>
              <option disabled value="">Selecione uma loja</option>
              <option v-for="loja in lojas" :key="loja._id" :value="loja._id">
                {{ loja.nome }} (ID: {{ loja._id }})
              </option>
            </select>

            <!-- Catálogo ID -->
            <label for="catalogo_id">Catálogo</label>
            <select v-model="form.catalogo_id" required>
              <option disabled value="">Selecione um catálogo</option>
              <option v-for="catalogo in catalogos" :key="catalogo._id" :value="catalogo._id">
                {{ catalogo.nome }} (ID: {{ catalogo._id }})
              </option>
            </select>

            <!-- Botões -->
            <button type="submit">Registrar Equipamento</button>
            <button type="button" class="cancelbtn" @click="voltar">Voltar</button>
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
  name: "CriarEquipamento",
  data() {
    return {
      form: {
        nome: "",
        marca: "",
        modelo: "",
        estado: "",
        preco: "",
        loja_id: "",
        catalogo_id: "",
      },
      lojas: [],
      catalogos: [],
      successMessage: "",
      errorMessage: "",
      user: null,
    };
  },
  async mounted() {
    try {
      const [lojasRes, catalogosRes] = await Promise.all([
        fetch(`${API_URL}/lojas`),
        fetch(`${API_URL}/catalogos`),
      ]);

      this.lojas = await lojasRes.json();
      this.catalogos = await catalogosRes.json();

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    } catch (err) {
      console.error("Erro ao carregar lojas/catalogos:", err);
      this.errorMessage = "Erro ao carregar dados.";
    }
  },
  methods: {
    loginOrRegister() {
      // Redireciona para a página de login ou criação de conta
      this.$router.push("/login");
    },
    async submitForm() {
      this.successMessage = "";
      this.errorMessage = "";

      try {
        const response = await fetch(`${API_URL}/equipamentos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.form),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Erro ao registrar equipamento");

        this.successMessage = "Equipamento registrado com sucesso!";
        this.resetForm();
      } catch (error) {
        console.error("Erro:", error);
        this.errorMessage = "Erro ao registrar equipamento: " + error.message;
      }
    },
    resetForm() {
      this.form = {
        nome: "",
        marca: "",
        modelo: "",
        estado: "",
        preco: "",
        loja_id: "",
        catalogo_id: "",
      };
    },
    voltar() {
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
/* Header */
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

/* Form container - deixa a caixa do formulário igual à dos outros */
#login form {
  background-color: white;
  max-width: 450px;
  margin: 0 auto 40px auto;
  padding: 30px 35px;
  border: 3px solid #f1f1f1;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgb(0 0 0 / 0.1);
  box-sizing: border-box;
}

/* Título e imagem do avatar */
.imgcontainer {
  text-align: center;
  margin-bottom: 30px;
}

img.avatar {
  width: 40%;
  border-radius: 50%;
  margin-bottom: 15px;
}

h1 {
  margin: 10;
  font-weight: 700;
  font-size: 1.8rem;
  color: #ffffff;
}

/* Inputs e selects estilo uniforme */
input[type="text"],
input[type="number"],
select {
  width: 100%;
  padding: 12px 20px;
  margin: 10px 0 20px 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
  font-size: 1rem;
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="number"]:focus,
select:focus {
  border-color: #0d6efd;
  outline: none;
}

/* Labels */
label {
  font-weight: 600;
  color: #555;
}

/* Botões */
button[type="submit"],
button.cancelbtn {
  width: 100%;
  padding: 14px 20px;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: opacity 0.3s ease;
  margin-top: 10px;
}

button[type="submit"] {
  background-color: #0d6efd;
  color: white;
}

button[type="submit"]:hover {
  background-color: #084298;
}

button.cancelbtn {
  background-color: #f44336;
  color: white;
  border: none;
}

button.cancelbtn:hover {
  opacity: 0.85;
}

/* Mensagens */
.success {
  color: green;
  font-weight: 700;
  margin-bottom: 15px;
  text-align: center;
}

.error {
  color: red;
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-align: center;
}

/* Footer */
footer {
  background: #0d6efd;
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 14px;
  margin-top: 50px;
  border-radius: 10px 10px 0 0;
}

/* Responsividade */
@media (max-width: 480px) {
  nav.nav-container {
    flex-direction: column;
    gap: 10px;
  }

  ul.nav-center {
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-right button {
    width: 100%;
  }

  #login form {
    padding: 20px;
    margin: 20px 10px 40px 10px;
  }
}
</style>