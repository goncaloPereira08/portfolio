"""
Aplicações Distribuídas - Projeto 1 - coincenter_server.py
Números de aluno: 57576
"""

import sys
import signal
from net_server import *
from coincenter_data import *

### código do programa principal ###
server = None

def handle_shutdown(signum, frame):
    global server
    server.close()
    sys.exit(0)

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 coincenter_server.py server_ip server_port")
        sys.exit(1)
    
    global server

    server_ip = sys.argv[1]
    server_port = int(sys.argv[2])

    server = NetServer(server_ip, server_port)

    signal.signal(signal.SIGINT, handle_shutdown)

    while True:
        client_socket = server.accept()
        client_address = client_socket.getpeername()
        print(f"Cliente {client_address} conectado.")
        
        try:
            while True:
                command = server.recv(client_socket)
                if not command or command.strip() == "":
                    break

                print(f"Comando recebido: {command}") 

                response = ClientController.process_request(command)
                print(f"Resposta gerada: {response}") 

                server.send(client_socket, response)
        finally:
            client_socket.close()
            print(f"Cliente {client_address} desconectado.")

if __name__ == "__main__":
    main()
