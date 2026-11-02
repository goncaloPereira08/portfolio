CREATE TABLE Usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  telefone VARCHAR(10),
  role ENUM('empregado', 'cliente', 'organizador', 'doador', 'admin') NOT NULL
);

CREATE TABLE Loja (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  endereco VARCHAR(100) NOT NULL,
  telemovel VARCHAR(10) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  responsavel_id INT,
  FOREIGN KEY (responsavel_id) REFERENCES Usuario(id)
);

CREATE TABLE CatalogoEquipamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100),
  descricao VARCHAR(225)
);

CREATE TABLE Equipamento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(10) NOT NULL,
  estado ENUM('novo', 'usado', 'avariado') NOT NULL,
  preco DOUBLE(10,2) NOT NULL,
  loja_id INT,
  catalogo_id INT,
  FOREIGN KEY (loja_id) REFERENCES Loja(id),
  FOREIGN KEY (catalogo_id) REFERENCES CatalogoEquipamentos(id)
);

CREATE TABLE ProjetoBeneficente (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(225),
  organizador_id INT NOT NULL,
  FOREIGN KEY (organizador_id) REFERENCES Usuario(id)
);

CREATE TABLE ProjetoBeneficenteEquipamento (
  projeto_id INT NOT NULL,
  equipamento_id INT NOT NULL,
  PRIMARY KEY (projeto_id, equipamento_id),
  FOREIGN KEY (projeto_id) REFERENCES ProjetoBeneficente(id),
  FOREIGN KEY (equipamento_id) REFERENCES Equipamento(id)
);

CREATE TABLE EntidadeSemFinsLucrativos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  nif VARCHAR(50) NOT NULL UNIQUE,
  endereco VARCHAR(100) NOT NULL,
  telefone VARCHAR(10),
  email VARCHAR(100) NOT NULL UNIQUE,
  responsavel_id INT NOT NULL,
  FOREIGN KEY (responsavel_id) REFERENCES Usuario(id)
);

CREATE TABLE EntidadeProjeto (
  entidade_id INT NOT NULL,
  projeto_id INT NOT NULL,
  PRIMARY KEY (entidade_id, projeto_id),
  FOREIGN KEY (entidade_id) REFERENCES EntidadeSemFinsLucrativos(id),
  FOREIGN KEY (projeto_id) REFERENCES ProjetoBeneficente(id)
);

CREATE TABLE Doacao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  doador_id INT NOT NULL,
  projeto_id INT NOT NULL,
  FOREIGN KEY (doador_id) REFERENCES Usuario(id),
  FOREIGN KEY (projeto_id) REFERENCES ProjetoBeneficente(id)
);

CREATE TABLE DoacaoEquipamento (
  doacao_id INT NOT NULL,
  equipamento_id INT NOT NULL,
  PRIMARY KEY (doacao_id, equipamento_id),
  FOREIGN KEY (doacao_id) REFERENCES Doacao(id),
  FOREIGN KEY (equipamento_id) REFERENCES Equipamento(id)
);

CREATE TABLE Transacao (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tipo ENUM('compra', 'venda', 'doacao') NOT NULL,
  cliente_id INT NOT NULL,
  loja_id INT NOT NULL,
  total DOUBLE(10,2),
  FOREIGN KEY (cliente_id) REFERENCES Usuario(id),
  FOREIGN KEY (loja_id) REFERENCES Loja(id)
);

CREATE TABLE TransacaoEquipamento (
  transacao_id INT NOT NULL,
  equipamento_id INT NOT NULL,
  PRIMARY KEY (transacao_id, equipamento_id),
  FOREIGN KEY (transacao_id) REFERENCES Transacao(id),
  FOREIGN KEY (equipamento_id) REFERENCES Equipamento(id)
);

CREATE TABLE Categoria (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(225)
);

CREATE TABLE Tipo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  descricao VARCHAR(225)
);

CREATE TABLE CatalogoEquipamentosEquipamento (
  catalogo_id INT NOT NULL,
  equipamento_id INT NOT NULL,
  PRIMARY KEY (catalogo_id, equipamento_id),
  FOREIGN KEY (catalogo_id) REFERENCES CatalogoEquipamentos(id),
  FOREIGN KEY (equipamento_id) REFERENCES Equipamento(id)
);

CREATE TABLE CatalogoEquipamentosCategoria (
  catalogo_id INT NOT NULL,
  categoria_id INT NOT NULL,
  PRIMARY KEY (catalogo_id, categoria_id),
  FOREIGN KEY (catalogo_id) REFERENCES CatalogoEquipamentos(id),
  FOREIGN KEY (categoria_id) REFERENCES Categoria(id)
);

CREATE TABLE CatalogoEquipamentosTipo (
  catalogo_id INT NOT NULL,
  tipo_id INT NOT NULL,
  PRIMARY KEY (catalogo_id, tipo_id),
  FOREIGN KEY (catalogo_id) REFERENCES CatalogoEquipamentos(id),
  FOREIGN KEY (tipo_id) REFERENCES Tipo(id)
);