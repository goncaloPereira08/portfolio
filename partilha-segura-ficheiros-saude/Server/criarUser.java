package Server;

import java.io.*;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import java.security.cert.Certificate;
import java.nio.file.Files;
import java.nio.file.Paths;

public class criarUser {

    // Função auxiliar para calcular o MAC de um ficheiro
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

    public static void main(String[] args) {

        // Validar Argumentos passados
        if (args.length != 5 || !args[3].equals("-f")) {
            System.out.println("Erro. Uso correto: criarUser <username> <funcao> <password> -f <ficheiro cert>");
            System.exit(1);
        }

        String username = args[0];
        String funcao = args[1];
        String passwordLimpa = args[2];
        String ficheiroCert = args[4];

        // Validar a Função
        if (!funcao.equals("medico") && !funcao.equals("utente")) {
            System.out.println("Erro: A funcao tem de ser 'medico' ou 'utente'.");
            System.exit(1);
        }

        try {
            //pedir a password de MAC do servidor
            Console console = System.console();
            if (console == null) {
                System.out.println("Erro: Console nao disponivel.");
                System.exit(1);
            }
            char[] macPassArray = console.readPassword("Introduza a password de MAC do servidor: ");
            String macPassword = new String(macPassArray);

            // Verificar a integridade do ficheiro 'users' usando o MAC
            File fileUsers = new File("users");
            File fileMac = new File("mySaude.mac");

            if (fileUsers.exists()) {
                if (!fileMac.exists()) {
                    System.out.println("Erro: Ficheiro users existe, mas mySaude.mac nao encontrado.");
                    System.exit(1);
                }

                String macCalculado = calcularMac("users", macPassword);
                String macGuardado = new String(Files.readAllBytes(Paths.get("mySaude.mac"))).trim();

                if (!macCalculado.equals(macGuardado)) {
                    System.out.println("ERRO GRAVE: Integridade do ficheiro 'users' comprometida (MAC incorreto)!");
                    System.exit(1);
                }
            }

            // Verificar se o utilizador já existe
            if (fileUsers.exists()) {
                BufferedReader reader = new BufferedReader(new FileReader(fileUsers));
                String linha;
                while ((linha = reader.readLine()) != null) {
                    String[] partes = linha.split(":");
                    if (partes[0].equals(username)) {
                        System.out.println("Erro: O utilizador '" + username + "' ja existe.");
                        reader.close();
                        System.exit(1);
                    }
                }
                reader.close();
            }

            // Proteger a password do utilizador
            SecureRandom random = new SecureRandom();
            byte[] saltBytes = new byte[16];
            random.nextBytes(saltBytes);

            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(passwordLimpa.getBytes());
            md.update(saltBytes);
            byte[] hashBytes = md.digest();

            String saltBase64 = Base64.getEncoder().encodeToString(saltBytes);
            String hashBase64 = Base64.getEncoder().encodeToString(hashBytes);

            // Guardar os dados no ficheiro 'users'
            String novaLinha = username + ":" + funcao + ":" + saltBase64 + ":" + hashBase64;
            BufferedWriter writer = new BufferedWriter(new FileWriter("users", true));
            writer.write(novaLinha);
            writer.newLine();
            writer.close();

            System.out.println("Utilizador adicionado ao ficheiro com sucesso.");

            // Atualizar o ficheiro 'mySaude.mac' com o novo MAC
            String novoMac = calcularMac("users", macPassword);
            Files.write(Paths.get("mySaude.mac"), novoMac.getBytes());
            System.out.println("MAC atualizado com sucesso.");

            // Criar diretoria do utilizador
            File dirUser = new File(username);
            if (!dirUser.exists()) {
                dirUser.mkdir();
                System.out.println("Diretoria do utilizador criada.");
            }

            // Adicionar o certificado ao keystore
            File certFile = new File(ficheiroCert);
            if (!certFile.exists()) {
                System.out.println("Aviso: O ficheiro de certificado '" + ficheiroCert + "' nao existe.");
            } else {
                KeyStore ks = KeyStore.getInstance("PKCS12");
                File ksFile = new File("keystore.users");
                char[] ksPass = "keystorepass".toCharArray();

                // Carregar keystore existente ou inicializar uma nova
                if (ksFile.exists()) {
                    try (FileInputStream fis = new FileInputStream(ksFile)) {
                        ks.load(fis, ksPass);
                    }
                } else {
                    ks.load(null, ksPass); 
                }

                // Ler o certificado do ficheiro
                try (FileInputStream fis = new FileInputStream(certFile)) {
                    CertificateFactory cf = CertificateFactory.getInstance("X.509");
                    Certificate cert = cf.generateCertificate(fis);
                    
                    // O alias tem de ser o username (Simplificação do enunciado)
                    ks.setCertificateEntry(username, cert);
                }

                // Guardar a keystore
                try (FileOutputStream fos = new FileOutputStream(ksFile)) {
                    ks.store(fos, ksPass);
                }
                System.out.println("Certificado adicionado a keystore.users.");
            }

            System.out.println("Processo concluido!");

        } catch (Exception e) {
            System.out.println("Ocorreu um erro: " + e.getMessage());
            e.printStackTrace();
        }
    }
}