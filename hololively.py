import json
from api import API
from flask import Flask, render_template, url_for, request
app = Flask(__name__, static_url_path='/static')

with open('static/json/members.json', 'r', encoding="utf-8") as f:
    members = f.read()

@app.route('/')
@app.route('/home/')
def home():
    query = request.args.get('q')
    if not query:
        query = ''
    return render_template('calendar.html', title='Home', streams=API(query=query), members=members)

@app.route('/about/')
def about():
    return render_template('about.html', title='about')

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
                '"message": "Invalid or incomplete request. Please double check the request documentation"' +
            '}'
        )
    else:
        response = app.response_class(
            status = 200,
            response = '{' +
                '"status": 200, ' +
                f'"streams": {API(query=query)}' +
            '}'
        )
    return response

@app.route('/docs/')
def docs():
    return render_template('docs.html', title='Documentation')

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html')

if __name__ == '__main__':
    app.run(host= '0.0.0.0')
