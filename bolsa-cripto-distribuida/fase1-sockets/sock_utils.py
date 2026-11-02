"""
Aplicações Distribuídas - Projeto 1 - sock_utils.py
Números de aluno: 57576
"""
import socket as s

def create_tcp_server_socket(address, port, queue_size):

    server_socket = s.socket(s.AF_INET, s.SOCK_STREAM)

    server_socket.bind((address, port))
    
    server_socket.listen(queue_size)
    
    return server_socket

def create_tcp_client_socket(address, port):

    client_socket = s.socket(s.AF_INET, s.SOCK_STREAM)

    client_socket.connect((address, port))

    return client_socket
