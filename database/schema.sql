-- ============================================================================
-- Babalola Legal OS - PostgreSQL Database Schema
-- A comprehensive law firm management platform
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP TABLES (in reverse dependency order)
-- ============================================================================
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS communications CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS conflicts CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS matters CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- DROP ENUM TYPES
-- ============================================================================
DROP TYPE IF EXISTS client_type CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS matter_practice_area CASCADE;
DROP TYPE IF EXISTS matter_status CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS expense_category CASCADE;
DROP TYPE IF EXISTS document_category CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS communication_type CASCADE;
DROP TYPE IF EXISTS communication_direction CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS conflict_status CASCADE;

-- ============================================================================
-- CREATE ENUM TYPES
-- ============================================================================

-- Client-related ENUMs
CREATE TYPE client_type AS ENUM ('individual', 'business');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect');

-- Matter-related ENUMs
CREATE TYPE matter_practice_area AS ENUM (
    'tax_controversy', 
    'corporate_tax', 
    'salt', 
    'm_and_a', 
    'general'
);
CREATE TYPE matter_status AS ENUM ('open', 'pending', 'closed');

-- Billing ENUMs
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue');
CREATE TYPE expense_category AS ENUM (
    'court_filing',
    'travel',
    'research',
    'expert_witness',
    'copying',
    'postage',
    'meals',
    'other'
);

-- Document ENUMs
CREATE TYPE document_category AS ENUM (
    'engagement_letter',
    'correspondence',
    'filing',
    'research',
    'opinion'
);

-- Task ENUMs
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'done');

-- Calendar ENUMs
CREATE TYPE event_type AS ENUM ('deadline', 'hearing', 'meeting', 'consultation');

-- Communication ENUMs
CREATE TYPE communication_type AS ENUM ('email', 'call', 'meeting', 'letter');
CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound');

-- User ENUMs
CREATE TYPE user_role AS ENUM ('attorney', 'paralegal', 'admin');

-- Conflict ENUMs
CREATE TYPE conflict_status AS ENUM ('clear', 'flagged', 'resolved');

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'attorney',
    hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_hourly_rate_positive CHECK (hourly_rate >= 0)
);

COMMENT ON TABLE users IS 'System users including attorneys, paralegals, and administrators';
COMMENT ON COLUMN users.hourly_rate IS 'Hourly billing rate in USD';

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(200),
    type client_type NOT NULL DEFAULT 'individual',
    status client_status NOT NULL DEFAULT 'prospect',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_client_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_client_name_not_empty CHECK (LENGTH(TRIM(first_name)) > 0 OR LENGTH(TRIM(last_name)) > 0)
);

COMMENT ON TABLE clients IS 'Client records for individuals and businesses';
COMMENT ON COLUMN clients.type IS 'Whether the client is an individual or business entity';

-- ============================================================================
-- CONTACTS TABLE
-- ============================================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(200),
    role VARCHAR(100),
    relationship_to_client TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_contact_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

COMMENT ON TABLE contacts IS 'External contacts related to clients or matters (opposing counsel, witnesses, etc.)';

-- ============================================================================
-- MATTERS TABLE
-- ============================================================================
CREATE TABLE matters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    matter_number VARCHAR(50) NOT NULL UNIQUE,
    practice_area matter_practice_area NOT NULL DEFAULT 'general',
    status matter_status NOT NULL DEFAULT 'open',
    open_date DATE NOT NULL DEFAULT CURRENT_DATE,
    close_date DATE,
    statute_of_limitations DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_matter_client 
        FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE RESTRICT,
    CONSTRAINT chk_matter_dates CHECK (close_date IS NULL OR close_date >= open_date),
    CONSTRAINT chk_matter_number_not_empty CHECK (LENGTH(TRIM(matter_number)) > 0)
);

COMMENT ON TABLE matters IS 'Legal matters/cases assigned to clients';
COMMENT ON COLUMN matters.matter_number IS 'Unique matter identifier (e.g., "2024-001")';
COMMENT ON COLUMN matters.statute_of_limitations IS 'Critical deadline for filing claims';

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    matter_id UUID,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    status invoice_status NOT NULL DEFAULT 'draft',
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_invoice_client 
        FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_invoice_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_invoice_amount_positive CHECK (amount >= 0),
    CONSTRAINT chk_invoice_paid_date CHECK (paid_date IS NULL OR status = 'paid'),
    CONSTRAINT chk_invoice_number_not_empty CHECK (LENGTH(TRIM(invoice_number)) > 0)
);

COMMENT ON TABLE invoices IS 'Client invoices for legal services';
COMMENT ON COLUMN invoices.amount IS 'Total invoice amount in USD';

-- ============================================================================
-- TIME ENTRIES TABLE
-- ============================================================================
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID NOT NULL,
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_time_entry_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_time_entry_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE RESTRICT,
    CONSTRAINT chk_time_hours_positive CHECK (hours > 0 AND hours <= 24),
    CONSTRAINT chk_time_rate_positive CHECK (rate >= 0)
);

COMMENT ON TABLE time_entries IS 'Billable and non-billable time entries for matters';
COMMENT ON COLUMN time_entries.hours IS 'Time spent in hours (e.g., 0.5 for 30 minutes)';

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category expense_category NOT NULL DEFAULT 'other',
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_expense_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE CASCADE,
    CONSTRAINT chk_expense_amount_positive CHECK (amount >= 0)
);

COMMENT ON TABLE expenses IS 'Matter-related expenses that may be billable to clients';

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID,
    client_id UUID,
    filename VARCHAR(500) NOT NULL,
    filepath VARCHAR(1000) NOT NULL,
    category document_category NOT NULL DEFAULT 'correspondence',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID,
    file_size_bytes INTEGER,
    mime_type VARCHAR(100),
    
    CONSTRAINT fk_document_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_document_client 
        FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_document_user 
        FOREIGN KEY (uploaded_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_document_has_parent CHECK (matter_id IS NOT NULL OR client_id IS NOT NULL),
    CONSTRAINT chk_filename_not_empty CHECK (LENGTH(TRIM(filename)) > 0),
    CONSTRAINT chk_filepath_not_empty CHECK (LENGTH(TRIM(filepath)) > 0)
);

COMMENT ON TABLE documents IS 'Legal documents associated with matters and clients';
COMMENT ON COLUMN documents.filepath IS 'Storage path to the document file';

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID,
    assigned_to UUID,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    due_date DATE,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'todo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_task_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_task_assigned_to 
        FOREIGN KEY (assigned_to) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_task_title_not_empty CHECK (LENGTH(TRIM(title)) > 0)
);

COMMENT ON TABLE tasks IS 'Tasks and to-do items for matters and general work';

-- ============================================================================
-- CALENDAR EVENTS TABLE
-- ============================================================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matter_id UUID,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type event_type NOT NULL DEFAULT 'meeting',
    reminder_minutes INTEGER DEFAULT 15,
    location VARCHAR(300),
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_calendar_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_calendar_created_by 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_event_times CHECK (end_time > start_time),
    CONSTRAINT chk_event_title_not_empty CHECK (LENGTH(TRIM(title)) > 0),
    CONSTRAINT chk_reminder_positive CHECK (reminder_minutes >= 0)
);

COMMENT ON TABLE calendar_events IS 'Calendar events including deadlines, hearings, and meetings';
COMMENT ON COLUMN calendar_events.reminder_minutes IS 'Minutes before event to send reminder';

-- ============================================================================
-- COMMUNICATIONS TABLE
-- ============================================================================
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    matter_id UUID,
    type communication_type NOT NULL DEFAULT 'email',
    direction communication_direction NOT NULL DEFAULT 'outbound',
    subject VARCHAR(500),
    body TEXT,
    communication_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    follow_up_date DATE,
    follow_up_status VARCHAR(50) DEFAULT 'pending',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_communication_client 
        FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_communication_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_communication_created_by 
        FOREIGN KEY (created_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE communications IS 'Client communications including emails, calls, and meetings';
COMMENT ON COLUMN communications.follow_up_status IS 'Status of any required follow-up action';

-- ============================================================================
-- ACTIVITIES TABLE (Audit Log)
-- ============================================================================
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_activity_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_entity_type_not_empty CHECK (LENGTH(TRIM(entity_type)) > 0),
    CONSTRAINT chk_action_not_empty CHECK (LENGTH(TRIM(action)) > 0)
);

COMMENT ON TABLE activities IS 'Audit log of user activities across the system';
COMMENT ON COLUMN activities.entity_type IS 'Type of entity affected (client, matter, invoice, etc.)';

-- ============================================================================
-- CONFLICTS TABLE
-- ============================================================================
CREATE TABLE conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL,
    matter_id UUID,
    adverse_party VARCHAR(300) NOT NULL,
    check_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status conflict_status NOT NULL DEFAULT 'clear',
    notes TEXT,
    checked_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_conflict_client 
        FOREIGN KEY (client_id) 
        REFERENCES clients(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_conflict_matter 
        FOREIGN KEY (matter_id) 
        REFERENCES matters(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_conflict_checked_by 
        FOREIGN KEY (checked_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT chk_adverse_party_not_empty CHECK (LENGTH(TRIM(adverse_party)) > 0)
);

COMMENT ON TABLE conflicts IS 'Conflict of interest checks for new clients and matters';
COMMENT ON COLUMN conflicts.adverse_party IS 'Name of the opposing party in the matter';

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Clients indexes
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_type ON clients(type);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_clients_created_at ON clients(created_at);

-- Contacts indexes
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company ON contacts(company);
CREATE INDEX idx_contacts_name ON contacts(last_name, first_name);

-- Matters indexes
CREATE INDEX idx_matters_client_id ON matters(client_id);
CREATE INDEX idx_matters_status ON matters(status);
CREATE INDEX idx_matters_practice_area ON matters(practice_area);
CREATE INDEX idx_matters_matter_number ON matters(matter_number);
CREATE INDEX idx_matters_open_date ON matters(open_date);
CREATE INDEX idx_matters_close_date ON matters(close_date);
CREATE INDEX idx_matters_statute_of_limitations ON matters(statute_of_limitations);

-- Invoices indexes
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_matter_id ON invoices(matter_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- Time entries indexes
CREATE INDEX idx_time_entries_matter_id ON time_entries(matter_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_entry_date ON time_entries(entry_date);
CREATE INDEX idx_time_entries_billable ON time_entries(billable);

-- Expenses indexes
CREATE INDEX idx_expenses_matter_id ON expenses(matter_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_billable ON expenses(billable);

-- Documents indexes
CREATE INDEX idx_documents_matter_id ON documents(matter_id);
CREATE INDEX idx_documents_client_id ON documents(client_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);

-- Tasks indexes
CREATE INDEX idx_tasks_matter_id ON tasks(matter_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Calendar events indexes
CREATE INDEX idx_calendar_matter_id ON calendar_events(matter_id);
CREATE INDEX idx_calendar_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_created_by ON calendar_events(created_by);

-- Communications indexes
CREATE INDEX idx_communications_client_id ON communications(client_id);
CREATE INDEX idx_communications_matter_id ON communications(matter_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_date ON communications(communication_date);
CREATE INDEX idx_communications_follow_up_date ON communications(follow_up_date);

-- Activities indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_action ON activities(action);

-- Conflicts indexes
CREATE INDEX idx_conflicts_client_id ON conflicts(client_id);
CREATE INDEX idx_conflicts_matter_id ON conflicts(matter_id);
CREATE INDEX idx_conflicts_status ON conflicts(status);
CREATE INDEX idx_conflicts_adverse_party ON conflicts(adverse_party);

-- ============================================================================
-- CREATE TRIGGER FUNCTION FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column on row modification';

-- ============================================================================
-- CREATE TRIGGERS FOR ALL TABLES WITH updated_at
-- ============================================================================
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_matters_updated_at
    BEFORE UPDATE ON matters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_calendar_events_updated_at
    BEFORE UPDATE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_communications_updated_at
    BEFORE UPDATE ON communications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_conflicts_updated_at
    BEFORE UPDATE ON conflicts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Active matters with client info
CREATE OR REPLACE VIEW v_active_matters AS
SELECT 
    m.id AS matter_id,
    m.matter_number,
    m.title AS matter_title,
    m.practice_area,
    m.status AS matter_status,
    m.open_date,
    m.statute_of_limitations,
    c.id AS client_id,
    c.first_name || ' ' || c.last_name AS client_name,
    c.company AS client_company,
    c.email AS client_email
FROM matters m
JOIN clients c ON m.client_id = c.id
WHERE m.status != 'closed';

COMMENT ON VIEW v_active_matters IS 'Active matters with associated client information';

-- View: Outstanding invoices
CREATE OR REPLACE VIEW v_outstanding_invoices AS
SELECT 
    i.id AS invoice_id,
    i.invoice_number,
    i.amount,
    i.due_date,
    i.status,
    CURRENT_DATE - i.due_date AS days_overdue,
    c.id AS client_id,
    c.first_name || ' ' || c.last_name AS client_name,
    m.id AS matter_id,
    m.title AS matter_title
FROM invoices i
JOIN clients c ON i.client_id = c.id
LEFT JOIN matters m ON i.matter_id = m.id
WHERE i.status IN ('sent', 'overdue');

COMMENT ON VIEW v_outstanding_invoices IS 'Invoices awaiting payment with client and matter details';

-- View: Time summary by matter
CREATE OR REPLACE VIEW v_matter_time_summary AS
SELECT 
    m.id AS matter_id,
    m.matter_number,
    m.title AS matter_title,
    c.first_name || ' ' || c.last_name AS client_name,
    COALESCE(SUM(te.hours), 0) AS total_hours,
    COALESCE(SUM(te.hours * te.rate), 0) AS total_value,
    COUNT(te.id) AS entry_count
FROM matters m
JOIN clients c ON m.client_id = c.id
LEFT JOIN time_entries te ON m.id = te.matter_id AND te.billable = TRUE
GROUP BY m.id, m.matter_number, m.title, c.first_name, c.last_name;

COMMENT ON VIEW v_matter_time_summary IS 'Summary of billable time by matter';

-- View: Upcoming deadlines
CREATE OR REPLACE VIEW v_upcoming_deadlines AS
SELECT 
    ce.id AS event_id,
    ce.title,
    ce.start_time,
    ce.event_type,
    m.id AS matter_id,
    m.matter_number,
    m.title AS matter_title,
    c.first_name || ' ' || c.last_name AS client_name
FROM calendar_events ce
LEFT JOIN matters m ON ce.matter_id = m.id
LEFT JOIN clients c ON m.client_id = c.id
WHERE ce.start_time >= CURRENT_TIMESTAMP
    AND ce.start_time <= CURRENT_TIMESTAMP + INTERVAL '30 days'
ORDER BY ce.start_time;

COMMENT ON VIEW v_upcoming_deadlines IS 'Calendar events in the next 30 days';

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- ============================================================================
-- SEED: USERS (3 users: attorney, paralegal, admin)
-- ============================================================================
INSERT INTO users (id, email, password_hash, first_name, last_name, role, hourly_rate) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'john.smith@babalolalegal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', 'John', 'Smith', 'attorney', 450.00),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'sarah.johnson@babalolalegal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', 'Sarah', 'Johnson', 'paralegal', 150.00),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'admin@babalolalegal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', 'Michael', 'Davis', 'admin', 0.00);

-- ============================================================================
-- SEED: CLIENTS (5 clients: mix of individuals and businesses)
-- ============================================================================
INSERT INTO clients (id, first_name, last_name, email, phone, company, type, status) VALUES
('d4e5f6a7-b8c9-0123-defa-456789012345', 'Robert', 'Anderson', 'robert.anderson@techcorp.com', '+1-555-0101', 'TechCorp Industries', 'business', 'active'),
('e5f6a7b8-c9d0-1234-efab-567890123456', 'Jennifer', 'Martinez', 'jmartinez@email.com', '+1-555-0102', NULL, 'individual', 'active'),
('f6a7b8c9-d0e1-2345-fabc-678901234567', 'David', 'Thompson', 'dthompson@manufacturing.com', '+1-555-0103', 'Thompson Manufacturing LLC', 'business', 'active'),
('a7b8c9d0-e1f2-3456-abcd-789012345678', 'Amanda', 'Wilson', 'awilson@prospect.com', '+1-555-0104', NULL, 'individual', 'prospect'),
('b8c9d0e1-f2a3-4567-bcde-890123456789', 'Christopher', 'Brown', 'cbrown@retailgroup.com', '+1-555-0105', 'Brown Retail Group', 'business', 'inactive');

-- ============================================================================
-- SEED: CONTACTS (external contacts)
-- ============================================================================
INSERT INTO contacts (first_name, last_name, email, phone, company, role, relationship_to_client, notes) VALUES
('Patricia', 'Lee', 'plee@opposingcounsel.com', '+1-555-0201', 'Lee & Associates', 'Opposing Counsel', 'Represents adverse party in TechCorp litigation', 'Experienced litigator, prefers email communication'),
('James', 'Wilson', 'jwilson@cpa.com', '+1-555-0202', 'Wilson CPA Firm', 'Accountant', 'Tax advisor for Jennifer Martinez', 'Certified Public Accountant, specializes in individual tax'),
('Maria', 'Garcia', 'mgarcia@expertwitness.com', '+1-555-0203', 'Expert Witness Services', 'Expert Witness', 'Financial expert for M&A matter', 'Former SEC examiner, highly credible'),
('Thomas', 'Wright', 'twright@courtreporter.com', '+1-555-0204', 'Wright Court Reporting', 'Court Reporter', 'Deposition services', 'Fast turnaround on transcripts'),
('Lisa', 'Chen', 'lchen@mediator.com', '+1-555-0205', 'Chen Mediation Group', 'Mediator', 'Alternative dispute resolution', 'Specializes in commercial disputes');

-- ============================================================================
-- SEED: MATTERS (10 matters across practice areas)
-- ============================================================================
INSERT INTO matters (id, client_id, title, description, matter_number, practice_area, status, open_date, statute_of_limitations) VALUES
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'IRS Audit Defense - 2022 Tax Year', 'Representation of TechCorp in IRS audit of 2022 corporate tax return. Issues include R&D credit eligibility and transfer pricing documentation.', '2024-001', 'tax_controversy', 'open', '2024-01-15', '2027-01-15'),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'e5f6a7b8-c9d0-1234-efab-567890123456', 'Individual Tax Controversy - Back Taxes', 'Negotiation with IRS regarding $125,000 in disputed back taxes and penalties for tax years 2019-2021.', '2024-002', 'tax_controversy', 'open', '2024-02-01', '2026-02-01'),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 'State and Local Tax Compliance Review', 'Comprehensive review of SALT obligations across 12 states where Thompson Manufacturing operates. Includes nexus analysis and voluntary disclosure recommendations.', '2024-003', 'salt', 'open', '2024-02-20', NULL),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'Acquisition of StartupCo Inc.', 'Due diligence and acquisition documentation for TechCorp''s planned $15M acquisition of StartupCo Inc. Includes IP review and employment agreement transitions.', '2024-004', 'm_and_a', 'pending', '2024-03-01', NULL),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'e5f6a7b8-c9d0-1234-efab-567890123456', 'Estate Planning - Trust Establishment', 'Drafting and implementation of revocable living trust, pour-over will, and healthcare directives.', '2024-005', 'general', 'open', '2024-03-10', NULL),
('b4c5d6e7-f8a9-0123-bcde-456789012345', 'b8c9d0e1-f2a3-4567-bcde-890123456789', 'Commercial Lease Negotiation', 'Negotiation of 10-year commercial lease for new retail location. Includes percentage rent provisions and tenant improvement allowances.', '2024-006', 'general', 'closed', '2023-11-01', '2024-05-01'),
('c5d6e7f8-a9b0-1234-cdef-567890123456', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 'Corporate Tax Restructuring', 'Analysis and implementation of corporate restructuring to optimize tax efficiency. Includes S-corp election consideration and subsidiary formation.', '2024-007', 'corporate_tax', 'open', '2024-04-01', NULL),
('d6e7f8a9-b0c1-2345-defa-678901234567', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'Transfer Pricing Documentation', 'Preparation of contemporaneous transfer pricing documentation for intercompany transactions with foreign subsidiaries.', '2024-008', 'corporate_tax', 'open', '2024-04-15', '2025-04-15'),
('e7f8a9b0-c1d2-3456-efab-789012345678', 'a7b8c9d0-e1f2-3456-abcd-789012345678', 'Initial Consultation - Tax Planning', 'Initial consultation for prospective client regarding tax planning strategies for small business owner.', '2024-009', 'general', 'open', '2024-05-01', NULL),
('f8a9b0c1-d2e3-4567-fabc-890123456789', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'Sales Tax Audit Defense', 'Defense of TechCorp in state sales tax audit covering 2021-2023. Issues include software-as-a-service taxability.', '2024-010', 'salt', 'pending', '2024-05-15', '2026-05-15');

-- ============================================================================
-- SEED: TIME ENTRIES (20 time entries across matters)
-- ============================================================================
INSERT INTO time_entries (matter_id, user_id, description, hours, rate, billable, entry_date) VALUES
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Initial client meeting - IRS audit scope discussion', 2.0, 450.00, TRUE, '2024-01-15'),
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Review of 2022 tax return and supporting documentation', 4.5, 450.00, TRUE, '2024-01-16'),
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Document organization and privilege log preparation', 6.0, 150.00, TRUE, '2024-01-17'),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Consultation regarding IRS notice CP2000', 1.5, 450.00, TRUE, '2024-02-01'),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Research on innocent spouse relief provisions', 3.0, 450.00, TRUE, '2024-02-02'),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nexus analysis for e-commerce sales', 5.0, 450.00, TRUE, '2024-02-21'),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'State registration requirement research', 4.0, 150.00, TRUE, '2024-02-22'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Due diligence kickoff meeting', 3.0, 500.00, TRUE, '2024-03-01'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Review of StartupCo IP portfolio', 8.0, 500.00, TRUE, '2024-03-05'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Document review - employment agreements', 5.5, 150.00, TRUE, '2024-03-06'),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Estate planning initial consultation', 1.5, 400.00, TRUE, '2024-03-10'),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Draft revocable living trust document', 6.0, 400.00, TRUE, '2024-03-12'),
('c5d6e7f8-a9b0-1234-cdef-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Corporate structure analysis', 4.0, 450.00, TRUE, '2024-04-01'),
('c5d6e7f8-a9b0-1234-cdef-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'S-corp election feasibility analysis', 3.5, 450.00, TRUE, '2024-04-03'),
('d6e7f8a9-b0c1-2345-defa-678901234567', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Transfer pricing methodology review', 7.0, 475.00, TRUE, '2024-04-15'),
('d6e7f8a9-b0c1-2345-defa-678901234567', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Intercompany agreement compilation', 4.0, 150.00, TRUE, '2024-04-16'),
('f8a9b0c1-d2e3-4567-fabc-890123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sales tax audit initial response', 2.5, 450.00, TRUE, '2024-05-15'),
('f8a9b0c1-d2e3-4567-fabc-890123456789', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'SaaS taxability research - multi-state', 5.0, 450.00, TRUE, '2024-05-16'),
('b4c5d6e7-f8a9-0123-bcde-456789012345', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Commercial lease final review and closing', 3.0, 400.00, TRUE, '2024-01-15'),
('e7f8a9b0-c1d2-3456-efab-789012345678', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Prospective client consultation', 1.0, 400.00, FALSE, '2024-05-01');

-- ============================================================================
-- SEED: EXPENSES (various matter expenses)
-- ============================================================================
INSERT INTO expenses (matter_id, description, amount, category, billable, expense_date) VALUES
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'Court filing fee - Tax Court petition', 465.00, 'court_filing', TRUE, '2024-01-20'),
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'Travel to IRS office - 2 days', 1250.00, 'travel', TRUE, '2024-02-05'),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'Certified mail - IRS correspondence', 15.00, 'postage', TRUE, '2024-02-10'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'UCC search and filing fees', 350.00, 'court_filing', TRUE, '2024-03-10'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'Due diligence data room subscription', 500.00, 'research', TRUE, '2024-03-02'),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'State registration fees - 3 states', 750.00, 'court_filing', TRUE, '2024-03-01'),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'Notary services', 25.00, 'other', TRUE, '2024-03-15'),
('d6e7f8a9-b0c1-2345-defa-678901234567', 'Transfer pricing database access', 2000.00, 'research', TRUE, '2024-04-20');

-- ============================================================================
-- SEED: INVOICES (5 invoices in different statuses)
-- ============================================================================
INSERT INTO invoices (id, client_id, matter_id, invoice_number, status, amount, due_date, paid_date) VALUES
('12345678-1234-1234-1234-123456789abc', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'INV-2024-001', 'paid', 8750.00, '2024-02-15', '2024-02-10'),
('23456789-2345-2345-2345-23456789abcd', 'e5f6a7b8-c9d0-1234-efab-567890123456', 'd0e1f2a3-b4c5-6789-defa-012345678901', 'INV-2024-002', 'paid', 3375.00, '2024-03-01', '2024-02-28'),
('34567890-3456-3456-3456-34567890bcde', 'f6a7b8c9-d0e1-2345-fabc-678901234567', 'e1f2a3b4-c5d6-7890-efab-123456789012', 'INV-2024-003', 'sent', 5200.00, '2024-04-30', NULL),
('45678901-4567-4567-4567-45678901cdef', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'f2a3b4c5-d6e7-8901-fabc-234567890123', 'INV-2024-004', 'overdue', 14250.00, '2024-04-15', NULL),
('56789012-5678-5678-5678-56789012defa', 'e5f6a7b8-c9d0-1234-efab-567890123456', 'a3b4c5d6-e7f8-9012-abcd-345678901234', 'INV-2024-005', 'draft', 4200.00, '2024-06-15', NULL);

-- ============================================================================
-- SEED: DOCUMENTS (sample documents)
-- ============================================================================
INSERT INTO documents (matter_id, client_id, filename, filepath, category, uploaded_by, file_size_bytes, mime_type) VALUES
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'Engagement_Letter_TechCorp_2024.pdf', '/documents/2024/001/engagement_letter.pdf', 'engagement_letter', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 245760, 'application/pdf'),
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'IRS_Notice_CP3219A.pdf', '/documents/2024/001/irs_notice.pdf', 'correspondence', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 184320, 'application/pdf'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'StartupCo_DD_Checklist.xlsx', '/documents/2024/004/dd_checklist.xlsx', 'research', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 51200, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'Asset_Purchase_Agreement_Draft.docx', '/documents/2024/004/apa_draft.docx', 'correspondence', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 458752, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'e5f6a7b8-c9d0-1234-efab-567890123456', 'Revocable_Trust_Draft.pdf', '/documents/2024/005/trust_draft.pdf', 'correspondence', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 320000, 'application/pdf'),
(NULL, 'd4e5f6a7-b8c9-0123-defa-456789012345', 'TechCorp_General_Counsel_Guidelines.pdf', '/documents/clients/techcorp/guidelines.pdf', 'correspondence', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 156000, 'application/pdf');

-- ============================================================================
-- SEED: TASKS (10 tasks)
-- ============================================================================
INSERT INTO tasks (matter_id, assigned_to, title, description, due_date, priority, status) VALUES
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Prepare IDR responses', 'Respond to IRS Information Document Requests 1-5', '2024-06-20', 'high', 'in_progress'),
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Organize supporting documents', 'Compile and organize all supporting documentation for IDR responses', '2024-06-18', 'high', 'todo'),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Draft OIC proposal', 'Prepare Offer in Compromise package for client review', '2024-06-25', 'medium', 'todo'),
('e1f2a3b4-c5d6-7890-efab-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Complete nexus analysis report', 'Finalize multi-state nexus analysis with recommendations', '2024-06-30', 'medium', 'in_progress'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Schedule closing call', 'Coordinate closing call with all parties', '2024-06-15', 'high', 'todo'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'Finalize closing checklist', 'Complete all items on closing checklist', '2024-06-14', 'high', 'in_progress'),
('a3b4c5d6-e7f8-9012-abcd-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Schedule trust signing', 'Coordinate notary and witness for trust document execution', '2024-06-22', 'medium', 'todo'),
('c5d6e7f8-a9b0-1234-cdef-567890123456', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Prepare S-corp election analysis', 'Draft memo on S-corp election pros/cons', '2024-07-01', 'low', 'todo'),
('d6e7f8a9-b0c1-2345-defa-678901234567', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Update transfer pricing memo', 'Revise transfer pricing documentation memo', '2024-06-28', 'medium', 'todo'),
(NULL, 'b2c3d4e5-f6a7-8901-bcde-f23456789012', 'File CLE certificates', 'Submit CLE certificates for annual compliance', '2024-06-30', 'low', 'todo');

-- ============================================================================
-- SEED: CALENDAR EVENTS (5 events)
-- ============================================================================
INSERT INTO calendar_events (matter_id, title, description, start_time, end_time, event_type, reminder_minutes, location, created_by) VALUES
('c9d0e1f2-a3b4-5678-cdef-901234567890', 'IRS Audit Conference', 'Initial conference with IRS examining agent', '2024-06-25 10:00:00+00', '2024-06-25 12:00:00+00', 'meeting', 60, 'IRS Office - Downtown', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('f2a3b4c5-d6e7-8901-fabc-234567890123', 'StartupCo Acquisition Closing', 'Final closing for TechCorp acquisition of StartupCo', '2024-06-28 14:00:00+00', '2024-06-28 16:00:00+00', 'deadline', 1440, 'TechCorp Conference Room', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('d0e1f2a3-b4c5-6789-defa-012345678901', 'Client Call - OIC Status', 'Discuss Offer in Compromise status update', '2024-06-20 15:00:00+00', '2024-06-20 15:30:00+00', 'meeting', 15, 'Phone Conference', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
(NULL, 'Partnership Meeting', 'Monthly partnership meeting', '2024-06-30 09:00:00+00', '2024-06-30 11:00:00+00', 'meeting', 30, 'Conference Room A', 'c3d4e5f6-a7b8-9012-cdef-345678901234'),
('f8a9b0c1-d2e3-4567-fabc-890123456789', 'Sales Tax Audit Response Deadline', 'Deadline to respond to state sales tax audit findings', '2024-07-15 17:00:00+00', '2024-07-15 17:00:00+00', 'deadline', 10080, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- ============================================================================
-- SEED: COMMUNICATIONS (sample communications)
-- ============================================================================
INSERT INTO communications (client_id, matter_id, type, direction, subject, body, communication_date, follow_up_date, follow_up_status, created_by) VALUES
('d4e5f6a7-b8c9-0123-defa-456789012345', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'email', 'outbound', 'IRS Audit - Document Request', 'Dear Robert, Please find attached the list of documents requested by the IRS examiner. We will need these by Friday to meet the deadline.', '2024-06-10 09:30:00+00', '2024-06-14', 'pending', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('e5f6a7b8-c9d0-1234-efab-567890123456', 'd0e1f2a3-b4c5-6789-defa-012345678901', 'call', 'inbound', 'Follow-up on OIC status', 'Client called to check on Offer in Compromise status. Informed her we are still awaiting IRS response.', '2024-06-12 14:00:00+00', '2024-06-19', 'pending', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('f6a7b8c9-d0e1-2345-fabc-678901234567', 'e1f2a3b4-c5d6-7890-efab-123456789012', 'meeting', 'outbound', 'SALT Review - Quarterly Update', 'Quarterly meeting to review state tax compliance progress and discuss next steps for voluntary disclosures.', '2024-06-05 10:00:00+00', '2024-09-05', 'pending', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('d4e5f6a7-b8c9-0123-defa-456789012345', 'f2a3b4c5-d6e7-8901-fabc-234567890123', 'email', 'outbound', 'StartupCo Due Diligence - Week 2 Update', 'Please find attached the week 2 due diligence update. We have completed the IP review and are moving to employment agreements.', '2024-06-08 16:00:00+00', NULL, NULL, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('a7b8c9d0-e1f2-3456-abcd-789012345678', 'e7f8a9b0-c1d2-3456-efab-789012345678', 'email', 'inbound', 'Re: Initial Consultation - Tax Planning', 'Thank you for the consultation. I would like to proceed with engagement. Please send the engagement letter.', '2024-05-02 11:00:00+00', '2024-05-05', 'completed', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- ============================================================================
-- SEED: ACTIVITIES (audit log entries)
-- ============================================================================
INSERT INTO activities (user_id, entity_type, entity_id, action, description, created_at) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'client', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'created', 'Created new client: Robert Anderson (TechCorp Industries)', '2024-01-15 08:00:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'matter', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'created', 'Created new matter: IRS Audit Defense - 2022 Tax Year (2024-001)', '2024-01-15 08:30:00+00'),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'document', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'uploaded', 'Uploaded document: IRS_Notice_CP3219A.pdf', '2024-01-16 10:00:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'time_entry', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'created', 'Logged 2.0 hours: Initial client meeting - IRS audit scope discussion', '2024-01-15 17:00:00+00'),
('c3d4e5f6-a7b8-9012-cdef-345678901234', 'user', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'updated', 'Updated user profile for John Smith', '2024-01-10 09:00:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'invoice', '12345678-1234-1234-1234-123456789abc', 'created', 'Created invoice INV-2024-001 for $8,750.00', '2024-02-01 14:00:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'invoice', '12345678-1234-1234-1234-123456789abc', 'marked_paid', 'Invoice INV-2024-001 marked as paid', '2024-02-10 10:30:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'task', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'created', 'Created task: Prepare IDR responses', '2024-06-10 09:00:00+00'),
('b2c3d4e5-f6a7-8901-bcde-f23456789012', 'task', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'updated', 'Updated task status: Organize supporting documents - in_progress', '2024-06-12 11:00:00+00'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'communication', 'd4e5f6a7-b8c9-0123-defa-456789012345', 'sent', 'Sent email to Robert Anderson regarding IRS document request', '2024-06-10 09:30:00+00');

-- ============================================================================
-- SEED: CONFLICTS (sample conflict checks)
-- ============================================================================
INSERT INTO conflicts (client_id, matter_id, adverse_party, check_date, status, notes, checked_by) VALUES
('d4e5f6a7-b8c9-0123-defa-456789012345', 'c9d0e1f2-a3b4-5678-cdef-901234567890', 'Internal Revenue Service', '2024-01-15', 'clear', 'Government entity, no conflict concerns', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('f6a7b8c9-d0e1-2345-fabc-678901234567', 'e1f2a3b4-c5d6-7890-efab-123456789012', 'Various State Revenue Departments', '2024-02-20', 'clear', 'Multiple state agencies, no conflicts identified', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('d4e5f6a7-b8c9-0123-defa-456789012345', 'f2a3b4c5-d6e7-8901-fabc-234567890123', 'StartupCo Inc. Shareholders', '2024-03-01', 'flagged', 'Minority shareholder is former client - requires conflict waiver', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('a7b8c9d0-e1f2-3456-abcd-789012345678', 'e7f8a9b0-c1d2-3456-efab-789012345678', 'None identified', '2024-05-01', 'clear', 'Initial consultation, no adverse parties at this stage', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890');

-- ============================================================================
-- GRANT STATEMENTS (if needed for specific roles)
-- ============================================================================
-- Example grants for application roles:
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
-- Babalola Legal OS Database Schema successfully created!
-- 
-- Tables created: 13
-- ENUM types created: 14
-- Indexes created: 50+
-- Views created: 4
-- Triggers created: 11
-- Seed records inserted: 100+
-- ============================================================================
