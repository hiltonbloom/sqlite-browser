import os
import json
import sqlite3
import re
import math
from flask import render_template, request, jsonify
from config import app, DATABASE, QUERIES_FILE

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def load_queries():
    if not os.path.exists(QUERIES_FILE):
        # Initialize with an empty list if file doesn't exist
        with open(QUERIES_FILE, 'w') as f:
            json.dump([], f)
        return []
    with open(QUERIES_FILE, 'r') as f:
        return json.load(f)

def save_queries(queries):
    with open(QUERIES_FILE, 'w') as f:
        json.dump(queries, f, indent=2)

@app.route('/')
def index():
    conn = get_db_connection()
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    conn.close()
    return render_template('index.html', tables=[table['name'] for table in tables])

@app.route('/table/<table_name>')
def view_table(table_name):
    conn = get_db_connection()
    rows = conn.execute(f"SELECT * FROM {table_name}").fetchall()
    columns_info = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    columns = [col['name'] for col in columns_info]
    conn.close()
    return render_template('table.html', table_name=table_name, rows=rows, columns=columns)

@app.route('/query', methods=['POST'])
def run_query():
    query = request.form.get('query')
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query)
        if query.lstrip().upper().startswith("SELECT"):
            results = cur.fetchall()
            columns = [desc[0] for desc in cur.description]
            data = [dict(zip(columns, row)) for row in results]
            conn.close()
            return jsonify({'status': 'success', 'data': data, 'columns': columns})
        else:
            conn.commit()
            conn.close()
            return jsonify({'status': 'success', 'message': 'Query executed successfully.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

# New endpoint to get and add sample queries.
@app.route('/api/queries', methods=['GET', 'POST'])
def api_queries():
    if request.method == 'GET':
        queries = load_queries()
        return jsonify({'status': 'success', 'queries': queries})
    elif request.method == 'POST':
        try:
            new_query = request.get_json()
            if not new_query or 'title' not in new_query or 'sql' not in new_query:
                return jsonify({'status': 'error', 'message': 'Invalid query data.'}), 400
            queries = load_queries()
            queries.append(new_query)
            save_queries(queries)
            return jsonify({'status': 'success', 'message': 'Query saved successfully.'})
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/get_schema/<table_name>')
def get_schema(table_name):
    conn = get_db_connection()
    schema = conn.execute(f"PRAGMA table_info({table_name})").fetchall()
    conn.close()

    # Build schema info as a list of dicts
    schema_info = [
        {
            "cid": row[0],
            "name": row[1],
            "type": row[2],
            "notnull": row[3],
            "dflt_value": row[4],
            "pk": row[5]
        }
        for row in schema
    ]
    return jsonify(schema_info)

@app.route('/get_tables')
def get_tables():
    conn = get_db_connection()
    tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()
    conn.close()
    return jsonify([t["name"] for t in tables])

# Add this route to your Flask app.py file

@app.route('/api/queries/<title>', methods=['DELETE'])
def delete_query(title):
    try:
        # Load existing queries
        with open('static/queries.json', 'r') as f:
            queries = json.load(f)
        
        # Find the query to delete by title
        original_length = len(queries)
        queries = [q for q in queries if q['title'] != title]
        
        # Check if a query was actually removed
        if len(queries) == original_length:
            return jsonify({'status': 'error', 'message': 'Query not found.'})
        
        # Save the updated queries list
        with open('static/queries.json', 'w') as f:
            json.dump(queries, f, indent=2)
        
        return jsonify({'status': 'success', 'message': 'Query deleted successfully.'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/hydrate_database', methods=['POST'])
def hydrate_database():
    try:
        # Get the force parameter from request JSON
        data = request.get_json()
        force = data.get('force', False) if data else False
        
        # Read the SQL file
        with open('users-hydration-sql.sql', 'r') as f:
            sql_script = f.read()
            
        # If force is True, modify the script to drop and recreate tables
        if force:
            # Add DROP TABLE statements at the beginning of the script
            drop_tables = """
            -- Dropping existing tables due to force option
            DROP TABLE IF EXISTS user_teams;
            DROP TABLE IF EXISTS users;
            
            """
            sql_script = drop_tables + sql_script
        
        # Execute the SQL commands
        conn = get_db_connection()  # Use your existing DB connection function
        conn.executescript(sql_script)
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success', 
            'message': 'Database hydrated successfully with sample user data.',
            'force_applied': force
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
    
@app.route('/check_tables', methods=['GET'])
def check_tables():
    try:
        conn = get_db_connection()
        
        # Check if users table exists and has data
        users_exist = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='users'").fetchone()[0] > 0
        users_has_data = False
        if users_exist:
            users_has_data = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] > 0
        
        # Check if user_teams table exists and has data
        teams_exist = conn.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='user_teams'").fetchone()[0] > 0
        teams_has_data = False
        if teams_exist:
            teams_has_data = conn.execute("SELECT COUNT(*) FROM user_teams").fetchone()[0] > 0
            
        conn.close()
        
        return jsonify({
            'status': 'success',
            'data': {
                'users_exist': users_exist,
                'users_has_data': users_has_data,
                'teams_exist': teams_exist,
                'teams_has_data': teams_has_data,
                'needs_hydration': not (users_exist and users_has_data and teams_exist and teams_has_data)
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

@app.route('/api/table/<table_name>/data', methods=['GET'])
def get_table_data(table_name):
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 25, type=int)
        
        # Sanitize table name to prevent SQL injection
        if not re.match(r'^[a-zA-Z0-9_]+$', table_name):
            return jsonify({'status': 'error', 'message': 'Invalid table name format'})
        
        # Calculate offset
        offset = (page - 1) * limit
        
        # Get total count first
        conn = get_db_connection()
        total_rows = conn.execute(f"SELECT COUNT(*) as count FROM {table_name}").fetchone()['count']
        
        # Get paginated data
        query = f"SELECT * FROM {table_name} LIMIT ? OFFSET ?"
        rows = conn.execute(query, (limit, offset)).fetchall()
        
        # Get column names
        columns = [column[0] for column in conn.execute(f"PRAGMA table_info({table_name})").fetchall()]
        
        # Convert rows to list of dicts for JSON serialization
        data = []
        for row in rows:
            row_dict = {}
            for i, column in enumerate(columns):
                row_dict[column] = row[i] if i < len(row) else None
            data.append(row_dict)
        
        conn.close()
        
        # Calculate total pages
        total_pages = math.ceil(total_rows / limit)
        
        return jsonify({
            'status': 'success',
            'data': data,
            'columns': columns,
            'pagination': {
                'page': page,
                'limit': limit,
                'total_rows': total_rows,
                'total_pages': total_pages
            }
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})
if __name__ == '__main__':
    app.run(debug=True, port='1234')
