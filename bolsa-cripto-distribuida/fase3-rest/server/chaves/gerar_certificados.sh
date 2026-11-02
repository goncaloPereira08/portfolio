#!/bin/sh
# Gera uma CA local, o certificado do servidor (localhost) e o certificado do cliente.
# Executar dentro da pasta server/chaves.
set -e
openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.pem -days 365 \
  -subj "/CN=CoinCenter CA" \
  -addext "basicConstraints=critical,CA:TRUE" \
  -addext "keyUsage=critical,keyCertSign,cRLSign"
openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr -config san.cnf
openssl x509 -req -in server.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out server.crt \
  -days 365 -extensions v3_req -extfile san.cnf
openssl req -newkey rsa:2048 -nodes -keyout client.key -out client.csr -subj "/CN=client"
openssl x509 -req -in client.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out client.crt -days 365
rm -f server.csr client.csr
echo "Certificados gerados."
