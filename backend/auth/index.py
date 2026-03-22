"""
Авторизация пользователей VibeSpace: регистрация, вход, получение профиля, выход.
Роутинг по query-параметру action: register | login | logout | me
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p16415107_project_enhancement_")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Authorization",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token() -> str:
    return secrets.token_hex(32)

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    # GET /?action=me
    if method == "GET" and action == "me":
        token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")
        if not token:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT u.id, u.username, u.email, u.display_name, u.avatar_url "
            f"FROM {SCHEMA}.sessions s "
            f"JOIN {SCHEMA}.users u ON u.id = s.user_id "
            f"WHERE s.token = %s AND s.expires_at > NOW()",
            (token,)
        )
        row = cur.fetchone()
        conn.close()
        if not row:
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}
        user = {"id": row[0], "username": row[1], "email": row[2], "displayName": row[3], "avatarUrl": row[4]}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"user": user})}

    # POST /?action=register
    if method == "POST" and action == "register":
        username = body.get("username", "").strip()
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")
        display_name = body.get("displayName", username).strip()

        if not username or not email or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
        if len(password) < 6:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s OR username = %s", (email, username))
        if cur.fetchone():
            conn.close()
            return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Email или имя пользователя уже занято"})}

        pw_hash = hash_password(password)
        cur.execute(
            f"INSERT INTO {SCHEMA}.users (username, email, password_hash, display_name) VALUES (%s, %s, %s, %s) RETURNING id",
            (username, email, pw_hash, display_name)
        )
        user_id = cur.fetchone()[0]

        token = make_token()
        expires = datetime.now() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires)
        )
        conn.commit()
        conn.close()

        user = {"id": user_id, "username": username, "email": email, "displayName": display_name, "avatarUrl": None}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": token, "user": user})}

    # POST /?action=login
    if method == "POST" and action == "login":
        email = body.get("email", "").strip().lower()
        password = body.get("password", "")

        if not email or not password:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введите email и пароль"})}

        conn = get_conn()
        cur = conn.cursor()
        pw_hash = hash_password(password)
        cur.execute(
            f"SELECT id, username, email, display_name, avatar_url FROM {SCHEMA}.users WHERE email = %s AND password_hash = %s",
            (email, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            conn.close()
            return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

        user_id, username, user_email, display_name, avatar_url = row
        token = make_token()
        expires = datetime.now() + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (user_id, token, expires)
        )
        conn.commit()
        conn.close()

        user = {"id": user_id, "username": username, "email": user_email, "displayName": display_name, "avatarUrl": avatar_url}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"token": token, "user": user})}

    # POST /?action=logout
    if method == "POST" and action == "logout":
        token = (event.get("headers") or {}).get("X-Authorization", "").replace("Bearer ", "")
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
            conn.commit()
            conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}
