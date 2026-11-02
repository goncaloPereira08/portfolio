"""
Aplicações Distribuídas - Projeto 2 - coincenter_stub.py
Números de aluno: 57576
"""

import pickle
import socket
from sock_utils import receive_all

class ListStub:
    def __init__(self, host, port):
        self.client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            self.client_socket.connect((host, port))
        except socket.error as e:
            print(f"Erro ao conectar ao servidor: {e}")
            raise

    def send_command(self, command):
        try:
            # Serializa o comando
            serialized_command = pickle.dumps(command)
            
            # Envia o tamanho dos dados primeiro
            self.client_socket.sendall(len(serialized_command).to_bytes(4, byteorder='big'))
            
            # Envia os dados serializados
            self.client_socket.sendall(serialized_command)
            
            # Recebe o tamanho da resposta
            size_data = receive_all(self.client_socket, 4)
            if not size_data:
                return None
            response_size = int.from_bytes(size_data, byteorder='big')
            
            # Recebe a resposta completa
            response_data = receive_all(self.client_socket, response_size)
            if not response_data:
                return None
                
            return pickle.loads(response_data)
        except Exception as e:
            print(f"Erro ao enviar ou receber dados: {e}")
            return None

    def disconnect(self):
        try:
            self.client_socket.close()
        except:
            pass