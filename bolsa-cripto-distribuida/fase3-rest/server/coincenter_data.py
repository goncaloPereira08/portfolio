"""
Aplicações Distribuídas - Projeto 3 - coincenter_data.py
Números de aluno: 57576
"""

import sqlite3

DB_PATH = "coincenter.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_db_locked():
    """Abre uma ligação com transação BEGIN IMMEDIATE, para que a verificação de saldo/stock
    e a respetiva atualização sejam atómicas mesmo com pedidos concorrentes."""
    conn = sqlite3.connect(DB_PATH, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("BEGIN IMMEDIATE")
    return conn

class ClientController:
    @staticmethod
    def create_client(is_manager=0):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("INSERT INTO Clients (is_manager, balance) VALUES (?, ?)", (is_manager, 0))
        client_id = cur.lastrowid
        conn.commit()
        conn.close()
        return client_id
    
    @staticmethod
    def is_manager(client_id):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT is_manager FROM Clients WHERE client_id = ?", (client_id,))
        row = cur.fetchone()
        conn.close()
        return row and row["is_manager"] == 1

    @staticmethod
    def deposit(client_id, amount):
        if amount <= 0:
            return "NOK"
        conn = get_db()
        cur = conn.cursor()
        cur.execute("UPDATE Clients SET balance = balance + ? WHERE client_id = ?", (amount, client_id))
        conn.commit()
        affected = cur.rowcount
        conn.close()
        return "OK" if affected > 0 else "NOK"

    @staticmethod
    def withdraw(client_id, amount):
        if amount <= 0:
            return "NOK"
        conn = get_db_locked()
        cur = conn.cursor()
        cur.execute("SELECT balance FROM Clients WHERE client_id = ?", (client_id,))
        row = cur.fetchone()
        if not row or row["balance"] < amount:
            conn.close()
            return "NOK"
        cur.execute("UPDATE Clients SET balance = balance - ? WHERE client_id = ?", (amount, client_id))
        conn.commit()
        affected = cur.rowcount
        conn.close()
        return "OK" if affected > 0 else "NOK"

class AssetController:
    @staticmethod
    def add_asset(symbol, name, price, available_quantity):
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute("SELECT asset_symbol FROM Assets WHERE lower(asset_symbol) = lower(?)", (symbol,))
            if cur.fetchone():
                conn.close()
                return "NOK"
            cur.execute("INSERT INTO Assets (asset_symbol, asset_name, price, available_quantity) VALUES (?, ?, ?, ?)",
                        (symbol, name, price, available_quantity))
            conn.commit()
            conn.close()
            return f"OK;{symbol}"
        except Exception as e:
            print(f"Erro ao adicionar ativo: {str(e)}")
            return "NOK"

    @staticmethod
    def remove_asset(symbol):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM Assets WHERE asset_symbol = ?", (symbol,))
        conn.commit()
        affected = cur.rowcount
        conn.close()
        return f"OK;{symbol}" if affected > 0 else "NOK"

    @staticmethod
    def list_all_assets():
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT asset_name, asset_symbol, price, available_quantity FROM Assets")
        rows = cur.fetchall()
        conn.close()
        if not rows:
            return "NOK"
        assets_list = []
        for row in rows:
            asset_str = f"{row['asset_name']};{row['asset_symbol']};{row['price']};{row['available_quantity']}"
            assets_list.append(asset_str)
        return "ALL_ASSETS;" + ":".join(assets_list)
    
    @staticmethod
    def get_asset(symbol):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT asset_symbol, asset_name, price, available_quantity FROM Assets WHERE asset_symbol = ?", (symbol,))
        row = cur.fetchone()
        conn.close()
        if row:
            return {
                "asset_symbol": row["asset_symbol"],
                "asset_name": row["asset_name"],
                "price": row["price"],
                "available_quantity": row["available_quantity"]
            }
        else:
            return None
        
    @staticmethod
    def get_assetset(symbols):
        if not symbols:
            return []
        conn = get_db()
        cur = conn.cursor()
        q = "SELECT asset_symbol, asset_name, price, available_quantity FROM Assets WHERE asset_symbol IN ({})".format(
            ",".join("?" for _ in symbols)
        )
        cur.execute(q, symbols)
        rows = cur.fetchall()
        conn.close()
        return [
            {
                "asset_symbol": row["asset_symbol"],
                "asset_name": row["asset_name"],
                "price": row["price"],
                "available_quantity": row["available_quantity"]
            }
            for row in rows
        ]

class ClientAssetController:
    @staticmethod
    def buy_asset(client_id, symbol, quantity):
        if quantity <= 0:
            return "NOK"
        conn = get_db_locked()
        cur = conn.cursor()
        cur.execute("SELECT price, available_quantity FROM Assets WHERE asset_symbol = ?", (symbol,))
        asset = cur.fetchone()
        if not asset or asset["available_quantity"] < quantity:
            conn.close()
            return "NOK"
        total_price = asset["price"] * quantity
        cur.execute("SELECT balance FROM Clients WHERE client_id = ?", (client_id,))
        client = cur.fetchone()
        if not client or client["balance"] < total_price:
            conn.close()
            return "NOK"
        cur.execute("UPDATE Clients SET balance = balance - ? WHERE client_id = ?", (total_price, client_id))
        cur.execute("UPDATE Assets SET available_quantity = available_quantity - ? WHERE asset_symbol = ?", (quantity, symbol))
        cur.execute("""
            INSERT INTO ClientAssets (client_id, asset_symbol, quantity) VALUES (?, ?, ?)
            ON CONFLICT(client_id, asset_symbol) DO UPDATE SET quantity = quantity + excluded.quantity
        """, (client_id, symbol, quantity))
        cur.execute("INSERT INTO Transactions (client_id, asset_symbol, type, quantity, price) VALUES (?, ?, ?, ?, ?)",
                    (client_id, symbol, "BUY", quantity, asset["price"]))
        conn.commit()
        conn.close()
        return "OK"

    @staticmethod
    def sell_asset(client_id, symbol, quantity):
        if quantity <= 0:
            return "NOK"
        conn = get_db_locked()
        cur = conn.cursor()
        cur.execute("SELECT quantity FROM ClientAssets WHERE client_id = ? AND asset_symbol = ?", (client_id, symbol))
        holding = cur.fetchone()
        if not holding or holding["quantity"] < quantity:
            conn.close()
            return "NOK"
        cur.execute("SELECT price FROM Assets WHERE asset_symbol = ?", (symbol,))
        asset = cur.fetchone()
        if not asset:
            conn.close()
            return "NOK"
        total_price = asset["price"] * quantity
        cur.execute("UPDATE Clients SET balance = balance + ? WHERE client_id = ?", (total_price, client_id))
        cur.execute("UPDATE Assets SET available_quantity = available_quantity + ? WHERE asset_symbol = ?", (quantity, symbol))
        cur.execute("UPDATE ClientAssets SET quantity = quantity - ? WHERE client_id = ? AND asset_symbol = ?", (quantity, client_id, symbol))
        cur.execute("DELETE FROM ClientAssets WHERE client_id = ? AND asset_symbol = ? AND quantity <= 0", (client_id, symbol))
        cur.execute("INSERT INTO Transactions (client_id, asset_symbol, type, quantity, price) VALUES (?, ?, ?, ?, ?)",
                    (client_id, symbol, "SELL", quantity, asset["price"]))
        conn.commit()
        conn.close()
        return "OK"

    @staticmethod
    def get_holdings(client_id):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT asset_symbol, quantity FROM ClientAssets WHERE client_id = ?", (client_id,))
        holdings = {row["asset_symbol"]: row["quantity"] for row in cur.fetchall()}
        conn.close()
        return holdings

    @staticmethod
    def get_balance(client_id):
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT balance FROM Clients WHERE client_id = ?", (client_id,))
        row = cur.fetchone()
        conn.close()
        return row["balance"] if row else 0.0

    @staticmethod
    def get_transactions(client_id, start_time, end_time):
        conn = get_db()
        cur = conn.cursor()
        # Sem intervalo indicado, devolve todas as transações
        start_time = start_time or "0000-01-01 00:00:00"
        end_time = end_time or "9999-12-31 23:59:59"
        cur.execute("SELECT * FROM Transactions WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp",
                    (start_time, end_time))
        transactions = [dict(row) for row in cur.fetchall()]
        conn.close()
        return transactions
