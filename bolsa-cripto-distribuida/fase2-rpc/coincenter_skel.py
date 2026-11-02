"""
Aplicações Distribuídas - Projeto 2 - coincenter_skel.py
Números de aluno: 57576
"""

from coincenter_data import ClientController
import pickle
from sock_utils import receive_all

class ListSkeleton:
    def __init__(self):
        pass

    def processMessage(self, client_socket):
        try:
            # Recebe o tamanho dos dados (4 bytes em big-endian)
            size_data = receive_all(client_socket, 4)
            if not size_data:
                
                return None
            data_size = int.from_bytes(size_data, byteorder='big')
            
            # Recebe os dados serializados
            serialized_msg = receive_all(client_socket, data_size)
            if not serialized_msg:
                
                return None
                
            try:
                pedido = pickle.loads(serialized_msg)
                
            except Exception as e:
                
                error_resp = pickle.dumps([99, False])
                return len(error_resp).to_bytes(4, byteorder='big') + error_resp
            
            # Validação básica do pedido
            if not isinstance(pedido, list) or len(pedido) < 2:
                
                error_resp = pickle.dumps([99, False])
                return len(error_resp).to_bytes(4, byteorder='big') + error_resp

            comando = pedido[0]
            ID = pedido[-1]  # ID é sempre o último elemento
            resposta = []

            try:
                # Comandos do Gestor (Tabela 1)
                if comando == 10:  # ADD_ASSET
                    if len(pedido) == 6:
                        
                        try:
                            symbol = str(pedido[1])
                            name = str(pedido[2])
                            price = float(pedido[3])
                            supply = int(pedido[4])
                            user_id = int(pedido[5])
                            
                            result = ClientController.process_request(
                                f"{user_id};ADD_ASSET;{symbol};{name};{price};{supply}"
                            )
                            
                            success = result.split(';')[0] == "OK"
                            resposta = [11, success]
                        except Exception as e:
                            
                            resposta = [11, False]

                elif comando == 20:  # GET_ALL_ASSETS (Gestor)
                    
                    assets = ClientController.process_request(f"{ID};GET_ALL_ASSETS")
                    if assets != "NOK":
                        if "ALL_ASSETS;" in assets:
                            assets_list = assets.split("ALL_ASSETS;")[1].split(":")
                            resposta = [21, True] + assets_list
                        else:
                            resposta = [21, True]
                    else:
                        resposta = [21, False]

                elif comando == 30:  # REMOVE_ASSET
                    if len(pedido) == 3:
                        result = ClientController.process_request(
                            f"{ID};REMOVE_ASSET;{pedido[1]}"
                        )
                        resposta = [31, result.split(';')[0] == "OK"]
                    else:
                        resposta = [31, False]

                elif comando == 40:  # EXIT (Gestor)
                    resposta = [41, True]

                # Comandos do Utilizador (Tabela 2)
                elif comando == 50:  # GET_ALL_ASSETS (Utilizador)
                    assets = ClientController.process_request(f"{ID};GET_ALL_ASSETS")
                    if assets != "NOK":
                        assets_list = assets.split("ALL_ASSETS;")[1].split(":")
                        resposta = [51, True] + assets_list
                    else:
                        resposta = [51, False]

                elif comando == 60:  # GET_ASSETS_BALANCE
                    balance_info = ClientController.process_request(f"{ID};GET_BALANCE")
                    if balance_info != "NOK":
                        # Formato: "User(id=X, balance=Y, holdings=Z)"
                        resposta = [61, True, balance_info]
                    else:
                        resposta = [61, False]

                elif comando == 70:  # BUY
                    if len(pedido) == 4:
                        result = ClientController.process_request(
                            f"{ID};BUY;{pedido[1]};{pedido[2]}"
                        )
                        resposta = [71, result == "OK"]
                    else:
                        resposta = [71, False]

                elif comando == 80:  # SELL
                    if len(pedido) == 4:
                        result = ClientController.process_request(
                            f"{ID};SELL;{pedido[1]};{pedido[2]}"
                        )
                        resposta = [81, result == "OK"]
                    else:
                        resposta = [81, False]

                elif comando == 90:  # EXIT (Utilizador)
                    resposta = [91, True]

                # Operações de depósito/levantamento (extras)
                elif comando == 100:  # DEPOSIT
                    if len(pedido) == 3:
                        result = ClientController.process_request(
                            f"{ID};DEPOSIT;{pedido[1]}"
                        )
                        resposta = [101, result == "OK"]
                    else:
                        resposta = [101, False]

                elif comando == 110:  # WITHDRAW
                    if len(pedido) == 3:
                        result = ClientController.process_request(
                            f"{ID};WITHDRAW;{pedido[1]}"
                        )
                        resposta = [111, result == "OK"]
                    else:
                        resposta = [111, False]

                else:
                    resposta = [99, False]  # Comando inválido

            except Exception as e:
                
                resposta = [500, False]

            # Serializa a resposta
            try:
                serialized_resp = pickle.dumps(resposta)
                return len(serialized_resp).to_bytes(4, byteorder='big') + serialized_resp
            except Exception as e:
                
                error_resp = pickle.dumps([500, False])
                return len(error_resp).to_bytes(4, byteorder='big') + error_resp

        except Exception as e:
            
            error_resp = pickle.dumps([500, False])
            return len(error_resp).to_bytes(4, byteorder='big') + error_resp