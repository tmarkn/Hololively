import json
import mysql.connector
import os
from dotenv import load_dotenv

def getMostRecentPicture(dbCur):
    results = []
    query = """
        SELECT member_name, photo_url from member_photos t1
        WHERE t1.time_added = 
            (SELECT max(time_added) FROM member_photos t2 WHERE t2.member_name = t1.member_name);
    """
    dbCur.execute(query)
    results = dbCur.fetchall()

    dict = {}
    for member in results:
        dict[member[0]] = member[1]

    return(dict)

if __name__ == "__main__":
    load_dotenv()
    DATABASE_USERNAME = os.getenv("DATABASE_USERNAME")
    DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
    DATABASE_HOST = os.getenv("DATABASE_HOST")
    DATABASE_NAME = os.getenv("DATABASE_NAME")

    with mysql.connector.connect(
        host = DATABASE_HOST,
        user = DATABASE_USERNAME,
        passwd = DATABASE_PASSWORD,
        db = DATABASE_NAME
    ) as db:
        dbCur = db.cursor()
        print(getMostRecentPicture(dbCur))
