package Client;

import java.io.*;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.PublicKey;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.SSLSocket;

public class mySaude {

    // Função para obter certificado no local ou no servidor
    private static java.security.cert.Certificate obterCertificado(String destinatario, KeyStore kstore, String username, String password, String serverAddress, int serverPort) throws Exception {
        // 1. Tenta procurar na keystore local primeiro
        java.security.cert.Certificate cert = kstore.getCertificate(destinatario);
        if (cert != null) {
            return cert; // Já o temos localmente
        }
        
        System.out.println("Certificado de '" + destinatario + "' nao encontrado localmente. A pedir ao servidor...");
        
        if (serverAddress == null || serverPort == -1) {
            System.out.println("Erro: Faltam argumentos de rede (-s) para ir buscar o certificado ao servidor.");
            System.exit(1);
        }

        // =========================================================
        // CORREÇÃO: Dizer a esta ligação TLS onde está a TrustStore
        // =========================================================
        System.setProperty("javax.net.ssl.trustStore", "keystore." + username);
        System.setProperty("javax.net.ssl.trustStorePassword", password);

        SSLSocketFactory sslSf = (SSLSocketFactory) SSLSocketFactory.getDefault();
        try (SSLSocket socket = (SSLSocket) sslSf.createSocket(serverAddress, serverPort);
             DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
             DataInputStream dis = new DataInputStream(socket.getInputStream())) {
             
             // Autenticar no servidor
             dos.writeUTF(username);
             dos.writeUTF(password);
             if (dis.readUTF().equals("ERR_AUTH")) {
                 System.out.println("Erro: Falha na autenticacao ao pedir certificado ao servidor.");
                 System.exit(1);
             }
             
             // Fazer o pedido do certificado
             dos.writeUTF("PEDIR_CERT");
             dos.writeUTF(destinatario);
             
             if (dis.readUTF().equals("OK")) {
                 int tamanho = dis.readInt();
                 byte[] certBytes = new byte[tamanho];
                 dis.readFully(certBytes);
                 
                 // Converter os bytes recebidos num objeto Certificate
                 java.security.cert.CertificateFactory cf = java.security.cert.CertificateFactory.getInstance("X.509");
                 cert = cf.generateCertificate(new ByteArrayInputStream(certBytes));
                 
                 // Guardar na keystore local permanentemente
                 kstore.setCertificateEntry(destinatario, cert);
                 try (FileOutputStream fos = new FileOutputStream("keystore." + username)) {
                     kstore.store(fos, password.toCharArray());
                 }
                 System.out.println("Sucesso: Certificado de '" + destinatario + "' descarregado e guardado na keystore local.");
                 return cert;
             } else {
                 System.out.println("Erro: O servidor nao possui o certificado de '" + destinatario + "'.");
                 System.exit(1);
             }
        }
        return null;
    }

    public static void main(String[] args) throws Exception {

        String serverAddress = null;
        int serverPort = -1;
        String username = null;
        String destinatario = null;
        String password = null; 

        List<String> ficheirosAEnviar = new ArrayList<>();
        List<String> ficheirosAReceber = new ArrayList<>();
        List<String> ficheirosACifrar = new ArrayList<>();   
        List<String> ficheirosADecifrar = new ArrayList<>(); 
        List<String> ficheirosACifrarEEnviar = new ArrayList<>();
        List<String> ficheirosAReceberEDecifrar = new ArrayList<>();
        List<String> ficheirosAAssinar = new ArrayList<>();
        List<String> ficheirosAVerificar = new ArrayList<>();
        List<String> ficheirosAAssinarEEnviar = new ArrayList<>();
        List<String> ficheirosAReceberEVerificar = new ArrayList<>();
        List<String> ficheirosACifrarAssinarEEnviar = new ArrayList<>();
        List<String> ficheirosAReceberDecifrarEVerificar = new ArrayList<>();

        //Ler argumentos
        for (int i = 0; i < args.length; i++) {
            if (args[i].equals("-s") && i + 1 < args.length) {
                String[] partes = args[i + 1].split(":");
                serverAddress = partes[0];
                serverPort = Integer.parseInt(partes[1]);
            } else if (args[i].equals("-u") && i + 1 < args.length) {
                username = args[i + 1];
            } else if (args[i].equals("-t") && i + 1 < args.length) {
                destinatario = args[i + 1];
            } else if (args[i].equals("-p") && i + 1 < args.length) { 
                password = args[i + 1];
            } else if (args[i].equals("-e")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAEnviar.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-r")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAReceber.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-c")) { 
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosACifrar.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-d")) { 
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosADecifrar.add(args[i]);
                    i++;
                }
                i--;
            }else if (args[i].equals("-ce")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) { 
                    ficheirosACifrarEEnviar.add(args[i]);
                    i++;
                } 
                i--;
            } else if (args[i].equals("-rd")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAReceberEDecifrar.add(args[i]);
                    i++;
                } 
                i--;
            }else if (args[i].equals("-a")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAAssinar.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-v")) {
                i++; 
                while (i < args.length && !args[i].startsWith("-")) { 
                    ficheirosAVerificar.add(args[i]); 
                    i++; 
                } 
                i--;
            } else if (args[i].equals("-ae")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAAssinarEEnviar.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-rv")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAReceberEVerificar.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-ace")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosACifrarAssinarEEnviar.add(args[i]);
                    i++;
                }
                i--;
            } else if (args[i].equals("-rdv")) {
                i++;
                while (i < args.length && !args[i].startsWith("-")) {
                    ficheirosAReceberDecifrarEVerificar.add(args[i]);
                    i++;
                }
                i--;
            }
        }

        //(-ce)
        if (username == null) {
            System.out.println("Erro: Falta argumento obrigatorio (-u).");
            System.exit(1);
        }

        if (!ficheirosACifrarEEnviar.isEmpty()) {
            if (password == null || destinatario == null || serverAddress == null) {
                System.out.println("Erro: Faltam argumentos (-p, -t ou -s).");
                return;
            }
            
            System.out.println("A iniciar Cifra Hibrida para envio...");
            
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }

            //Ir buscar Certificado Público do Destinatário
            java.security.cert.Certificate cert = obterCertificado(destinatario, kstore, username, password, serverAddress, serverPort);
            PublicKey pubKey = cert.getPublicKey();
            Cipher rsaCipher = Cipher.getInstance("RSA");
            rsaCipher.init(Cipher.ENCRYPT_MODE, pubKey);

            KeyGenerator kg = KeyGenerator.getInstance("AES");
            kg.init(128);

            //Cifrar cada ficheiro da lista
            for (String fName : ficheirosACifrarEEnviar) {
                File fOrig = new File(fName);
                if (!fOrig.exists()) {
                    System.out.println("Erro: Ficheiro '" + fName + "' nao existe.");
                    continue;
                }
                
                SecretKey aesKey = kg.generateKey();
                
                // Gravar Chave AES Cifrada com RSA
                byte[] chaveCifrada = rsaCipher.doFinal(aesKey.getEncoded());
                String nomeFicheiroChave = fName + ".chave." + destinatario;
                try (FileOutputStream kos = new FileOutputStream(nomeFicheiroChave)) {
                    kos.write(chaveCifrada);
                }

                // Cifrar Dados com AES
                Cipher aesCipher = Cipher.getInstance("AES");
                aesCipher.init(Cipher.ENCRYPT_MODE, aesKey);
                String nomeFicheiroCifrado = fName + ".cifrado";
                
                try (FileInputStream fis = new FileInputStream(fOrig);
                     FileOutputStream fos = new FileOutputStream(nomeFicheiroCifrado);
                     CipherOutputStream cos = new CipherOutputStream(fos, aesCipher)) {
                     byte[] buffer = new byte[4096];
                     int lidos;
                     while ((lidos = fis.read(buffer)) != -1) cos.write(buffer, 0, lidos);
                }
                
                System.out.println("Preparado localmente: " + nomeFicheiroCifrado + " e " + nomeFicheiroChave);

                // Adiciona os dois ficheiros gerados à lista de envio
                ficheirosAEnviar.add(nomeFicheiroCifrado);
                ficheirosAEnviar.add(nomeFicheiroChave);
            }

        }

        //(-a)
        if (!ficheirosAAssinar.isEmpty()) {
            if (password == null) {
                System.out.println("Erro: Falta a password (-p) para aceder a chave privada e assinar.");
                System.exit(1);
            }
            
            System.out.println("A iniciar processo de assinatura digital...");
            
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            
            //Ir buscar Chave Privada do Próprio
            PrivateKey privKey = (PrivateKey) kstore.getKey(username, password.toCharArray());
            
            //Preparar a "Máquina" de assinaturas (SHA256 com RSA)
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initSign(privKey);

            for (String fName : ficheirosAAssinar) {
                File fOrig = new File(fName);
                if (!fOrig.exists()) {
                    System.out.println("Erro: Ficheiro '" + fName + "' nao existe.");
                    continue;
                }
                
                //Le o ficheiro e alimenta a máquina de assinaturas
                signature.update(fOrig.getName().getBytes()); // Fix: Agarrar a assinatura ao nome do ficheiro
                try (FileInputStream fis = new FileInputStream(fOrig)) {
                    byte[] buffer = new byte[4096];
                    int lidos;
                    while ((lidos = fis.read(buffer)) != -1) {
                        signature.update(buffer, 0, lidos);
                    }
                }
                
                //O ficheiro acabou, gera o carimbo final
                byte[] bytesDaAssinatura = signature.sign();
                
                //Guarda o carimbo num ficheiro separado
                String nomeAssinatura = fName + ".assinatura." + username;
                try (FileOutputStream fos = new FileOutputStream(nomeAssinatura)) {
                    fos.write(bytesDaAssinatura);
                }
                
                System.out.println("Sucesso: Ficheiro '" + fName + "' assinado! Gerado: " + nomeAssinatura);
            }
        }

        //(-v)
        else if (!ficheirosAVerificar.isEmpty()) {
            // O destinatario (-t) aqui representa quem supostamente assinou o ficheiro
            if (password == null || destinatario == null) {
                System.out.println("Erro: Faltam argumentos (-p ou -t) para verificar assinaturas.");
                System.exit(1);
            }
            
            System.out.println("A iniciar verificacao de assinatura digital...");
            
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            
            //Vai buscar o certificado publico de quem assinou o ficheiro
            java.security.cert.Certificate cert = obterCertificado(destinatario, kstore, username, password, serverAddress, serverPort);
            PublicKey pubKey = cert.getPublicKey();
            
            //Preparar a máquina de assinaturas para VERIFICAR (usando a Chave Pública do assinante)
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initVerify(pubKey);

            for (String fName : ficheirosAVerificar) {
                File fOrig = new File(fName);
                String nomeAssinatura = fName + ".assinatura." + destinatario;
                File fAssinatura = new File(nomeAssinatura);
                
                if (!fOrig.exists() || !fAssinatura.exists()) {
                    System.out.println("Erro: Ficheiro original '" + fName + "' ou a assinatura '" + nomeAssinatura + "' nao existem.");
                    continue;
                }
                
                //Ler o ficheiro original e passar os bytes para a máquina recalcular o Hash
                signature.update(fOrig.getName().getBytes()); // Fix: Atualizar a maquina com o nome original esperado
                try (FileInputStream fis = new FileInputStream(fOrig)) {
                    byte[] buffer = new byte[4096];
                    int lidos;
                    while ((lidos = fis.read(buffer)) != -1) {
                        signature.update(buffer, 0, lidos);
                    }
                }
                
                //Ler os bytes do ficheiro de assinatura (o carimbo)
                byte[] bytesDaAssinatura = new byte[(int) fAssinatura.length()];
                try (FileInputStream fisAssinatura = new FileInputStream(fAssinatura)) {
                    fisAssinatura.read(bytesDaAssinatura);
                }
                
                //Validação, compara o carimbo do ficheiro com o que a máquina de assinaturas recalculou.
                boolean isValida = signature.verify(bytesDaAssinatura);
                
                if (isValida) {
                    System.out.println("Sucesso: A assinatura de '" + fName + "' e VALIDA! O ficheiro e legitimo e foi assinado por '" + destinatario + "'.");
                } else {
                    System.out.println("ALERTA: A assinatura de '" + fName + "' e INVALIDA! O ficheiro foi alterado ou a assinatura e falsa.");
                }
            }
        }

        //(-ace)
        if (!ficheirosACifrarAssinarEEnviar.isEmpty()) {
            if (password == null || serverAddress == null || destinatario == null) {
                System.out.println("Erro: Faltam argumentos (-p, -t ou -s) para o Envelope Seguro.");
                System.exit(1);
            }
            
            System.out.println("A preparar Envelope Seguro (Assinar e Cifrar)...");
            
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            
            //Ferramentas para ASSINAR (A nossa Chave Privada)
            PrivateKey privKey = (PrivateKey) kstore.getKey(username, password.toCharArray());
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initSign(privKey);
            
            //Ferramentas para CIFRAR a Chave AES (A Chave Pública do Destinatário)
            java.security.cert.Certificate certDest = obterCertificado(destinatario, kstore, username, password, serverAddress, serverPort);
            PublicKey pubKeyDest = certDest.getPublicKey();
            Cipher rsaCipher = Cipher.getInstance("RSA");
            rsaCipher.init(Cipher.ENCRYPT_MODE, pubKeyDest);
            
            KeyGenerator kg = KeyGenerator.getInstance("AES");
            kg.init(128);

            for (String fName : ficheirosACifrarAssinarEEnviar) {
                File fOrig = new File(fName);
                if (!fOrig.exists()) {
                    System.out.println("Erro: Ficheiro '" + fName + "' nao existe.");
                    continue;
                }
                
                //Assinar o original
                signature.update(fOrig.getName().getBytes()); // Fix: Agarrar a assinatura ao nome do ficheiro
                try (FileInputStream fis = new FileInputStream(fOrig)) {
                    byte[] buffer = new byte[4096]; int lidos;
                    while ((lidos = fis.read(buffer)) != -1) signature.update(buffer, 0, lidos);
                }
                byte[] bytesDaAssinatura = signature.sign();
                String nomeAssinatura = fName + ".assinatura." + username;
                try (FileOutputStream fos = new FileOutputStream(nomeAssinatura)) {
                    fos.write(bytesDaAssinatura);
                }
                
                //Gerar Chave AES e Cifrá-la
                SecretKey aesKey = kg.generateKey();
                byte[] chaveCifrada = rsaCipher.doFinal(aesKey.getEncoded());
                String nomeFicheiroChave = fName + ".chave." + destinatario;
                try (FileOutputStream kos = new FileOutputStream(nomeFicheiroChave)) {
                    kos.write(chaveCifrada);
                }
                
                //Cifrar o Documento (Gerar o .envelope)
                Cipher aesCipher = Cipher.getInstance("AES");
                aesCipher.init(Cipher.ENCRYPT_MODE, aesKey);
                String nomeEnvelope = fName + ".envelope";
                try (FileInputStream fis = new FileInputStream(fOrig);
                     FileOutputStream fos = new FileOutputStream(nomeEnvelope);
                     CipherOutputStream cos = new CipherOutputStream(fos, aesCipher)) {
                     byte[] buffer = new byte[4096]; int lidos;
                     while ((lidos = fis.read(buffer)) != -1) cos.write(buffer, 0, lidos);
                }
                
                System.out.println("Sucesso: Envelope fechado para '" + fName + "'!");
                
                //Enviar os 3 ficheiros
                ficheirosAEnviar.add(nomeEnvelope);
                ficheirosAEnviar.add(nomeFicheiroChave);
                ficheirosAEnviar.add(nomeAssinatura);
            }
        }

        //(-ae)
        if (!ficheirosAAssinarEEnviar.isEmpty()) {
            if (password == null || serverAddress == null || destinatario == null) {
                System.out.println("Erro: Faltam argumentos (-p, -t ou -s).");
                System.exit(1);
            }
            
            System.out.println("A iniciar processo de assinatura digital...");
            
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            
            //Ir buscar Chave Privada do Próprio
            PrivateKey privKey = (PrivateKey) kstore.getKey(username, password.toCharArray());
            
            //Preparar a "Máquina" de assinaturas (SHA256 com RSA)
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initSign(privKey);

            for (String fName : ficheirosAAssinarEEnviar) {
                File fOrig = new File(fName);
                if (!fOrig.exists()) {
                    System.out.println("Erro: Ficheiro '" + fName + "' nao existe.");
                    continue;
                }
                
                //Le o ficheiro e alimenta a máquina de assinaturas
                signature.update(fOrig.getName().getBytes()); // Fix: Agarrar a assinatura ao nome do ficheiro
                try (FileInputStream fis = new FileInputStream(fOrig)) {
                    byte[] buffer = new byte[4096];
                    int lidos;
                    while ((lidos = fis.read(buffer)) != -1) {
                        signature.update(buffer, 0, lidos);
                    }
                }
                
                //O ficheiro acabou, gera o carimbo final
                byte[] bytesDaAssinatura = signature.sign();
                
                //Guarda o carimbo num ficheiro separado
                String nomeAssinatura = fName + ".assinatura." + username;
                try (FileOutputStream fos = new FileOutputStream(nomeAssinatura)) {
                    fos.write(bytesDaAssinatura);
                }
                System.out.println("Sucesso: Ficheiro '" + fName + "' assinado! Gerado: " + nomeAssinatura);

                String nomeAssinado = fName + ".assinado";
                try (FileInputStream fisCopy = new FileInputStream(fOrig);
                     FileOutputStream fosCopy = new FileOutputStream(nomeAssinado)) {
                     byte[] bufferCopy = new byte[4096];
                     int lidosCopy;
                     while ((lidosCopy = fisCopy.read(bufferCopy)) != -1) {
                         fosCopy.write(bufferCopy, 0, lidosCopy);
                     }
                }
                
                ficheirosAEnviar.add(nomeAssinado);
                ficheirosAEnviar.add(nomeAssinatura);

                
            }
        }

        //(-c)
        if (!ficheirosACifrar.isEmpty()) {
            if (password == null || destinatario == null) {
                System.out.println("Erro: Faltam argumentos (-p ou -t).");
                System.exit(1);
            }
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            // Ir buscar Certificado Público do Destinatário
            java.security.cert.Certificate cert = obterCertificado(destinatario, kstore, username, password, serverAddress, serverPort);
            PublicKey pubKey = cert.getPublicKey();
            Cipher rsaCipher = Cipher.getInstance("RSA");
            rsaCipher.init(Cipher.ENCRYPT_MODE, pubKey);

            KeyGenerator kg = KeyGenerator.getInstance("AES");
            kg.init(128);

            for (String fName : ficheirosACifrar) {
                File fOrig = new File(fName);
                if (!fOrig.exists()) {
                    System.out.println("Erro: Ficheiro '" + fName + "' nao existe.");
                    continue;
                }
                SecretKey aesKey = kg.generateKey();
                
                // Gravar Chave AES Cifrada com RSA
                byte[] chaveCifrada = rsaCipher.doFinal(aesKey.getEncoded());
                String nomeFicheiroChave = fName + ".chave." + destinatario;
                try (FileOutputStream kos = new FileOutputStream(nomeFicheiroChave)) {
                    kos.write(chaveCifrada);
                }

                // Cifrar Dados com AES
                Cipher aesCipher = Cipher.getInstance("AES");
                aesCipher.init(Cipher.ENCRYPT_MODE, aesKey);
                String nomeFicheiroCifrado = fName + ".cifrado";
                
                try (FileInputStream fis = new FileInputStream(fOrig);
                     FileOutputStream fos = new FileOutputStream(nomeFicheiroCifrado);
                     CipherOutputStream cos = new CipherOutputStream(fos, aesCipher)) {
                     byte[] buffer = new byte[4096];
                     int lidos;
                     while ((lidos = fis.read(buffer)) != -1) cos.write(buffer, 0, lidos);
                }
                System.out.println("Sucesso: '" + fName + "' cifrado! Gerados: " + nomeFicheiroCifrado + " e " + nomeFicheiroChave);
            }
        }

        //(-d)
        else if (!ficheirosADecifrar.isEmpty()) {
            if (password == null) {
                System.out.println("Erro: Faltam argumentos (-p).");
                System.exit(1);
            }
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            // Ir buscar Chave Privada do Próprio
            PrivateKey privKey = (PrivateKey) kstore.getKey(username, password.toCharArray());
            Cipher rsaCipher = Cipher.getInstance("RSA");
            rsaCipher.init(Cipher.DECRYPT_MODE, privKey);

            for (String fNomeCifrado : ficheirosADecifrar) {
                if (!fNomeCifrado.endsWith(".cifrado")) {
                    System.out.println("Erro: O ficheiro '" + fNomeCifrado + "' nao termina em .cifrado");
                    continue;
                }
                String nomeOriginal = fNomeCifrado.substring(0, fNomeCifrado.length() - 8);
                String nomeFicheiroChave = nomeOriginal + ".chave." + username;

                File fChave = new File(nomeFicheiroChave);
                if (!fChave.exists()) {
                    System.out.println("Erro: O ficheiro de chave '" + nomeFicheiroChave + "' nao existe.");
                    continue;
                }

                // Decifrar Chave AES com RSA
                byte[] chaveCifrada = new byte[(int) fChave.length()];
                try (FileInputStream fisKey = new FileInputStream(fChave)) {
                    fisKey.read(chaveCifrada);
                }
                byte[] chaveAesBytes = rsaCipher.doFinal(chaveCifrada);
                SecretKeySpec aesKey = new SecretKeySpec(chaveAesBytes, "AES");

                // Decifrar Dados com AES
                Cipher aesCipher = Cipher.getInstance("AES");
                aesCipher.init(Cipher.DECRYPT_MODE, aesKey);

                try (FileInputStream fis = new FileInputStream(fNomeCifrado);
                     CipherInputStream cis = new CipherInputStream(fis, aesCipher);
                     FileOutputStream fos = new FileOutputStream(nomeOriginal)) {
                     byte[] buffer = new byte[4096];
                     int lidos;
                     while ((lidos = cis.read(buffer)) != -1) fos.write(buffer, 0, lidos);
                }
                System.out.println("Sucesso: '" + fNomeCifrado + "' decifrado para '" + nomeOriginal + "'!");
            }
        }

        //(-rd)

        if (!ficheirosAReceberEDecifrar.isEmpty()) {
            if (password == null || serverAddress == null) {
                System.out.println("Erro: Falta a password (-p) ou o endereço do servidor (-s) para decifrar os ficheiros.");
                System.exit(1);
            }
            // Para cada ficheiro base indicado, vamos assumir que queremos receber o par (.cifrado + .chave) do servidor
            for (String fName : ficheirosAReceberEDecifrar) {
                String fCifrado = fName.endsWith(".cifrado") ? fName : fName + ".cifrado";
                String baseName = fCifrado.substring(0, fCifrado.length() - 8);
                String keyName = baseName + ".chave." + username;
                
                ficheirosAReceber.add(fCifrado);
                ficheirosAReceber.add(keyName);
            }
        }

        //(-rdv)
        if (!ficheirosAReceberDecifrarEVerificar.isEmpty()) {
            if (password == null || destinatario == null) {
                System.out.println("Erro: Faltam argumentos (-p ou -t) para o Envelope Seguro.");
                System.exit(1);
            }
            for (String fName : ficheirosAReceberDecifrarEVerificar) {
                String fEnvelope = fName.endsWith(".envelope") ? fName : fName + ".envelope";
                String baseName = fEnvelope.substring(0, fEnvelope.length() - 9);
                String keyName = baseName + ".chave." + username;
                String assName = baseName + ".assinatura." + destinatario;
                
                ficheirosAReceber.add(fEnvelope);
                ficheirosAReceber.add(keyName);
                ficheirosAReceber.add(assName);
            }
        }

        //(-rv)
        if (!ficheirosAReceberEVerificar.isEmpty()) {
            if (password == null || destinatario == null) {
                System.out.println("Erro: Falta a password (-p) ou o autor (-t) para validar os ficheiros.");
                System.exit(1);
            }
            for (String fName : ficheirosAReceberEVerificar) {
                // O ficheiro que vem da rede tem a extensão .assinado
                String fAssinado = fName.endsWith(".assinado") ? fName : fName + ".assinado";
                String baseName = fAssinado.substring(0, fAssinado.length() - 9);
                String nomeAssinatura = baseName + ".assinatura." + destinatario;
                
                ficheirosAReceber.add(fAssinado);
                ficheirosAReceber.add(nomeAssinatura);
            }
        }


        //(-e) e (-r)
        else if (!ficheirosAEnviar.isEmpty() || !ficheirosAReceber.isEmpty()) {

            if (serverAddress == null || serverPort == -1) {
                System.out.println("Erro: Faltam argumentos obrigatorios (-s) para usar a rede.");
                System.exit(1);
            }

            // Fase 2: Precisamos da password para falar com o servidor
            if (password == null) {
                System.out.println("Erro: Falta a password (-p) para se autenticar no servidor.");
                System.exit(1);
            }

            // CONFIGURA TLS/SSL DO CLIENTE
            // O cliente confia no servidor se o certificado dele estiver na keystore do utilizador
            System.setProperty("javax.net.ssl.trustStore", "keystore." + username);
            System.setProperty("javax.net.ssl.trustStorePassword", password);

            SSLSocketFactory sslSf = (SSLSocketFactory) SSLSocketFactory.getDefault();

            // Estabelecer ligacao segura (TLS) ao servidor
            try (SSLSocket socket = (SSLSocket) sslSf.createSocket(serverAddress, serverPort);
                 DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
                 DataInputStream dis = new DataInputStream(socket.getInputStream())) {

                // Fase 2: Enviar credenciais para autentica
                dos.writeUTF(username);
                dos.writeUTF(password);

                // Aguardar resposta do servidor sobre a autentica
                String respostaAuth = dis.readUTF();
                if (respostaAuth.equals("ERR_AUTH")) {
                    System.out.println("Erro: Autenticacao falhou! Username ou password incorretos.");
                    return; // Termina o programa
                }
                System.out.println("Autenticacao no servidor bem sucedida!");


                //(-e)
                if (!ficheirosAEnviar.isEmpty() && destinatario != null) {
                    
                    // Filtrar os ficheiros que existem no nosso computador
                    List<File> ficheirosValidos = new ArrayList<>();
                    for (String fname : ficheirosAEnviar) {
                        File f = new File(fname);
                        if (!f.exists()) {
                            System.out.println("Erro: Ficheiro local '" + fname + "' nao existe. A saltar...");
                        } else {
                            ficheirosValidos.add(f);
                        }
                    }

                    dos.writeUTF("ENVIAR");
                    dos.writeUTF(destinatario);
                    dos.writeInt(ficheirosValidos.size());

                    for (File f : ficheirosValidos) {
                        dos.writeUTF(f.getName());
                        String resposta = dis.readUTF();

                        // Fase 2: Verificar se o servidor aceitou o ficheiro para envio
                        if (resposta.equals("ERR_ROLE")) {
                            System.out.println("Erro: Acesso negado! Apenas medicos podem enviar ficheiros para o servidor.");
                            break; // Aborta o envio
                        } else if (resposta.equals("ERR_DIR")) {
                            System.out.println("Erro: Diretoria do destinatario '" + destinatario + "' nao existe no servidor!");
                            continue; // Se a pasta n o existe, continua a tentar os restantes
                        } else if (resposta.equals("ERR_EXISTS")) {
                            System.out.println("Erro: Ficheiro '" + f.getName() + "' ja existe no servidor. A saltar...");
                        } else if (resposta.equals("OK")) {
                            dos.writeLong(f.length());
                            try (FileInputStream fis = new FileInputStream(f)) {
                                byte[] buffer = new byte[4096];
                                int lidos;
                                while ((lidos = fis.read(buffer)) != -1) {
                                    dos.write(buffer, 0, lidos);
                                }
                            }
                            System.out.println("Sucesso: Ficheiro '" + f.getName() + "' enviado!");
                        }
                    }
                }

                //(-r)
                else if (!ficheirosAReceber.isEmpty()) {
                    
                    // Filtrar para n o substituirmos ficheiros que j  temos
                    List<String> ficheirosValidos = new ArrayList<>();
                    for (String fname : ficheirosAReceber) {
                        File f = new File(fname);
                        if (f.exists()) {
                            System.out.println("Erro: Ficheiro '" + fname + "' ja existe localmente. A saltar...");
                        } else {
                            ficheirosValidos.add(fname);
                        }
                    }

                    dos.writeUTF("RECEBER");
                    dos.writeUTF(username); // Quando recebemos, a pasta alvo   a nossa pr pria pasta (-u)
                    dos.writeInt(ficheirosValidos.size());

                    for (String fName : ficheirosValidos) {
                        dos.writeUTF(fName);
                        String resposta = dis.readUTF();

                        if (resposta.equals("ERR_DIR")) {
                            System.out.println("Erro: A sua diretoria ('" + username + "') nao existe no servidor!");
                            break;// Se a pasta do cliente n o existe, n o adianta tentar os restantes ficheiros
                        } else if (resposta.equals("ERR_NOT_FOUND")) {
                            System.out.println("Erro: Ficheiro '" + fName + "' nao encontrado no servidor. A saltar...");
                        } else if (resposta.equals("OK")) {
                            long tamanho = dis.readLong();
                            File f = new File(fName);
                            try (FileOutputStream fos = new FileOutputStream(f)) {
                                byte[] buffer = new byte[4096];
                                int lidos;
                                long total = 0;
                                while (total < tamanho && (lidos = dis.read(buffer, 0, (int)Math.min(buffer.length, tamanho - total))) != -1) {
                                    fos.write(buffer, 0, lidos);
                                    total += lidos;
                                }
                            }
                            System.out.println("Sucesso: Ficheiro '" + fName + "' recebido!");
                        }
                    }
                }

            } catch (IOException e) {
                if (e.getCause() instanceof java.security.NoSuchAlgorithmException) {
                    // A password abre a keystore local, que serve de truststore TLS
                    System.out.println("Erro: password incorreta ou keystore local invalida.");
                } else {
                    System.out.println("Erro na ligacao ao servidor: " + e.getMessage());
                }
            }
        }

        //(-rd)
        if (!ficheirosAReceberEDecifrar.isEmpty()) {
            System.out.println("A iniciar decifragem dos ficheiros recebidos...");
            
            //Abrir Keystore do utilizador
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            // Ir buscar Chave Privada do Pr prio
            PrivateKey privKey = (PrivateKey) kstore.getKey(username, password.toCharArray());
            Cipher rsaCipher = Cipher.getInstance("RSA");
            rsaCipher.init(Cipher.DECRYPT_MODE, privKey);
            //Verifica os pares de ficheiros (.cifrado + .chave) para cada ficheiro base indicado
            for (String fName : ficheirosAReceberEDecifrar) {
                String fCifrado = fName.endsWith(".cifrado") ? fName : fName + ".cifrado";
                String baseName = fCifrado.substring(0, fCifrado.length() - 8);
                String keyName = baseName + ".chave." + username;

                File fFicheiroCifrado = new File(fCifrado);
                File fFicheiroChave = new File(keyName);

                if (!fFicheiroCifrado.exists() || !fFicheiroChave.exists()) {
                    System.out.println("Erro: Nao decifrado. Ficheiros '" + fCifrado + "' e/ou '" + keyName + "' em falta.");
                    continue;
                }
                // Decifrar Chave AES com RSA
                byte[] chaveCifrada = new byte[(int) fFicheiroChave.length()];
                try (FileInputStream fisKey = new FileInputStream(fFicheiroChave)) {
                    fisKey.read(chaveCifrada);
                }
                byte[] chaveAesBytes = rsaCipher.doFinal(chaveCifrada);
                SecretKeySpec aesKey = new SecretKeySpec(chaveAesBytes, "AES");

                Cipher aesCipher = Cipher.getInstance("AES");
                aesCipher.init(Cipher.DECRYPT_MODE, aesKey);

                File fOriginalDecifrado = new File(baseName);
                try (FileInputStream fis = new FileInputStream(fFicheiroCifrado);
                     CipherInputStream cis = new CipherInputStream(fis, aesCipher);
                     FileOutputStream fos = new FileOutputStream(fOriginalDecifrado)) {
                     byte[] buffer = new byte[4096];
                     int lidos;
                     while ((lidos = cis.read(buffer)) != -1) fos.write(buffer, 0, lidos);
                }
                System.out.println("Sucesso Total: Ficheiro '" + baseName + "' recebido e decifrado!");
            }
        }
        //(-rv)
        if (!ficheirosAReceberEVerificar.isEmpty()) {
            System.out.println("A iniciar validacao dos ficheiros recebidos...");
            
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            
            java.security.cert.Certificate cert = obterCertificado(destinatario, kstore, username, password, serverAddress, serverPort);
            PublicKey pubKey = cert.getPublicKey();
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initVerify(pubKey);

            for (String fName : ficheirosAReceberEVerificar) {
                String fAssinado = fName.endsWith(".assinado") ? fName : fName + ".assinado";
                String baseName = fAssinado.substring(0, fAssinado.length() - 9);
                String nomeAssinatura = baseName + ".assinatura." + destinatario;

                File fFicheiroAssinado = new File(fAssinado);
                File fFicheiroAssinatura = new File(nomeAssinatura);

                if (!fFicheiroAssinado.exists() || !fFicheiroAssinatura.exists()) {
                    System.out.println("Erro: Nao validado. Ficheiros '" + fAssinado + "' e/ou '" + nomeAssinatura + "' em falta.");
                    continue;
                }

                //Le o ficheiro recebido e passar a maquina de assinaturas
                signature.update(baseName.getBytes()); // Corrigido: Atualizar a maquina com o nome original do ficheiro
                try (FileInputStream fis = new FileInputStream(fFicheiroAssinado)) {
                    byte[] buffer = new byte[4096]; int lidos;
                    while ((lidos = fis.read(buffer)) != -1) signature.update(buffer, 0, lidos);
                }
                
                //Le o carimbo da assinatura
                byte[] bytesDaAssinatura = new byte[(int) fFicheiroAssinatura.length()];
                try (FileInputStream fisAssinatura = new FileInputStream(fFicheiroAssinatura)) {
                    fisAssinatura.read(bytesDaAssinatura);
                }
                
                //Valida
                if (signature.verify(bytesDaAssinatura)) {
                    // Se for v lido, renomeamos o ".assinado" para o nome normal para o utilizador poder ler!
                    File fOriginalFinal = new File(baseName);
                    fFicheiroAssinado.renameTo(fOriginalFinal);
                    System.out.println("Sucesso Total: Ficheiro '" + baseName + "' recebido e a assinatura de '" + destinatario + "' e VALIDA!");
                } else {
                    System.out.println("ALERTA MAXIMO: A assinatura de '" + baseName + "' e INVALIDA! Ficheiro corrompido ou adulterado.");
                }
            }
        }

        //(-rdv)
        if (!ficheirosAReceberDecifrarEVerificar.isEmpty()) {
            System.out.println("A abrir o Envelope Seguro (Decifrar e Validar)...");
            
            KeyStore kstore = KeyStore.getInstance("PKCS12");
            try (FileInputStream kfile = new FileInputStream("keystore." + username)) {
                kstore.load(kfile, password.toCharArray());
            }
            
            //Chave Privada (para Decifrar a chave AES)
            PrivateKey privKey = (PrivateKey) kstore.getKey(username, password.toCharArray());
            Cipher rsaCipher = Cipher.getInstance("RSA");
            rsaCipher.init(Cipher.DECRYPT_MODE, privKey);
            
            //Chave P blica do assinante (para Verificar)
            java.security.cert.Certificate cert = obterCertificado(destinatario, kstore, username, password, serverAddress, serverPort);
            PublicKey pubKey = cert.getPublicKey();
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initVerify(pubKey);

            for (String fName : ficheirosAReceberDecifrarEVerificar) {
                String fEnvelope = fName.endsWith(".envelope") ? fName : fName + ".envelope";
                String baseName = fEnvelope.substring(0, fEnvelope.length() - 9);
                String keyName = baseName + ".chave." + username;
                String assName = baseName + ".assinatura." + destinatario;

                File fFicheiroEnvelope = new File(fEnvelope);
                File fFicheiroChave = new File(keyName);
                File fFicheiroAssinatura = new File(assName);

                if (!fFicheiroEnvelope.exists() || !fFicheiroChave.exists() || !fFicheiroAssinatura.exists()) {
                    System.out.println("Erro: Ficheiros do envelope em falta para '" + baseName + "'.");
                    continue;
                }

                //Decifrar a chave AES
                byte[] chaveCifrada = new byte[(int) fFicheiroChave.length()];
                try (FileInputStream fisKey = new FileInputStream(fFicheiroChave)) {
                    fisKey.read(chaveCifrada);
                }
                byte[] chaveAesBytes = rsaCipher.doFinal(chaveCifrada);
                SecretKeySpec aesKey = new SecretKeySpec(chaveAesBytes, "AES");

                //Decifrar o .envelope para obter o documento original leg
                Cipher aesCipher = Cipher.getInstance("AES");
                aesCipher.init(Cipher.DECRYPT_MODE, aesKey);
                File fOriginalDecifrado = new File(baseName);
                try (FileInputStream fis = new FileInputStream(fFicheiroEnvelope);
                     CipherInputStream cis = new CipherInputStream(fis, aesCipher);
                     FileOutputStream fos = new FileOutputStream(fOriginalDecifrado)) {
                     byte[] buffer = new byte[4096]; int lidos;
                     while ((lidos = cis.read(buffer)) != -1) fos.write(buffer, 0, lidos);
                }
                
                //Verificar a assinatura usando o documento acabado de decifrar
                signature.update(baseName.getBytes()); // Fix: Atualizar a maquina com o nome original do ficheiro
                try (FileInputStream fis = new FileInputStream(fOriginalDecifrado)) {
                    byte[] buffer = new byte[4096]; int lidos;
                    while ((lidos = fis.read(buffer)) != -1) signature.update(buffer, 0, lidos);
                }
                byte[] bytesDaAssinatura = new byte[(int) fFicheiroAssinatura.length()];
                try (FileInputStream fisAssinatura = new FileInputStream(fFicheiroAssinatura)) {
                    fisAssinatura.read(bytesDaAssinatura);
                }
                
                if (signature.verify(bytesDaAssinatura)) {
                    System.out.println("SUCESSO: Envelope aberto! O ficheiro '" + baseName + "' e legitimo, intacto e protegido.");
                } else {
                    System.out.println("ALERTA: A assinatura de '" + baseName + "' e INVALIDA! Ficheiro corrompido.");
                }
            }
        }


    }
}