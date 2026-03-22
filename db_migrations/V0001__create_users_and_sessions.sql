CREATE TABLE IF NOT EXISTS t_p16415107_project_enhancement_.users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p16415107_project_enhancement_.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p16415107_project_enhancement_.users(id),
  token VARCHAR(64) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);