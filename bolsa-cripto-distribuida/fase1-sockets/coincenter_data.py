"""
Aplicações Distribuídas - Projeto 1 - coincenter_data.py
Número de aluno:57576
"""
from typing import Dict,List
from abc import ABC, abstractmethod



class Asset:

    def __init__(self, symbol:str, name:str, price:float, available_supply:int):
        self.symbol = symbol
        self.name = name
        self.price = price
        self.available_supply = available_supply

    def __str__(self):
        return f"Name: {self.name}, Symbol: {self.symbol}, Price: {self.price}, Available_supply: {self.available_supply}"

    def check_availability(self, quantity:int) -> bool:
        return 0 < quantity <= self.available_supply

    def decrease_quantity(self, quantity: int) -> bool:
        if self.check_availability(quantity):
            self.available_supply -= quantity
            return True
        return False

    def increase_quantity(self, quantity: int):
        self.available_supply += quantity

class AssetController:
    assets:List[Asset] = []

    @staticmethod
    def list_all_assets() -> str:
        if not AssetController.assets:
            return "NOK"

        assets_list = []
        for asset in AssetController.assets:
            asset_str = f"{asset.name};{asset.symbol};{asset.price};{asset.available_supply}"
            assets_list.append(asset_str)
        
        return "ALL_ASSETS;" + ":".join(assets_list)
    
    @staticmethod
    def remove_asset(symbol:str):
        for asset in AssetController.assets:
            if asset.symbol == symbol:
                AssetController.assets.remove(asset)
                return f"OK;{symbol}"
        return "NOK"


    @staticmethod
    def add_asset(symbol:str, name:str, price:float, available_supply:int):
        if not any(asset.symbol == symbol for asset in AssetController.assets):
            new_asset = Asset(symbol, name, price, available_supply)
            AssetController.assets.append(new_asset)
            return f"OK;{symbol}"
        return "NOK"

class Client(ABC):
    def __init__(self, id):
        self.id = id
    
    @abstractmethod
    def process_request(self,_):
        pass
    
class User(Client):
    def __init__(self, user_id):
        super().__init__(user_id)
        self.balance: float = 0.0
        self.holdings: Dict[str, float] = {}

    def __str__(self):
        holdings_str = ", ".join([f"{symbol}: {quantity}" for symbol, quantity in self.holdings.items()])
        return f"User(id={self.id}, balance={self.balance}, holdings={holdings_str})"

    def buy_asset(self, asset_symbol:str, quantity:float) -> bool:
        asset = next((a for a in AssetController.assets if a.symbol == asset_symbol), None)
        if asset and self.balance >= asset.price * quantity and asset.check_availability(quantity):
            self.balance -= asset.price * quantity
            asset.decrease_quantity(quantity)
            self.holdings[asset_symbol] = self.holdings.get(asset_symbol, 0.0) + quantity
            return "OK"
        return "NOK"
    
    def sell_asset(self, asset_symbol:str, quantity:float) -> bool:
        if self.holdings.get(asset_symbol, 0.0) >= quantity:
            asset = next((a for a in AssetController.assets if a.symbol == asset_symbol), None)
            if asset:
                self.balance += asset.price * quantity
                asset.increase_quantity(quantity)
                self.holdings[asset_symbol] -= quantity
                if self.holdings[asset_symbol] == 0:
                    del self.holdings[asset_symbol]
                return "OK"
        return "NOK"

    def deposit(self, amount: float):
        print("2")
        if amount > 0:
            self.balance += amount
            return "OK"
        return "NOK"

    def withdraw(self,amount):
        if amount > 0 and self.balance >= amount:
            self.balance -= amount
            return "OK"
        return "NOK"
    
    def process_request(self, request) -> str:
        parts = request.split(";")
        if not parts:
            return "NOK"

        command = parts[0].upper()

        if command == "DEPOSIT" and len(parts) == 2:
            return self.deposit(float(parts[1].split()[0]))
        elif command == "WITHDRAW" and len(parts) == 2:
            return self.withdraw(float(parts[1].split()[0]))
        elif command == "BUY" and len(parts) == 3:
            return self.buy_asset(parts[1], float(parts[2]))
        elif command == "SELL" and len(parts) == 3:
            return self.sell_asset(parts[1], float(parts[2]))
        elif command == "GET_BALANCE":
            return str(self)
        elif command == "GET_ALL_ASSETS": 
            return AssetController.list_all_assets()
        return "NOK"

class Manager(Client):
    def __init__(self, user_id):
        super().__init__(user_id)

    def process_request(self, request):
        parts = request.split(";")
        if not parts:
            return "NOK"

        command = parts[0].upper()
        if command == "ADD_ASSET" and len(parts) == 5:
            try:
                return AssetController.add_asset(parts[1], parts[2], float(parts[3]), int(parts[4]))
            except ValueError:
                return "NOK"
        elif command == "REMOVE_ASSET" and len(parts) == 2:
            return AssetController.remove_asset(parts[1])
        elif command == "GET_ALL_ASSETS":
            return AssetController.list_all_assets()

        return "NOK"


class ClientController:
    clients:Dict[int,Client] = {0:Manager(0)}

    @staticmethod
    def process_request(request: str) -> str:
        parts = request.split(";")

        if not parts:
            return "NOK"

        try:
            client_id = int(parts[0])
        except ValueError:
            return "NOK"
        
        if client_id not in ClientController.clients:
            ClientController.clients[client_id] = User(client_id)
        
        command_without_id = ";".join(parts[1:])

        return ClientController.clients[client_id].process_request(command_without_id)