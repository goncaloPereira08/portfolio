# Partilha Segura de Ficheiros de Saúde (mySaúde)

> Projeto de grupo · Segurança Informática · LTI, FCUL · 2025/2026
>
> **Stack:** Java · JCA/JCE · TLS (SSLSocket) · PKCS#12 / keytool

Sistema cliente-servidor para médicos enviarem documentos a utentes de forma segura. O cliente cifra, assina e verifica ficheiros localmente. O servidor guarda-os por utilizador, com controlo de acesso por função (`medico`/`utente`).

**Mecanismos de segurança implementados**
- Cifra híbrida: o ficheiro é cifrado com AES e a chave AES com a chave pública RSA do destinatário (envelope digital)
- Assinaturas digitais RSA e verificação com o certificado de quem assinou
- Canal cliente-servidor sobre TLS
- Passwords guardadas com SHA-256 e *salt* aleatório de 16 bytes (`SecureRandom`), comparadas em tempo constante
- Integridade do ficheiro de utilizadores protegida por HMAC-SHA256: o servidor recusa arrancar se o MAC não corresponder
- Distribuição de certificados pelo servidor (keystore `keystore.users`)

## Executar
```bash
javac Server/*.java Client/*.java
```
O guia completo (geração de chaves com `keytool`, registo de utilizadores e todas as opções `-e`, `-r`, `-c`, `-d`, `-a`, `-v`, `-ce`, `-rd`, `-ae`, `-rv`, `-ace`, `-rdv`) está em [`INSTRUCOES.txt`](INSTRUCOES.txt).

## Revisão para o portefólio
- O servidor passou a aceitar apenas nomes de ficheiro simples, o que impede *path traversal* (ex.: `../users`).
- Na receção de ficheiros, o servidor usa sempre a pasta do utilizador autenticado, em vez da pasta indicada pelo cliente. Antes era possível ler os ficheiros de outro utilizador.
- O cliente passou a mostrar uma mensagem clara quando a password está errada (antes surgia uma exceção interna do TLS).
- Testado de ponta a ponta: registo de utilizadores, assinar+cifrar+enviar (`-ace`) e receber+decifrar+validar (`-rdv`), recusa de envio por utentes, recusa de password errada e tentativa de *path traversal*.
