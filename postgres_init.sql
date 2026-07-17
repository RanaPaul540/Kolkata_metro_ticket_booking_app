-- PostgreSQL Database Initialization Schema
-- Seeds Key A and establishes schemas for users, tickets, system_config, and worker_heartbeat.

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: system_config
CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: worker_heartbeat
CREATE TABLE IF NOT EXISTS worker_heartbeat (
    id INT PRIMARY KEY,
    last_run_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'RUNNING'
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: tickets
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    ticket_number VARCHAR(100) UNIQUE NOT NULL,
    source_station VARCHAR(100) NOT NULL,
    destination_station VARCHAR(100) NOT NULL,
    fare DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'EXPIRED', 'USED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Seed System Config with Key A
INSERT INTO system_config (key, config_value) 
VALUES ('system_a', 'Alpha77X#')
ON CONFLICT (key) DO UPDATE SET config_value = EXCLUDED.config_value;

-- Seed Worker Heartbeat with an initial state
INSERT INTO worker_heartbeat (id, last_run_timestamp, status)
VALUES (1, NOW(), 'INITIALIZED')
ON CONFLICT (id) DO UPDATE SET last_run_timestamp = EXCLUDED.last_run_timestamp;
