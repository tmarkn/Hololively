import datetime
import json
import mysql.connector
import os
import re
import warnings
import sys
from bs4 import BeautifulSoup as bs
from dateutil import tz
from dotenv import load_dotenv
from urllib.request import urlopen

from json_serial import json_serial

from_zone = tz.gettz('Asia/Tokyo')

load_dotenv()
DATABASE_USERNAME = os.getenv("DATABASE_USERNAME")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("DATABASE_NAME")

try:
    with open('static/json/memberPhotos.json', 'r', encoding='utf-8') as f:
        members = json.load(f)
        useLocalFile = True
except:
    warnings.warn('No memberPhotos.json found: Assuming SQL database connection')
    useLocalFile = False

class Stream:
    def __init__(self, link, host, time, thumbnail, collaborators = [], live = False):
        self.link = link
        self.host = host
        self.time = time
        self.thumbnail = thumbnail
        self.collaborators = collaborators
        self.live = live

def API(query, db = None):
    if not useLocalFile and db == None:
        raise sys.exit('No memberPhotos.JSON or Database Connection provided')
    elif not useLocalFile and db:
        cursor = db.cursor()
        q = """
            SELECT member_name, photo_url FROM member_photos  t1
            WHERE t1.time_added = 
                (SELECT max(time_added) FROM member_photos t2 WHERE t2.member_name = t1.member_name);
        """
        cursor.execute(q)
        newResults = cursor.fetchall()

        members = {}
        for result in newResults:
            members[result[1]] = result[0]

    url = 'https://schedule.hololive.tv/lives/' + query

    text = urlopen(url).read()
    soup = bs(text, "html.parser")

    data = soup.find('div', attrs={'id': 'all'})
    containers = data.findAll('div', attrs={'class': 'container'}, recursive=False)
    containers.extend(soup.findAll('div', attrs={'class': 'container'}, recursive=False))

    data = []
    currentDay = None
    for cont in containers:
        # find day header
        dayHeader = cont.find('div', attrs={'class': 'holodule navbar-text'})
        
        if dayHeader:
            # set date
            date = datetime.datetime.strptime(dayHeader.text.split()[0], '%m/%d')
            # set year
            if date.month == 12 and datetime.datetime.now().month == 1:
                date = date.replace(year=datetime.datetime.now().year-1)
            elif date.month == 1 and datetime.datetime.now().month == 12:
                date = date.replace(year=datetime.datetime.now().year+1)
            else:
                date = date.replace(year=datetime.datetime.now().year)

            currentDay = date

        # find inner containers
        streams = cont.findAll('a', attrs={'class': 'thumbnail'})
        for stream in streams:
            # stream link
            link = stream['href']

            # filter only lives
            parent = stream.find_parent('div')
            if 'col-11' in parent.get("class"):
                continue

            # host
            try:
                host = stream.find('div', attrs={'class': 'name'}).text.strip()
            except AttributeError as e:
                print(f'Name error: {e}')
                continue

            # time
            try:
                rawTime = stream.find('div', attrs={'class': 'datetime'}).text.strip().split(':')
            except Exception as e:
                print(f'Datetime error: {e}')
                continue
            
            time = currentDay.replace(hour=int(rawTime[0]), minute=int(rawTime[1]), tzinfo=from_zone)

            # thumbnail
            thumbnail = stream.findAll('img')[1]['src']

            # collaborators
            collabContainer = stream.findAll('div', attrs={'class': 'no-gutters'})
            collabImages = collabContainer[1].findAll('img')
            collaborators = []

            for image in collabImages:
                if image['src'] in members:
                    collaborators.append(members[image['src']])
                else:
                    print('\tnot found: ' + image['src'])
                    with open("unknown_members.txt", 'a') as f:
                        f.write(image['src'])
                        f.write('\n')
            
            # live
            live = bool(re.search(r"border: 3px red", stream.attrs.get('style')))

            # Stream
            data.append(Stream(link, host, time, thumbnail, collaborators, live))

    return json.dumps([x.__dict__ for x in data], default=json_serial, ensure_ascii=False)

if __name__ == '__main__':
    db = mysql.connector.connect(
        host = DATABASE_HOST,
        user = DATABASE_USERNAME,
        passwd = DATABASE_PASSWORD,
        db = DATABASE_NAME
    )
    print(API('', db))
    db.close()