"""
Aplicações Distribuídas - Projeto 1 - net_client.py
Números de aluno: 57576
"""
from sock_utils import *

class NetClient:
    def __init__(self, id, host, port):
        self.id = id
        self.host = host
        self.port = port
        try:
            self.sock = create_tcp_client_socket(host, port)
            print(f"Cliente {id} conectado ao servidor {host}:{port}")
        except Exception as e:
            print(f"Falha ao conectar ao servidor: {e}")
            self.close()
     
    def send(self, data):
        try:
            self.sock.sendall(data.encode())
        except Exception as e:
            print(f"Falha ao enviar dados: {e}")
            self.close()

    def recv(self):
        try:
            data = self.sock.recv(1024).decode()
            if not data:
                self.close()
                return None
            return data
        except Exception as e:
            print(f"Falha ao receber dados: {e}")
            self.close()
            return None
    
    def close(self):
        if self.sock:
            self.sock.close()
            self.sock = None
            print(f"Cliente {self.id} desconectado.")