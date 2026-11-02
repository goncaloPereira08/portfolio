"""
Aplicações Distribuídas - Projeto 2 - net_server.py
Números de aluno: 57576
"""
from sock_utils import *
import select

class NetServer:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.clients = {}  # Dicionário para guardar conexões
        try:
            self.server_socket = create_tcp_server_socket(host, port, queue_size=5)
            print(f"Servidor iniciado em {host}:{port}")
        except Exception as e:
            print(f"Erro ao iniciar o servidor: {e}")
            raise
    
    def run(self, skeleton):
        inputs = [self.server_socket]
        while True:
            readable, _, exceptional = select.select(inputs, [], inputs)
            
            for s in readable:
                if s is self.server_socket:
                    client_socket, addr = s.accept()
                    inputs.append(client_socket)
                    self.clients[client_socket] = addr
                    print(f"Nova conexão de {addr} (Total: {len(self.clients)})")
                else:
                    try:
                        response = skeleton.processMessage(s)
                        if response:
                            s.sendall(response)
                    except Exception as e:
                        print(f"Erro: {e} - Desconectando {self.clients.get(s, 'cliente desconhecido')}")
                        inputs.remove(s)
                        s.close()
                        if s in self.clients:
                            print(f"Conexão encerrada: {self.clients[s]} (Total: {len(self.clients)-1})")
                            del self.clients[s]
            
            for s in exceptional:
                addr = self.clients.get(s, 'cliente desconhecido')
                print(f"Conexão excepcional com {addr} - Encerrada")
                inputs.remove(s)
                s.close()
                if s in self.clients:
                    del self.clients[s]

    def close(self):
        for client in self.clients:
            client.close()
        self.server_socket.close()
        print("Servidor fechado")