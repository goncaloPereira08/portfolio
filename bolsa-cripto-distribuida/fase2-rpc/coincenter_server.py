"""
Aplicações Distribuídas - Projeto 2 - coincenter_server.py
Números de aluno: 57576
"""

import sys
import signal
from coincenter_skel import ListSkeleton
from net_server import NetServer

def handle_shutdown(signum, frame):
    global server
    print("\nA Desligar o  servidor...")
    server.close()
    sys.exit(0)

def main():
    if len(sys.argv) != 3:
        print("Uso: python3 coincenter_server.py <server_ip> <server_port>")
        sys.exit(1)

    global server
    server_ip = sys.argv[1]
    server_port = int(sys.argv[2])

    try:
        server = NetServer(server_ip, server_port)
        skeleton = ListSkeleton()
        
        # Configurar handler para CTRL+C
        signal.signal(signal.SIGINT, handle_shutdown)

        server.run(skeleton)  # Usa o novo método run() com select

    except Exception as e:
        print(f"Erro ao iniciar servidor: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()