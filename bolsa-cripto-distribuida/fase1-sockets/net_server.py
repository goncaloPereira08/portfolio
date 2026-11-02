"""
Aplicações Distribuídas - Projeto 1 - net_server.py
Números de aluno: 57576
"""
from sock_utils import *

class NetServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        try:
            self.server_socket = create_tcp_server_socket(host, port, queue_size=1)
            print(f"Servidor iniciado em {host}:{port}")
        except Exception as e:
            print(f"Erro ao iniciar o servidor: {e}")
    
    def accept(self):
        try:
            client_socket, client_address = self.server_socket.accept()
            return client_socket
        except Exception as e:
            print(f"Erro ao aceitar conexão: {e}")

    def recv(self, client_socket):
        try:
            data = client_socket.recv(1024).decode()
            return data
        except Exception as e:
            print(f"Erro ao receber dados: {e}")
    
    def send(self, client_socket, data):
        try:
            client_socket.sendall(data.encode())
        except Exception as e:
            print(f"Erro ao enviar dados: {e}")

    def close(self):
        self.server_socket.close()
        print("Servidor fechado")