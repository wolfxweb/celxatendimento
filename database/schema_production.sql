--
-- PostgreSQL database dump
--

\restrict KQj0bHWygsqMJkw4pbsAxYJg0VgIqEQv38N1RD8n2eJzTtIUETQXRMKVEbV1i48

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: ai_model_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ai_model_type AS ENUM (
    'llm',
    'embedding'
);


ALTER TYPE public.ai_model_type OWNER TO postgres;

--
-- Name: ai_provider_name; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ai_provider_name AS ENUM (
    'openai',
    'anthropic',
    'cohere',
    'openrouter',
    'local'
);


ALTER TYPE public.ai_provider_name OWNER TO postgres;

--
-- Name: ai_response_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ai_response_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'edited'
);


ALTER TYPE public.ai_response_status OWNER TO postgres;

--
-- Name: autonomy_level; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.autonomy_level AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.autonomy_level OWNER TO postgres;

--
-- Name: company_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.company_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'cancelled'
);


ALTER TYPE public.company_status OWNER TO postgres;

--
-- Name: source_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.source_type AS ENUM (
    'pdf',
    'text',
    'url'
);


ALTER TYPE public.source_type OWNER TO postgres;

--
-- Name: ticket_priority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_priority AS ENUM (
    'critical',
    'high',
    'medium',
    'low'
);


ALTER TYPE public.ticket_priority OWNER TO postgres;

--
-- Name: ticket_relation_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_relation_type AS ENUM (
    'duplicate',
    'causes',
    'caused_by',
    'related',
    'subticket',
    'parent'
);


ALTER TYPE public.ticket_relation_type OWNER TO postgres;

--
-- Name: ticket_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.ticket_status AS ENUM (
    'open',
    'pending_ai',
    'pending_agent',
    'pending_customer_feedback',
    'resolved',
    'closed',
    'rejected'
);


ALTER TYPE public.ticket_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'customer',
    'agent',
    'admin',
    'superadmin'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ai_feedback_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_feedback_log (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    ai_response_id integer,
    agent_id integer NOT NULL,
    action character varying(20) NOT NULL,
    previous_state text,
    new_state text,
    rating integer,
    feedback_text text,
    rejection_reason character varying(100),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_feedback_log OWNER TO postgres;

--
-- Name: ai_feedback_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_feedback_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_feedback_log_id_seq OWNER TO postgres;

--
-- Name: ai_feedback_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_feedback_log_id_seq OWNED BY public.ai_feedback_log.id;


--
-- Name: ai_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_models (
    id integer NOT NULL,
    provider_id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(100) NOT NULL,
    model_type character varying(20) NOT NULL,
    max_tokens integer,
    embedding_dimensions integer,
    supports_function_calling boolean NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_models OWNER TO postgres;

--
-- Name: ai_models_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_models_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_models_id_seq OWNER TO postgres;

--
-- Name: ai_models_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_models_id_seq OWNED BY public.ai_models.id;


--
-- Name: ai_providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_providers (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    api_url character varying(500),
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_providers OWNER TO postgres;

--
-- Name: ai_providers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_providers_id_seq OWNER TO postgres;

--
-- Name: ai_providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_providers_id_seq OWNED BY public.ai_providers.id;


--
-- Name: ai_tools; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ai_tools (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    display_name character varying(200) NOT NULL,
    description text,
    icon character varying(50),
    requires_integration boolean NOT NULL,
    integration_type character varying(50),
    schema_definition text,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_tools OWNER TO postgres;

--
-- Name: ai_tools_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ai_tools_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ai_tools_id_seq OWNER TO postgres;

--
-- Name: ai_tools_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ai_tools_id_seq OWNED BY public.ai_tools.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    company_id integer,
    name character varying(100) NOT NULL,
    description text,
    sla_minutes integer DEFAULT 1440,
    escalation_level integer DEFAULT 1,
    parent_category_id integer,
    is_active boolean DEFAULT true,
    is_default boolean DEFAULT false,
    require_approval boolean DEFAULT true,
    icon character varying(50),
    color character varying(7),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    domain character varying(255),
    logo_url character varying(500),
    status public.company_status DEFAULT 'pending'::public.company_status,
    status_reason text,
    approved_by integer,
    approved_at timestamp with time zone,
    settings jsonb DEFAULT '{}'::jsonb,
    timezone character varying(50) DEFAULT 'America/Sao_Paulo'::character varying,
    locale character varying(10) DEFAULT 'pt-BR'::character varying,
    contact_name character varying(255),
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(50),
    billing_email character varying(255),
    billing_address jsonb,
    total_users integer DEFAULT 0,
    total_tickets integer DEFAULT 0,
    tickets_this_month integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO postgres;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: company_ai_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_ai_config (
    id integer NOT NULL,
    company_id integer NOT NULL,
    provider_id integer,
    api_key_encrypted text,
    api_key_is_set boolean NOT NULL,
    llm_model character varying(100) NOT NULL,
    temperature double precision NOT NULL,
    max_tokens integer NOT NULL,
    embedding_model character varying(100) NOT NULL,
    embedding_dimensions integer NOT NULL,
    system_prompt text NOT NULL,
    tools jsonb NOT NULL,
    autonomy_level character varying(20) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_ai_config OWNER TO postgres;

--
-- Name: company_ai_config_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_ai_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_ai_config_id_seq OWNER TO postgres;

--
-- Name: company_ai_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_ai_config_id_seq OWNED BY public.company_ai_config.id;


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knowledge_base (
    id integer NOT NULL,
    company_id integer NOT NULL,
    title character varying(500) NOT NULL,
    content text NOT NULL,
    source_type character varying(10) NOT NULL,
    source_url character varying(1000),
    original_filename character varying(255),
    embedding text,
    chunks_count integer NOT NULL,
    chunk_index integer,
    parent_doc_id integer,
    is_active boolean NOT NULL,
    is_indexed boolean NOT NULL,
    index_error text,
    last_indexed_at timestamp with time zone,
    extra_data text NOT NULL,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.knowledge_base OWNER TO postgres;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knowledge_base_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_id_seq OWNER TO postgres;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knowledge_base_id_seq OWNED BY public.knowledge_base.id;


--
-- Name: priority_levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.priority_levels (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    display_name character varying(100) NOT NULL,
    sla_minutes integer NOT NULL,
    color character varying(7) NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.priority_levels OWNER TO postgres;

--
-- Name: priority_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.priority_levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.priority_levels_id_seq OWNER TO postgres;

--
-- Name: priority_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.priority_levels_id_seq OWNED BY public.priority_levels.id;


--
-- Name: ticket_ai_response; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_ai_response (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    response_text text NOT NULL,
    context_used text NOT NULL,
    config_snapshot text NOT NULL,
    generated_at timestamp with time zone NOT NULL,
    processing_time_ms integer,
    status character varying(20) NOT NULL,
    reviewed_by integer,
    reviewed_at timestamp with time zone,
    ai_rating integer,
    ai_feedback text,
    rejection_reason character varying(100),
    is_example_good boolean NOT NULL,
    is_example_bad boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_ai_response OWNER TO postgres;

--
-- Name: ticket_ai_response_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_ai_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_ai_response_id_seq OWNER TO postgres;

--
-- Name: ticket_ai_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_ai_response_id_seq OWNED BY public.ticket_ai_response.id;


--
-- Name: ticket_assignment_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_assignment_log (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    assigned_to integer,
    assigned_from integer,
    reason character varying(50) NOT NULL,
    notes text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_assignment_log OWNER TO postgres;

--
-- Name: ticket_assignment_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_assignment_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_assignment_log_id_seq OWNER TO postgres;

--
-- Name: ticket_assignment_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_assignment_log_id_seq OWNED BY public.ticket_assignment_log.id;


--
-- Name: ticket_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_attachments (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    message_id integer,
    filename character varying(255) NOT NULL,
    original_filename character varying(255) NOT NULL,
    mime_type character varying(100),
    file_size integer NOT NULL,
    storage_provider character varying(50) NOT NULL,
    storage_path character varying(500) NOT NULL,
    storage_bucket character varying(100),
    storage_url character varying(1000),
    thumbnail_path character varying(500),
    thumbnail_url character varying(1000),
    uploaded_by integer,
    is_active boolean NOT NULL,
    is_scanned boolean NOT NULL,
    scan_result character varying(50),
    deleted_at timestamp with time zone,
    deleted_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_attachments OWNER TO postgres;

--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_attachments_id_seq OWNER TO postgres;

--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_attachments_id_seq OWNED BY public.ticket_attachments.id;


--
-- Name: ticket_audit_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_audit_log (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    action_type text NOT NULL,
    user_id integer,
    user_role text,
    old_values text,
    new_values text,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_audit_log OWNER TO postgres;

--
-- Name: ticket_audit_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_audit_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_audit_log_id_seq OWNER TO postgres;

--
-- Name: ticket_audit_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_audit_log_id_seq OWNED BY public.ticket_audit_log.id;


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_messages (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    author_id integer,
    content text NOT NULL,
    message_type character varying(30) NOT NULL,
    ai_response_id integer,
    was_edited boolean NOT NULL,
    original_ai_text text,
    is_internal boolean NOT NULL,
    is_deleted boolean NOT NULL,
    deleted_by integer,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_messages OWNER TO postgres;

--
-- Name: ticket_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_messages_id_seq OWNER TO postgres;

--
-- Name: ticket_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_messages_id_seq OWNED BY public.ticket_messages.id;


--
-- Name: ticket_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_relations (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    related_ticket_id integer NOT NULL,
    relation_type character varying(20) NOT NULL,
    description text,
    created_by integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ticket_relations OWNER TO postgres;

--
-- Name: ticket_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_relations_id_seq OWNER TO postgres;

--
-- Name: ticket_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_relations_id_seq OWNED BY public.ticket_relations.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    company_id integer NOT NULL,
    ticket_number character varying(20) NOT NULL,
    user_id integer NOT NULL,
    category_id integer,
    assigned_to integer,
    status public.ticket_status DEFAULT 'open'::public.ticket_status,
    priority public.ticket_priority DEFAULT 'medium'::public.ticket_priority,
    subject character varying(200) NOT NULL,
    description text NOT NULL,
    channel character varying(50) DEFAULT 'website'::character varying,
    first_response_at timestamp with time zone,
    resolved_at timestamp with time zone,
    closed_at timestamp with time zone,
    sla_due_at timestamp with time zone,
    sla_breached boolean DEFAULT false,
    resolution_time_minutes integer,
    response_time_minutes integer,
    rating integer,
    rating_comment text,
    rated_at timestamp with time zone,
    tags jsonb DEFAULT '[]'::jsonb,
    locked_by integer,
    locked_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone,
    CONSTRAINT tickets_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO postgres;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    company_id integer,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    avatar_url character varying(500),
    phone character varying(50),
    role public.user_role DEFAULT 'customer'::public.user_role NOT NULL,
    is_active boolean DEFAULT true,
    is_email_verified boolean DEFAULT false,
    permissions jsonb DEFAULT '[]'::jsonb,
    last_login_at timestamp with time zone,
    last_login_ip inet,
    login_count integer DEFAULT 0,
    failed_login_count integer DEFAULT 0,
    password_reset_token character varying(255),
    password_reset_expires_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ai_feedback_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback_log ALTER COLUMN id SET DEFAULT nextval('public.ai_feedback_log_id_seq'::regclass);


--
-- Name: ai_models id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models ALTER COLUMN id SET DEFAULT nextval('public.ai_models_id_seq'::regclass);


--
-- Name: ai_providers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_providers ALTER COLUMN id SET DEFAULT nextval('public.ai_providers_id_seq'::regclass);


--
-- Name: ai_tools id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_tools ALTER COLUMN id SET DEFAULT nextval('public.ai_tools_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: company_ai_config id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_ai_config ALTER COLUMN id SET DEFAULT nextval('public.company_ai_config_id_seq'::regclass);


--
-- Name: knowledge_base id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_base ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_id_seq'::regclass);


--
-- Name: priority_levels id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.priority_levels ALTER COLUMN id SET DEFAULT nextval('public.priority_levels_id_seq'::regclass);


--
-- Name: ticket_ai_response id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_ai_response ALTER COLUMN id SET DEFAULT nextval('public.ticket_ai_response_id_seq'::regclass);


--
-- Name: ticket_assignment_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignment_log ALTER COLUMN id SET DEFAULT nextval('public.ticket_assignment_log_id_seq'::regclass);


--
-- Name: ticket_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_attachments ALTER COLUMN id SET DEFAULT nextval('public.ticket_attachments_id_seq'::regclass);


--
-- Name: ticket_audit_log id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_audit_log ALTER COLUMN id SET DEFAULT nextval('public.ticket_audit_log_id_seq'::regclass);


--
-- Name: ticket_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages ALTER COLUMN id SET DEFAULT nextval('public.ticket_messages_id_seq'::regclass);


--
-- Name: ticket_relations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_relations ALTER COLUMN id SET DEFAULT nextval('public.ticket_relations_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: ai_feedback_log ai_feedback_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback_log
    ADD CONSTRAINT ai_feedback_log_pkey PRIMARY KEY (id);


--
-- Name: ai_models ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_pkey PRIMARY KEY (id);


--
-- Name: ai_providers ai_providers_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_providers
    ADD CONSTRAINT ai_providers_name_key UNIQUE (name);


--
-- Name: ai_providers ai_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_providers
    ADD CONSTRAINT ai_providers_pkey PRIMARY KEY (id);


--
-- Name: ai_tools ai_tools_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_tools
    ADD CONSTRAINT ai_tools_name_key UNIQUE (name);


--
-- Name: ai_tools ai_tools_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_tools
    ADD CONSTRAINT ai_tools_pkey PRIMARY KEY (id);


--
-- Name: categories categories_company_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_company_id_name_key UNIQUE (company_id, name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: companies companies_domain_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_domain_key UNIQUE (domain);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: company_ai_config company_ai_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_ai_config
    ADD CONSTRAINT company_ai_config_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: priority_levels priority_levels_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.priority_levels
    ADD CONSTRAINT priority_levels_name_key UNIQUE (name);


--
-- Name: priority_levels priority_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.priority_levels
    ADD CONSTRAINT priority_levels_pkey PRIMARY KEY (id);


--
-- Name: ticket_ai_response ticket_ai_response_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_ai_response
    ADD CONSTRAINT ticket_ai_response_pkey PRIMARY KEY (id);


--
-- Name: ticket_assignment_log ticket_assignment_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignment_log
    ADD CONSTRAINT ticket_assignment_log_pkey PRIMARY KEY (id);


--
-- Name: ticket_attachments ticket_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id);


--
-- Name: ticket_audit_log ticket_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_audit_log
    ADD CONSTRAINT ticket_audit_log_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: ticket_relations ticket_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_relations
    ADD CONSTRAINT ticket_relations_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_company_id_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_company_id_ticket_number_key UNIQUE (company_id, ticket_number);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users users_company_id_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_email_key UNIQUE (company_id, email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_categories_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_active ON public.categories USING btree (is_active);


--
-- Name: idx_categories_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_company ON public.categories USING btree (company_id);


--
-- Name: idx_companies_domain; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_domain ON public.companies USING btree (domain);


--
-- Name: idx_companies_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_companies_status ON public.companies USING btree (status);


--
-- Name: idx_tickets_assigned; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_assigned ON public.tickets USING btree (assigned_to);


--
-- Name: idx_tickets_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_category ON public.tickets USING btree (category_id);


--
-- Name: idx_tickets_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_company ON public.tickets USING btree (company_id);


--
-- Name: idx_tickets_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_created ON public.tickets USING btree (created_at);


--
-- Name: idx_tickets_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_number ON public.tickets USING btree (ticket_number);


--
-- Name: idx_tickets_priority; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_priority ON public.tickets USING btree (priority);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: idx_tickets_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_user ON public.tickets USING btree (user_id);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active);


--
-- Name: idx_users_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_company ON public.users USING btree (company_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: ai_feedback_log ai_feedback_log_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback_log
    ADD CONSTRAINT ai_feedback_log_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id);


--
-- Name: ai_feedback_log ai_feedback_log_ai_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback_log
    ADD CONSTRAINT ai_feedback_log_ai_response_id_fkey FOREIGN KEY (ai_response_id) REFERENCES public.ticket_ai_response(id);


--
-- Name: ai_feedback_log ai_feedback_log_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_feedback_log
    ADD CONSTRAINT ai_feedback_log_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ai_models ai_models_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id);


--
-- Name: categories categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.categories(id);


--
-- Name: company_ai_config company_ai_config_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_ai_config
    ADD CONSTRAINT company_ai_config_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: company_ai_config company_ai_config_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_ai_config
    ADD CONSTRAINT company_ai_config_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.ai_providers(id);


--
-- Name: knowledge_base knowledge_base_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: knowledge_base knowledge_base_parent_doc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_parent_doc_id_fkey FOREIGN KEY (parent_doc_id) REFERENCES public.knowledge_base(id);


--
-- Name: ticket_ai_response ticket_ai_response_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_ai_response
    ADD CONSTRAINT ticket_ai_response_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: ticket_ai_response ticket_ai_response_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_ai_response
    ADD CONSTRAINT ticket_ai_response_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_assignment_log ticket_assignment_log_assigned_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignment_log
    ADD CONSTRAINT ticket_assignment_log_assigned_from_fkey FOREIGN KEY (assigned_from) REFERENCES public.users(id);


--
-- Name: ticket_assignment_log ticket_assignment_log_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignment_log
    ADD CONSTRAINT ticket_assignment_log_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: ticket_assignment_log ticket_assignment_log_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignment_log
    ADD CONSTRAINT ticket_assignment_log_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ticket_assignment_log ticket_assignment_log_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_assignment_log
    ADD CONSTRAINT ticket_assignment_log_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_attachments ticket_attachments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: ticket_attachments ticket_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.ticket_messages(id);


--
-- Name: ticket_attachments ticket_attachments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_attachments ticket_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: ticket_audit_log ticket_audit_log_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_audit_log
    ADD CONSTRAINT ticket_audit_log_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_audit_log ticket_audit_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_audit_log
    ADD CONSTRAINT ticket_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ticket_messages ticket_messages_ai_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ai_response_id_fkey FOREIGN KEY (ai_response_id) REFERENCES public.ticket_ai_response(id);


--
-- Name: ticket_messages ticket_messages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: ticket_messages ticket_messages_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_relations ticket_relations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_relations
    ADD CONSTRAINT ticket_relations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ticket_relations ticket_relations_related_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_relations
    ADD CONSTRAINT ticket_relations_related_ticket_id_fkey FOREIGN KEY (related_ticket_id) REFERENCES public.tickets(id);


--
-- Name: ticket_relations ticket_relations_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_relations
    ADD CONSTRAINT ticket_relations_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: tickets tickets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tickets tickets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: tickets tickets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_locked_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_locked_by_fkey FOREIGN KEY (locked_by) REFERENCES public.users(id);


--
-- Name: tickets tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict KQj0bHWygsqMJkw4pbsAxYJg0VgIqEQv38N1RD8n2eJzTtIUETQXRMKVEbV1i48
