"""
Aplicações Distribuídas - Projeto 3 - coincenter_flask.py
Números de aluno: 57576
"""

from flask import Flask, request, jsonify
from coincenter_data import ClientController, AssetController, ClientAssetController

# ===== INTEGRAÇÃO ZOOKEEPER =====
from kazoo.client import KazooClient

zk = KazooClient(hosts='127.0.0.1:2181')
zk.start()

# Garante que o nó /assets existe
if not zk.exists("/assets"):
    zk.create("/assets")

# ================================

import ssl
import os

app = Flask(__name__)


@app.errorhandler(ValueError)
@app.errorhandler(TypeError)
def bad_request(e):
    # Pedidos com campos em falta ou com tipos inválidos devolvem 400 em vez de 500
    return jsonify({"error": "Pedido inválido"}), 400


@app.route("/client", methods=["POST"])
def create_client():
    data = request.get_json(force=True)
    is_manager = int(data.get("is_manager", 0))
    if is_manager not in (0, 1):
        is_manager = 0
    client_id = ClientController.create_client(is_manager)
    return jsonify({"client_id": client_id})

@app.route("/client/<int:client_id>/deposit", methods=["POST"])
def deposit(client_id):
    data = request.get_json(force=True)
    amount = float(data.get("amount"))
    result = ClientController.deposit(client_id, amount)
    return jsonify({"msg": result})

@app.route("/client/<int:client_id>/withdraw", methods=["POST"])
def withdraw(client_id):
    data = request.get_json(force=True)
    amount = float(data.get("amount"))
    result = ClientController.withdraw(client_id, amount)
    return jsonify({"msg": result})

@app.route("/asset", methods=["POST"])
def add_asset():
    data = request.get_json(force=True)
    symbol = data.get("asset_symbol")
    name = data.get("asset_name")
    price = float(data.get("price"))
    available_quantity = int(data.get("available_quantity"))
    result = AssetController.add_asset(symbol, name, price, available_quantity)

    # === ZOOKEEPER: Atualiza o zNode do novo asset ===
    asset_path = f"/assets/{symbol}"
    asset_data = f"{name};{price};{available_quantity}".encode()
    if zk.exists(asset_path):
        zk.set(asset_path, asset_data)
    else:
        zk.create(asset_path, asset_data)
    # ================================================

    return jsonify({"msg": result})

@app.route("/asset/<symbol>", methods=["GET"])
def get_asset(symbol):
    asset = AssetController.get_asset(symbol)
    if asset:
        return jsonify(asset)
    else:
        return jsonify({"error": "Asset not found"}), 404

@app.route("/asset/<symbol>", methods=["DELETE"])
def remove_asset(symbol):
    result = AssetController.remove_asset(symbol)
    # (Opcional) Remover do ZooKeeper também:
    asset_path = f"/assets/{symbol}"
    if zk.exists(asset_path):
        zk.delete(asset_path)
    return jsonify({"msg": result})

@app.route("/assets", methods=["GET"])
def list_assets():
    result = AssetController.list_all_assets()
    if isinstance(result, str) and result.startswith("ALL_ASSETS;"):
        assets = []
        for asset_str in result[len("ALL_ASSETS;"):].split(":"):
            if asset_str:
                name, symbol, price, available_quantity = asset_str.split(";")
                assets.append({
                    "asset_name": name,
                    "asset_symbol": symbol,
                    "price": float(price),
                    "available_quantity": int(available_quantity)
                })
        return jsonify(assets)
    return jsonify([])

@app.route("/assetset", methods=["POST"])
def get_assetset():
    data = request.get_json(force=True)
    symbols = data.get("symbols", [])
    assets = AssetController.get_assetset(symbols)
    return jsonify(assets)

@app.route("/client/<int:client_id>/buy", methods=["POST"])
def buy(client_id):
    data = request.get_json(force=True)
    symbol = data.get("asset_symbol")
    quantity = float(data.get("quantity"))
    result = ClientAssetController.buy_asset(client_id, symbol, quantity)
    return jsonify({"msg": result})

@app.route("/client/<int:client_id>/sell", methods=["POST"])
def sell(client_id):
    data = request.get_json(force=True)
    symbol = data.get("asset_symbol")
    quantity = float(data.get("quantity"))
    result = ClientAssetController.sell_asset(client_id, symbol, quantity)
    return jsonify({"msg": result})

@app.route("/client/<int:client_id>/holdings", methods=["GET"])
def holdings(client_id):
    holdings = ClientAssetController.get_holdings(client_id)
    return jsonify(holdings)

@app.route("/client/<int:client_id>/balance", methods=["GET"])
def balance(client_id):
    balance = ClientAssetController.get_balance(client_id)
    return jsonify({"balance": balance})

@app.route("/client/<int:client_id>/transactions", methods=["GET"])
def transactions(client_id):
    is_manager = ClientController.is_manager(client_id)
    if not is_manager:
        return jsonify({"error": "Acesso restrito a managers"}), 403

    start_time = request.args.get("start_time")
    end_time = request.args.get("end_time")
    transactions = ClientAssetController.get_transactions(client_id, start_time, end_time)
    return jsonify(transactions)

if __name__ == "__main__":
    # Caminho absoluto para a pasta dos certificados
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    CHAVES_DIR = os.path.join(BASE_DIR, "chaves")

    context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
    context.load_cert_chain(
        certfile=os.path.join(CHAVES_DIR, "server.crt"),
        keyfile=os.path.join(CHAVES_DIR, "server.key")
    )
    context.load_verify_locations(
        cafile=os.path.join(CHAVES_DIR, "ca.pem")
    )
    context.verify_mode = ssl.CERT_REQUIRED
    context.minimum_version = ssl.TLSVersion.TLSv1_3  # Força TLS 1.3

    try:
        app.run(host="0.0.0.0", port=5001, ssl_context=context)
    finally:
        zk.stop()
        zk.close()
