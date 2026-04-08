import os
from datetime import datetime
from bson import ObjectId
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = MongoClient(os.getenv('MONGO_URI'))
db = client.freelancehub



def is_admin(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return user and user.get("role") == "admin"





# ====================== SEED (données de test) ======================

@app.route('/api/seed', methods=['GET'])
def seed():
    # Clear existing collections
    db.users.delete_many({})
    db.gigs.delete_many({})
    db.products.delete_many({})
    db.offers.delete_many({})
    db.proposals.delete_many({})
    db.messages.delete_many({})

    # --- USERS ---

    # Admin
    db.users.insert_one({
        "email": "admin@ensit.tn",
        "password": generate_password_hash("admin123"),
        "name": "Super Admin",
        "role": "admin",
        "status": "active"
    })

    # Freelancer (pending validation)
    freelancer = {
        "email": "freelancer@ensit.tn",
        "password": generate_password_hash("freelancer123"),
        "name": "Ahmed Ben Ali",
        "role": "freelancer",
        "status": "pending",  # pending until admin approves CV/profile
        "bio": "Développeur FullStack & IA",
        "skills": ["Python", "Angular", "IA", "Flask"],
        "cv": "cv_ahmed.pdf",
        "portfolio": []
    }
    freelancer_id = db.users.insert_one(freelancer).inserted_id

    # Client
    db.users.insert_one({
        "email": "client@ensit.tn",
        "password": generate_password_hash("client123"),
        "name": "Sara Trabelsi",
        "role": "client",
        "status": "active"
    })

    # --- GIGS ---
    db.gigs.insert_many([
        {
            "freelancer_id": freelancer_id,
            "title": "Développement site e-commerce",
            "description": "Site complet avec Ionic + Flask",
            "price": 450,
            "tags": ["web", "ecommerce"],
            "status": "approved"
        },
        {
            "freelancer_id": freelancer_id,
            "title": "Modèle IA de détection d'objets",
            "description": "Modèle YOLOv8 prêt à l'emploi",
            "price": 120,
            "tags": ["ia", "ml"],
            "status": "approved"
        }
    ])

    # --- STORE PRODUCTS ---
    db.products.insert_many([
        {
            "title": "Starter Kit Ionic + Flask",
            "description": "Template complet pour démarrer un projet similaire",
            "price": 29,
            "category": "code-source",
            "version": "1.2",
            "license": "Commercial",
            "file_name": "starter-kit.zip",
            "status": "pending"  # pending until admin approves
        },
        {
            "title": "Modèle IA Chatbot Tunisien",
            "description": "Fine-tuned sur dialecte tunisien",
            "price": 49,
            "category": "ia-model",
            "version": "2.0",
            "license": "Commercial",
            "file_name": "chatbot-model.zip",
            "status": "pending"
        }
    ])

    return jsonify({"message": "✅ Base de données seedée avec succès !"})


# ====================== AUTH ======================
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if db.users.find_one({"email": data["email"]}):
        return jsonify({"error": "Email déjà utilisé"}), 400

    user = {
        "email": data["email"],
        "password": generate_password_hash(data["password"]),
        "name": data.get("name", ""),
        "role": data["role"],
        "status": "pending" if data["role"] == "freelancer" else "active",
        "bio": "",
        "skills": [],
        "cv": "",
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(user)
    return jsonify({"message": "Inscription réussie !"}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = db.users.find_one({"email": data["email"]})
    
    if not user or not check_password_hash(user["password"], data["password"]):
        return jsonify({"error": "Identifiants invalides"}), 401
    
    # Only block users who are neither approved nor active
    if user["status"] != "approved" and user["status"] != "active":
        return jsonify({"error": "Compte en attente de validation"}), 403

    token = create_access_token(identity=str(user["_id"]), additional_claims={"role": user["role"]})
    return jsonify({
        "access_token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "role": user["role"]
        }
    })
'''

# payload 1 : {"email": {"$ne": null}, "password": {"$ne": null}}
# payload 2 : "admin@ensit.tn" + {"$ne": "wrong"}
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # === VERSION VULNÉRABLE À NoSQL INJECTION ===
    # On passe directement les inputs de l'utilisateur dans la query MongoDB
    # Sans aucune sanitization ni typage
    user = db.users.find_one({
        "email": email,      # ← Peut être un objet comme {"$ne": null}
        "password": password # ← Peut contenir des opérateurs MongoDB
    })

    if user:
        # On simule la création de token (même si bypass)
        token = create_access_token(identity=str(user["_id"]), additional_claims={"role": user["role"]})
        return jsonify({
            "access_token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "role": user["role"],
                "message": "Login successful (VULNERABLE MODE)"
            }
        })

    return jsonify({"error": "Identifiants invalides"}), 401



'''






# ====================== PROFIL FREELANCER ======================
@app.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    if request.method == 'GET':
        user = db.users.find_one({"_id": ObjectId(user_id)})
        user["_id"] = str(user["_id"])
        return jsonify(user)
    else:
        data = request.get_json()
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": data})
        return jsonify({"message": "Profil mis à jour"})

# ====================== GIGS ======================
@app.route('/api/gigs', methods=['POST'])
@jwt_required()
def create_gig():
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user["role"] != "freelancer":
        return jsonify({"error": "Seuls les freelancers peuvent créer des gigs"}), 403
    data = request.get_json()
    gig = {**data, "freelancer_id": ObjectId(user_id), "status": "pending", "created_at": datetime.utcnow()}
    result = db.gigs.insert_one(gig)
    return jsonify({"id": str(result.inserted_id), "message": "Gig créé (en attente de validation admin)"}), 201

@app.route('/api/gigs', methods=['GET'])
def get_gigs():
    gigs = list(db.gigs.find({"status": "approved"}))
    for g in gigs:
        g["_id"] = str(g["_id"])
        g["freelancer_id"] = str(g["freelancer_id"])
    return jsonify(gigs)

# ====================== ADMIN ======================
@app.route('/api/admin/pending', methods=['GET'])
@jwt_required()
def admin_pending():
    user_id = get_jwt_identity()

    if not is_admin(user_id):
        return jsonify({"error": "Accès refusé"}), 403

    users = list(db.users.find({"status": "pending"}))
    gigs = list(db.gigs.find({"status": "pending"}))
    products = list(db.products.find({"status": "pending"}))

    for u in users:
        u["_id"] = str(u["_id"])

    for g in gigs:
        g["_id"] = str(g["_id"])
        g["freelancer_id"] = str(g["freelancer_id"])

    for p in products:
        p["_id"] = str(p["_id"])

    return jsonify({
        "pending_users": users,
        "pending_gigs": gigs,
        "pending_products": products
    })

@app.route('/api/admin/validate/user/<user_id>', methods=['POST'])
@jwt_required()
def validate_user(user_id):
    admin_id = get_jwt_identity()

    if not is_admin(admin_id):
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
    status = data.get("status")

    if status not in ["approved", "rejected", "active"]:
        return jsonify({"error": "Statut invalide"}), 400

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"status": status}}
    )

    return jsonify({"message": "Utilisateur mis à jour"})

@app.route('/api/admin/validate/gig/<gig_id>', methods=['POST'])
@jwt_required()
def validate_gig(gig_id):
    admin_id = get_jwt_identity()

    if not is_admin(admin_id):
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
    status = data.get("status")

    if status not in ["approved", "rejected"]:
        return jsonify({"error": "Statut invalide"}), 400

    db.gigs.update_one(
        {"_id": ObjectId(gig_id)},
        {"$set": {"status": status}}
    )

    return jsonify({"message": "Gig mis à jour"})


@app.route('/api/admin/validate/product/<product_id>', methods=['POST'])
@jwt_required()
def validate_product(product_id):
    admin_id = get_jwt_identity()

    if not is_admin(admin_id):
        return jsonify({"error": "Accès refusé"}), 403

    data = request.get_json()
    status = data.get("status")

    if status not in ["approved", "rejected"]:
        return jsonify({"error": "Statut invalide"}), 400

    db.products.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"status": status}}
    )

    return jsonify({"message": "Produit mis à jour"})




# ====================== OFFRES & PROPOSALS ======================
@app.route('/api/offers', methods=['POST', 'GET'])
@jwt_required()
def offers():
    # implémentation complète identique aux gigs (je te la donne si tu veux le détail)
    pass  # (code complet disponible sur demande ou je peux l’ajouter)

# ====================== MESSAGERIE ======================
@app.route('/api/messages', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    msg = {
        "from_id": ObjectId(get_jwt_identity()),
        "to_id": ObjectId(data["to_id"]),
        "content": data["content"],
        "timestamp": datetime.utcnow()
    }
    db.messages.insert_one(msg)
    return jsonify({"message": "Message envoyé"})

@app.route('/api/messages/<partner_id>', methods=['GET'])
@jwt_required()
def get_chat(partner_id):
    user_id = get_jwt_identity()
    msgs = list(db.messages.find({
        "$or": [
            {"from_id": ObjectId(user_id), "to_id": ObjectId(partner_id)},
            {"from_id": ObjectId(partner_id), "to_id": ObjectId(user_id)}
        ]
    }).sort("timestamp", 1))
    for m in msgs:
        m["_id"] = str(m["_id"])
        m["from_id"] = str(m["from_id"])
    return jsonify(msgs)

# ====================== STORE ======================
@app.route('/api/products', methods=['GET'])
def get_products():
    products = list(db.products.find({"status": "approved"}))

    for p in products:
        p["_id"] = str(p["_id"])

    return jsonify(products)
# ====================== LANCER LE SERVEUR ======================
if __name__ == '__main__':
    # Seed automatique la première fois
    if db.users.count_documents({}) == 0:
        print("🌱 Première exécution → seeding...")
        # tu peux appeler /api/seed depuis Postman une fois
    app.run(host='0.0.0.0', port=5000, debug=True)