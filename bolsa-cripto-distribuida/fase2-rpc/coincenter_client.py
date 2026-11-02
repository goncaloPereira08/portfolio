"""
Aplicações Distribuídas - Projeto 2 - coincenter_client.py
Números de aluno: 57576
"""

import sys
import pickle
from coincenter_stub import ListStub

def show_manager_menu():
    print("\n=============== MENU GESTOR ===============")
    print("10 - ADD_ASSET <symbol> <name> <price> <supply> - Adicionar ativo")
    print("20 - GET_ALL_ASSETS - Listar todos os ativos")
    print("30 - REMOVE_ASSET <symbol> - Remover ativo")
    print("40 - EXIT - Sair")
    print("===========================================")

def show_user_menu():
    print("\n============= MENU UTILIZADOR =============")
    print("50 - GET_ALL_ASSETS - Listar todos os ativos")
    print("60 - GET_ASSETS_BALANCE - Ver saldo e carteira")
    print("70 - BUY <symbol> <quantity> - Comprar ativo")
    print("80 - SELL <symbol> <quantity> - Vender ativo")
    print("90 - EXIT - Sair")
    print("100 - DEPOSIT <amount> - Depositar fundos")
    print("110 - WITHDRAW <amount> - Levantar fundos")
    print("===========================================")

def build_command(user_id, input_str):
    parts = input_str.split()
    if not parts:
        return None
    
    try:
        cmd_code = int(parts[0])
    except ValueError:
        return None

    # Manager commands (ID = 0)
    if cmd_code == 10 and len(parts) == 5:  # ADD_ASSET
        try:
            return [10, parts[1], parts[2], float(parts[3]), int(parts[4]), int(user_id)]
        except:
            return None
            
    elif cmd_code == 20 and len(parts) == 1:  # GET_ALL_ASSETS
        return [20, int(user_id)]
        
    elif cmd_code == 30 and len(parts) == 2:  # REMOVE_ASSET
        return [30, parts[1], int(user_id)]
        
    elif cmd_code == 40 and len(parts) == 1:  # EXIT
        return [40, int(user_id)]

    # User commands (ID > 0)
    elif cmd_code == 50 and len(parts) == 1:  # GET_ALL_ASSETS
        return [50, int(user_id)]
        
    elif cmd_code == 60 and len(parts) == 1:  # GET_ASSETS_BALANCE
        return [60, int(user_id)]
        
    elif cmd_code == 70 and len(parts) == 3:  # BUY
        try:
            return [70, parts[1], float(parts[2]), int(user_id)]
        except:
            return None
            
    elif cmd_code == 80 and len(parts) == 3:  # SELL
        try:
            return [80, parts[1], float(parts[2]), int(user_id)]
        except:
            return None
            
    elif cmd_code == 90 and len(parts) == 1:  # EXIT
        return [90, int(user_id)]
        
    elif cmd_code == 100 and len(parts) == 2:  # DEPOSIT
        try:
            return [100, float(parts[1]), int(user_id)]
        except:
            return None
            
    elif cmd_code == 110 and len(parts) == 2:  # WITHDRAW
        try:
            return [110, float(parts[1]), int(user_id)]
        except:
            return None
    
    return None

def print_response(response):
    if not isinstance(response, list) or len(response) < 2:
        print("Resposta inválida do servidor.")
        return
    
    code = response[0]
    
    if code in [21, 51]:  # GET_ALL_ASSETS responses
        if len(response) > 2:
            print("\n=== ATIVOS DISPONÍVEIS ===")
            for asset in response[2:]:
                print(asset)
        else:
            print("Nenhum ativo disponível.")
            
    elif code == 61:  # GET_ASSETS_BALANCE
        if len(response) > 2:
            print("\n=== SALDO E CARTEIRA ===")
            print(response[2])  
        else:
            print("Erro ao obter saldo.")
            
    elif code in [11, 31, 71, 81, 101, 111]:
        # response[1] indica se a operação foi aceite pelo servidor
        if len(response) > 1 and response[1]:
            print("Operação realizada com sucesso!")
        else:
            print("Operação recusada (dados inválidos, saldo ou quantidade insuficiente).")
        
    elif code in [41, 91]:
        print("A sair...")

def main():
    if len(sys.argv) != 4:
        print("Uso: python3 coincenter_client.py <user_id> <server_ip> <server_port>")
        sys.exit(1)

    user_id = sys.argv[1]
    server_ip = sys.argv[2]
    server_port = int(sys.argv[3])

    try:
        stub = ListStub(server_ip, server_port)
    except Exception as e:
        print(f"Erro ao conectar ao servidor: {e}")
        sys.exit(1)

    print(f"Conectado ao servidor {server_ip}:{server_port}")
    
    if user_id == "0":
        print("Autenticado como GESTOR")
    else:
        print(f"Autenticado como UTILIZADOR (ID: {user_id})")

    while True:
        

        try:
            if user_id=="0":
                show_manager_menu()
            else:
                show_user_menu()

            input_str = input("\n> ").strip()
            if not input_str:
                continue
                
            command = build_command(user_id, input_str)
            if not command:
                print("Comando inválido. Tente novamente.")
                continue

            
            response = stub.send_command(command)
            
            if response is None:
                print("Erro: sem resposta do servidor")
                break
                
            print_response(response)
            
            # Handle exit commands
            if command[0] in [40, 90]:
                break
                
        except KeyboardInterrupt:
            print("\nA desligar cliente...")
            break
        except Exception as e:
            print(f"Erro: {e}")
            break

    stub.disconnect()
    print("Conexão terminada")

if __name__ == "__main__":
    main()