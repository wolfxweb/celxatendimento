"""
Database Migration Script

Execute this script to create all tables in the PostgreSQL database.
Usage: python -m database.migrate
"""

import asyncio
import asyncpg
import os
from pathlib import Path

# Get database URL from environment or use default
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/celx_atendimento"
)


async def run_migrations():
    """Run all migrations"""

    print("Connecting to database...")
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        print("Creating extension: uuid-ossp")
        await conn.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

        # Read schema file
        schema_path = Path(__file__).parent / "schema.sql"
        schema_sql = schema_path.read_text()

        # Execute schema
        print("Executing schema.sql...")
        await conn.execute(schema_sql)

        print("\n✅ Migrations completed successfully!")

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        await conn.close()


if __name__ == "__main__":
    asyncio.run(run_migrations())
