"""
migrate_db.py – Safe schema migration for travel_planner.db

Run from project root:
    python migrate_db.py

What it does:
  - Reads travel_planner.db
  - Adds any missing columns to users / trips / itinerary_items tables
  - Creates any missing tables from scratch
  - Does NOT delete existing data
  - Idempotent – safe to run multiple times
"""
import sqlite3
import os
import sys

DB_PATH = os.path.join(os.path.dirname(__file__), "travel_planner.db")


def get_existing_columns(cur, table_name):
    cur.execute(f"PRAGMA table_info({table_name})")
    return {row[1] for row in cur.fetchall()}


def table_exists(cur, table_name):
    cur.execute(
        "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=?",
        (table_name,),
    )
    return cur.fetchone()[0] > 0


def migrate():
    print(f"Connecting to: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # ── users table ──────────────────────────────────────────────────────────
    if not table_exists(cur, "users"):
        print("Creating users table from scratch...")
        cur.execute("""
            CREATE TABLE users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                email       VARCHAR(255) NOT NULL UNIQUE,
                name        VARCHAR(255) NOT NULL,
                password    VARCHAR(255),
                preferences VARCHAR(1000),
                created_at  DATETIME NOT NULL DEFAULT (datetime('now')),
                updated_at  DATETIME NOT NULL DEFAULT (datetime('now'))
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)")
        print("  ✓ users table created.")
    else:
        existing = get_existing_columns(cur, "users")
        print(f"  users table exists. Current columns: {existing}")

        # Add missing columns one by one (SQLite ALTER TABLE only supports ADD COLUMN)
        missing_columns = {
            "password":    "ALTER TABLE users ADD COLUMN password    VARCHAR(255)",
            "preferences": "ALTER TABLE users ADD COLUMN preferences VARCHAR(1000)",
            "created_at":  "ALTER TABLE users ADD COLUMN created_at  DATETIME NOT NULL DEFAULT (datetime('now'))",
            "updated_at":  "ALTER TABLE users ADD COLUMN updated_at  DATETIME NOT NULL DEFAULT (datetime('now'))",
        }
        for col_name, ddl in missing_columns.items():
            if col_name not in existing:
                print(f"  Adding missing column: {col_name}")
                cur.execute(ddl)
                print(f"  ✓ Added column: {col_name}")
            else:
                print(f"  ✓ Column already exists: {col_name}")

    # ── trips table ──────────────────────────────────────────────────────────
    if not table_exists(cur, "trips"):
        print("Creating trips table from scratch...")
        cur.execute("""
            CREATE TABLE trips (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title         VARCHAR(500) NOT NULL,
                destination   VARCHAR(500) NOT NULL,
                start_date    DATE NOT NULL,
                end_date      DATE NOT NULL,
                budget_min    REAL,
                budget_max    REAL,
                num_travelers INTEGER NOT NULL DEFAULT 1,
                interests     VARCHAR(500),
                raw_itinerary TEXT,
                created_at    DATETIME NOT NULL DEFAULT (datetime('now')),
                updated_at    DATETIME NOT NULL DEFAULT (datetime('now'))
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_trips_user ON trips (user_id)")
        print("  ✓ trips table created.")
    else:
        existing = get_existing_columns(cur, "trips")
        print(f"  trips table exists. Current columns: {existing}")
        trips_missing = {
            "raw_itinerary": "ALTER TABLE trips ADD COLUMN raw_itinerary TEXT",
            "updated_at":    "ALTER TABLE trips ADD COLUMN updated_at DATETIME NOT NULL DEFAULT (datetime('now'))",
        }
        for col_name, ddl in trips_missing.items():
            if col_name not in existing:
                print(f"  Adding missing column: {col_name}")
                cur.execute(ddl)
                print(f"  ✓ Added column: {col_name}")
            else:
                print(f"  ✓ Column already exists: {col_name}")

    # ── itinerary_items table ─────────────────────────────────────────────────
    if not table_exists(cur, "itinerary_items"):
        print("Creating itinerary_items table from scratch...")
        cur.execute("""
            CREATE TABLE itinerary_items (
                id             INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id        INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
                day_number     INTEGER NOT NULL,
                period         VARCHAR(20) NOT NULL,
                activity       VARCHAR(1000) NOT NULL,
                location       VARCHAR(500),
                description    TEXT,
                estimated_cost REAL,
                weather_risk   VARCHAR(100) DEFAULT 'low',
                tips           TEXT
            )
        """)
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_items_trip_day ON itinerary_items (trip_id, day_number)"
        )
        print("  ✓ itinerary_items table created.")
    else:
        print("  ✓ itinerary_items table exists.")

    conn.commit()
    conn.close()

    # Final report
    conn2 = sqlite3.connect(DB_PATH)
    cur2 = conn2.cursor()
    print("\n─── Final Schema ───────────────────────────────")
    for tbl in ("users", "trips", "itinerary_items"):
        if table_exists(cur2, tbl):
            cur2.execute(f"PRAGMA table_info({tbl})")
            cols = [r[1] for r in cur2.fetchall()]
            cur2.execute(f"SELECT COUNT(*) FROM {tbl}")
            count = cur2.fetchone()[0]
            print(f"  {tbl}: {cols}  ({count} rows)")
    conn2.close()
    print("\n✅ Migration complete. Database is ready.")


if __name__ == "__main__":
    migrate()
