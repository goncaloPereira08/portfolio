# Bolsa de Criptomoedas Distribuída (CoinCenter)

> Projeto individual · Aplicações Distribuídas · LTI, FCUL · 2024/2025
>
> **Stack:** Python · sockets TCP · RPC (stub/skeleton com `pickle`) · Flask (REST) · SQLite · TLS 1.3 com autenticação mútua · Apache ZooKeeper (`kazoo`)

Sistema cliente-servidor onde gestores criam e removem ativos (criptomoedas) e utilizadores depositam fundos, compram e vendem ativos. O mesmo domínio foi implementado em **três fases**, cada uma com uma arquitetura de comunicação diferente:

| Fase | Pasta | Arquitetura |
|------|-------|-------------|
| 1 | [`fase1-sockets`](fase1-sockets) | Protocolo de texto próprio sobre sockets TCP |
| 2 | [`fase2-rpc`](fase2-rpc) | Camada RPC própria (stub no cliente, skeleton no servidor), mensagens serializadas, códigos de operação e servidor com `select` para vários clientes |
| 3 | [`fase3-rest`](fase3-rest) | API REST em Flask, persistência em SQLite, TLS 1.3 com certificados de cliente e notificações de novos ativos via ZooKeeper |

## Executar

### Fases 1 e 2
```bash
python3 coincenter_server.py 127.0.0.1 9999
python3 coincenter_client.py <user_id> 127.0.0.1 9999   # user_id 0 = gestor
```

### Fase 3
Requer `pip install flask requests kazoo` e um ZooKeeper em `127.0.0.1:2181` (por exemplo `docker run -p 2181:2181 zookeeper`).

```bash
# 1. Gerar a CA e os certificados (as chaves privadas não estão no repositório)
cd fase3-rest/server/chaves && ./gerar_certificados.sh

# 2. Criar a base de dados e arrancar o servidor (porta 5001, HTTPS)
cd .. && python3 setup_db.py && python3 coincenter_flask.py

# 3. Cliente
cd ../client && python3 coincenter_client.py
```

## Endpoints REST (fase 3)

`POST /client` · `POST /client/<id>/deposit` · `POST /client/<id>/withdraw` · `POST /asset` · `GET /asset/<symbol>` · `DELETE /asset/<symbol>` · `GET /assets` · `POST /assetset` · `POST /client/<id>/buy` · `POST /client/<id>/sell` · `GET /client/<id>/holdings` · `GET /client/<id>/balance` · `GET /client/<id>/transactions` (apenas gestores)

## Revisão para o portefólio
- Fase 2: o cliente mostrava "Operação realizada com sucesso" mesmo quando o servidor recusava a operação (ex.: saldo insuficiente). Passou a respeitar o resultado devolvido.
- Fase 3: compras, vendas e levantamentos passaram a correr numa transação `BEGIN IMMEDIATE`, o que evita condições de corrida entre a verificação de saldo/stock e a atualização.
- Fase 3: pedidos com campos em falta ou inválidos devolvem `400` em vez de `500`. A listagem de transações sem intervalo de datas devolve todas as transações, em vez de uma lista vazia.
- As chaves privadas e os certificados foram retirados do repositório e substituídos pelo script `gerar_certificados.sh`, que gera uma CA compatível com as validações mais recentes do Python (`keyUsage` na CA).
- Testado: API REST completa (clientes, ativos, compra/venda, permissões de gestor) e ligação mTLS — sem certificado de cliente a ligação é recusada.
