from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_DETAILS = "mongodb+srv://pj0431205_db_user:CK2kIa960gB5M1WT@cluster0.o6qq3hn.mongodb.net/SolarGuard_AI"
client = None
db = None

def get_database():
    return db

async def connect_to_mongo():
    global client, db
    try:
        client = AsyncIOMotorClient(MONGO_DETAILS)
        db = client.solarguard_db
        print("Connected to MongoDB!")
    except Exception as e:
        print(f"Could not connect to MongoDB: {e}")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")
