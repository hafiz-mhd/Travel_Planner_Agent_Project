import sqlite3

db_path = "travel_planner.db"
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("TABLES:", [t[0] for t in tables])

for (table_name,) in tables:
    print(f"\n--- {table_name} SCHEMA ---")
    cur.execute(f"PRAGMA table_info({table_name})")
    cols = cur.fetchall()
    for col in cols:
        print(f"  col_id={col[0]} name={col[1]} type={col[2]} notnull={col[3]} dflt={col[4]} pk={col[5]}")

    cur.execute(f"SELECT COUNT(*) FROM {table_name}")
    count = cur.fetchone()[0]
    print(f"  ROW COUNT: {count}")

    if table_name == "users" and count > 0:
        cur.execute(f"SELECT id, email, name FROM {table_name} LIMIT 5")
        rows = cur.fetchall()
        print("  SAMPLE USER ROWS (id, email, name):")
        for r in rows:
            print(f"    {r}")

conn.close()
print("\nDone.")
