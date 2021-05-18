import json
import markdown
from api import API
from datetime import datetime, timezone
from flask import Flask, render_template, url_for, request
app = Flask(__name__, static_url_path='/static')

with open('static/json/members.json', 'r', encoding="utf-8") as f:
    members = f.read()
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
    return render_template('calendar.html', title='Home', streams=API(query=query), members=members)

@app.route('/about/')
@app.route('/policy/')
def about():
    return render_template('about.html', title='about', aboutText=markdown.markdown(aboutText), policyText=markdown.markdown(policyText))

@app.route('/api/')
@app.route('/api/<query>')
@app.route('/api/<query>/')
def api(query = ''):
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
    return render_template('docs.html', title='Documentation', documentationText=markdown.markdown(documentationText))

@app.route('/settings/')
def settings():
    return render_template('settings.html', title='Settings')

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html')

if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.run(host= '0.0.0.0', debug=True)
