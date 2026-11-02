"""
Aplicações Distribuídas - Projeto 1 - coincenter_client.py
Números de aluno: 57576
"""

import sys
from net_client import *

def show_manager_menu():
    print("Comandos do gestor:")
    print("  ADD_ASSET;nome;símbolo;preço;oferta_disponível - Adicionar um ativo")
    print("  REMOVE_ASSET;símbolo - Remover um ativo")
    print("  GET_ALL_ASSETS - Ver todos os ativos disponíveis")
    print("  EXIT - Sair do programa cliente")


def show_user_menu():
    print("Comandos do utilizador:")
    print("  GET_ALL_ASSETS - Ver todos os ativos disponíveis")
    print("  GET_BALANCE - Ver o saldo e os ativos associados")
    print("  DEPOSIT;montante - Depositar fundos")
    print("  WITHDRAW;montante - Levantar fundos")
    print("  BUY;símbolo;quantidade - Comprar um ativo")
    print("  SELL;símbolo;quantidade - Vender um ativos")
    print("  EXIT - Sair do programa cliente")

def main():
    if len(sys.argv) != 4:
        print("Usage: python3 coincenter_client.py user_id server_ip server_port")
        sys.exit(1)

    user_id = sys.argv[1]
    server_ip = sys.argv[2]
    server_port = int(sys.argv[3])

    client_socket = create_tcp_client_socket(server_ip, server_port)

    print(f"Cliente {user_id} conectado ao servidor {server_ip} na porta {server_port}")


    if user_id == "0":
        print("És um gestor.")
        show_manager_menu()
    else:
        print(f"És um utilizador com id {user_id}.")
        show_user_menu()

    while True:
        command = input("Comando: ").strip()
        
        if command.upper() == "EXIT":
            print("Saindo do programa cliente...")
            break

        if not command:
            print("Comando vazio. Tente novamente.")
            continue

        full_command = f"{user_id};{command}"
        try:
            client_socket.send(full_command.encode('utf-8'))
            response = client_socket.recv(1024).decode('utf-8')
            print(f"Resposta do servidor: {response}")
        except OSError as e:
            print(f"Erro de comunicação com o servidor: {e}")
            break  # Sai do loop se houver erro de conexão

    # Fecha o socket apenas ao sair do programa
    client_socket.close()

if __name__ == "__main__":
    main()