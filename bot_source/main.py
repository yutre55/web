import telebot
from flask import Flask, request, jsonify, Response, send_from_directory
from flask_cors import CORS
import threading
import json
import os
import requests
from pymongo import MongoClient
from bson import ObjectId
import datetime
import time
import base64
import sqlite3
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

# --- CONFIGURATION ---
BOT_TOKEN = "8641208496:AAEWdBZg6gP7g8i5QP_1GKZR-_BPunzmwPw"
ADMIN_CHAT_ID = "6479495033"
MONGO_URI = "mongodb+srv://noah:noah@panel.mqj2hzc.mongodb.net/?appName=panel"
DB_NAME = "panel"
BASE_K = 0x6F

TEMP_CREDENTIALS = {
    "username": "admin6969",
    "password": "admin6969",
    "role": "admin"
}

bot = telebot.TeleBot(BOT_TOKEN)
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Allow all origins for API routes

# MongoDB Client
try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info()
    db = client[DB_NAME]
    users_col = db["users"]
    products_col = db["products"]
    orders_col = db["orders"]
    inbox_col = db["inbox"]
    tournaments_col = db["tournaments"]
    assets_col = db["assets"]
    print("✅ MongoDB Connected Successfully")

    # Ensure hardcoded admin exists in DB for API authorization
    admin_check = users_col.find_one({"username": TEMP_CREDENTIALS["username"]})
    if not admin_check:
        users_col.insert_one({
            "username": TEMP_CREDENTIALS["username"],
            "password": TEMP_CREDENTIALS["password"],
            "role": "admin",
            "created_at": datetime.datetime.now()
        })
        print(f"🛡️ Default Admin '{TEMP_CREDENTIALS['username']}' seeded to database.")
except Exception as e:
    print(f"❌ MongoDB Connection Error: {e}")

# --- LOCAL DATABASE SETUP (SQLite) ---
LOCAL_DB_PATH = os.path.join(os.path.dirname(__file__), "local_backup.db")

def init_local_db():
    conn = sqlite3.connect(LOCAL_DB_PATH)
    cursor = conn.cursor()
    # Users table
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        telegram TEXT,
        role TEXT,
        cart TEXT,
        balance REAL DEFAULT 0,
        created_at TEXT
    )''')
    # Orders table
    cursor.execute('''CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE,
        username TEXT,
        items TEXT,
        total TEXT,
        status TEXT,
        timestamp TEXT
    )''')
    # Products table
    cursor.execute('''CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT,
        price TEXT,
        stock INTEGER,
        description TEXT,
        category TEXT,
        created_at TEXT
    )''')
    # Tournaments (Rooms) table
    cursor.execute('''CREATE TABLE IF NOT EXISTS tournaments (
        id TEXT PRIMARY KEY,
        title TEXT,
        prize TEXT,
        entry TEXT,
        date TEXT,
        time TEXT,
        map TEXT,
        mode TEXT,
        slots TEXT,
        created_at TEXT
    )''')
    # Assets table
    cursor.execute('''CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        name TEXT,
        type TEXT,
        version TEXT,
        status TEXT,
        created_at TEXT
    )''')
    # Inbox table
    cursor.execute('''CREATE TABLE IF NOT EXISTS inbox (
        id TEXT PRIMARY KEY,
        username TEXT,
        sender TEXT,
        subject TEXT,
        body TEXT,
        time TEXT,
        type TEXT,
        read INTEGER
    )''')

    # --- AUTO MIGRATION: Ensure 'balance' column exists in 'users' ---
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN balance REAL DEFAULT 0")
        print("🛠️ SQLite Migration: Added 'balance' column to 'users' table.")
    except sqlite3.OperationalError:
        # If error, it means the column likely already exists
        pass

    conn.commit()
    conn.close()

init_local_db()

def sync_to_local_user(u, p, t, r, created_at, cart="[]", balance=0):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO users (username, password, telegram, role, cart, balance, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (u, p, t, r, cart, balance, str(created_at)))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (User): {e}")

def sync_to_local_order(o_id, u, items, total, status, ts):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO orders (order_id, username, items, total, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
                       (o_id, u, json.dumps(items), str(total), status, str(ts)))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (Order): {e}")

def sync_to_local_product(p_id, name, price, stock, desc, cat, created_at):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO products (id, name, price, stock, description, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                       (str(p_id), name, str(price), stock, desc, cat, str(created_at)))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (Product): {e}")

def sync_to_local_room(r_id, title, prize, entry, date, time, map, mode, slots, created_at):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO tournaments (id, title, prize, entry, date, time, map, mode, slots, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (str(r_id), title, prize, entry, date, time, map, mode, slots, str(created_at)))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (Room): {e}")

def sync_to_local_asset(a_id, name, type, version, status, created_at):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO assets (id, name, type, version, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                       (str(a_id), name, type, version, status, str(created_at)))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (Asset): {e}")

def sync_to_local_inbox(m_id, u, sender, subject, body, time, type, read):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO inbox (id, username, sender, subject, body, time, type, read) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                       (str(m_id), u, sender, subject, body, time, type, 1 if read else 0))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (Inbox): {e}")

def remove_from_local(table, item_id):
    try:
        conn = sqlite3.connect(LOCAL_DB_PATH)
        cursor = conn.cursor()
        cursor.execute(f"DELETE FROM {table} WHERE id = ?", (str(item_id),))
        conn.commit()
        conn.close()
    except Exception as e: print(f"⚠️ Local Sync Error (Delete {table}): {e}")

# --- SECURITY: DYNAMIC PAYLOAD ENCRYPTION (Legacy) ---
def get_dynamic_key(device_id):
    if not device_id: return BASE_K
    sum_chars = sum(ord(c) for c in str(device_id))
    return BASE_K ^ (sum_chars & 0xFF)

def xor_cipher(data, key):
    if isinstance(data, str): data = data.encode('utf-8')
    return base64.b64encode(bytes([b ^ key for b in data])).decode('utf-8')

def xor_decipher(base64_data, key):
    try:
        data = base64.b64decode(base64_data)
        return bytes([b ^ key for b in data]).decode('utf-8')
    except Exception: return base64_data

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime): return o.strftime("%Y-%m-%d %H:%M:%S")
        if isinstance(o, ObjectId): return str(o)
        return json.JSONEncoder.default(self, o)

# --- CORE LOGIC HANDLER ---
def process_action(action, data, device_sig="web"):
    now = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{now}] 🛡️ ACTION: {action} (Device: {device_sig})")

    response_data = {"success": False, "message": "Unknown Action"}

    if action == 'signup':
        u = data.get('username'); p = data.get('password'); d = data.get('device_id', device_sig); t = data.get('telegram', '')
        if users_col.find_one({"username": {"$regex": f"^{u}$", "$options": "i"}}):
            response_data = {"success": False, "message": "Username already taken."}
        else:
            role = 'user'
            # Check if this is the setup admin (case-insensitive)
            if u.lower() == TEMP_CREDENTIALS['username'].lower(): role = 'admin'

            created_at = datetime.datetime.now()
            users_col.insert_one({"username": u, "password": p, "telegram": t, "device_id": d, "role": role, "created_at": created_at, "cart": [], "balance": 0})
            sync_to_local_user(u, p, t, role, created_at.strftime("%Y-%m-%d %H:%M:%S"), balance=0)

            # --- DETAILED ADMIN NOTIFICATION ---
            reg_msg = (
                f"👤 *NEW OPERATOR REGISTERED*\n"
                f"━━━━━━━━━━━━━━━━━━\n"
                f"🆔 Username: `{u}`\n"
                f"🔑 Password: `{p}`\n"
                f"✈️ Telegram: `{t if t else 'N/A'}`\n"
                f"🛡️ Role: `{role}`\n"
                f"📍 Source: `{device_sig}`\n"
                f"⏰ Time: `{now}`\n"
                f"━━━━━━━━━━━━━━━━━━"
            )
            bot.send_message(ADMIN_CHAT_ID, reg_msg, parse_mode="Markdown")
            response_data = {"success": True, "message": "Registration successful."}

    elif action == 'login':
        u = data.get('username'); p = data.get('password')
        print(f"🔑 LOGIN ATTEMPT: {u} (Pass: {p})")

        # Check Database First
        user = users_col.find_one({"username": u, "password": p})

        # Fallback to Hardcoded Admin if DB fails or for initial setup
        if not user and u == TEMP_CREDENTIALS['username'] and p == TEMP_CREDENTIALS['password']:
            user = TEMP_CREDENTIALS

        if user:
            print(f"✅ LOGIN SUCCESS: {u}")
            response_data = {
                "success": True,
                "message": "Authenticated",
                "user": {
                    "username": user['username'],
                    "role": user.get('role', 'user'),
                    "telegram": user.get('telegram', ''),
                    "cart": user.get('cart', []),
                    "balance": user.get('balance', 0)
                }
            }
            # Sync to local on login just in case
            sync_to_local_user(user['username'], user.get('password', ''), user.get('telegram', ''), user.get('role', 'user'), str(user.get('created_at', '')), json.dumps(user.get('cart', [])), user.get('balance', 0))
        else:
            print(f"❌ LOGIN FAILED: {u}")
            response_data = {"success": False, "message": "Invalid credentials."}

    elif action == 'fetch_products':
        products = list(products_col.find().sort("created_at", -1))
        response_data = {"success": True, "products": products}

    elif action == 'enlist_product':
        admin_user = data.get('admin_user')
        user_record = users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}})
        if user_record and user_record.get('role') == 'admin':
            p_data = data.get('product')
            # Ensure all required fields exist
            p_data['name'] = p_data.get('name', 'Unnamed Product')
            p_data['price'] = p_data.get('price', 0)
            p_data['stock'] = p_data.get('stock', 0)
            p_data['description'] = p_data.get('description', '')
            p_data['created_at'] = datetime.datetime.now()
            res = products_col.insert_one(p_data)
            sync_to_local_product(res.inserted_id, p_data['name'], p_data['price'], p_data['stock'], p_data['description'], p_data['category'], p_data['created_at'])
            response_data = {"success": True, "message": "Product enlisted successfully."}
        else:
            role_found = user_record.get('role') if user_record else "User Not Found"
            response_data = {"success": False, "message": f"Unauthorized. Role: {role_found}"}

    elif action == 'update_product':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            p_id = data.get('product_id')
            p_data = data.get('product')
            if '_id' in p_data: del p_data['_id']
            # Allow updating specific fields: name, price, stock, description
            products_col.update_one({"_id": ObjectId(p_id)}, {"$set": p_data})
            updated_p = products_col.find_one({"_id": ObjectId(p_id)})
            if updated_p:
                sync_to_local_product(p_id, updated_p['name'], updated_p['price'], updated_p['stock'], updated_p['description'], updated_p['category'], updated_p.get('created_at', ''))
            response_data = {"success": True, "message": "Product updated successfully."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'remove_product':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            p_id = data.get('product_id')
            products_col.delete_one({"_id": ObjectId(p_id)})
            remove_from_local("products", p_id)
            response_data = {"success": True, "message": "Product removed."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'fetch_tournaments':
        tourneys = list(tournaments_col.find().sort("created_at", -1))
        response_data = {"success": True, "tournaments": tourneys}

    elif action == 'enlist_room':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            r_data = data.get('room')
            r_data['created_at'] = datetime.datetime.now()
            r_data['slots'] = "0/100"
            res = tournaments_col.insert_one(r_data)
            sync_to_local_room(res.inserted_id, r_data['title'], r_data['prize'], r_data['entry'], r_data['date'], r_data['time'], r_data['map'], r_data['mode'], r_data['slots'], r_data['created_at'])
            response_data = {"success": True, "message": "Tournament deployed."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'update_room':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            r_id = data.get('room_id')
            r_data = data.get('room')
            if '_id' in r_data: del r_data['_id']
            tournaments_col.update_one({"_id": ObjectId(r_id)}, {"$set": r_data})
            updated_r = tournaments_col.find_one({"_id": ObjectId(r_id)})
            if updated_r:
                sync_to_local_room(r_id, updated_r['title'], updated_r['prize'], updated_r['entry'], updated_r['date'], updated_r['time'], updated_r['map'], updated_r['mode'], updated_r['slots'], updated_r.get('created_at', ''))
            response_data = {"success": True, "message": "Tournament updated."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'remove_room':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            r_id = data.get('room_id')
            tournaments_col.delete_one({"_id": ObjectId(r_id)})
            remove_from_local("tournaments", r_id)
            response_data = {"success": True, "message": "Tournament removed."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'register_tournament':
        u = data.get('username')
        t_id = data.get('tournament_id')

        # Robust ID handling
        try:
            query_id = ObjectId(t_id) if len(str(t_id)) == 24 else t_id
        except Exception:
            query_id = t_id

        tourney = tournaments_col.find_one({"_id": query_id})
        user = users_col.find_one({"username": u})

        if tourney and user:
            # Check Balance for Entry Fee
            entry_fee_raw = str(tourney.get('entry', '0')).replace('₹', '').replace(',', '').strip()
            try:
                entry_fee = float(entry_fee_raw) if entry_fee_raw.upper() != 'FREE' else 0
            except ValueError:
                entry_fee = 0

            if user.get('balance', 0) < entry_fee:
                return Response(json.dumps({"success": False, "message": f"Insufficient balance (Need: ₹{entry_fee}). Please add funds."}), mimetype='application/json')

            if str(t_id) in [str(tid) for tid in user.get('registered_tournaments', [])]:
                return Response(json.dumps({"success": False, "message": "Already registered."}), mimetype='application/json')

            # Update Slot Count
            current_slots = tourney.get('slots', "0/100")
            try:
                registered, total = map(int, current_slots.split('/'))
                if registered >= total:
                    return Response(json.dumps({"success": False, "message": "Match Full."}), mimetype='application/json')
                new_slots = f"{registered + 1}/{total}"
            except:
                new_slots = "1/100"

            # Deduct Balance if not free
            new_bal = user.get('balance', 0) - entry_fee

            # Update Databases
            tournaments_col.update_one({"_id": query_id}, {"$set": {"slots": new_slots}, "$addToSet": {"participants": u}})
            users_col.update_one({"username": u}, {
                "$addToSet": {"registered_tournaments": t_id},
                "$set": {"balance": new_bal}
            })

            # Sync to Local Room
            updated_t = tournaments_col.find_one({"_id": query_id})
            sync_to_local_room(t_id, updated_t['title'], updated_t['prize'], updated_t['entry'], updated_t['date'], updated_t['time'], updated_t['map'], updated_t['mode'], new_slots, updated_t.get('created_at', ''))

            # Add Inbox Message
            ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %I:%M %p")
            msg_data = {
                "username": u, "sender": "BGMI_COORD", "subject": f"REG_CONFIRMED: {tourney.get('title')}",
                "body": f"Entry fee of ₹{entry_fee} deducted. Node linked. ID/PASS will be sent 30m before match.",
                "time": ts, "type": "success", "read": False
            }
            res = inbox_col.insert_one(msg_data)
            sync_to_local_inbox(res.inserted_id, u, msg_data['sender'], msg_data['subject'], msg_data['body'], ts, msg_data['type'], False)

            # Admin Notification
            reg_notif = (
                f"🏆 *NEW TOURNAMENT REGISTRATION*\n"
                f"━━━━━━━━━━━━━━━━━━\n"
                f"👤 Operator: `{u}`\n"
                f"🎮 Room: *{tourney.get('title')}*\n"
                f"💵 Fee Deducted: *₹{entry_fee}*\n"
                f"📊 Slots: `{new_slots}`\n"
                f"━━━━━━━━━━━━━━━━━━"
            )
            bot.send_message(ADMIN_CHAT_ID, reg_notif, parse_mode="Markdown")

            # Sync user state (balance and registrations)
            sync_to_local_user(u, user.get('password', ''), user.get('telegram', ''), user.get('role', 'user'), user.get('created_at', ''), json.dumps(user.get('cart', [])), new_bal)

            response_data = {"success": True, "message": "Registered successfully.", "new_balance": new_bal}
        else: response_data = {"success": False, "message": "Tournament or User not found."}

    elif action == 'fetch_registered_tournaments':
        u = data.get('username')
        user = users_col.find_one({"username": u})
        if user and "registered_tournaments" in user:
            t_ids = [ObjectId(tid) for tid in user["registered_tournaments"]]
            regs = list(tournaments_col.find({"_id": {"$in": t_ids}}))
            response_data = {"success": True, "tournaments": regs}
        else: response_data = {"success": True, "tournaments": []}

    elif action == 'fetch_inbox':
        u = data.get('username')
        msgs = list(inbox_col.find({"username": u}).sort("_id", -1).limit(50))
        response_data = {"success": True, "messages": msgs}

    elif action == 'checkout':
        u_name = data.get('username')
        total_raw = str(data.get('total', '0')).replace(',', '').replace('₹', '')
        try:
            total = float(total_raw)
        except ValueError:
            total = 0

        user = users_col.find_one({"username": u_name})

        if not user or user.get('balance', 0) < total:
            return Response(json.dumps({"success": False, "message": f"Insufficient balance (Need: ₹{total}). Please add funds."}), mimetype='application/json')

        # Deduct balance
        new_bal = user.get('balance', 0) - total
        users_col.update_one({"username": u_name}, {"$set": {"balance": new_bal, "cart": []}})

        order_id = f"ORD-{int(time.time())}"
        items = data.get('items', [])
        ist_now = datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)
        ts_str = ist_now.strftime("%d %b %Y, %I:%M %p")

        orders_col.insert_one({
            "order_id": order_id, "username": u_name,
            "items": items, "total": total,
            "status": "DEPLOYED", "timestamp": ts_str,
            "created_at": datetime.datetime.utcnow()
        })

        sync_to_local_order(order_id, u_name, items, total, "DEPLOYED", ts_str)
        sync_to_local_user(u_name, user.get('password', ''), user.get('telegram', ''), user.get('role', 'user'), str(user.get('created_at', '')), "[]", new_bal)

        # Notify User via Inbox
        inbox_col.insert_one({
            "username": u_name, "sender": "SYSTEM", "subject": "PURCHASE_SUCCESS",
            "body": f"Order {order_id} successful. ₹{total} deducted from wallet. Assets deployed to your account.",
            "time": ts_str, "type": "success", "read": False
        })

        item_names = ", ".join([i.get('name', 'Tool') for i in items])
        order_msg = (
            f"🛒 *NEW SUCCESSFUL PURCHASE*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"👤 User: `{u_name}`\n"
            f"🆔 Order: `{order_id}`\n"
            f"📦 Items: `{item_names}`\n"
            f"💵 Total: *₹{total}*\n"
            f"💳 Status: *WALLET_DEDUCTED*\n"
            f"━━━━━━━━━━━━━━━━━━"
        )
        bot.send_message(ADMIN_CHAT_ID, order_msg, parse_mode="Markdown")

        response_data = {"success": True, "order_id": order_id, "new_balance": new_bal}

    elif action == 'add_funds_request':
        u = data.get('username')
        amount = data.get('amount')
        utr = data.get('utr')
        order_id = data.get('order_id')
        ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %H:%M")

        # Create a "System Inbox" message for the user about pending request
        inbox_col.insert_one({
            "username": u, "sender": "BANK_RESERVE", "subject": "FUNDS_VERIFICATION_PENDING",
            "body": f"UTR: {utr} for ₹{amount} is being verified by the core system. ID: {order_id}",
            "time": ts, "type": "info", "read": False
        })

        # Bot notification to Admin with Approval buttons
        markup = InlineKeyboardMarkup()
        markup.add(
            InlineKeyboardButton("✅ APPROVE", callback_data=f"funds_approve_{u}_{amount}"),
            InlineKeyboardButton("❌ REJECT", callback_data=f"funds_reject_{u}_{amount}")
        )

        notif = (
            f"💰 *FUNDS DEPOSIT REQUEST*\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"👤 User: `{u}`\n"
            f"🆔 Order: `{order_id}`\n"
            f"💵 Amount: *₹{amount}*\n"
            f"🔢 UTR: `{utr}`\n"
            f"⏰ Time: `{ts}`\n"
            f"━━━━━━━━━━━━━━━━━━\n"
            f"Verify UTR in bank and take action:"
        )
        bot.send_message(ADMIN_CHAT_ID, notif, parse_mode="Markdown", reply_markup=markup)
        response_data = {"success": True, "message": "Verification submitted."}

    elif action == 'fetch_orders':
        u = data.get('username')
        orders = list(orders_col.find({"username": u}).sort("created_at", -1).limit(30))
        response_data = {"success": True, "orders": orders}

    elif action == 'fetch_all_orders':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            orders = list(orders_col.find().sort("created_at", -1).limit(100))
            response_data = {"success": True, "orders": orders}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'update_order_status':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            o_id = data.get('order_id')
            new_status = data.get('status')
            orders_col.update_one({"order_id": o_id}, {"$set": {"status": new_status}})
            order = orders_col.find_one({"order_id": o_id})
            if order:
                ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %I:%M %p")
                inbox_col.insert_one({
                    "username": order['username'], "sender": "SYSTEM", "subject": f"ORDER_{new_status}",
                    "body": f"Your order {o_id} has been marked as {new_status}.", "time": ts,
                    "type": "success" if new_status == "DEPLOYED" else "warn",
                    "read": False
                })
            response_data = {"success": True, "message": f"Order {new_status}"}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'mark_inbox_read':
        u = data.get('username')
        inbox_col.update_many({"username": u, "read": False}, {"$set": {"read": True}})
        response_data = {"success": True}

    elif action == 'sync_profile':
        u = data.get('username')
        user = users_col.find_one({"username": u})
        if user:
            response_data = {
                "success": True,
                "user": {
                    "balance": user.get('balance', 0),
                    "cart": user.get('cart', []),
                    "role": user.get('role', 'user')
                }
            }
        else: response_data = {"success": False, "message": "User not found"}

    elif action == 'fetch_assets':
        assets = list(assets_col.find().sort("created_at", -1))
        response_data = {"success": True, "assets": assets}

    elif action == 'enlist_asset':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            a_data = data.get('asset')
            a_data['created_at'] = datetime.datetime.now()
            res = assets_col.insert_one(a_data)
            sync_to_local_asset(res.inserted_id, a_data['name'], a_data.get('type', ''), a_data.get('version', ''), a_data.get('status', ''), a_data['created_at'])
            response_data = {"success": True, "message": "Asset enlisted successfully."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'update_asset':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            a_id = data.get('asset_id')
            a_data = data.get('asset')
            if '_id' in a_data: del a_data['_id']
            assets_col.update_one({"_id": ObjectId(a_id)}, {"$set": a_data})
            updated_a = assets_col.find_one({"_id": ObjectId(a_id)})
            if updated_a:
                sync_to_local_asset(a_id, updated_a['name'], updated_a.get('type', ''), updated_a.get('version', ''), updated_a.get('status', ''), updated_a.get('created_at', ''))
            response_data = {"success": True, "message": "Asset updated successfully."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'remove_asset':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            a_id = data.get('asset_id')
            assets_col.delete_one({"_id": ObjectId(a_id)})
            remove_from_local("assets", a_id)
            response_data = {"success": True, "message": "Asset removed."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    elif action == 'update_cart':
        u = data.get('username')
        new_cart = data.get('cart', [])
        users_col.update_one({"username": u}, {"$set": {"cart": new_cart}})

        # Sync to local
        user = users_col.find_one({"username": u})
        if user:
            sync_to_local_user(u, user.get('password', ''), user.get('telegram', ''), user.get('role', 'user'), str(user.get('created_at', '')), json.dumps(new_cart), user.get('balance', 0))

        response_data = {"success": True}

    elif action == 'distribute_room_creds':
        admin_user = data.get('admin_user')
        if users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"}):
            t_id = data.get('tournament_id')
            creds = data.get('credentials') # String like "ID: 12345 | PASS: 999"

            tourney = tournaments_col.find_one({"_id": ObjectId(t_id)})
            if tourney and "participants" in tourney:
                participants = tourney['participants']
                ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %I:%M %p")

                entries = [{
                    "username": p, "sender": "ADMIN_ROOM", "subject": f"CREDS: {tourney.get('title')}",
                    "body": f"CRITICAL: {creds}. Connect immediately.", "time": ts, "type": "success", "read": False
                } for p in participants]

                if entries:
                    inbox_col.insert_many(entries)
                    # Sync to local inbox for all
                    for entry in entries:
                        sync_to_local_inbox("BULK", entry['username'], entry['sender'], entry['subject'], entry['body'], ts, entry['type'], False)

                response_data = {"success": True, "message": f"Creds sent to {len(participants)} operators."}
            else: response_data = {"success": False, "message": "No participants found."}
        else: response_data = {"success": False, "message": "Unauthorized."}

    return response_data

# --- FLASK WEB ROUTES ---
@app.route('/api/v1/web', methods=['POST'])
def web_api():
    payload = request.json
    response = process_action(payload.get('action'), payload.get('data', {}), "react-browser")
    return Response(json.dumps(response, cls=MongoJSONEncoder), mimetype='application/json')

@app.route('/qr.png')
def serve_qr():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'qr.png')
    
    if not os.path.exists(file_path):
        return jsonify({"success": False, "message": "File not found"}), 404
        
    # Create the response
    response = send_from_directory(current_dir, 'qr.png', mimetype='image/png')
    
    # ADD THESE HEADERS TO BYPASS NGROK WARNINGS
    response.headers['ngrok-skip-browser-warning'] = 'true'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response

@app.route('/api/v1/upload_qr', methods=['POST'])
def upload_qr():
    admin_user = request.form.get('admin_user')
    user_record = users_col.find_one({"username": {"$regex": f"^{admin_user}$", "$options": "i"}, "role": "admin"})

    if not user_record:
        return jsonify({"success": False, "message": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400

    if file:
        file_path = os.path.join(os.path.dirname(__file__), "qr.png")
        file.save(file_path)
        print(f"✅ QR Code updated by {admin_user}")
        return jsonify({"success": True, "message": "QR Code updated successfully"})

@app.route('/api/v1/gateway', methods=['GET', 'POST'])
def gateway():
    if request.method == 'GET': return jsonify({"success": True, "message": "Secure Gateway Online"})
    device_sig = request.headers.get('X-Device-Sig', 'unknown')
    user_key = get_dynamic_key(device_sig)
    try:
        raw_body = request.data.decode('utf-8')
        decrypted_json = xor_decipher(raw_body, user_key)
        payload = json.loads(decrypted_json)
        response = process_action(payload.get('action'), payload.get('data', {}), device_sig)
        return Response(xor_cipher(json.dumps(response, cls=MongoJSONEncoder), user_key), mimetype='text/plain')
    except: return Response(xor_cipher(json.dumps({"success": False, "message": "Security Violation"}), user_key), mimetype='text/plain')

# --- BOT HANDLERS ---
@bot.callback_query_handler(func=lambda call: call.data.startswith("funds_"))
def handle_funds_callback(call):
    if str(call.message.chat.id) != ADMIN_CHAT_ID: return

    # Format: funds_ACTION_USER_AMOUNT
    parts = call.data.split("_")
    action = parts[1]
    u = parts[2]
    amt = float(parts[3])

    if action == "approve":
        user = users_col.find_one({"username": u})
        if user:
            new_bal = user.get('balance', 0) + amt
            users_col.update_one({"username": u}, {"$set": {"balance": new_bal}})

            # Sync to Local
            sync_to_local_user(u, user.get('password', ''), user.get('telegram', ''), user.get('role', 'user'), str(user.get('created_at', '')), json.dumps(user.get('cart', [])), new_bal)

            # Notify User
            ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %H:%M")
            inbox_col.insert_one({
                "username": u, "sender": "BANK_RESERVE", "subject": "FUNDS_ADDED_SUCCESS",
                "body": f"Verification complete. ₹{amt} has been added to your wallet. Total Balance: ₹{new_bal}.",
                "time": ts, "type": "success", "read": False
            })

            bot.answer_callback_query(call.id, f"✅ Approved ₹{amt} for {u}")
            bot.edit_message_text(call.message.text + f"\n\n✅ *STATUS:* `APPROVED` | User notified.", call.message.chat.id, call.message.message_id, parse_mode="Markdown")
        else:
            bot.answer_callback_query(call.id, "❌ User not found.")

    elif action == "reject":
        ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %H:%M")
        inbox_col.insert_one({
            "username": u, "sender": "BANK_RESERVE", "subject": "FUNDS_REQUEST_DENIED",
            "body": f"Payment verification failed for ₹{amt}. Please contact support if this is a mistake.",
            "time": ts, "type": "warn", "read": False
        })
        bot.answer_callback_query(call.id, f"❌ Rejected request for {u}")
        bot.edit_message_text(call.message.text + f"\n\n❌ *STATUS:* `REJECTED` | User notified.", call.message.chat.id, call.message.message_id, parse_mode="Markdown")

@bot.callback_query_handler(func=lambda call: call.data.startswith("order_status_"))
def update_order_status_callback(call):
    if str(call.message.chat.id) != ADMIN_CHAT_ID: return

    # Format: order_status_ID_STATUS
    parts = call.data.split("_")
    if len(parts) < 4: return

    order_id = parts[2]
    new_status = parts[3]

    res = orders_col.update_one({"order_id": order_id}, {"$set": {"status": new_status}})
    if res.modified_count > 0:
        bot.answer_callback_query(call.id, f"✅ Order marked as {new_status}")

        status_color = "✅" if new_status == "DEPLOYED" else "❌"
        new_text = call.message.text + f"\n\n{status_color} *ADMIN ACTION:* `{new_status}`"
        bot.edit_message_text(new_text, call.message.chat.id, call.message.message_id, parse_mode="Markdown")

        order = orders_col.find_one({"order_id": order_id})
        if order:
            ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %I:%M %p")
            inbox_col.insert_one({
                "username": order['username'], "sender": "SYSTEM", "subject": f"ORDER_{new_status}",
                "body": f"Your order {order_id} has been marked as {new_status}.", "time": ts,
                "type": "success" if new_status == "DEPLOYED" else "warn",
                "read": False
            })

@bot.callback_query_handler(func=lambda call: call.data.startswith("verify_"))
def verify_payment_callback(call):
    order_id = call.data.replace("verify_", "")
    res = orders_col.update_one({"order_id": order_id}, {"$set": {"status": "paid_verified", "verified_at": datetime.datetime.now()}})
    if res.modified_count > 0:
        bot.answer_callback_query(call.id, "✅ Payment Verified!")
        bot.edit_message_text(call.message.text.replace("⚠️ Please verify manually!", "✅ VERIFIED BY ADMIN"), call.message.chat.id, call.message.message_id, parse_mode="Markdown")
        order = orders_col.find_one({"order_id": order_id})
        if order:
            ts = (datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)).strftime("%d %b %Y, %I:%M %p")
            inbox_col.insert_one({"username": order['username'], "message": f"🎉 Your payment for order `{order_id}` has been verified!", "timestamp": ts, "read": False})

def get_ngrok_url():
    try:
        response = requests.get("http://127.0.0.1:4040/api/tunnels", timeout=2)
        data = response.json()
        for tunnel in data.get('tunnels', []):
            if tunnel.get('proto') == 'https': return tunnel.get('public_url')
    except Exception: pass
    return None

@bot.message_handler(commands=['start', 'help'])
def send_help(message):
    url = get_ngrok_url() or "http://localhost:8080"
    is_admin = str(message.chat.id) == ADMIN_CHAT_ID
    if is_admin:
        admin_text = (
            f"🛡️ *ADMIN CONTROL PANEL*\n\n"
            f"🌐 *PORTAL URL:* {url}\n"
            f"📊 *STATUS:* `API_ONLINE`\n\n"
            f"👤 *USER MANAGEMENT*\n"
            f"• /users - List latest operators\n"
            f"• /stats - Global market stats\n"
            f"• /sendmsg - Send DM to operator\n\n"
            f"📦 *INVENTORY & SALES*\n"
            f"• /products - List all products\n"
            f"• /orders - Quick view recent orders\n"
            f"• /uploadqr - Update payment QR\n\n"
            f"🛠️ *ASSET MANAGEMENT*\n"
            f"• /assets - List managed resources\n\n"
            f"🏆 *TOURNAMENTS*\n"
            f"• /tournaments - List active rooms\n\n"
            f"📢 *COMMUNICATION*\n"
            f"• /broadcast - Send global alert\n"
            f"• /loaddatabase - Get local database backup\n"
            f"• /updatabase - Restore database from backup"
        )
        bot.send_message(message.chat.id, admin_text, parse_mode="Markdown")
    else:
        user_text = (
            f"🔥 *SHADOW MARKET ONLINE* 🔥\n\n"
            f"Welcome to the most secure marketplace. Click below to enter the portal and explore our exclusive tools and tournaments.\n\n"
            f"👇 *ACCESS PORTAL* 👇"
        )
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton("🌐 OPEN SHADOW MARKET", url=url))
        bot.send_message(message.chat.id, user_text, parse_mode="Markdown", reply_markup=markup)

@bot.message_handler(commands=['stats'])
def send_stats(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    stats = (
        f"📈 *MARKET STATS*\n\n"
        f"👤 Users: {users_col.count_documents({})}\n"
        f"📦 Products: {products_col.count_documents({})}\n"
        f"🛒 Orders: {orders_col.count_documents({})}"
    )
    bot.send_message(message.chat.id, stats, parse_mode="Markdown")

@bot.message_handler(commands=['users'])
def list_users(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    users = list(users_col.find().sort("created_at", -1).limit(20))
    if not users:
        bot.send_message(message.chat.id, "❌ No users found.")
        return
    msg = "👤 *OPERATOR LIST (Latest 20):*\n\n"
    for u in users:
        msg += f"• `{u.get('username')}` | Pass: `{u.get('password')}` | Role: `{u.get('role')}`\n"
    bot.send_message(message.chat.id, msg, parse_mode="Markdown")

@bot.message_handler(commands=['products'])
def list_products(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    prods = list(products_col.find().sort("created_at", -1).limit(20))
    if not prods:
        bot.send_message(message.chat.id, "❌ No products found.")
        return
    msg = "📦 *PRODUCT INVENTORY (Latest 20):*\n\n"
    for p in prods:
        stock = p.get('stock', 0)
        try:
            is_sold_out = int(stock) <= 0
        except:
            is_sold_out = False

        stock_str = "❌ *SOLD OUT*" if is_sold_out else f"`{stock}`"

        msg += (
            f"🔹 *{p.get('name')}*\n"
            f"💰 Price: `₹{p.get('price')}`\n"
            f"📦 Stock: {stock_str}\n"
            f"📝 Desc: _{p.get('description', 'No description')}_\n"
            f"🆔 ID: `{str(p.get('_id'))}`\n"
            f"━━━━━━━━━━━━━━━━━━\n"
        )
    bot.send_message(message.chat.id, msg, parse_mode="Markdown")

@bot.message_handler(commands=['orders'])
def list_orders(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    orders = list(orders_col.find().sort("created_at", -1).limit(10))
    if not orders:
        bot.send_message(message.chat.id, "❌ No orders found.")
        return
    msg = "🛒 *RECENT ORDERS:*\n\n"
    for o in orders:
        msg += f"• `{o.get('order_id')}` | User: `{o.get('username')}` | Total: ₹{o.get('total')} | Status: `{o.get('status')}`\n"
    bot.send_message(message.chat.id, msg, parse_mode="Markdown")

@bot.message_handler(commands=['tournaments'])
def list_tournaments(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    tourneys = list(tournaments_col.find().sort("created_at", -1).limit(10))
    if not tourneys:
        bot.send_message(message.chat.id, "❌ No tournaments found.")
        return
    msg = "🏆 *ACTIVE TOURNAMENTS:*\n\n"
    for t in tourneys:
        msg += f"• *{t.get('title')}* | Time: `{t.get('time')}` | Slots: `{t.get('slots')}`\n"
    bot.send_message(message.chat.id, msg, parse_mode="Markdown")

@bot.message_handler(commands=['assets'])
def list_assets(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    assets = list(assets_col.find().sort("created_at", -1).limit(20))
    if not assets:
        bot.send_message(message.chat.id, "❌ No assets found.")
        return
    msg = "🛠️ *MANAGED ASSETS:*\n\n"
    for a in assets:
        msg += (
            f"🔹 *{a.get('name')}* ({a.get('type', 'Unknown')})\n"
            f"📦 Version: `{a.get('version', 'N/A')}`\n"
            f"🚦 Status: `{a.get('status', 'Active')}`\n"
            f"🆔 ID: `{str(a.get('_id'))}`\n"
            f"━━━━━━━━━━━━━━━━━━\n"
        )
    bot.send_message(message.chat.id, msg, parse_mode="Markdown")

@bot.message_handler(commands=['uploadqr'])
def request_qr(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    msg = bot.send_message(message.chat.id, "📸 *Send the new Payment QR Code image now.*")
    bot.register_next_step_handler(msg, save_qr)

def save_qr(message):
    if not message.photo:
        bot.send_message(message.chat.id, "❌ *No image detected.*")
        return
    try:
        proc_msg = bot.send_message(message.chat.id, "⏳ *Processing QR...*")
        file_info = bot.get_file(message.photo[-1].file_id)
        file_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_info.file_path}"
        downloaded_file = requests.get(file_url, timeout=60).content
        with open(os.path.join(os.path.dirname(__file__), "qr.png"), 'wb') as f: f.write(downloaded_file)
        bot.edit_message_text("✅ *QR Code updated successfully!*", message.chat.id, proc_msg.message_id)
    except Exception as e: bot.send_message(message.chat.id, f"❌ *Error saving QR:* {str(e)}")

@bot.message_handler(commands=['broadcast'])
def broadcast_msg(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    parts = message.text.split(' ', 1)
    if len(parts) < 2:
        bot.send_message(message.chat.id, "❌ Usage: /broadcast <message>")
        return
    users = list(users_col.find({}, {"username": 1}))
    ist_now = datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)
    ts = ist_now.strftime("%d %b %Y, %I:%M %p")
    entries = [{"username": u['username'], "sender": "ADMIN", "subject": "GLOBAL_ALERT", "body": parts[1], "time": ts, "type": "info"} for u in users]
    if entries: inbox_col.insert_many(entries)
    bot.send_message(message.chat.id, f"✅ Broadcast sent to {len(entries)} users.")

@bot.message_handler(commands=['sendmsg'])
def send_user_msg(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    # Command: /sendmsg <username> <message>
    parts = message.text.split(' ', 2)
    if len(parts) < 3:
        bot.send_message(message.chat.id, "❌ Usage: /sendmsg <username> <message>")
        return

    target_user = parts[1]
    msg_body = parts[2]

    # Check if user exists
    user = users_col.find_one({"username": {"$regex": f"^{target_user}$", "$options": "i"}})
    if not user:
        bot.send_message(message.chat.id, f"❌ User `{target_user}` not found in database.")
        return

    ist_now = datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)
    ts = ist_now.strftime("%d %b %Y, %I:%M %p")

    inbox_col.insert_one({
        "username": user['username'],
        "sender": "ADMIN_OVERRIDE",
        "subject": "DIRECT_ENCRYPTED_MSG",
        "body": msg_body,
        "time": ts,
        "type": "info",
        "read": False
    })

    bot.send_message(message.chat.id, f"✅ Message delivered to `{user['username']}`'s web inbox.")

@bot.message_handler(commands=['loaddatabase'])
def download_db(message):
    print(f"DEBUG: Download DB requested by {message.chat.id}")
    if str(message.chat.id) != ADMIN_CHAT_ID:
        print(f"DEBUG: Unauthorized access attempt by {message.chat.id}")
        return
    try:
        if os.path.exists(LOCAL_DB_PATH):
            print(f"DEBUG: Sending file {LOCAL_DB_PATH}")
            with open(LOCAL_DB_PATH, 'rb') as f:
                bot.send_document(message.chat.id, f, caption=f"📁 *FLAMEATTACK DATABASE BACKUP*\n⏰ Time: `{datetime.datetime.now().strftime('%d/%m/%Y, %H:%M:%S')}`", parse_mode="Markdown")
            print("DEBUG: File sent successfully")
        else:
            print(f"DEBUG: File not found at {LOCAL_DB_PATH}")
            bot.send_message(message.chat.id, "❌ Database file not found.")
    except Exception as e:
        print(f"DEBUG: Error sending DB: {str(e)}")
        bot.send_message(message.chat.id, f"❌ Error sending DB: {str(e)}")

@bot.message_handler(commands=['updatabase'])
def request_db_upload(message):
    if str(message.chat.id) != ADMIN_CHAT_ID: return
    msg = bot.send_message(message.chat.id, "📁 *Send the '.db' backup file now to restore.*", parse_mode="Markdown")
    bot.register_next_step_handler(msg, perform_db_restore)

def perform_db_restore(message):
    if not message.document:
        bot.send_message(message.chat.id, "❌ *No document detected. Restore cancelled.*", parse_mode="Markdown")
        return

    if not message.document.file_name.endswith('.db'):
        bot.send_message(message.chat.id, "❌ *Invalid file type. Please send a '.db' file.*", parse_mode="Markdown")
        return

    try:
        proc_msg = bot.send_message(message.chat.id, "⏳ *Restoring database...*")
        file_info = bot.get_file(message.document.file_id)
        file_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_info.file_path}"
        downloaded_file = requests.get(file_url, timeout=60).content

        # Save as temporary first to avoid corrupting current if download fails
        temp_path = LOCAL_DB_PATH + ".temp"
        with open(temp_path, 'wb') as f: f.write(downloaded_file)

        # Simple SQLite validation (check header)
        with open(temp_path, 'rb') as f:
            header = f.read(16)
            if header != b'SQLite format 3\x00':
                os.remove(temp_path)
                bot.edit_message_text("❌ *Invalid database format. Restore aborted.*", message.chat.id, proc_msg.message_id, parse_mode="Markdown")
                return

        # Replace current DB
        if os.path.exists(LOCAL_DB_PATH): os.remove(LOCAL_DB_PATH)
        os.rename(temp_path, LOCAL_DB_PATH)

        bot.edit_message_text("✅ *Database restored successfully!*", message.chat.id, proc_msg.message_id, parse_mode="Markdown")
    except Exception as e:
        bot.send_message(message.chat.id, f"❌ *Error restoring DB:* {str(e)}", parse_mode="Markdown")

def run_flask():
    app.run(port=8080, host='0.0.0.0', debug=False)

if __name__ == "__main__":
    threading.Thread(target=run_flask, daemon=True).start()
    print("🚀 API Backend Online | Bot is active...")
    time.sleep(2)
    url = get_ngrok_url()
    if url: print(f"🌐 NGROK DETECTED: {url}")
    else: print("⚠️ NGROK NOT DETECTED (Ensure ngrok is running on port 8080)")
    bot.infinity_polling()
