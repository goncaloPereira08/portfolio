"""
Aplicações Distribuídas - Projeto 3 - setup_db.py
Números de aluno: 57576
"""

import sqlite3

def get_db():
    conn = sqlite3.connect('coincenter.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with open("schema.sql") as f:
        sql = f.read()
    conn = get_db()
    conn.executescript(sql)
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Base de dados criada!")