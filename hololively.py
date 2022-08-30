import markdown
import mysql.connector
import os
import requests
from api import API
from mostRecentPictures import getMostRecentPicture
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask import Flask, render_template, url_for, request, make_response

load_dotenv()
GA_MEASUREMENT_ID = os.getenv("GA_MEASUREMENT_ID")
DATABASE_USERNAME = os.getenv("DATABASE_USERNAME")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_NAME = os.getenv("DATABASE_NAME")

def track_api(userAgent=None):
    data = {
        'v': '1',  # API Version.
        'tid': GA_MEASUREMENT_ID,  # Tracking ID / Property ID.
        'cid': '555',
        't': 'pageview',  # Event hit type.
        'dt': 'Hololively - API', # Page title
        'dh': 'hololively.com', # Site Name
        'dp': '/api', # Path name
        'ua': userAgent
    }

    response = requests.post(
        'https://www.google-analytics.com/collect', params=data)

    return response

app = Flask(__name__, static_url_path='/static')
timestamp = datetime.now(timezone.utc)

def connectToDb():
    return mysql.connector.connect(
        host = DATABASE_HOST,
        user = DATABASE_USERNAME,
        passwd = DATABASE_PASSWORD,
        db = DATABASE_NAME
    )

# with open('static/json/memberPhotos.json', 'r', encoding="utf-8") as f:
#     memberPhotos = f.read()
with open('about.md', 'r', encoding="utf-8") as f:
    aboutText = f.read()
with open('README.md', 'r', encoding="utf-8") as f:
    documentationText = f.read()
with open('policy.md', 'r', encoding="utf-8") as f:
    policyText = f.read()
with open('faq.md', 'r', encoding="utf-8") as f:
    faqText = f.read()

@app.route('/')
@app.route('/home/')
def home():
    
    query = request.args.get('q')
    if not query:
        query = ''
    db = connectToDb()
    streams = API(query=query, db=db)
    db.close()
    return render_template('calendar.html', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, streams=streams, upcoming='false')

@app.route('/upcoming/')
def active():
    query = request.args.get('q')
    if not query:
        query = ''
    db = connectToDb()
    streams = API(query=query, db=db)
    db.close()
    return render_template('calendar.html', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, streams=streams, upcoming='true')

@app.route('/about/')
@app.route('/policy/')
@app.route('/faq/')
def about():
    return render_template('about.html', 
        title='About', 
        GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, 
        aboutText=markdown.markdown(aboutText), 
        faqText=markdown.markdown(faqText),
        policyText=markdown.markdown(policyText)
    )

@app.route('/api/')
@app.route('/api/<query>')
@app.route('/api/<query>/')
def api(query = ''):
    response = track_api(request.headers.get('User-Agent'))
    if not response.ok:
        print(response.content)
    endpoints = [
        "",
        "hololive",
        "holostars",
        "innk",
        "china",
        "indonesia",
        "english",
        "holostars_english"
    ]
    db = connectToDb()
    if query not in endpoints:
        response = app.response_class(
            status = 400,
            content_type='application/json; charset=utf-8',
            response = '{' +
                '"status": 400, ' + 
                f'"timestamp": "{datetime.now(timezone.utc).isoformat()}",' + 
                '"message": "Invalid or incomplete request. Please double check the request documentation"' +
            '}'
        )
    else:
        response = app.response_class(
            status = 200,
            content_type='application/json; charset=utf-8',
            response = '{' +
                '"status": 200, ' +
                f'"timestamp": "{datetime.now(timezone.utc).isoformat()}",' + 
                f'"streams": {API(query=query, db=db)}' +
            '}'
        )
    db.close()
    return response

@app.route('/docs/')
def docs():
    return render_template('docs.html', 
        title='Documentation', 
        GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, 
        documentationText=markdown.markdown(documentationText)
    )

@app.route('/settings/')
def settings():
    return render_template('settings.html', 
        title='Settings', 
        GA_MEASUREMENT_ID=GA_MEASUREMENT_ID
    )

@app.route('/photos/')
def photos():
    db = connectToDb()
    photosJson = getMostRecentPicture(db.cursor())
    db.close()
    return photosJson

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID)

@app.route('/sitemap.xml')
def sitemap():
    try:
        """Generate sitemap.xml. Makes a list of urls and date modified."""
        pages=[]
        # static pages
        for rule in app.url_map.iter_rules():
            if "GET" in rule.methods and len(rule.arguments)==0 and rule.rule != "/":
                pages.append(str(rule.rule))

        sitemap_xml = render_template('sitemap.xml', base_url="http://hololively.com", pages=pages, date=timestamp.date().isoformat())
        response = make_response(sitemap_xml)
        response.headers["Content-Type"] = "application/xml"    
    
        return response
    except Exception as e:
        return(str(e))	  

@app.route('/git_update', methods=['POST'])
def git_update():
    repo = git.Repo('./hololively')
    origin = repo.remotes.origin
    repo.create_head('pa',
        origin.refs.pa).set_tracking_branch(origin.refs.pa).checkout()
    origin.pull()
    return '', 200    

if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host= '0.0.0.0')