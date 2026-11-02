CREATE TABLE IF NOT EXISTS Clients (
    client_id INTEGER PRIMARY KEY AUTOINCREMENT,
    is_manager BOOLEAN NOT NULL DEFAULT 0,
    balance REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Assets (
    asset_symbol TEXT PRIMARY KEY,
    asset_name TEXT NOT NULL,
    price REAL NOT NULL,
    available_quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ClientAssets (
    client_id INTEGER NOT NULL REFERENCES clients(client_id),
    asset_symbol TEXT NOT NULL REFERENCES assets(asset_symbol),
    quantity INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (client_id, asset_symbol)
);

CREATE TABLE IF NOT EXISTS Transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(client_id),
    asset_symbol TEXT NOT NULL REFERENCES assets(asset_symbol),
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
