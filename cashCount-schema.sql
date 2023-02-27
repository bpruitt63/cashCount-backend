CREATE TABLE companies (
    company_code TEXT PRIMARY KEY
);

CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    email TEXT,
    password TEXT
);

CREATE TABLE company_admins (
    user_id VARCHAR REFERENCES users ON DELETE CASCADE,
    company_code TEXT REFERENCES companies ON DELETE CASCADE,
    email_receiver BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (user_id, company_code)
);

CREATE TABLE company_users(
    user_id VARCHAR REFERENCES users ON DELETE CASCADE,
    company_code TEXT REFERENCES companies ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY (user_id, company_code)
);

CREATE TABLE containers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company_code TEXT REFERENCES companies ON DELETE CASCADE,
    target NUMERIC(7, 2) NOT NULL,
    pos_threshold NUMERIC(5, 2) NOT NULL,
    neg_threshold NUMERIC(5, 2) NOT NULL
);

CREATE TABLE counts (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users ON DELETE SET NULL,
    container_id INTEGER REFERENCES containers ON DELETE CASCADE,
    cash NUMERIC(7, 2) NOT NULL,
    time TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    note TEXT
);