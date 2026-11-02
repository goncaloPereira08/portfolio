"""
Aplicações Distribuídas - Projeto 3 - coincenter_client.py
Números de aluno: 57576
"""

import sys
import requests
from kazoo.client import KazooClient
from kazoo.recipe.watchers import ChildrenWatch
import threading
import os

COMMANDS = """
Comandos disponíveis:
ASSET <SYMBOL> <NAME> <PRICE> <QUANTITY>   - Adiciona novo asset
ASSET <SYMBOL>                             - Consulta asset
ASSETSET <SYMBOL1> <SYMBOL2> ...           - Consulta vários assets
LOGIN <NUMBER>                             - Cria novo cliente (0=manager, >0=cliente)
USER [ID]                                  - Mostra saldo e holdings do user
BUY <SYMBOL> <QUANTITY>                    - Compra asset
SELL <SYMBOL> <QUANTITY>                   - Vende asset
DEPOSIT <AMOUNT>                           - Deposita fundos
WITHDRAW <AMOUNT>                          - Levanta fundos
TRANSACTIONS <START> <END>                 - (Manager) Lista transações entre datas
EXIT                                       - Sair
"""

# --- Caminhos seguros para os certificados ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHAVES_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "server", "chaves"))
base_url = "https://localhost:5001"
CLIENT_CERT = (os.path.join(CHAVES_DIR, "client.crt"), os.path.join(CHAVES_DIR, "client.key"))
CA_CERT = os.path.join(CHAVES_DIR, "ca.pem")
# --------------------------------------------

# --- ZOOKEEPER SETUP ---
def start_zk_watcher():
    zk = KazooClient(hosts='127.0.0.1:2181')
    zk.start()

    def on_assets_change(children):
        print("\n[ZooKeeper] Ativos disponíveis atualizados:")
        for symbol in children:
            data, stat = zk.get(f"/assets/{symbol}")
            name, price, available_quantity = data.decode().split(";")
            print(f"  {symbol}: {name}, preço={price}, quantidade={available_quantity}")
        print(COMMANDS, end="")

    # Watch para /assets
    ChildrenWatch(zk, "/assets", func=on_assets_change)

    # Mantém o watcher a correr
    threading.Event().wait()

# --- Arranca o watcher em background ---
def main():
    # Arranca watcher ZooKeeper numa thread separada
    watcher_thread = threading.Thread(target=start_zk_watcher, daemon=True)
    watcher_thread.start()

    client_id = None

    print("Bem-vindo ao CoinCenter!")
    print(COMMANDS)
    while True:
        cmd = input("> ").strip()
        if not cmd:
            print(COMMANDS)
            continue

        parts = cmd.split()
        command = parts[0].upper()

        try:
            if command == "ASSET":
                if len(parts) == 2:
                    r = requests.get(
                        f"{base_url}/asset/{parts[1]}",
                        cert=CLIENT_CERT,
                        verify=CA_CERT
                    )
                    print(r.json())
                elif len(parts) == 5:
                    payload = {
                        "asset_symbol": parts[1],
                        "asset_name": parts[2],
                        "price": float(parts[3]),
                        "available_quantity": int(parts[4])
                    }
                    r = requests.post(
                        f"{base_url}/asset",
                        json=payload,
                        cert=CLIENT_CERT,
                        verify=CA_CERT
                    )
                    print(r.json())
                else:
                    print("Uso: ASSET <SYMBOL> ou ASSET <SYMBOL> <NAME> <PRICE> <QUANTITY>")
            elif command == "ASSETSET":
                symbols = parts[1:]
                r = requests.post(
                    f"{base_url}/assetset",
                    json={"symbols": symbols},
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print(r.json())
            elif command == "LOGIN":
                if len(parts) > 1 and parts[1].isdigit():
                    n = int(parts[1])
                    is_manager = 1 if n == 0 else 0
                    r = requests.post(
                        f"{base_url}/client",
                        json={"is_manager": is_manager},
                        cert=CLIENT_CERT,
                        verify=CA_CERT
                    )
                    resp = r.json()
                    print(resp)
                    if "client_id" in resp:
                        client_id = resp["client_id"]
                        print(f"Novo client_id ativo: {client_id}")
                else:
                    print("Uso: LOGIN <NÚMERO>")
            elif command == "USER":
                uid = int(parts[1]) if len(parts) > 1 else client_id
                r1 = requests.get(
                    f"{base_url}/client/{uid}/balance",
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                r2 = requests.get(
                    f"{base_url}/client/{uid}/holdings",
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print("Balance:", r1.json())
                print("Holdings:", r2.json())
            elif command == "BUY":
                if not client_id:
                    print("Por favor, faça LOGIN primeiro.")
                    continue
                r = requests.post(
                    f"{base_url}/client/{client_id}/buy",
                    json={
                        "asset_symbol": parts[1],
                        "quantity": float(parts[2])
                    },
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print(r.json())
            elif command == "SELL":
                if not client_id:
                    print("Por favor, faça LOGIN primeiro.")
                    continue
                r = requests.post(
                    f"{base_url}/client/{client_id}/sell",
                    json={
                        "asset_symbol": parts[1],
                        "quantity": float(parts[2])
                    },
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print(r.json())
            elif command == "DEPOSIT":
                if not client_id:
                    print("Por favor, faça LOGIN primeiro.")
                    continue
                r = requests.post(
                    f"{base_url}/client/{client_id}/deposit",
                    json={"amount": float(parts[1])},
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print(r.json())
            elif command == "WITHDRAW":
                if not client_id:
                    print("Por favor, faça LOGIN primeiro.")
                    continue
                r = requests.post(
                    f"{base_url}/client/{client_id}/withdraw",
                    json={"amount": float(parts[1])},
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print(r.json())
            elif command == "TRANSACTIONS":
                if not client_id:
                    print("Por favor, faça LOGIN primeiro.")
                    continue
                if len(parts) == 3:
                    start = parts[1] + " 00:00:00"
                    end = parts[2] + " 23:59:59"
                elif len(parts) == 5:
                    start = parts[1] + " " + parts[2]
                    end = parts[3] + " " + parts[4]
                else:
                    print("Uso: TRANSACTIONS <START_DATE> <START_HOUR> <END_DATE> <END_HOUR>")
                    print("Ou:  TRANSACTIONS <START_DATE> <END_DATE>")
                    continue
                r = requests.get(
                    f"{base_url}/client/{client_id}/transactions",
                    params={"start_time": start, "end_time": end},
                    cert=CLIENT_CERT,
                    verify=CA_CERT
                )
                print(r.json())
            elif command == "EXIT":
                break
            else:
                print("Comando desconhecido.")
        except Exception as e:
            print("Erro:", e)
        print(COMMANDS)

if __name__ == "__main__":
    main()
