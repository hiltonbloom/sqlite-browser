-- Create users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT 1
);

-- Delete existing data if needed (uncomment if you want to start fresh)
-- DELETE FROM users;

-- Insert dummy users with random usernames and the same password
INSERT OR IGNORE INTO users (username, password, email, first_name, last_name, created_at, last_login) VALUES
('admin', 'admin', 'admin@example.com', 'Ad', 'Min', datetime('now', '-120 days'), datetime('now', '-2 days')),
('john_doe', 'password', 'john@example.com', 'John', 'Doe', datetime('now', '-120 days'), datetime('now', '-2 days')),
('jane_smith', 'password', 'jane@example.com', 'Jane', 'Smith', datetime('now', '-110 days'), datetime('now', '-5 days')),
('bob_johnson', 'password', 'bob@example.com', 'Bob', 'Johnson', datetime('now', '-100 days'), datetime('now', '-3 days')),
('alice_williams', 'password', 'alice@example.com', 'Alice', 'Williams', datetime('now', '-90 days'), datetime('now', '-1 days')),
('charlie_brown', 'password', 'charlie@example.com', 'Charlie', 'Brown', datetime('now', '-80 days'), datetime('now', '-4 days')),
('diana_miller', 'password', 'diana@example.com', 'Diana', 'Miller', datetime('now', '-70 days'), datetime('now', '-6 days')),
('eric_davis', 'password', 'eric@example.com', 'Eric', 'Davis', datetime('now', '-60 days'), datetime('now', '-7 days')),
('fiona_jones', 'password', 'fiona@example.com', 'Fiona', 'Jones', datetime('now', '-50 days'), datetime('now', '-8 days')),
('george_wilson', 'password', 'george@example.com', 'George', 'Wilson', datetime('now', '-40 days'), datetime('now', '-9 days')),
('hannah_taylor', 'password', 'hannah@example.com', 'Hannah', 'Taylor', datetime('now', '-30 days'), datetime('now', '-10 days')),
('ian_anderson', 'password', 'ian@example.com', 'Ian', 'Anderson', datetime('now', '-20 days'), datetime('now', '-11 days')),
('julia_thomas', 'password', 'julia@example.com', 'Julia', 'Thomas', datetime('now', '-10 days'), datetime('now', '-12 days')),
('kevin_martin', 'password', 'kevin@example.com', 'Kevin', 'Martin', datetime('now', '-9 days'), datetime('now', '-3 days')),
('lisa_clark', 'password', 'lisa@example.com', 'Lisa', 'Clark', datetime('now', '-8 days'), datetime('now', '-2 days')),
('mike_rodriguez', 'password', 'mike@example.com', 'Mike', 'Rodriguez', datetime('now', '-7 days'), datetime('now', '-1 days')),
('nancy_lewis', 'password', 'nancy@example.com', 'Nancy', 'Lewis', datetime('now', '-6 days'), datetime('now', '-1 days')),
('oscar_lee', 'password', 'oscar@example.com', 'Oscar', 'Lee', datetime('now', '-5 days'), datetime('now', '-1 days')),
('patricia_walker', 'password', 'patricia@example.com', 'Patricia', 'Walker', datetime('now', '-4 days'), datetime('now', '-1 days')),
('quentin_hall', 'password', 'quentin@example.com', 'Quentin', 'Hall', datetime('now', '-3 days'), datetime('now', '-1 days')),
('rachel_allen', 'password', 'rachel@example.com', 'Rachel', 'Allen', datetime('now', '-2 days'), datetime('now', '-1 days')),
('steve_young', 'password', 'steve@example.com', 'Steve', 'Young', datetime('now', '-1 days'), datetime('now')),
('tina_king', 'password', 'tina@example.com', 'Tina', 'King', datetime('now'), datetime('now')),
('coder123', 'password', 'coder123@example.com', 'Code', 'Master', datetime('now', '-150 days'), datetime('now', '-30 days')),
('dev_guru', 'password', 'devguru@example.com', 'Dev', 'Guru', datetime('now', '-140 days'), datetime('now', '-25 days')),
('tech_ninja', 'password', 'techninja@example.com', 'Tech', 'Ninja', datetime('now', '-130 days'), datetime('now', '-15 days')),
('data_wizard', 'password', 'datawizard@example.com', 'Data', 'Wizard', datetime('now', '-25 days'), datetime('now', '-5 days')),
('sql_master', 'password', 'sqlmaster@example.com', 'SQL', 'Master', datetime('now', '-15 days'), datetime('now', '-2 days')),
('web_dev', 'password', 'webdev@example.com', 'Web', 'Developer', datetime('now', '-10 days'), datetime('now', '-1 days')),
('app_builder', 'password', 'appbuilder@example.com', 'App', 'Builder', datetime('now', '-5 days'), datetime('now', '-1 days')),
('crypto_fan', 'password', 'cryptofan@example.com', 'Crypto', 'Fan', datetime('now', '-2 days'), datetime('now'));

-- Create a user_teams table to demonstrate relationship
CREATE TABLE IF NOT EXISTS user_teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert some team assignments
INSERT OR IGNORE INTO user_teams (user_id, team_name, joined_at) VALUES
(1, 'Engineering', datetime('now', '-100 days')),
(2, 'Design', datetime('now', '-95 days')),
(3, 'Marketing', datetime('now', '-90 days')),
(4, 'Engineering', datetime('now', '-85 days')),
(5, 'Support', datetime('now', '-80 days')),
(6, 'Design', datetime('now', '-75 days')),
(7, 'Engineering', datetime('now', '-70 days')),
(8, 'Marketing', datetime('now', '-65 days')),
(9, 'Support', datetime('now', '-60 days')),
(10, 'Engineering', datetime('now', '-55 days')),
(11, 'Design', datetime('now', '-50 days')),
(12, 'Marketing', datetime('now', '-45 days')),
(13, 'Support', datetime('now', '-40 days')),
(14, 'Engineering', datetime('now', '-35 days')),
(15, 'Design', datetime('now', '-30 days'));

-- Create an index to speed up username searches
CREATE INDEX IF NOT EXISTS idx_username ON users(username);