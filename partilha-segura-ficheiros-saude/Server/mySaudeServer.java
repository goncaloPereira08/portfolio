package Server;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.security.MessageDigest;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.SSLServerSocketFactory;
import javax.net.ssl.SSLServerSocket;

public class mySaudeServer {

    // Função auxiliar para calcular o MAC
    private static String calcularMac(String filePath, String password) throws Exception {
        File f = new File(filePath);
        if (!f.exists()) return null;

        byte[] keyBytes = password.getBytes();
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(keySpec);

        byte[] fileBytes = Files.readAllBytes(Paths.get(filePath));
        byte[] macResult = mac.doFinal(fileBytes);

        return Base64.getEncoder().encodeToString(macResult);
    }

    // Função auxiliar para autenticar o utilizador e devolver a sua função
    private static String autenticarUtilizador(String username, String passwordRecebida) {
        File fileUsers = new File("users");
        if (!fileUsers.exists()) return null;

        try (BufferedReader reader = new BufferedReader(new FileReader(fileUsers))) {
            String linha;
            while ((linha = reader.readLine()) != null) {
                String[] partes = linha.split(":");
                if (partes[0].equals(username)) {
                    String funcao = partes[1];
                    String saltBase64 = partes[2];
                    String hashGuardadaBase64 = partes[3];

                    // Descodificar o salt
                    byte[] saltBytes = Base64.getDecoder().decode(saltBase64);

                    // Calcular a hash da password recebida com o salt guardado
                    MessageDigest md = MessageDigest.getInstance("SHA-256");
                    md.update(passwordRecebida.getBytes());
                    md.update(saltBytes);
                    byte[] hashCalculadaBytes = md.digest();

                    // Descodificar a hash guardada e comparar
                    byte[] hashGuardadaBytes = Base64.getDecoder().decode(hashGuardadaBase64);

                    if (MessageDigest.isEqual(hashCalculadaBytes, hashGuardadaBytes)) {
                        return funcao; // Password correta
                    } else {
                        return null; // Password incorreta
                    }
                }
            }
        } catch (Exception e) {
            System.out.println("Erro na autenticacao: " + e.getMessage());
        }
        return null; // Utilizador não encontrado
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.out.println("Uso correto: java mySaudeServer <porto>");
            System.exit(1);
        }

        int porto = Integer.parseInt(args[0]);

        try {
            Console console = System.console();
            if (console == null) {
                System.out.println("Erro: Console nao disponivel. Corra o servidor no terminal.");
                System.exit(1);
            }
            
            //Pedir a password de MAC do servidor
            char[] macPassArray = console.readPassword("Introduza a password de MAC do servidor para iniciar: ");
            String macPassword = new String(macPassArray);

            // Verificar a integridade do ficheiro 'users' usando o MAC
            File fileUsers = new File("users");
            File fileMac = new File("mySaude.mac");

            // Se o ficheiro 'users' existir, o 'mySaude.mac' tem de existir e ser válido
            if (fileUsers.exists()) {
                if (!fileMac.exists()) {
                    System.out.println("ERRO GRAVE: Ficheiro 'users' existe, mas 'mySaude.mac' nao encontrado. O servidor recusa-se a iniciar.");
                    System.exit(1);
                }

                // Calcular o MAC atual do ficheiro 'users' e comparar com o valor guardado em 'mySaude.mac'
                String macCalculado = calcularMac("users", macPassword);
                String macGuardado = new String(Files.readAllBytes(Paths.get("mySaude.mac"))).trim();

                // Se o MAC calculado não corresponder ao guardado, recusar iniciar o servidor
                if (!macCalculado.equals(macGuardado)) {
                    System.out.println("ERRO GRAVE: Integridade do ficheiro 'users' comprometida (MAC incorreto)! O servidor vai desligar-se.");
                    System.exit(1);
                }
                System.out.println("Integridade do ficheiro 'users' validada com sucesso.");
            } else {
                System.out.println("Aviso: Ficheiro 'users' ainda nao existe. Nenhuma validacao de MAC efetuada.");
            }

            // Iniciar o servidor
            // CONFIGURAR TLS/SSL DO SERVIDOR
            System.setProperty("javax.net.ssl.keyStore", "keystore.server");
            System.setProperty("javax.net.ssl.keyStorePassword", "serverpass");

            SSLServerSocketFactory sslSsf = (SSLServerSocketFactory) SSLServerSocketFactory.getDefault();
            
            try (SSLServerSocket serverSocket = (SSLServerSocket) sslSsf.createServerSocket(porto)) {
                System.out.println("Servidor mySaude a escuta de forma SEGURA (TLS) no porto " + porto + "...");

                while (true) {
                    Socket clientSocket = serverSocket.accept();
                    tratarCliente(clientSocket);
                }
            }

        } catch (Exception e) {
            System.out.println("Erro critico no servidor: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void tratarCliente(Socket socket) {

        try (DataInputStream dis = new DataInputStream(socket.getInputStream());
             DataOutputStream dos = new DataOutputStream(socket.getOutputStream())) {
            // Ler as credenciais do cliente
            String username = dis.readUTF();
            String password = dis.readUTF();
            
            // Autenticar o utilizador
            String funcaoUser = autenticarUtilizador(username, password);

            if (funcaoUser == null) {
                dos.writeUTF("ERR_AUTH"); // Credenciais inválidas
                return; // Rejeita e fecha a ligação
            } else {
                dos.writeUTF("OK_AUTH"); // Sucesso
            }

            String operacao = dis.readUTF(); // "ENVIAR", "RECEBER" ou "PEDIR_CERT"
            String alvo = dis.readUTF();     // nome do destinatario (-t) ou username (-u)
            
            // Geatão de certificados: Se for PEDIR_CERT, o cliente quer o certificado do alvo
            if (operacao.equals("PEDIR_CERT")) {
                try {
                    java.security.KeyStore ks = java.security.KeyStore.getInstance("PKCS12");
                    try (FileInputStream fis = new FileInputStream("keystore.users")) {
                        // "keystorepass" foi a password usada no criarUser.java
                        ks.load(fis, "keystorepass".toCharArray()); 
                    }
                    java.security.cert.Certificate cert = ks.getCertificate(alvo);
                    
                    if (cert == null) {
                        dos.writeUTF("ERR_NOT_FOUND");
                    } else {
                        dos.writeUTF("OK");
                        byte[] certBytes = cert.getEncoded();
                        dos.writeInt(certBytes.length);
                        dos.write(certBytes);
                    }
                } catch (Exception e) {
                    dos.writeUTF("ERR_NOT_FOUND");
                }
                return; // O pedido de certificado é uma operação única, fecha a ligação e a thread termina
            }

            // Se não for PEDIR_CERT, continua normalmente a ler o número de ficheiros
            int numFicheiros = dis.readInt();
            
            // LÓGICA DE CONTROLO DE ACESSO
            if (operacao.equals("ENVIAR") && !funcaoUser.equals("medico")) {
                dos.writeUTF("ERR_ROLE"); // Nao e medico, nao pode enviar
                return;
            }

            // Pasta alvo para a operação.
            // Só é aceite um nome simples (sem separadores de diretoria) e, ao receber,
            // o utilizador só pode ler ficheiros da sua própria pasta.
            if (alvo.contains("/") || alvo.contains("\\") || alvo.contains("..")) {
                dos.writeUTF("ERR_DIR");
                return;
            }
            File dirAlvo = operacao.equals("RECEBER") ? new File(username) : new File(alvo);

            // Processar cada ficheiro enviado pelo cliente
            for (int i = 0; i < numFicheiros; i++) {
                // Remove qualquer componente de diretoria do nome (evita path traversal)
                String nomeFicheiro = new File(dis.readUTF()).getName();

                if (operacao.equals("ENVIAR")) {
                    if (!dirAlvo.exists() || !dirAlvo.isDirectory()) {
                        dos.writeUTF("ERR_DIR"); // Erro: Diretoria não existe
                    } else {
                        boolean conflito = false;
                        
                        //Verificar a regra de unicidade APENAS para os ficheiros de dados
                        if (!nomeFicheiro.contains(".chave.") && !nomeFicheiro.contains(".assinatura.")) {
                            
                            // Descobrir o nome base
                            String baseName = nomeFicheiro;
                            if (baseName.endsWith(".cifrado")) baseName = baseName.substring(0, baseName.length() - 8);
                            else if (baseName.endsWith(".assinado")) baseName = baseName.substring(0, baseName.length() - 9);
                            else if (baseName.endsWith(".envelope")) baseName = baseName.substring(0, baseName.length() - 9);
                            
                            // Preparar os 4 cenários possíveis de conflito
                            File fNormal = new File(dirAlvo, baseName);
                            File fCifrado = new File(dirAlvo, baseName + ".cifrado");
                            File fAssinado = new File(dirAlvo, baseName + ".assinado");
                            File fEnvelope = new File(dirAlvo, baseName + ".envelope");
                            
                            // Se algum deles já existir na pasta, temos conflito
                            if (fNormal.exists() || fCifrado.exists() || fAssinado.exists() || fEnvelope.exists()) {
                                conflito = true;
                            }
                        } else {
                            //Para chaves e assinaturas, basta ver se a cópia exata já existe
                            File fExato = new File(dirAlvo, nomeFicheiro);
                            if (fExato.exists()) {
                                conflito = true;
                            }
                        }

                        //Responder ao cliente
                        if (conflito) {
                            dos.writeUTF("ERR_EXISTS"); // O cliente vai receber isto e mostrar o erro
                        } else {
                            dos.writeUTF("OK");
                            long tamanho = dis.readLong();
                            File f = new File(dirAlvo, nomeFicheiro);
                            
                            try (FileOutputStream fos = new FileOutputStream(f)) {
                                byte[] buffer = new byte[4096];
                                int lidos;
                                long total = 0;
                                while (total < tamanho && (lidos = dis.read(buffer, 0, (int)Math.min(buffer.length, tamanho - total))) != -1) {
                                    fos.write(buffer, 0, lidos);
                                    total += lidos;
                                }
                            }
                        }
                    }
                } 
                else if (operacao.equals("RECEBER")) {
                    if (!dirAlvo.exists() || !dirAlvo.isDirectory()) {
                        dos.writeUTF("ERR_DIR");
                    } else {
                        File f = new File(dirAlvo, nomeFicheiro);
                        if (!f.exists()) {
                            dos.writeUTF("ERR_NOT_FOUND"); // Erro: Ficheiro não existe no servidor
                        } else {
                            dos.writeUTF("OK");
                            dos.writeLong(f.length());
                            
                            try (FileInputStream fis = new FileInputStream(f)) {
                                byte[] buffer = new byte[4096];
                                int lidos;
                                while ((lidos = fis.read(buffer)) != -1) {
                                    dos.write(buffer, 0, lidos);
                                }
                            }
                        }
                    }
                }
            }
        } catch (EOFException e) {
            // Cliente desligou normalmente
        } catch (IOException e) {
            System.out.println("Erro na comunicacao: " + e.getMessage());
        }
    }
}