import markdown
import os
import requests
from api import API
from datetime import datetime, timezone
from dotenv import load_dotenv
from flask import Flask, render_template, url_for, request

load_dotenv()
GA_MEASUREMENT_ID = os.getenv("GA_MEASUREMENT_ID")



def track_api():
    data = {
        'v': '1',  # API Version.
        'tid': GA_MEASUREMENT_ID,  # Tracking ID / Property ID.
        'cid': '555',
        't': 'pageview',  # Event hit type.
        'dt': 'Hololively - API', # Page title
        'dh': 'hololively.com', # Site Name
        'dp': '/api' # Page name
    }

    response = requests.post(
        'https://www.google-analytics.com/collect', data=data)

    return response

app = Flask(__name__, static_url_path='/static')

with open('static/json/memberPhotos.json', 'r', encoding="utf-8") as f:
    memberPhotos = f.read()
with open('about.md', 'r', encoding="utf-8") as f:
    aboutText = f.read()
with open('README.md', 'r', encoding="utf-8") as f:
    documentationText = f.read()
with open('policy.md', 'r', encoding="utf-8") as f:
    policyText = f.read()

@app.route('/')
@app.route('/home/')
def home():
    query = request.args.get('q')
    if not query:
        query = ''
    return render_template('calendar.html', title='Home', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, streams=API(query=query), memberPhotos=memberPhotos, )

@app.route('/about/')
@app.route('/policy/')
def about():
    return render_template('about.html', title='about', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, aboutText=markdown.markdown(aboutText), policyText=markdown.markdown(policyText))

@app.route('/api/')
@app.route('/api/<query>')
@app.route('/api/<query>/')
def api(query = ''):
    track_api()
    endpoints = [
        "",
        "hololive",
        "holostars",
        "innk",
        "china",
        "indonesia",
        "english"
    ]
    if query not in endpoints:
        response = app.response_class(
            status = 400,
            response = '{' +
                '"status": 400, ' + 
                f'"timestamp": "{datetime.now(timezone.utc).isoformat()}",' + 
                '"message": "Invalid or incomplete request. Please double check the request documentation"' +
            '}'
        )
    else:
        response = app.response_class(
            status = 200,
            response = '{' +
                '"status": 200, ' +
                f'"timestamp": "{datetime.now(timezone.utc).isoformat()}",' + 
                f'"streams": {API(query=query)}' +
            '}'
        )
    return response

@app.route('/docs/')
def docs():
    return render_template('docs.html', title='Documentation', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID, documentationText=markdown.markdown(documentationText))

@app.route('/settings/')
def settings():
    return render_template('settings.html', title='Settings', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID)

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html', GA_MEASUREMENT_ID=GA_MEASUREMENT_ID)

if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host= '0.0.0.0')
