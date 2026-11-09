# Foodlink – Database Setup & Administration Guide (MongoDB)

This guide provides step-by-step instructions for installing, configuring, indexing, and maintaining the MongoDB database instance for the Foodlink platform.

---

## 1. MongoDB Installation & Service Management

### Ubuntu Linux Installation
Foodlink requires **MongoDB Community Edition 7.0+**:

```bash
# Import the official MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add the MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install packages
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start and enable the mongod daemon
sudo systemctl daemon-reload
sudo systemctl enable mongod
sudo systemctl start mongod

# Verify status
sudo systemctl status mongod
```

### Connection Test
Verify MongoDB is listening locally on port `27017`:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
# Expected response: { ok: 1 }
```

---

## 2. Collections and Geospatial Indexing

Foodlink relies on 10 Mongoose schemas with compound and geospatial indexes. These indexes are automatically created by Mongoose upon service startup:

| Collection | Key Indexes | Purpose |
| :--- | :--- | :--- |
| `users` | `{ email: 1 }` (unique) | Authentication lookups and duplicate prevention |
| `users` | `{ role: 1, accountStatus: 1 }` | Fast role-based filtering and admin audits |
| `ngoprofiles` | `{ user: 1 }` (unique) | 1-to-1 link between User and NGO profile |
| `ngoprofiles` | `{ location: "2dsphere" }` | Geospatial proximity queries and distance matching |
| `deliveryprofiles` | `{ user: 1 }` (unique) | 1-to-1 link between User and Courier profile |
| `deliveryprofiles` | `{ "serviceArea.currentCoordinates": "2dsphere" }` | Proximity dispatching of available volunteer couriers |
| `donations` | `{ location: "2dsphere" }` | Radius-based matching of surplus food to recipient NGOs |
| `donations` | `{ status: 1, pickupDeadline: 1 }` | Expiry engine background polling & filtering |
| `donations` | `{ donor: 1, createdAt: -1 }` | Donor inventory history and dashboard sorting |
| `donationrequests` | `{ donation: 1, ngo: 1 }` (unique) | Duplicate request prevention |
| `deliveryassignments`| `{ donation: 1 }` (unique) | Enforcing single courier per rescue assignment |
| `notifications` | `{ recipient: 1, isRead: 1, createdAt: -1 }` | Notification inbox polling and unread counts |

---

## 3. Database Seeding & Reset

### Clean Reset with Karnataka Dataset
To reset all collections and seed authentic Karnataka, India accounts and surplus food listings:

```bash
cd /home/srujan/FOODLINK/backend
node src/scripts/seedAll.js
```

### Script Execution Flow
1. Connects to `mongodb://127.0.0.1:27017/foodlink`.
2. Purges all 10 collections (`User`, `Donation`, `NGOProfile`, `DeliveryProfile`, etc.).
3. Provisions verified accounts:
   - Admin: `admin@foodlink.org` (Karnataka Foodlink Administration)
   - Donor: `donor@foodlink.org` (Mavalli Tiffin Room - MTR Bengaluru)
   - NGO: `ngo@foodlink.org` (Bengaluru Annapoorna Seva Trust)
   - Courier: `courier@foodlink.org` (Basavaraj Gowda, KA-04-NB-4421)
4. Seeds 4 authentic surplus listings in Bengaluru and Mysuru with food safety checklists.
5. Disconnects cleanly with exit code 0.

---

## 4. Backup & Recovery Procedures

### Create a Complete Backup (`mongodump`)
```bash
# Dump the active foodlink database to a timestamped archive
BACKUP_DIR="/tmp/foodlink_backup_$(date +%Y%m%d_%H%M%S)"
mongodump --db=foodlink --out="$BACKUP_DIR"
echo "Backup created at $BACKUP_DIR"
```

### Restore from Backup (`mongorestore`)
```bash
# Restore collections from a backup directory
mongorestore --db=foodlink --drop "$BACKUP_DIR/foodlink"
```

---

## 5. Troubleshooting Common Issues

### Issue 1: `connect ECONNREFUSED 127.0.0.1:27017`
- **Cause**: The `mongod` service is stopped or not listening on loopback.
- **Fix**: Run `sudo systemctl restart mongod`. Verify logs with `sudo journalctl -u mongod -n 50`.

### Issue 2: `2dsphere index error: Point coordinates must be [longitude, latitude]`
- **Cause**: GeoJSON standard requires `[lng, lat]` order (e.g. `[77.5946, 12.9716]` for Bengaluru).
- **Fix**: Ensure longitude is entered first in coordinates arrays across models and seeds.

