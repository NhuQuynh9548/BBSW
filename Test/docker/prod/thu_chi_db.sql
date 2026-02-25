--
-- PostgreSQL database dump
--

-- Dumped from database version 16.0 (Debian 16.0-1.pgdg120+1)
-- Dumped by pg_dump version 16.0 (Debian 16.0-1.pgdg120+1)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: thuchi
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO thuchi;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: thuchi
--

COMMENT ON SCHEMA public IS '';


--
-- Name: approval_status; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.approval_status AS ENUM (
    'DRAFT',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.approval_status OWNER TO thuchi;

--
-- Name: category_status; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.category_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.category_status OWNER TO thuchi;

--
-- Name: category_type; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.category_type AS ENUM (
    'THU',
    'CHI',
    'VAY',
    'HOAN_UNG'
);


ALTER TYPE public.category_type OWNER TO thuchi;

--
-- Name: cost_allocation; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.cost_allocation AS ENUM (
    'DIRECT',
    'INDIRECT'
);


ALTER TYPE public.cost_allocation OWNER TO thuchi;

--
-- Name: object_type; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.object_type AS ENUM (
    'PARTNER',
    'EMPLOYEE',
    'STUDENT',
    'OTHER'
);


ALTER TYPE public.object_type OWNER TO thuchi;

--
-- Name: partner_status; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.partner_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.partner_status OWNER TO thuchi;

--
-- Name: partner_type; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.partner_type AS ENUM (
    'CUSTOMER',
    'SUPPLIER',
    'BOTH'
);


ALTER TYPE public.partner_type OWNER TO thuchi;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.payment_status AS ENUM (
    'PAID',
    'UNPAID'
);


ALTER TYPE public.payment_status OWNER TO thuchi;

--
-- Name: transaction_type; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.transaction_type AS ENUM (
    'INCOME',
    'EXPENSE',
    'LOAN'
);


ALTER TYPE public.transaction_type OWNER TO thuchi;

--
-- Name: work_status; Type: TYPE; Schema: public; Owner: thuchi
--

CREATE TYPE public.work_status AS ENUM (
    'WORKING',
    'PROBATION',
    'RESIGNED'
);


ALTER TYPE public.work_status OWNER TO thuchi;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _BusinessUnitToPartner; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public."_BusinessUnitToPartner" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_BusinessUnitToPartner" OWNER TO thuchi;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO thuchi;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.activity_logs (
    id text NOT NULL,
    user_id text,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action text NOT NULL,
    module text NOT NULL,
    description text NOT NULL,
    ip text,
    status text DEFAULT 'success'::text NOT NULL
);


ALTER TABLE public.activity_logs OWNER TO thuchi;

--
-- Name: allocation_previews; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.allocation_previews (
    id text NOT NULL,
    transaction_id text NOT NULL,
    bu_name text NOT NULL,
    percentage double precision NOT NULL,
    amount double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.allocation_previews OWNER TO thuchi;

--
-- Name: allocation_rules; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.allocation_rules (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    allocations jsonb
);


ALTER TABLE public.allocation_rules OWNER TO thuchi;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    action text NOT NULL,
    user_id text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changes jsonb,
    reason text,
    ip_address text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO thuchi;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.bank_accounts (
    id text NOT NULL,
    partner_id text NOT NULL,
    account_number text NOT NULL,
    bank_name text NOT NULL,
    branch text NOT NULL,
    swift_code text,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO thuchi;

--
-- Name: business_units; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.business_units (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    code text,
    leader_name text,
    staff_count integer DEFAULT 0 NOT NULL,
    start_date timestamp(3) without time zone,
    status text DEFAULT 'active'::text NOT NULL
);


ALTER TABLE public.business_units OWNER TO thuchi;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.categories (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type public.category_type NOT NULL,
    description text NOT NULL,
    status public.category_status DEFAULT 'ACTIVE'::public.category_status NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categories OWNER TO thuchi;

--
-- Name: contracts; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.contracts (
    id text NOT NULL,
    partner_id text NOT NULL,
    contract_number text NOT NULL,
    sign_date timestamp(3) without time zone NOT NULL,
    expiry_date timestamp(3) without time zone NOT NULL,
    value double precision NOT NULL,
    file_name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.contracts OWNER TO thuchi;

--
-- Name: employee_levels; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.employee_levels (
    id text NOT NULL,
    name text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    code text NOT NULL,
    description text
);


ALTER TABLE public.employee_levels OWNER TO thuchi;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.employees (
    id text NOT NULL,
    employee_id text NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    business_unit_id text NOT NULL,
    specialization_id text,
    level_id text,
    join_date timestamp(3) without time zone,
    work_status public.work_status DEFAULT 'WORKING'::public.work_status NOT NULL,
    birth_date timestamp(3) without time zone,
    id_card text,
    address text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.employees OWNER TO thuchi;

--
-- Name: login_history; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.login_history (
    id text NOT NULL,
    user_id text NOT NULL,
    "timestamp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip text,
    device text
);


ALTER TABLE public.login_history OWNER TO thuchi;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info'::text NOT NULL,
    unread boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    related_id text,
    target_path text
);


ALTER TABLE public.notifications OWNER TO thuchi;

--
-- Name: partners; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.partners (
    id text NOT NULL,
    partner_id text NOT NULL,
    partner_name text NOT NULL,
    partner_type public.partner_type NOT NULL,
    tax_code text NOT NULL,
    phone text NOT NULL,
    contact_person text NOT NULL,
    status public.partner_status DEFAULT 'ACTIVE'::public.partner_status NOT NULL,
    address text NOT NULL,
    email text NOT NULL,
    representative_name text NOT NULL,
    representative_title text NOT NULL,
    representative_phone text NOT NULL,
    payment_method_id text,
    payment_term integer DEFAULT 30 NOT NULL,
    balance double precision DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.partners OWNER TO thuchi;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.payment_methods (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO thuchi;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.projects (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    start_date timestamp(3) without time zone NOT NULL,
    end_date timestamp(3) without time zone,
    status text DEFAULT 'ACTIVE'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    bu_owner text,
    budget double precision DEFAULT 0 NOT NULL,
    pm text,
    spent double precision DEFAULT 0 NOT NULL
);


ALTER TABLE public.projects OWNER TO thuchi;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    permissions jsonb,
    is_system_role boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO thuchi;

--
-- Name: specializations; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.specializations (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    code text NOT NULL,
    description text
);


ALTER TABLE public.specializations OWNER TO thuchi;

--
-- Name: system_sequences; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.system_sequences (
    key text NOT NULL,
    value integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.system_sequences OWNER TO thuchi;

--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.system_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    category text DEFAULT 'general'::text NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.system_settings OWNER TO thuchi;

--
-- Name: transaction_attachments; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.transaction_attachments (
    id text NOT NULL,
    transaction_id text NOT NULL,
    file_name text NOT NULL,
    file_size integer NOT NULL,
    file_type text NOT NULL,
    file_url text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.transaction_attachments OWNER TO thuchi;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    transaction_code text NOT NULL,
    transaction_date timestamp(3) without time zone NOT NULL,
    transaction_type public.transaction_type NOT NULL,
    category_id text NOT NULL,
    project_id text,
    object_type public.object_type NOT NULL,
    partner_id text,
    employee_id text,
    payment_method_id text,
    business_unit_id text NOT NULL,
    amount double precision NOT NULL,
    cost_allocation public.cost_allocation NOT NULL,
    allocation_rule_id text,
    payment_status public.payment_status DEFAULT 'UNPAID'::public.payment_status NOT NULL,
    approval_status public.approval_status DEFAULT 'DRAFT'::public.approval_status NOT NULL,
    rejection_reason text,
    description text NOT NULL,
    created_by text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    is_advance boolean DEFAULT false NOT NULL,
    student_name text,
    other_name text,
    project_name text
);


ALTER TABLE public.transactions OWNER TO thuchi;

--
-- Name: users; Type: TABLE; Schema: public; Owner: thuchi
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    avatar text,
    bu_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    data_scope text DEFAULT 'personal'::text NOT NULL,
    full_name text,
    last_login timestamp(3) without time zone,
    role_id text,
    status text DEFAULT 'active'::text NOT NULL,
    two_fa_enabled boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO thuchi;

--
-- Data for Name: _BusinessUnitToPartner; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public."_BusinessUnitToPartner" ("A", "B") FROM stdin;
56bf3663-05b2-4c1d-abf6-b87528361b02	c8f26a52-de4b-4ad0-8261-8511e53a4752
56bf3663-05b2-4c1d-abf6-b87528361b02	c8fe3ae5-f0de-48d6-a1a4-7f63e9f0124c
56bf3663-05b2-4c1d-abf6-b87528361b02	7d5d729f-985e-4ada-8ac6-53b2198db4b4
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	97fba3d0-89dc-4e77-8cc6-2c64fc9f234f
53563c80-e91b-4068-9369-b3d676df5628	97fba3d0-89dc-4e77-8cc6-2c64fc9f234f
56bf3663-05b2-4c1d-abf6-b87528361b02	97fba3d0-89dc-4e77-8cc6-2c64fc9f234f
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	fac93949-0744-4db7-b2a3-caf1a40ff581
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	3f57cbea-2849-4e39-af3b-7087561b71bf
53563c80-e91b-4068-9369-b3d676df5628	3f57cbea-2849-4e39-af3b-7087561b71bf
56bf3663-05b2-4c1d-abf6-b87528361b02	3f57cbea-2849-4e39-af3b-7087561b71bf
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	0eb36d46-e424-4f52-9734-9f304c6ca74c
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	550fc744-0e3f-4116-a56a-08856aa745a0
53563c80-e91b-4068-9369-b3d676df5628	550fc744-0e3f-4116-a56a-08856aa745a0
56bf3663-05b2-4c1d-abf6-b87528361b02	550fc744-0e3f-4116-a56a-08856aa745a0
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	6a50589f-0770-4088-b88f-27ca6a6dba22
53563c80-e91b-4068-9369-b3d676df5628	6a50589f-0770-4088-b88f-27ca6a6dba22
56bf3663-05b2-4c1d-abf6-b87528361b02	6a50589f-0770-4088-b88f-27ca6a6dba22
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e5db6905-3eb4-4c0b-b9cf-bb8c65abbf8d	bcdd0261bf996328c3e463b1f3af68fb1eecc6be5c08479213eb6d38c59a8270	2026-01-19 04:17:01.452115+00	20260116081349_init	\N	\N	2026-01-19 04:17:01.325723+00	1
4e82e84c-834c-4f1a-925e-0436fd6c9954	eae67d4698540d574b5a9604a40a3014a02ce27d3a76f174e7a346cca6a6748f	2026-01-19 04:17:01.544534+00	20260116100848_add_bu_manual_fields	\N	\N	2026-01-19 04:17:01.481053+00	1
141088fb-a0be-4f07-a963-58e40726e45f	d1242932a0a83b7dfdc8f58aab43eea0076c0b195ca8aa9320e70134c128ce55	2026-01-19 04:17:01.618187+00	20260116103631_add_allocation_rule_details_fix	\N	\N	2026-01-19 04:17:01.574275+00	1
021ac1ec-10c7-4d9a-85bc-bce530442aca	c74338695b15e786fb809213fe836c48692d38ead0bdf92551710a2450c556b8	2026-01-19 04:17:01.730193+00	20260117021724_add_project_fields_buowner_pm_budget	\N	\N	2026-01-19 04:17:01.645022+00	1
f03fed57-d9b0-44be-acc1-6df93ca38fe1	c578f1bc02c9f4c8caf8eb1e707ea586ccb51c5aac023077eea5a534f7edfa1d	2026-01-19 04:17:35.928663+00	20260119041735_make_employee_fields_optional	\N	\N	2026-01-19 04:17:35.853634+00	1
ad8e1a84-221c-408a-92c1-1729e67e10b4	56b80ad706780bf5233589afca39b368286e74b74a1d8dcb256ce2f7c0f10a0c	2026-01-21 07:40:31.412709+00	20260121074031_add_bu_to_partners	\N	\N	2026-01-21 07:40:31.226557+00	1
6d6d89d1-cec3-4ec3-acd9-4406205bd436	968c6f120c2682f7a3b607fa31b2ec8a6aac8e72785c99634de4c946448cf5c9	2026-01-21 08:25:25.307676+00	20260121082525_add_student_to_transactions	\N	\N	2026-01-21 08:25:25.263352+00	1
f0f7d8cd-9ca6-473f-91a4-9c83a064f420	7a145146e56d358ab9b121cf4f2b5c13bbb79e201fe0683b22d14ef4d2a11a68	2026-01-21 14:49:40.535058+00	20260121144940_add_other_to_transactions	\N	\N	2026-01-21 14:49:40.464592+00	1
1590c187-0f65-41c1-ada7-1a514d849b3b	9645ab5976699f558fd065ac2674c97c95a4fe41b8b6d6a1a27586ade1c7c8da	2026-01-25 14:03:58.195974+00	20260125140358_add_project_name	\N	\N	2026-01-25 14:03:58.155271+00	1
87dba457-1739-424a-b6f2-12d7295823ab	43320ba5152b9cb95f18c6d5480d561e0b902f0b6094cd4222ea01946fd39f82	2026-01-25 15:35:24.87102+00	20260125153524_add_notifications	\N	\N	2026-01-25 15:35:24.581276+00	1
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.activity_logs (id, user_id, "timestamp", action, module, description, ip, status) FROM stdin;
313fb5e9-f106-405e-9b8a-7aadebe43d97	4f228265-d6c1-4a36-bbc5-273cce390f35	2026-01-19 04:17:46.311	LOGIN	Authentication	Hệ thống Admin đăng nhập	127.0.0.1	success
5dc6ded6-73c2-4ddc-9b2d-b581a53d6469	4f228265-d6c1-4a36-bbc5-273cce390f35	2026-01-19 04:17:46.337	UPDATE	Hệ thống	Cập nhật cấu hình bảo mật	127.0.0.1	success
\.


--
-- Data for Name: allocation_previews; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.allocation_previews (id, transaction_id, bu_name, percentage, amount, created_at) FROM stdin;
\.


--
-- Data for Name: allocation_rules; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.allocation_rules (id, name, description, created_at, updated_at, allocations) FROM stdin;
18a599e1-7ad4-4480-bda8-f06c5e8407d5	Phân bổ chung		2026-01-20 08:10:44.063	2026-01-23 08:02:21.076	[{"buId": "53563c80-e91b-4068-9369-b3d676df5628", "percentage": 15}, {"buId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "percentage": 22}, {"buId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "percentage": 63}]
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.audit_logs (id, table_name, record_id, action, user_id, old_values, new_values, changes, reason, ip_address, user_agent, created_at) FROM stdin;
df49123c-04b3-493c-ab00-07831d2f025d	Transaction	53221a63-c783-4b25-9d73-25e6dacbcede	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "53221a63-c783-4b25-9d73-25e6dacbcede", "amount": 130000000, "createdAt": "2026-01-28T17:30:12.727Z", "createdBy": "eab2eb0f-dfd4-4ab0-8c83-38613ac673f7", "isAdvance": false, "otherName": null, "partnerId": "c8f26a52-de4b-4ad0-8261-8511e53a4752", "projectId": null, "updatedAt": "2026-01-28T18:48:32.279Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "PARTNER", "description": "", "projectName": null, "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_09", "transactionDate": "2026-01-21T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "53221a63-c783-4b25-9d73-25e6dacbcede", "amount": 130000000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-01-28T17:30:12.727Z", "createdBy": "eab2eb0f-dfd4-4ab0-8c83-38613ac673f7", "isAdvance": false, "otherName": null, "partnerId": "c8f26a52-de4b-4ad0-8261-8511e53a4752", "projectId": null, "updatedAt": "2026-01-28T18:48:32.279Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "PARTNER", "attachments": [], "description": "Thu tiền lắp đặt", "projectName": null, "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_09", "transactionDate": "2026-01-21T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": []}, "description": {"new": "Thu tiền lắp đặt", "old": ""}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 09:05:42.053
34c3e584-993d-4185-b50c-5639e1215f01	Transaction	5469c414-398d-426e-8313-f863ad529184	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "5469c414-398d-426e-8313-f863ad529184", "amount": 999000, "createdAt": "2026-01-28T16:18:10.930Z", "createdBy": "eab2eb0f-dfd4-4ab0-8c83-38613ac673f7", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-01-28T17:25:49.924Z", "categoryId": "121cc413-3ddf-428f-a6f8-a77a6578f917", "employeeId": null, "objectType": "STUDENT", "description": "", "projectName": "Khoá Web01-Tự tay xây dựng Website bằng AI", "studentName": "Khoá Web01-Tự tay xây dựng Website bằng AI", "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_08", "transactionDate": "2026-01-22T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "5469c414-398d-426e-8313-f863ad529184", "amount": 999000, "category": {"id": "121cc413-3ddf-428f-a6f8-a77a6578f917", "code": "T02", "name": "Thu bán khóa học", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-20T09:15:10.012Z", "updatedAt": "2026-01-20T09:15:10.012Z", "description": "thu"}, "createdAt": "2026-01-28T16:18:10.930Z", "createdBy": "eab2eb0f-dfd4-4ab0-8c83-38613ac673f7", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-01-28T17:25:49.924Z", "categoryId": "121cc413-3ddf-428f-a6f8-a77a6578f917", "employeeId": null, "objectType": "STUDENT", "attachments": [], "description": "Khóa học", "projectName": "Khoá Web01-Tự tay xây dựng Website bằng AI", "studentName": "Khoá Web01-Tự tay xây dựng Website bằng AI", "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_08", "transactionDate": "2026-01-22T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "121cc413-3ddf-428f-a6f8-a77a6578f917", "code": "T02", "name": "Thu bán khóa học", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-20T09:15:10.012Z", "updatedAt": "2026-01-20T09:15:10.012Z", "description": "thu"}}, "attachments": {"new": []}, "description": {"new": "Khóa học", "old": ""}, "businessUnit": {"new": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 09:06:52.005
0e6831f4-cafb-4c9d-9548-2fc49dd1968f	Transaction	7326df89-5524-41b3-9b6e-2cdd0243acd9	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "7326df89-5524-41b3-9b6e-2cdd0243acd9", "amount": 9957600, "createdAt": "2026-02-02T08:44:37.619Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": "c8fe3ae5-f0de-48d6-a1a4-7f63e9f0124c", "projectId": null, "updatedAt": "2026-02-02T08:44:37.619Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "PARTNER", "description": "Công nợ lắp đặt T12/2025", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "PENDING", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_13", "transactionDate": "2026-01-30T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "7326df89-5524-41b3-9b6e-2cdd0243acd9", "amount": 9957600, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-02T08:44:37.619Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": "c8fe3ae5-f0de-48d6-a1a4-7f63e9f0124c", "projectId": null, "updatedAt": "2026-02-02T08:44:37.619Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "PARTNER", "attachments": [], "description": "Công nợ lắp đặt T12/2025", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "PENDING", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_13", "transactionDate": "2026-01-30T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": []}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 09:49:08.746
d228ee13-6cf2-46cd-be57-7a4f80042461	Transaction	93c1f560-f80a-46e7-bd8b-fe52f3b1ca0e	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "93c1f560-f80a-46e7-bd8b-fe52f3b1ca0e", "amount": 100000, "createdAt": "2026-02-02T09:49:46.934Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-02T09:49:46.934Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "DRAFT", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_15", "transactionDate": "2026-01-30T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "93c1f560-f80a-46e7-bd8b-fe52f3b1ca0e", "amount": 100000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-02T09:49:46.934Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-02T09:49:46.934Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [], "description": "", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "PAID", "approvalStatus": "DRAFT", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_15", "transactionDate": "2026-01-30T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": []}, "businessUnit": {"new": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}}, "paymentStatus": {"new": "PAID", "old": "UNPAID"}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 09:50:01.406
323e82b5-0bc0-4b80-b13c-055c0aa42bea	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGOUT	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:39:21.589
17c4ffdc-4f8e-40a5-8b87-0da7d371156b	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 04:50:24.771
234257f9-dcdf-468f-b8ef-326e316b29b4	Transaction	93c1f560-f80a-46e7-bd8b-fe52f3b1ca0e	DELETE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "93c1f560-f80a-46e7-bd8b-fe52f3b1ca0e", "amount": 100000, "createdAt": "2026-02-02T09:49:46.934Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-02T09:49:46.934Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "", "projectName": null, "studentName": null, "paymentStatus": "PAID", "approvalStatus": "DRAFT", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0126_15", "transactionDate": "2026-01-30T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 09:50:11.644
050903fd-de98-4d05-ae93-49c020d00205	Transaction	4f6a5d33-1757-46c2-a30f-a3f5afdac18d	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "4f6a5d33-1757-46c2-a30f-a3f5afdac18d", "amount": 100000, "createdAt": "2026-02-02T10:00:26.143Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-02T10:00:26.143Z", "categoryId": "121cc413-3ddf-428f-a6f8-a77a6578f917", "employeeId": null, "objectType": "OTHER", "description": "", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0226_02", "transactionDate": "2026-02-02T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "4f6a5d33-1757-46c2-a30f-a3f5afdac18d", "amount": 100000, "category": {"id": "121cc413-3ddf-428f-a6f8-a77a6578f917", "code": "T02", "name": "Thu bán khóa học", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-20T09:15:10.012Z", "updatedAt": "2026-01-20T09:15:10.012Z", "description": "thu"}, "createdAt": "2026-02-02T10:00:26.143Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-02T10:00:26.143Z", "categoryId": "121cc413-3ddf-428f-a6f8-a77a6578f917", "employeeId": null, "objectType": "OTHER", "attachments": [], "description": "", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0226_02", "transactionDate": "2026-02-02T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "121cc413-3ddf-428f-a6f8-a77a6578f917", "code": "T02", "name": "Thu bán khóa học", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-20T09:15:10.012Z", "updatedAt": "2026-01-20T09:15:10.012Z", "description": "thu"}}, "attachments": {"new": []}, "businessUnit": {"new": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}}, "paymentStatus": {"new": "PAID", "old": "UNPAID"}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 10:00:40.924
a33159dd-5971-4d98-9074-6e496ecf2d16	Transaction	4f6a5d33-1757-46c2-a30f-a3f5afdac18d	DELETE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "4f6a5d33-1757-46c2-a30f-a3f5afdac18d", "amount": 100000, "createdAt": "2026-02-02T10:00:26.143Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-02T10:00:26.143Z", "categoryId": "121cc413-3ddf-428f-a6f8-a77a6578f917", "employeeId": null, "objectType": "OTHER", "description": "", "projectName": null, "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "T0226_02", "transactionDate": "2026-02-02T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-02 10:00:47.761
a9f6d9e1-30db-4198-b2d3-3df82dd5295b	User	4f228265-d6c1-4a36-bbc5-273cce390f35	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "4f228265-d6c1-4a36-bbc5-273cce390f35", "buId": null, "name": "Hệ thống Admin", "email": "admin@bluebolt.com", "avatar": null, "roleId": "0b147ee8-3e20-4ff3-b351-38c39bbf29af", "status": "active", "fullName": "Hệ thống Admin", "password": "$2a$10$OA2skMkheZAM5JznZO.Z0eC5Mqzv.ZZMZJsiQGSaaSN1GaK0S9pcG", "createdAt": "2026-01-19T04:17:44.964Z", "dataScope": "global", "lastLogin": null, "updatedAt": "2026-01-25T15:27:02.697Z", "twoFAEnabled": false}	{"id": "4f228265-d6c1-4a36-bbc5-273cce390f35", "buId": null, "name": "Hệ thống Admin", "role": {"id": "a99cf48d-7116-40bf-89e4-6b18d0495580", "name": "ADMIN", "createdAt": "2026-01-19T06:40:00.160Z", "updatedAt": "2026-01-19T06:40:33.245Z", "description": "Quản trị hệ thống", "permissions": [{"edit": true, "view": true, "create": true, "delete": true, "module": "thu_chi", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "bao_cao", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "nhan_su", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "master_data", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "he_thong", "approve": true}], "isSystemRole": false}, "email": "admin@bluebolt.com", "avatar": null, "roleId": "a99cf48d-7116-40bf-89e4-6b18d0495580", "status": "active", "fullName": "Hệ thống Admin", "password": "$2a$10$OA2skMkheZAM5JznZO.Z0eC5Mqzv.ZZMZJsiQGSaaSN1GaK0S9pcG", "createdAt": "2026-01-19T04:17:44.964Z", "dataScope": "personal", "lastLogin": null, "updatedAt": "2026-02-03T04:04:51.669Z", "businessUnit": null, "twoFAEnabled": false}	{"role": {"new": {"id": "a99cf48d-7116-40bf-89e4-6b18d0495580", "name": "ADMIN", "createdAt": "2026-01-19T06:40:00.160Z", "updatedAt": "2026-01-19T06:40:33.245Z", "description": "Quản trị hệ thống", "permissions": [{"edit": true, "view": true, "create": true, "delete": true, "module": "thu_chi", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "bao_cao", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "nhan_su", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "master_data", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "he_thong", "approve": true}], "isSystemRole": false}}, "roleId": {"new": "a99cf48d-7116-40bf-89e4-6b18d0495580", "old": "0b147ee8-3e20-4ff3-b351-38c39bbf29af"}, "dataScope": {"new": "personal", "old": "global"}, "updatedAt": {"new": "2026-02-03T04:04:51.669Z", "old": "2026-01-25T15:27:02.697Z"}, "businessUnit": {"new": null}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 04:04:51.808
dcd758b9-6743-4190-9c5f-08c6e0e61ece	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGOUT	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 04:04:58.07
c844efd1-e594-4b1c-99a0-a847897c0d91	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 04:05:08.023
21c7931d-3d3d-461e-b435-65b63de6b612	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGOUT	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 04:20:58.92
87879909-140f-4b5f-a0de-c1e984159289	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 04:21:08.1
bc33e88b-0480-4abc-8bf2-4066c97e4823	User	5b76cd1d-0f8f-44e2-aebd-576507a45228	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "5b76cd1d-0f8f-44e2-aebd-576507a45228", "buId": null, "name": "Huỳnh Thị Mỹ Hồng", "email": "honghuynh@bluebolt.vn", "avatar": null, "roleId": "0b147ee8-3e20-4ff3-b351-38c39bbf29af", "status": "active", "fullName": "Huỳnh Thị Mỹ Hồng", "password": "$2a$10$vc0Cp.bWKZeVTES7TaVSteVM0KdsOLhgyVos94pilhLUaVwCsuY/u", "createdAt": "2026-01-22T02:48:39.648Z", "dataScope": "global", "lastLogin": null, "updatedAt": "2026-01-26T03:26:47.863Z", "twoFAEnabled": false}	{"id": "5b76cd1d-0f8f-44e2-aebd-576507a45228", "buId": null, "name": "Huỳnh Thị Mỹ Hồng", "role": {"id": "b5312881-dd9c-4bbe-b645-d8437a1976fd", "name": "CEO", "createdAt": "2026-01-19T06:38:10.724Z", "updatedAt": "2026-01-20T09:36:02.874Z", "description": "CEO", "permissions": [{"edit": true, "view": true, "create": true, "delete": true, "module": "thu_chi", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "bao_cao", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "nhan_su", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "master_data", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "he_thong", "approve": true}], "isSystemRole": false}, "email": "honghuynh@bluebolt.vn", "avatar": null, "roleId": "b5312881-dd9c-4bbe-b645-d8437a1976fd", "status": "active", "fullName": "Huỳnh Thị Mỹ Hồng", "password": "$2a$10$vc0Cp.bWKZeVTES7TaVSteVM0KdsOLhgyVos94pilhLUaVwCsuY/u", "createdAt": "2026-01-22T02:48:39.648Z", "dataScope": "global", "lastLogin": null, "updatedAt": "2026-02-03T07:08:59.274Z", "businessUnit": null, "twoFAEnabled": false}	{"role": {"new": {"id": "b5312881-dd9c-4bbe-b645-d8437a1976fd", "name": "CEO", "createdAt": "2026-01-19T06:38:10.724Z", "updatedAt": "2026-01-20T09:36:02.874Z", "description": "CEO", "permissions": [{"edit": true, "view": true, "create": true, "delete": true, "module": "thu_chi", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "bao_cao", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "nhan_su", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "master_data", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "he_thong", "approve": true}], "isSystemRole": false}}, "roleId": {"new": "b5312881-dd9c-4bbe-b645-d8437a1976fd", "old": "0b147ee8-3e20-4ff3-b351-38c39bbf29af"}, "updatedAt": {"new": "2026-02-03T07:08:59.274Z", "old": "2026-01-26T03:26:47.863Z"}, "businessUnit": {"new": null}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 07:08:59.46
ec841542-2d96-4474-be6c-d5a7e5423bc9	Transaction	89ea8171-84ed-49f9-8672-afcac72d66d5	CREATE	4f228265-d6c1-4a36-bbc5-273cce390f35	null	{"id": "89ea8171-84ed-49f9-8672-afcac72d66d5", "amount": 100000, "creator": {"name": "Hệ thống Admin", "fullName": "Hệ thống Admin"}, "category": {"id": "f6558866-1aad-422f-85f9-1144baecb636", "code": "V01", "name": "Vay đầu tư", "type": "VAY", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:26.862Z", "updatedAt": "2026-01-19T15:16:33.152Z", "description": "Vay đầu tư"}, "createdAt": "2026-02-03T08:04:18.127Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:04:18.127Z", "categoryId": "f6558866-1aad-422f-85f9-1144baecb636", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "d6867b86-1c14-43fd-b1c6-4fa797d28562", "fileUrl": "/uploads/1770105857946-899545523-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-03T08:04:18.127Z", "transactionId": "89ea8171-84ed-49f9-8672-afcac72d66d5"}], "description": "mmmmm", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PV0226_001", "transactionDate": "2026-02-03T00:00:00.000Z", "transactionType": "LOAN", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 08:04:18.33
56c396d1-5c66-4fe8-9104-7c77a0412adc	Transaction	89ea8171-84ed-49f9-8672-afcac72d66d5	DELETE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "89ea8171-84ed-49f9-8672-afcac72d66d5", "amount": 100000, "createdAt": "2026-02-03T08:04:18.127Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:04:18.127Z", "categoryId": "f6558866-1aad-422f-85f9-1144baecb636", "employeeId": null, "objectType": "OTHER", "description": "mmmmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PV0226_001", "transactionDate": "2026-02-03T00:00:00.000Z", "transactionType": "LOAN", "allocationRuleId": null}	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 08:04:51.677
9ead9b8d-df5a-49d7-bf8a-58d003435d6d	Transaction	5686a92b-3e12-4f7f-b117-94618f6ea5cd	CREATE	4f228265-d6c1-4a36-bbc5-273cce390f35	null	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "creator": {"name": "Hệ thống Admin", "fullName": "Hệ thống Admin"}, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "b522090c-77b9-4b9d-b631-8161e889986e", "fileUrl": "/uploads/1770107563009-82980733-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-03T08:32:43.153Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}], "description": "mmmm", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 08:32:43.488
63de3eeb-e56f-41f4-814b-acc76afca835	Transaction	5686a92b-3e12-4f7f-b117-94618f6ea5cd	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "description": "mmmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "bf8a6fea-95ae-40f1-96a2-4221b5d90973", "fileUrl": "/uploads/1770108520953-183024661-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-03T08:48:41.063Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}], "description": "mmmm", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "bf8a6fea-95ae-40f1-96a2-4221b5d90973", "fileUrl": "/uploads/1770108520953-183024661-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-03T08:48:41.063Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}]}, "businessUnit": {"new": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 08:48:41.277
df651d49-17e8-4c3b-a270-e7e185030a19	Transaction	5686a92b-3e12-4f7f-b117-94618f6ea5cd	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "description": "mmmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "b0dadfd0-6078-4bed-aea3-090c1fa20ea4", "fileUrl": "/uploads/1770109385989-223883244-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-03T09:03:06.143Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}], "description": "mmmm", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "b0dadfd0-6078-4bed-aea3-090c1fa20ea4", "fileUrl": "/uploads/1770109385989-223883244-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-03T09:03:06.143Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}]}, "businessUnit": {"new": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 09:03:06.335
ab00dd02-302b-40ce-8048-df7f18e2e391	Transaction	5686a92b-3e12-4f7f-b117-94618f6ea5cd	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "description": "mmmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "cb3d890c-d3e8-4a77-a531-5369cbf8317a", "fileUrl": "/uploads/1770109385989-223883244-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-03T09:10:22.576Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}, {"id": "1bb9312e-b2ce-44e8-9507-d5524829340b", "fileUrl": "/uploads/1770109822473-285390081-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-03T09:10:22.576Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}], "description": "mmmm", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "cb3d890c-d3e8-4a77-a531-5369cbf8317a", "fileUrl": "/uploads/1770109385989-223883244-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-03T09:10:22.576Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}, {"id": "1bb9312e-b2ce-44e8-9507-d5524829340b", "fileUrl": "/uploads/1770109822473-285390081-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-03T09:10:22.576Z", "transactionId": "5686a92b-3e12-4f7f-b117-94618f6ea5cd"}]}, "businessUnit": {"new": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 09:10:22.801
5ce85a5b-d69c-4721-8d8e-fd84cba7602d	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:53:08.541
044c0280-7878-40de-982e-0ae5c92aacda	Transaction	5686a92b-3e12-4f7f-b117-94618f6ea5cd	DELETE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "5686a92b-3e12-4f7f-b117-94618f6ea5cd", "amount": 10000, "createdAt": "2026-02-03T08:32:43.153Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T08:32:43.153Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "OTHER", "description": "mmmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_PC0126_006", "transactionDate": "2026-01-31T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 09:17:55.092
6329d34c-e0f7-4340-97d3-cedafd08d8e0	Transaction	0d38e486-53be-4805-9bb1-e0c29be0c1a4	DELETE	02e42798-fc80-4285-b1e3-fec19fdf3222	{"id": "0d38e486-53be-4805-9bb1-e0c29be0c1a4", "amount": 52650000, "createdAt": "2026-01-28T16:42:29.616Z", "createdBy": "eab2eb0f-dfd4-4ab0-8c83-38613ac673f7", "isAdvance": false, "otherName": "CEO Lê Hoàng Đạt", "partnerId": null, "projectId": null, "updatedAt": "2026-02-03T07:51:45.276Z", "categoryId": "f6558866-1aad-422f-85f9-1144baecb636", "employeeId": null, "objectType": "OTHER", "description": "", "projectName": null, "studentName": null, "paymentStatus": "PAID", "approvalStatus": "CANCELLED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": "Bị lặp", "transactionCode": "BBAC_PV0126_002", "transactionDate": "2026-01-01T00:00:00.000Z", "transactionType": "LOAN", "allocationRuleId": null}	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-03 09:23:08.414
6ad83b4a-ab75-47b8-8f68-1e2a1383e99d	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Mobile/15E148 Safari/604.1	2026-02-03 12:33:16.015
52ac7db4-7d7b-4315-a371-9bc2b33fa2d7	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 02:29:26.742
c074fe4e-28a0-421f-9f9a-7025bda48f61	User	7ffda0d3-3b91-4503-b583-1d50051aa072	LOGOUT	7ffda0d3-3b91-4503-b583-1d50051aa072	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 04:14:31.119
9bdc9599-0ce7-43a0-9cb8-974c2bfb1085	User	7ffda0d3-3b91-4503-b583-1d50051aa072	LOGIN	7ffda0d3-3b91-4503-b583-1d50051aa072	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 04:14:32.506
c615f2e2-e14d-42fb-b366-20a9af45b1cb	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	CREATE	7ffda0d3-3b91-4503-b583-1d50051aa072	null	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "creator": {"name": "Phạm Anh Duy", "fullName": "Phạm Anh Duy"}, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "65d57ea4-1dcd-40f3-a069-5e3d0e8181fb", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T04:17:33.284Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 04:17:33.293
623f2d25-d839-4efc-a0d8-4b62035a4e1a	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 07:21:32.366
7d3b8088-2d1e-404c-b9bd-35c4afac0677	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "45a3b265-4eef-4fd5-bb88-357bdf24d813", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T07:26:06.972Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "ee144dd4-6c53-4112-89e1-17d1d4517f51", "fileUrl": "/uploads/1770189966887-431474864-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T07:26:06.972Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "45a3b265-4eef-4fd5-bb88-357bdf24d813", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T07:26:06.972Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "ee144dd4-6c53-4112-89e1-17d1d4517f51", "fileUrl": "/uploads/1770189966887-431474864-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T07:26:06.972Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 07:26:07.248
3bd63841-911a-409b-8e73-d7f65e569279	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "25ff2d7c-71ae-4cc6-a425-369db56007ff", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T07:26:27.163Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "4ea66c74-15c6-4861-b424-fd1cb1a86be6", "fileUrl": "/uploads/1770189966887-431474864-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T07:26:27.163Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "a6f9df86-6873-41d5-8802-199d75f487f6", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T07:26:27.163Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "25ff2d7c-71ae-4cc6-a425-369db56007ff", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T07:26:27.163Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "4ea66c74-15c6-4861-b424-fd1cb1a86be6", "fileUrl": "/uploads/1770189966887-431474864-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T07:26:27.163Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "a6f9df86-6873-41d5-8802-199d75f487f6", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T07:26:27.163Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 07:26:27.329
6b063eb5-b2e4-42ec-aa98-efa9aa0445fa	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "9b6ece55-32c4-45a5-9868-c17d22a47284", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T07:30:44.140Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "bcfb01e4-9a4b-4fa2-8a73-85ef2f380e5f", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T07:30:44.140Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "9b6ece55-32c4-45a5-9868-c17d22a47284", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T07:30:44.140Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "bcfb01e4-9a4b-4fa2-8a73-85ef2f380e5f", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T07:30:44.140Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 07:30:44.44
6db31a84-deca-4a04-a142-5c5e1d63d75e	Transaction	8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12	CREATE	4f228265-d6c1-4a36-bbc5-273cce390f35	null	{"id": "8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12", "amount": 1000, "creator": {"name": "Hệ thống Admin", "fullName": "Hệ thống Admin"}, "category": {"id": "f6558866-1aad-422f-85f9-1144baecb636", "code": "V01", "name": "Vay đầu tư", "type": "VAY", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:26.862Z", "updatedAt": "2026-01-19T15:16:33.152Z", "description": "Vay đầu tư"}, "createdAt": "2026-02-04T07:47:54.570Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T07:47:54.570Z", "categoryId": "f6558866-1aad-422f-85f9-1144baecb636", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "e7f31bea-bc27-495e-8ca6-75c32bb1c1b1", "fileUrl": "/uploads/1770191274503-64083994-1 (1).jpg", "fileName": "1 (1).jpg", "fileSize": 546, "fileType": "image/jpeg", "createdAt": "2026-02-04T07:47:54.570Z", "transactionId": "8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12"}, {"id": "9895a26f-3cd0-424d-ad8e-e58adf862c62", "fileUrl": "/uploads/1770191274505-70686718-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T07:47:54.570Z", "transactionId": "8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12"}], "description": "mmmm", "projectName": null, "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_V0126_002", "transactionDate": "2026-01-29T00:00:00.000Z", "transactionType": "LOAN", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 07:47:54.776
0a957055-4f7e-43ba-b947-51521a30f3e6	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:00:01.917
6d0adcde-e208-4ea6-830f-0e7b7685af0b	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:01:08.184
2697a658-d997-4db4-bf35-c3b286625fd6	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "27aa558b-26c5-435e-bb6f-05e5a8c94d3b", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T08:09:00.530Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "cffa7517-5d75-43d2-954d-7992d9b21e3c", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T08:09:00.530Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "14276a31-955f-459e-a737-eecad2da8c16", "fileUrl": "/uploads/1770192540340-570597198-Screenshot 2026-01-17 224807.png", "fileName": "Screenshot 2026-01-17 224807.png", "fileSize": 5779, "fileType": "image/png", "createdAt": "2026-02-04T08:09:00.530Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "27aa558b-26c5-435e-bb6f-05e5a8c94d3b", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T08:09:00.530Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "cffa7517-5d75-43d2-954d-7992d9b21e3c", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T08:09:00.530Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "14276a31-955f-459e-a737-eecad2da8c16", "fileUrl": "/uploads/1770192540340-570597198-Screenshot 2026-01-17 224807.png", "fileName": "Screenshot 2026-01-17 224807.png", "fileSize": 5779, "fileType": "image/png", "createdAt": "2026-02-04T08:09:00.530Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:09:00.722
9d9694b5-a1bd-4550-af56-9665f6f5bb7d	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "49c63760-bff5-4bed-86ff-82a0d9e3cb27", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T08:09:13.312Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "ed8b270b-9926-4625-939b-6b15fd482f1d", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T08:09:13.312Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "49c63760-bff5-4bed-86ff-82a0d9e3cb27", "fileUrl": "/uploads/1770178653249-621776441-screenshot_1770178600.png", "fileName": "screenshot_1770178600.png", "fileSize": 19969, "fileType": "image/png", "createdAt": "2026-02-04T08:09:13.312Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "ed8b270b-9926-4625-939b-6b15fd482f1d", "fileUrl": "/uploads/1770189987112-481603796-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T08:09:13.312Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:09:13.422
0d4e6e8a-7839-4f84-946c-06ff1398428e	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "ff4b69f2-835c-453e-a2e3-4ea876742d97", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:09:42.917Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "ff4b69f2-835c-453e-a2e3-4ea876742d97", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:09:42.917Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:09:43.026
b17a1fb6-9a86-4862-91d0-671ef8d3d7c0	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:53:10.731
b9ca1ca4-78ad-4eca-8ba8-c99a8f3b065c	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:172.21.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 06:44:08.825
7a9165f0-f4cf-4ec0-9f90-45647abe4fa4	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "a9249703-89f8-4d1a-8a0f-8e98f7a39b83", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:15:24.213Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "0848f6c0-61b7-4933-82dd-2147b8cb608e", "fileUrl": "/uploads/1770192924136-845895250-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T08:15:24.213Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "a9249703-89f8-4d1a-8a0f-8e98f7a39b83", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:15:24.213Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "0848f6c0-61b7-4933-82dd-2147b8cb608e", "fileUrl": "/uploads/1770192924136-845895250-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T08:15:24.213Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:15:24.352
fb9d770e-1439-4417-a7cd-d5c46a9f24e2	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "c6004aa8-8f66-4348-8efc-4976e858f73c", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:15:46.687Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "c6004aa8-8f66-4348-8efc-4976e858f73c", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:15:46.687Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:15:46.816
ff7b5213-d3e9-4292-9e9c-be4b1e37ffaa	Transaction	8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12	DELETE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12", "amount": 1000, "createdAt": "2026-02-04T07:47:54.570Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T07:47:54.570Z", "categoryId": "f6558866-1aad-422f-85f9-1144baecb636", "employeeId": null, "objectType": "OTHER", "description": "mmmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_V0126_002", "transactionDate": "2026-01-29T00:00:00.000Z", "transactionType": "LOAN", "allocationRuleId": null}	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:17:54.546
1a74817c-acf7-40d2-95dd-bff590d3e6e0	Transaction	3aa5a1f6-a9d5-41dd-8b45-5ba7116ca068	CREATE	4f228265-d6c1-4a36-bbc5-273cce390f35	null	{"id": "3aa5a1f6-a9d5-41dd-8b45-5ba7116ca068", "amount": 10000, "creator": {"name": "Hệ thống Admin", "fullName": "Hệ thống Admin"}, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T08:41:55.944Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T08:41:55.944Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "21028e2f-a184-44a4-81b0-0a1ba7fe3230", "fileUrl": "/uploads/1770194515784-362316821-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T08:41:55.944Z", "transactionId": "3aa5a1f6-a9d5-41dd-8b45-5ba7116ca068"}], "description": "mmm", "projectName": null, "studentName": null, "businessUnit": {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_T0126_003", "transactionDate": "2026-01-27T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:41:56.193
b286859a-8010-4bad-b3b0-766cab7657ed	Transaction	3aa5a1f6-a9d5-41dd-8b45-5ba7116ca068	DELETE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3aa5a1f6-a9d5-41dd-8b45-5ba7116ca068", "amount": 10000, "createdAt": "2026-02-04T08:41:55.944Z", "createdBy": "4f228265-d6c1-4a36-bbc5-273cce390f35", "isAdvance": false, "otherName": "mmmm", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T08:41:55.944Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "mmm", "projectName": null, "studentName": null, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "53563c80-e91b-4068-9369-b3d676df5628", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBAC_T0126_003", "transactionDate": "2026-01-27T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 08:42:23.049
5b69db67-7fce-4497-9dd2-5b9026a5d299	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0	2026-02-04 09:01:31.717
c8f66a63-fa9a-4c32-8ddf-849cd6c41261	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "304007ab-1302-4a70-9bca-8808e875e9e7", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:26:02.588Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "36ad9dfd-ecfc-4023-b32a-6099c79383eb", "fileUrl": "/uploads/1770197162459-589697893-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T09:26:02.588Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "304007ab-1302-4a70-9bca-8808e875e9e7", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:26:02.588Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "36ad9dfd-ecfc-4023-b32a-6099c79383eb", "fileUrl": "/uploads/1770197162459-589697893-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T09:26:02.588Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:26:02.877
d700da21-5dc7-4094-a800-ee8c15420c97	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "ad5b934f-da3f-4639-a5de-cceca38c04ab", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:26:30.758Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "ad5b934f-da3f-4639-a5de-cceca38c04ab", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:26:30.758Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:26:30.894
8a302ba1-3533-45f1-a172-9d8f50fa2873	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "5f73cb72-266d-4a64-971f-a530b0a6e845", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:37:25.757Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "f8a82f5e-3244-4f6b-b864-6eeacef5a5d6", "fileUrl": "/uploads/1770197845704-785759928-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:37:25.757Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "5f73cb72-266d-4a64-971f-a530b0a6e845", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:37:25.757Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "f8a82f5e-3244-4f6b-b864-6eeacef5a5d6", "fileUrl": "/uploads/1770197845704-785759928-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:37:25.757Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:37:25.77
404282a3-f57b-42dd-90e4-b99471665fc4	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "8af72827-3ebb-4920-abd4-6ddf5400e743", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:38:10.580Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "363a8d53-5509-4556-8074-346185ddd029", "fileUrl": "/uploads/1770197845704-785759928-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:38:10.580Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "55d6f0a4-fe34-4a50-b92e-223f6bba0797", "fileUrl": "/uploads/1770197890543-445129986-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T09:38:10.580Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "8af72827-3ebb-4920-abd4-6ddf5400e743", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:38:10.580Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "363a8d53-5509-4556-8074-346185ddd029", "fileUrl": "/uploads/1770197845704-785759928-1.jpg", "fileName": "1.jpg", "fileSize": 259338, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:38:10.580Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "55d6f0a4-fe34-4a50-b92e-223f6bba0797", "fileUrl": "/uploads/1770197890543-445129986-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-04T09:38:10.580Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:38:10.589
532decce-1a38-4467-9c83-2a62f07fe215	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "c4b92231-ba2a-413b-8ef8-6989437cfedd", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:39:51.716Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "c4b92231-ba2a-413b-8ef8-6989437cfedd", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:39:51.716Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:39:51.934
468f43e3-1a19-405a-9f55-f5c27d7a46b1	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "7230c1ee-2f20-47ca-a2a8-df8207a752d9", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:43:29.377Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "9861b113-961c-4a1b-86c4-24b396927c66", "fileUrl": "/uploads/1770198209332-328625813-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T09:43:29.377Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "7230c1ee-2f20-47ca-a2a8-df8207a752d9", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:43:29.377Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "9861b113-961c-4a1b-86c4-24b396927c66", "fileUrl": "/uploads/1770198209332-328625813-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T09:43:29.377Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:43:29.39
558f3e04-df6e-464d-902f-9f2de65f90ec	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "331e2ed7-765e-4bc3-916f-d20b45cd66cf", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:44:23.865Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "1e8ff752-4a29-42ad-8a63-fc1701d26083", "fileUrl": "/uploads/1770198263729-254682488-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T09:44:23.865Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "331e2ed7-765e-4bc3-916f-d20b45cd66cf", "fileUrl": "/uploads/1770192582864-877353440-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T09:44:23.865Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}, {"id": "1e8ff752-4a29-42ad-8a63-fc1701d26083", "fileUrl": "/uploads/1770198263729-254682488-TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileName": "TÃ­nh nÄng - Trang tÃ­nh1.pdf", "fileSize": 119803, "fileType": "application/pdf", "createdAt": "2026-02-04T09:44:23.865Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 09:44:24.179
77c27cae-b785-4eca-8cb6-ebd00ee22ecd	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGOUT	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:14:13.007
b1c08280-00ca-448c-800d-7b38b1adce61	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:14:23.31
7db18d74-ff64-437e-8a5f-ee1e8a65992c	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:25:55.453
fa6b5f65-bb4a-4dd2-8f74-6be5bd1f92d6	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "d35d1469-02ec-440b-855a-1c3f76d780a3", "fileUrl": "/api/uploads/1770202418783-513915911-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T10:53:38.806Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "d35d1469-02ec-440b-855a-1c3f76d780a3", "fileUrl": "/api/uploads/1770202418783-513915911-screenshot_1770178600.jpeg", "fileName": "screenshot_1770178600.jpeg", "fileSize": 7393, "fileType": "image/jpeg", "createdAt": "2026-02-04T10:53:38.806Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 10:53:38.818
a055b67d-31cc-4343-b572-96ac4a33ea11	User	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	LOGIN	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 13:06:16.413
a7bf0d6e-e4b9-4dab-8ad1-e9d183458889	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 13:07:24.363
184128b1-6702-4790-ac4f-778b1defb559	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	CREATE	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "creator": {"name": "Châu Nga", "fullName": "Châu Nga"}, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "d596b282-e713-4d18-a3ed-5a3dc03cdf02", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-04T13:07:34.850Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 13:07:34.86
5cdec913-2b4b-4e71-af59-cab935eb6254	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGOUT	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-04 13:09:10.956
8a098763-c628-4f30-a61f-aea392f2a3c3	Transaction	31f31a84-8fe0-46ec-b47b-5e78b51a9b44	CREATE	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	{"id": "31f31a84-8fe0-46ec-b47b-5e78b51a9b44", "amount": 31114800, "creator": {"name": "Châu Nga", "fullName": "Châu Nga"}, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-05T01:51:23.606Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": "c8f26a52-de4b-4ad0-8261-8511e53a4752", "projectId": null, "updatedAt": "2026-02-05T01:51:23.606Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "PARTNER", "attachments": [{"id": "76a233a3-d708-437c-93e7-7db3ed0692de", "fileUrl": "/api/uploads/1770256283562-5261125-img-1448.jpeg", "fileName": "img-1448.jpeg", "fileSize": 116582, "fileType": "image/jpeg", "createdAt": "2026-02-05T01:51:23.606Z", "transactionId": "31f31a84-8fe0-46ec-b47b-5e78b51a9b44"}], "description": "Chi phí lắp đặt Tháng 12.2025", "projectName": "Lắp Đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 01:51:23.615
39902d60-4c28-4076-b72f-7348707e0c4c	Partner	0eb36d46-e424-4f52-9734-9f304c6ca74c	CREATE	4f228265-d6c1-4a36-bbc5-273cce390f35	null	{"id": "0eb36d46-e424-4f52-9734-9f304c6ca74c", "email": "m@gmail.com", "phone": "0123456780", "status": "ACTIVE", "address": "mmm", "balance": 0, "taxCode": "010101010101", "contracts": [], "createdAt": "2026-02-05T02:01:58.432Z", "partnerId": "KH008", "updatedAt": "2026-02-05T02:01:58.432Z", "partnerName": "mm", "partnerType": "CUSTOMER", "paymentTerm": 30, "bankAccounts": [], "businessUnits": [{"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}], "contactPerson": "", "paymentMethod": {"id": "cff0ce35-2105-4707-a847-401f61e06d70", "name": "Chuyển khoản", "createdAt": "2026-01-19T04:17:45.857Z", "updatedAt": "2026-01-19T04:17:45.857Z"}, "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:01:58.44
80ed2a00-912b-4347-933a-e6f17be935a7	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "8e6171bf-b5d5-49b6-bae3-a0b6d6d23cf0", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:38:57.974Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "3195dbd2-673a-44e7-bfd0-8085e4c12d0a", "fileUrl": "/api/uploads/1770259137948-425247116-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-05T02:38:57.974Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "8e6171bf-b5d5-49b6-bae3-a0b6d6d23cf0", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:38:57.974Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "3195dbd2-673a-44e7-bfd0-8085e4c12d0a", "fileUrl": "/api/uploads/1770259137948-425247116-BLUEBOLT.png", "fileName": "BLUEBOLT.png", "fileSize": 12139, "fileType": "image/png", "createdAt": "2026-02-05T02:38:57.974Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}]}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:38:57.986
96b980c6-15c4-47ef-bee9-73b20946312f	Partner	550fc744-0e3f-4116-a56a-08856aa745a0	UPDATE	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	{"id": "550fc744-0e3f-4116-a56a-08856aa745a0", "email": "info@gmail.com", "phone": "123456789", "status": "ACTIVE", "address": "Không có địa chỉ", "balance": 0, "taxCode": "0123456789", "createdAt": "2026-01-28T08:31:43.575Z", "partnerId": "KH005", "updatedAt": "2026-02-03T04:37:36.391Z", "partnerName": "CÔNG TY DỊCH VỤ KẾ TOÁN ANH TOẢN", "partnerType": "CUSTOMER", "paymentTerm": 30, "contactPerson": "", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	{"id": "550fc744-0e3f-4116-a56a-08856aa745a0", "email": "info@gmail.com", "phone": "0911716258", "status": "ACTIVE", "address": "Không có địa chỉ", "balance": 0, "taxCode": "0123456789", "contracts": [], "createdAt": "2026-01-28T08:31:43.575Z", "partnerId": "KH005", "updatedAt": "2026-02-03T04:37:36.391Z", "partnerName": "CÔNG TY DỊCH VỤ KẾ TOÁN ANH TOẢN", "partnerType": "CUSTOMER", "paymentTerm": 30, "bankAccounts": [], "businessUnits": [{"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}], "contactPerson": "", "paymentMethod": {"id": "cff0ce35-2105-4707-a847-401f61e06d70", "name": "Chuyển khoản", "createdAt": "2026-01-19T04:17:45.857Z", "updatedAt": "2026-01-19T04:17:45.857Z"}, "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	{"phone": {"new": "0911716258", "old": "123456789"}, "contracts": {"new": []}, "bankAccounts": {"new": []}, "businessUnits": {"new": [{"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}]}, "paymentMethod": {"new": {"id": "cff0ce35-2105-4707-a847-401f61e06d70", "name": "Chuyển khoản", "createdAt": "2026-01-19T04:17:45.857Z", "updatedAt": "2026-01-19T04:17:45.857Z"}}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:02:08.658
eea9e691-63f3-4a80-9bef-c56844e48786	User	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	LOGOUT	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:02:54.802
088c84cb-53af-420c-902f-b1723b4db5ea	User	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	LOGIN	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:03:04.455
d7414aca-9d65-41e3-8880-5d2a72da5eaa	Partner	0eb36d46-e424-4f52-9734-9f304c6ca74c	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "0eb36d46-e424-4f52-9734-9f304c6ca74c", "email": "m@gmail.com", "phone": "0123456780", "status": "ACTIVE", "address": "mmm", "balance": 0, "taxCode": "010101010101", "createdAt": "2026-02-05T02:01:58.432Z", "partnerId": "KH008", "updatedAt": "2026-02-05T02:01:58.432Z", "partnerName": "mm", "partnerType": "CUSTOMER", "paymentTerm": 30, "contactPerson": "", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	{"id": "0eb36d46-e424-4f52-9734-9f304c6ca74c", "email": "m@gmail.com", "phone": "0123456780", "status": "INACTIVE", "address": "mmm", "balance": 0, "taxCode": "010101010101", "contracts": [], "createdAt": "2026-02-05T02:01:58.432Z", "partnerId": "KH008", "updatedAt": "2026-02-05T02:05:41.860Z", "partnerName": "mm", "partnerType": "CUSTOMER", "paymentTerm": 30, "bankAccounts": [], "businessUnits": [{"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}], "contactPerson": "", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	null	Deactivate partner	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:05:41.867
b0402bfa-70e4-4c09-a586-05ed72c5f54e	Transaction	dc99b142-85da-4893-aac9-1d186d31245c	CREATE	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	{"id": "dc99b142-85da-4893-aac9-1d186d31245c", "amount": 2246400, "creator": {"name": "Châu Nga", "fullName": "Châu Nga"}, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-05T02:08:23.834Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": "N AND H", "partnerId": null, "projectId": null, "updatedAt": "2026-02-05T02:08:23.834Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "22ebe534-1e3f-47e6-a496-1708d13a9f33", "fileUrl": "/api/uploads/1770257303793-86362781-img-1448.jpeg", "fileName": "img-1448.jpeg", "fileSize": 116582, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:08:23.834Z", "transactionId": "dc99b142-85da-4893-aac9-1d186d31245c"}], "description": "N AND H TT CP THAO LAP MAY LANH VP CHUYEN VE FC APD", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_T0226_002", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:08:23.844
caf3dcec-352c-418c-8903-b1b22dd21b75	Partner	0a7902d7-42aa-4e38-8248-841c389b1f75	CREATE	4f228265-d6c1-4a36-bbc5-273cce390f35	null	{"id": "0a7902d7-42aa-4e38-8248-841c389b1f75", "email": "", "phone": "", "status": "ACTIVE", "address": "", "balance": 0, "taxCode": "", "contracts": [], "createdAt": "2026-02-05T02:36:01.330Z", "partnerId": "KH009", "updatedAt": "2026-02-05T02:36:01.330Z", "partnerName": "", "partnerType": "CUSTOMER", "paymentTerm": 30, "bankAccounts": [], "businessUnits": [], "contactPerson": "", "paymentMethod": {"id": "cff0ce35-2105-4707-a847-401f61e06d70", "name": "Chuyển khoản", "createdAt": "2026-01-19T04:17:45.857Z", "updatedAt": "2026-01-19T04:17:45.857Z"}, "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	null	\N	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:36:01.672
66097cb8-2013-41b5-8a8c-da48681fd5e3	Partner	0a7902d7-42aa-4e38-8248-841c389b1f75	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "0a7902d7-42aa-4e38-8248-841c389b1f75", "email": "", "phone": "", "status": "ACTIVE", "address": "", "balance": 0, "taxCode": "", "createdAt": "2026-02-05T02:36:01.330Z", "partnerId": "KH009", "updatedAt": "2026-02-05T02:36:01.330Z", "partnerName": "", "partnerType": "CUSTOMER", "paymentTerm": 30, "contactPerson": "", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	{"id": "0a7902d7-42aa-4e38-8248-841c389b1f75", "email": "", "phone": "", "status": "INACTIVE", "address": "", "balance": 0, "taxCode": "", "contracts": [], "createdAt": "2026-02-05T02:36:01.330Z", "partnerId": "KH009", "updatedAt": "2026-02-05T02:36:11.553Z", "partnerName": "", "partnerType": "CUSTOMER", "paymentTerm": 30, "bankAccounts": [], "businessUnits": [], "contactPerson": "", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	null	Deactivate partner	::1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:36:11.684
fc02b402-2a48-45a6-82ce-7b8e604c0820	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "eebd41af-b72c-4742-9cf8-053f5c0cde91", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:39:15.329Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "eebd41af-b72c-4742-9cf8-053f5c0cde91", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:39:15.329Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}]}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:39:15.34
06d481e6-66ba-46ad-8322-121326876cec	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "1645386b-984c-4fc2-bdef-178c7e179a44", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:40:59.632Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "96a968b9-2d9b-4808-b5e6-0dcfd4079cab", "fileUrl": "/api/uploads/1770259259609-598796650-Screenshot From 2026-02-05 09-40-37.png", "fileName": "Screenshot From 2026-02-05 09-40-37.png", "fileSize": 9132, "fileType": "image/png", "createdAt": "2026-02-05T02:40:59.632Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "1645386b-984c-4fc2-bdef-178c7e179a44", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:40:59.632Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "96a968b9-2d9b-4808-b5e6-0dcfd4079cab", "fileUrl": "/api/uploads/1770259259609-598796650-Screenshot From 2026-02-05 09-40-37.png", "fileName": "Screenshot From 2026-02-05 09-40-37.png", "fileSize": 9132, "fileType": "image/png", "createdAt": "2026-02-05T02:40:59.632Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}]}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:40:59.645
33a87947-123f-4762-a671-d4f5073bcb46	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "485028c1-9c04-49e7-87d3-53b55eecbd60", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:46:03.806Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "df6dcdc3-e1dc-4f8c-923b-98b2adc45414", "fileUrl": "/api/uploads/1770259563766-780202988-Screenshot From 2026-02-05 09-41-34.png", "fileName": "Screenshot From 2026-02-05 09-41-34.png", "fileSize": 95830, "fileType": "image/png", "createdAt": "2026-02-05T02:46:03.806Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "485028c1-9c04-49e7-87d3-53b55eecbd60", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T02:46:03.806Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "df6dcdc3-e1dc-4f8c-923b-98b2adc45414", "fileUrl": "/api/uploads/1770259563766-780202988-Screenshot From 2026-02-05 09-41-34.png", "fileName": "Screenshot From 2026-02-05 09-41-34.png", "fileSize": 95830, "fileType": "image/png", "createdAt": "2026-02-05T02:46:03.806Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}]}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 02:46:03.819
79981972-978c-461f-b1ec-058dd79e9a3e	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:24:16.759
a74355d9-ca80-4389-b221-f4c22932d54b	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "450ff6e3-6b52-406d-9a12-79e97d85dee3", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T03:25:00.946Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "fa3514f7-b23e-4b2c-8a81-a80c39a78bd5", "fileUrl": "/api/uploads/1770261900922-237758590-Screenshot From 2026-02-05 10-24-34.png", "fileName": "Screenshot From 2026-02-05 10-24-34.png", "fileSize": 31161, "fileType": "image/png", "createdAt": "2026-02-05T03:25:00.946Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "450ff6e3-6b52-406d-9a12-79e97d85dee3", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-05T03:25:00.946Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "fa3514f7-b23e-4b2c-8a81-a80c39a78bd5", "fileUrl": "/api/uploads/1770261900922-237758590-Screenshot From 2026-02-05 10-24-34.png", "fileName": "Screenshot From 2026-02-05 10-24-34.png", "fileSize": 31161, "fileType": "image/png", "createdAt": "2026-02-05T03:25:00.946Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}]}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:25:00.958
de3733e8-849b-4627-a6f0-33bb9343e1f0	User	7ffda0d3-3b91-4503-b583-1d50051aa072	LOGIN	7ffda0d3-3b91-4503-b583-1d50051aa072	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:52:32.968
63ac622d-5685-48f0-b8ec-7b06c17e2ccf	User	7ffda0d3-3b91-4503-b583-1d50051aa072	LOGOUT	7ffda0d3-3b91-4503-b583-1d50051aa072	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:53:21.108
c2f20f68-89bf-4ae0-9a8a-76a5dc577172	User	7ffda0d3-3b91-4503-b583-1d50051aa072	LOGIN	7ffda0d3-3b91-4503-b583-1d50051aa072	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:53:25.435
0396388e-427a-4aff-a6f1-5f9aa704cc24	Transaction	3cb1194e-d407-43b7-ba69-31f7222e5274	UPDATE	7ffda0d3-3b91-4503-b583-1d50051aa072	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null}	{"id": "3cb1194e-d407-43b7-ba69-31f7222e5274", "amount": 4320000, "category": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}, "createdAt": "2026-02-04T04:17:33.284Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": "Khách hàng Pelio", "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T04:17:33.284Z", "categoryId": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "employeeId": null, "objectType": "OTHER", "attachments": [{"id": "46a92b21-47c1-4f7b-b585-59411048710c", "fileUrl": "/api/uploads/1770263651920-180995540-screenshot_1770257086.png", "fileName": "screenshot_1770257086.png", "fileSize": 61161, "fileType": "image/png", "createdAt": "2026-02-05T03:54:11.943Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}], "description": "Thu tiền hosting khách hàng Pelio", "projectName": "Hosting Pelio", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_T0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "INCOME", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "6f69ea92-d80b-45fa-94d1-46c22cd972a9", "code": "T01", "name": "Thực thu", "type": "THU", "status": "ACTIVE", "createdAt": "2026-01-19T15:16:11.691Z", "updatedAt": "2026-01-19T15:16:11.691Z", "description": "Doanh thu thực"}}, "attachments": {"new": [{"id": "46a92b21-47c1-4f7b-b585-59411048710c", "fileUrl": "/api/uploads/1770263651920-180995540-screenshot_1770257086.png", "fileName": "screenshot_1770257086.png", "fileSize": 61161, "fileType": "image/png", "createdAt": "2026-02-05T03:54:11.943Z", "transactionId": "3cb1194e-d407-43b7-ba69-31f7222e5274"}]}, "businessUnit": {"new": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:54:11.956
18840ac6-af58-40fc-8b73-72ec77271831	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 03:55:44.367
abf3e6c9-dc58-400a-8ecf-a6bea9102485	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-05 04:03:19.162
1bda3544-b53a-4095-8d97-2c61405451af	Transaction	c2a86167-86e0-4a01-8b33-a1b85fc71631	CREATE	7ffda0d3-3b91-4503-b583-1d50051aa072	null	{"id": "c2a86167-86e0-4a01-8b33-a1b85fc71631", "amount": 3022111, "creator": {"name": "Phạm Anh Duy", "fullName": "Phạm Anh Duy"}, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-06T02:03:50.590Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": null, "partnerId": "6a50589f-0770-4088-b88f-27ca6a6dba22", "projectId": null, "updatedAt": "2026-02-06T02:03:50.590Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "PARTNER", "attachments": [{"id": "16691e09-b09f-4b05-912c-4a47babcfc72", "fileUrl": "/api/uploads/1770343430565-930894624-hoa_Don_GGEMAIL_0102_280226.png", "fileName": "hoa_Don_GGEMAIL_0102_280226.png", "fileSize": 45319, "fileType": "image/png", "createdAt": "2026-02-06T02:03:50.590Z", "transactionId": "c2a86167-86e0-4a01-8b33-a1b85fc71631"}], "description": "Email Google Workspace Tháng 2 2026\\n111,93$ x 27.000đ = 3.022.111đ", "projectName": "Email Google Workspace", "studentName": null, "businessUnit": {"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSW_C0226_001", "transactionDate": "2026-02-06T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 02:03:50.603
8df765fc-5644-48c7-b75c-1fec49b679d8	Transaction	f1488562-3e11-4b2b-a71e-819aa8321902	CREATE	7ffda0d3-3b91-4503-b583-1d50051aa072	null	{"id": "f1488562-3e11-4b2b-a71e-819aa8321902", "amount": 197910, "creator": {"name": "Phạm Anh Duy", "fullName": "Phạm Anh Duy"}, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-06T02:07:03.118Z", "createdBy": "7ffda0d3-3b91-4503-b583-1d50051aa072", "isAdvance": false, "otherName": null, "partnerId": "6a50589f-0770-4088-b88f-27ca6a6dba22", "projectId": null, "updatedAt": "2026-02-06T02:07:03.118Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": null, "objectType": "PARTNER", "attachments": [{"id": "5ad1a7f7-1020-4fae-adc4-b21ef4099adb", "fileUrl": "/api/uploads/1770343623097-677983968-BB_hoadon_GGEMAIL_0102_280226.png", "fileName": "BB_hoadon_GGEMAIL_0102_280226.png", "fileSize": 44793, "fileType": "image/png", "createdAt": "2026-02-06T02:07:03.118Z", "transactionId": "f1488562-3e11-4b2b-a71e-819aa8321902"}], "description": "Email Google Workspace Bluebolt.vn\\n7,33$ x 27.000đ = 197.910đ", "projectName": "Email Bluebolt.vn GG", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "UNPAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_002", "transactionDate": "2026-02-06T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 02:07:03.127
180c25c7-9cef-4c86-be27-bf436f003b4d	Partner	6a50589f-0770-4088-b88f-27ca6a6dba22	UPDATE	7ffda0d3-3b91-4503-b583-1d50051aa072	{"id": "6a50589f-0770-4088-b88f-27ca6a6dba22", "email": "ggworkspace@gmail.com", "phone": "0123456789", "status": "ACTIVE", "address": "Tầng 8, Tòa nhà Hà Đô, Số 2 Hồng Hà, P. Tân Sơn Hòa, Q. Tân Bình.", "balance": 0, "taxCode": "0318079058", "createdAt": "2026-01-28T08:30:33.332Z", "partnerId": "NCC001", "updatedAt": "2026-02-03T04:37:36.377Z", "partnerName": "GOOGLE WORKSPACE", "partnerType": "SUPPLIER", "paymentTerm": 30, "contactPerson": "", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	{"id": "6a50589f-0770-4088-b88f-27ca6a6dba22", "email": "ggworkspace@gmail.com", "phone": "0123456789", "status": "ACTIVE", "address": "Tầng 8, Tòa nhà Hà Đô, Số 2 Hồng Hà, P. Tân Sơn Hòa, Q. Tân Bình.", "balance": 0, "taxCode": "0318079058", "contracts": [], "createdAt": "2026-01-28T08:30:33.332Z", "partnerId": "NCC001", "updatedAt": "2026-02-03T04:37:36.377Z", "partnerName": "Google Workspace", "partnerType": "SUPPLIER", "paymentTerm": 30, "bankAccounts": [], "businessUnits": [{"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}], "contactPerson": "", "paymentMethod": {"id": "cff0ce35-2105-4707-a847-401f61e06d70", "name": "Chuyển khoản", "createdAt": "2026-01-19T04:17:45.857Z", "updatedAt": "2026-01-19T04:17:45.857Z"}, "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "representativeName": "", "representativePhone": "", "representativeTitle": ""}	{"contracts": {"new": []}, "partnerName": {"new": "Google Workspace", "old": "GOOGLE WORKSPACE"}, "bankAccounts": {"new": []}, "businessUnits": {"new": [{"id": "f7865cd6-f59b-4897-ab8c-4b18fa9f491e", "code": "BBSW", "name": "BlueBolt Software", "status": "active", "createdAt": "2026-01-19T04:31:57.292Z", "startDate": "2021-05-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:31:57.292Z", "leaderName": "Phạm Anh Duy", "staffCount": 10}, {"id": "53563c80-e91b-4068-9369-b3d676df5628", "code": "BBAC", "name": "BlueBolt Academy", "status": "active", "createdAt": "2026-01-19T04:34:59.646Z", "startDate": "2026-01-01T00:00:00.000Z", "updatedAt": "2026-01-19T04:34:59.646Z", "leaderName": "Huỳnh Thị Quốc Trinh", "staffCount": 5}, {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}]}, "paymentMethod": {"new": {"id": "cff0ce35-2105-4707-a847-401f61e06d70", "name": "Chuyển khoản", "createdAt": "2026-01-19T04:17:45.857Z", "updatedAt": "2026-01-19T04:17:45.857Z"}}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 02:08:07.746
865cd3b2-09de-43d2-8e33-d0e7da03cdf5	User	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	LOGIN	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 02:16:09.039
0d0bab71-6b5d-46f1-af65-b82f60cd5026	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 03:37:00.375
0299fb5f-3897-4d8f-af86-5c4aab9364a1	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 03:37:07.05
50f06fca-ea88-4545-92e4-790d0f62f8fd	Transaction	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	UPDATE	4f228265-d6c1-4a36-bbc5-273cce390f35	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null}	{"id": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678", "amount": 5000000, "category": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}, "createdAt": "2026-02-04T13:07:34.850Z", "createdBy": "ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1", "isAdvance": false, "otherName": null, "partnerId": null, "projectId": null, "updatedAt": "2026-02-04T13:07:34.850Z", "categoryId": "317aceb4-59d5-45f7-adda-887965c8bc33", "employeeId": "eb08f070-d84a-45d0-9124-f16b646f8399", "objectType": "EMPLOYEE", "attachments": [{"id": "24e4caa9-21bb-4ce1-b24d-b42c06367193", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-06T03:53:32.698Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "dd7cbcd9-3304-4487-be8c-cbe59474c25f", "fileUrl": "/api/uploads/1770350012663-598283233-Screenshot From 2026-02-06 00-04-52.png", "fileName": "Screenshot From 2026-02-06 00-04-52.png", "fileSize": 38313, "fileType": "image/png", "createdAt": "2026-02-06T03:53:32.698Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}], "description": "Tạm ứng thanh toán đơn thợ lẻ", "projectName": "Lắp đặt", "studentName": null, "businessUnit": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}, "paymentStatus": "PAID", "approvalStatus": "APPROVED", "businessUnitId": "56bf3663-05b2-4c1d-abf6-b87528361b02", "costAllocation": "DIRECT", "paymentMethodId": "cff0ce35-2105-4707-a847-401f61e06d70", "rejectionReason": null, "transactionCode": "BBSV_C0226_001", "transactionDate": "2026-02-04T00:00:00.000Z", "transactionType": "EXPENSE", "allocationRuleId": null, "allocationPreviews": []}	{"category": {"new": {"id": "317aceb4-59d5-45f7-adda-887965c8bc33", "code": "C01", "name": "Dịch vụ thuê ngoài", "type": "CHI", "status": "ACTIVE", "createdAt": "2026-01-19T15:12:22.373Z", "updatedAt": "2026-01-19T15:12:22.373Z", "description": "Dịch vụ công ty thuê từ bên ngoài"}}, "attachments": {"new": [{"id": "24e4caa9-21bb-4ce1-b24d-b42c06367193", "fileUrl": "/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileName": "z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg", "fileSize": 338235, "fileType": "image/jpeg", "createdAt": "2026-02-06T03:53:32.698Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}, {"id": "dd7cbcd9-3304-4487-be8c-cbe59474c25f", "fileUrl": "/api/uploads/1770350012663-598283233-Screenshot From 2026-02-06 00-04-52.png", "fileName": "Screenshot From 2026-02-06 00-04-52.png", "fileSize": 38313, "fileType": "image/png", "createdAt": "2026-02-06T03:53:32.698Z", "transactionId": "2ceff990-5b5a-4d5f-b384-aaba6e4dd678"}]}, "businessUnit": {"new": {"id": "56bf3663-05b2-4c1d-abf6-b87528361b02", "code": "BBSV", "name": "BlueBolt Services", "status": "active", "createdAt": "2026-01-19T04:35:21.624Z", "startDate": "2026-01-19T00:00:00.000Z", "updatedAt": "2026-01-19T04:35:21.624Z", "leaderName": "Châu Nga", "staffCount": 20}}, "allocationPreviews": {"new": []}}	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 03:53:32.711
73dc175e-aab2-4613-9096-3aa460a8e13e	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:172.21.0.1	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 04:42:56.024
8760a851-a92c-445c-8358-8706a875893a	User	4f228265-d6c1-4a36-bbc5-273cce390f35	LOGIN	4f228265-d6c1-4a36-bbc5-273cce390f35	null	null	null	\N	::ffff:192.167.10.111	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	2026-02-06 04:50:02.346
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.bank_accounts (id, partner_id, account_number, bank_name, branch, swift_code, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_units; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.business_units (id, name, created_at, updated_at, code, leader_name, staff_count, start_date, status) FROM stdin;
f7865cd6-f59b-4897-ab8c-4b18fa9f491e	BlueBolt Software	2026-01-19 04:31:57.292	2026-01-19 04:31:57.292	BBSW	Phạm Anh Duy	10	2021-05-19 00:00:00	active
53563c80-e91b-4068-9369-b3d676df5628	BlueBolt Academy	2026-01-19 04:34:59.646	2026-01-19 04:34:59.646	BBAC	Huỳnh Thị Quốc Trinh	5	2026-01-01 00:00:00	active
56bf3663-05b2-4c1d-abf6-b87528361b02	BlueBolt Services	2026-01-19 04:35:21.624	2026-01-19 04:35:21.624	BBSV	Châu Nga	20	2026-01-19 00:00:00	active
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.categories (id, code, name, type, description, status, created_at, updated_at) FROM stdin;
317aceb4-59d5-45f7-adda-887965c8bc33	C01	Dịch vụ thuê ngoài	CHI	Dịch vụ công ty thuê từ bên ngoài	ACTIVE	2026-01-19 15:12:22.373	2026-01-19 15:12:22.373
42b77c64-71a5-419f-a5f5-ad9e838576e8	C02	Lương, thưởng, phụ cấp	CHI	Lương, thưởng, phụ cấp cho nhân viên	ACTIVE	2026-01-19 15:13:27.88	2026-01-19 15:13:27.88
fadf72b4-e1f1-4bab-86cf-424fe5997e1c	C03	Chi phí văn phòng	CHI	Chi phí đi thuê văn phòng	ACTIVE	2026-01-19 15:13:48.6	2026-01-19 15:13:48.6
29e910f0-1b21-45e7-9e85-741a749b8b0b	C05	Công cụ thiết bị phần mềm	CHI	Công cụ thiết bị phần mềm	ACTIVE	2026-01-19 15:14:29.968	2026-01-19 15:14:29.968
a0b2500e-e392-4174-b15a-9d344710e780	C06	Thuế và lệ phí	CHI	Thuế và lệ phí	ACTIVE	2026-01-19 15:14:51.16	2026-01-19 15:14:51.16
0f08fbcc-d5a1-4056-be8c-b5b5aed93360	C07	Bảo hiểm xã hội	CHI	Bảo hiểm xã hội	ACTIVE	2026-01-19 15:15:11.743	2026-01-19 15:15:11.743
6f69ea92-d80b-45fa-94d1-46c22cd972a9	T01	Thực thu	THU	Doanh thu thực	ACTIVE	2026-01-19 15:16:11.691	2026-01-19 15:16:11.691
f6558866-1aad-422f-85f9-1144baecb636	V01	Vay đầu tư	VAY	Vay đầu tư	ACTIVE	2026-01-19 15:16:26.862	2026-01-19 15:16:33.152
121cc413-3ddf-428f-a6f8-a77a6578f917	T02	Thu bán khóa học	THU	thu	ACTIVE	2026-01-20 09:15:10.012	2026-01-20 09:15:10.012
dd7c134e-3667-4f1b-9150-f2168d70cbe6	C08	Chi phí khác	CHI	Chi phí phát sinh khác	ACTIVE	2026-01-22 02:33:28.889	2026-01-22 02:33:28.889
2a025a16-048c-419b-bb2a-2fb20819fb02	C04	Dịch vụ tư vấn	CHI	Dịch vụ tư vấn	ACTIVE	2026-01-19 15:14:09.106	2026-02-02 08:44:22.591
\.


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.contracts (id, partner_id, contract_number, sign_date, expiry_date, value, file_name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: employee_levels; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.employee_levels (id, name, "order", created_at, updated_at, code, description) FROM stdin;
8fa08a62-a4e5-4c16-a5b6-1f29189d814f	Nhân viên	1	2026-01-19 04:43:11.553	2026-01-19 04:43:11.553	LV1	\N
ee0cc575-f3bf-4621-8386-3f7d3f48ca56	Trưởng nhóm	2	2026-01-19 04:43:11.633	2026-01-19 04:43:11.633	LV2	\N
2976dadd-c6bb-4abc-9246-0f44171b192c	Trưởng phòng	3	2026-01-19 04:43:11.667	2026-01-19 04:43:11.667	LV3	\N
2ac172ec-3ebc-4b20-bc98-9f449d534459	Quản lý (Manager)	4	2026-01-19 04:43:11.702	2026-01-19 04:43:11.702	LV4	\N
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.employees (id, employee_id, full_name, email, phone, business_unit_id, specialization_id, level_id, join_date, work_status, birth_date, id_card, address, created_at, updated_at) FROM stdin;
94864d6c-d8c3-4c9d-9b5b-b9ee5544fce5	BB001	Huỳnh Thị Mỹ Hồng	hong.huynh@blueboltsoftware.com	0906965737	53563c80-e91b-4068-9369-b3d676df5628	a935f014-dc85-4cad-a9ef-61d2facaf5f0	2ac172ec-3ebc-4b20-bc98-9f449d534459	2021-05-19 00:00:00	WORKING	1990-10-10 00:00:00	94847568393	Tân Sơn	2026-01-19 15:19:59.195	2026-01-19 15:19:59.195
74ce3558-97a1-44c8-ab39-30122a76b3e2	BB002	Nguyễn Phương Bình 	nguyenphuongbinh303@gmail.com	0765968091	53563c80-e91b-4068-9369-b3d676df5628	40195846-ae96-4865-86bf-331b024a45f3	8fa08a62-a4e5-4c16-a5b6-1f29189d814f	2024-05-01 00:00:00	WORKING	1988-06-01 00:00:00	03254258872	Bình Tân	2026-01-20 08:08:47.768	2026-01-20 08:08:47.768
5caf5283-8b23-44c4-91b3-1a95b0bb63db	BB003	Nguyễn Đình Thanh	thanhnd2462245@gmail.com	0862462245	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	8123907c-5f8d-4e3c-a9db-25da3265cbf2	ee0cc575-f3bf-4621-8386-3f7d3f48ca56	2025-12-30 00:00:00	WORKING	2001-01-01 00:00:00	0325325788158	Gò Vấp	2026-01-21 15:26:06.035	2026-01-21 15:26:06.035
05059042-5774-447d-8db2-fd86f02eed61	BB004	Hồng Huệ Hoa	ho.hong@bluebolt.services	0785981482	56bf3663-05b2-4c1d-abf6-b87528361b02	022160e3-2700-45cb-acb4-7b3275a41d72	ee0cc575-f3bf-4621-8386-3f7d3f48ca56	\N	WORKING	\N		HCM	2026-01-29 08:44:30.024	2026-01-29 08:44:30.024
a0bec971-9920-468d-9214-88e1ff67f419	BB005	Trần Nam Bá	ba.tran@bluebolt.services	+84796543071	56bf3663-05b2-4c1d-abf6-b87528361b02	b1f6fae8-2469-451f-9d66-659f6fc78c22	8fa08a62-a4e5-4c16-a5b6-1f29189d814f	\N	WORKING	\N		HCM	2026-01-29 08:46:16.107	2026-01-29 08:46:16.107
429a49a5-490d-43f5-9aa9-bb2bc4a8506f	BB006	Nguyễn Thị Thu Thảo	thao.nguyen@bluebolt.services	+84961100326	56bf3663-05b2-4c1d-abf6-b87528361b02	5e4240a5-dd09-4811-bc67-748aa479ee7a	8fa08a62-a4e5-4c16-a5b6-1f29189d814f	\N	WORKING	\N		HCM	2026-01-29 08:47:07.926	2026-01-29 08:47:07.926
1faac449-78c7-4876-a442-8cffcf736f1c	BB007	Lê Mạnh Tường	tuong.le@bluebolt.services	+84906691547	56bf3663-05b2-4c1d-abf6-b87528361b02	022160e3-2700-45cb-acb4-7b3275a41d72	8fa08a62-a4e5-4c16-a5b6-1f29189d814f	\N	WORKING	\N		HCM	2026-01-29 08:48:03.21	2026-01-29 08:48:03.21
275ea725-f2a6-438c-82b5-fbe8e93f14f5	BB008	Phan Hồng Tiên	tien.phan@bluebolt.services	+84399943368	56bf3663-05b2-4c1d-abf6-b87528361b02	45f17712-2c6e-4a88-831c-b79f3b9a8397	8fa08a62-a4e5-4c16-a5b6-1f29189d814f	\N	WORKING	\N		Lâm Đồng	2026-01-29 08:49:24.636	2026-01-29 08:49:24.636
eb08f070-d84a-45d0-9124-f16b646f8399	BB009	Châu Ngọc Nga	nga.chau@bluebolt.services	0978046455	56bf3663-05b2-4c1d-abf6-b87528361b02	a935f014-dc85-4cad-a9ef-61d2facaf5f0	2ac172ec-3ebc-4b20-bc98-9f449d534459	\N	WORKING	\N		GIa Lai	2026-01-29 08:50:58.266	2026-01-29 08:50:58.266
\.


--
-- Data for Name: login_history; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.login_history (id, user_id, "timestamp", ip, device) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.notifications (id, user_id, message, type, unread, created_at, related_id, target_path) FROM stdin;
1a4c1c02-c16c-4d8c-b127-3178320fc4ca	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_04 chờ duyệt	warning	t	2026-01-28 01:35:15.341	\N	\N
b8999e28-ad71-40c8-80d9-852a37df7a65	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_04 chờ duyệt	warning	t	2026-01-28 01:35:15.341	\N	\N
b920776a-adf9-4e73-b393-3c89d0193f87	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_02 chờ duyệt	warning	t	2026-01-28 01:43:50.723	\N	\N
5f8f77a9-115b-4cd3-ad1b-61e9a9c00ff1	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_02 chờ duyệt	warning	t	2026-01-28 01:43:50.723	\N	\N
de48be0a-45e3-482f-92ab-dc760e159f41	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_02 chờ duyệt	warning	f	2026-01-28 01:43:50.723	\N	\N
d835ef05-095e-4502-8bed-325e3d4f385c	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_04 chờ duyệt	warning	f	2026-01-28 01:35:15.341	\N	\N
cdf61b67-db2a-4272-bef1-6c1dbe487593	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_02 chờ duyệt	warning	f	2026-01-28 01:43:50.723	\N	\N
7195c22b-e3da-4cc1-90d1-04899aef6f29	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_04 chờ duyệt	warning	f	2026-01-28 01:35:15.341	\N	\N
237e3a5b-39e7-4ae8-962a-399de5be664c	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_05 chờ duyệt	warning	t	2026-01-28 09:22:59.097	\N	\N
4f84bcdf-115b-4d62-8d01-126716db2140	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_05 chờ duyệt	warning	t	2026-01-28 09:22:59.097	\N	\N
86de95d7-0767-45c3-87d8-5a01c481b4c3	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_05 chờ duyệt	warning	f	2026-01-28 09:22:59.097	\N	\N
2baf6081-8982-46cd-ac68-e1a772d29cbb	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_06 chờ duyệt	warning	t	2026-01-28 09:31:07.023	e2ec58b3-73d3-4d39-aad1-48aae56caee3	/quan-ly-thu-chi
62f10d2a-ec11-4676-b40d-3ce1e658c906	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_06 chờ duyệt	warning	t	2026-01-28 09:31:07.023	e2ec58b3-73d3-4d39-aad1-48aae56caee3	/quan-ly-thu-chi
25d00b2b-e031-4a4f-bcf1-73204b4062a0	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu thu #T0126_06 thành công	info	f	2026-01-28 09:31:07.123	e2ec58b3-73d3-4d39-aad1-48aae56caee3	/quan-ly-thu-chi
dff641dd-897d-49b3-948e-42c854bf1943	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_06 chờ duyệt	warning	f	2026-01-28 09:31:07.023	e2ec58b3-73d3-4d39-aad1-48aae56caee3	/quan-ly-thu-chi
7be45089-7d5b-446e-91c0-2319523f4ce7	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_06 chờ duyệt	warning	f	2026-01-28 09:31:07.023	e2ec58b3-73d3-4d39-aad1-48aae56caee3	/quan-ly-thu-chi
1a7b69e3-0129-426c-b36b-5b22b1cd5e9b	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_07 chờ duyệt	warning	t	2026-01-28 16:17:07.273	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
f4bf6c28-7324-4a82-8bd0-d46bd555944c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_07 chờ duyệt	warning	t	2026-01-28 16:17:07.273	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
cd04e216-b286-4cc6-9a2e-3b4691b39059	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu thu #T0126_07 thành công	info	t	2026-01-28 16:17:07.276	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
0e10f163-9652-4618-928f-162ee1c159d7	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_08 chờ duyệt	warning	t	2026-01-28 16:18:10.94	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
f3ae061c-3525-41db-8ef1-d94a29a5c341	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_08 chờ duyệt	warning	t	2026-01-28 16:18:10.94	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
3057750e-0aec-4ee5-b037-2fa3dd236d80	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu thu #T0126_08 thành công	info	t	2026-01-28 16:18:10.942	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
574d5f59-df7d-4d1f-8906-e7a4119e3ee0	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_03 chờ duyệt	warning	t	2026-01-28 16:23:08.277	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
63764dbd-e408-400b-98ca-25145c5a78a8	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_03 chờ duyệt	warning	t	2026-01-28 16:23:08.277	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
338ab1c0-7c6f-468c-ace8-c313696402fe	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_03 thành công	info	t	2026-01-28 16:23:08.279	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
7d762439-06cd-44a5-a6a9-d11180ac9c86	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_04 chờ duyệt	warning	t	2026-01-28 16:26:09.782	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
bb48bb5c-1819-462f-941d-4ead017eafee	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_05 chờ duyệt	warning	f	2026-01-28 09:22:59.097	\N	\N
36bdfc5c-9aea-4bfc-9720-89d5a838dd27	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_07 chờ duyệt	warning	f	2026-01-28 16:17:07.273	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
4d3b090e-3743-42ba-b142-ef96391d7668	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_08 chờ duyệt	warning	f	2026-01-28 16:18:10.94	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
6045c57b-4c64-4cb0-89af-294ac3bc67d7	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_03 chờ duyệt	warning	f	2026-01-28 16:23:08.277	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
02b6b924-6f73-4e96-b74b-2ff06571a320	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_04 chờ duyệt	warning	f	2026-01-28 01:35:15.341	\N	\N
c39877f5-09e2-430b-9d66-f6a86e51e56f	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_02 chờ duyệt	warning	f	2026-01-28 01:43:50.723	\N	\N
196b62f2-4c51-40e1-9280-80a4ebaa4344	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_05 chờ duyệt	warning	f	2026-01-28 09:22:59.097	\N	\N
78306732-8c0c-4f29-8bbd-227ca4f0f847	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_06 chờ duyệt	warning	f	2026-01-28 09:31:07.023	e2ec58b3-73d3-4d39-aad1-48aae56caee3	/quan-ly-thu-chi
f4419bcc-020b-4f95-964a-08334daed612	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_04 chờ duyệt	warning	t	2026-01-28 16:26:09.782	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
485c8302-a6b6-4581-ad86-cca9c9a6c4c6	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_04 thành công	info	t	2026-01-28 16:26:09.784	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
94ba0338-d6bc-4da5-b3e1-dd3a83c909da	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_05 chờ duyệt	warning	t	2026-01-28 16:27:26.708	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
31e29edd-40ed-4500-abdd-f4b502132dd0	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_05 chờ duyệt	warning	t	2026-01-28 16:27:26.708	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
a034b367-bba4-4c59-b919-2bb8e9c6504f	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_05 thành công	info	t	2026-01-28 16:27:26.711	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
fdb2bdc6-1d01-4408-87ef-3597ef3459c0	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_06 chờ duyệt	warning	t	2026-01-28 16:32:27.438	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
7e6b102d-75c3-48e2-8e66-0d353089a4a1	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_06 chờ duyệt	warning	t	2026-01-28 16:32:27.438	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
2986f837-7aaa-47f0-b65b-ece0a4eef124	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_06 thành công	info	t	2026-01-28 16:32:27.44	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
1a034283-2e38-46d5-aaf8-c2405a9f2838	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_06 bị từ chối: Không có đối tượng chi	error	t	2026-01-28 16:33:15.311	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
521f50b3-9e5c-41a9-97a5-081ee2073519	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0746_01 chờ duyệt	warning	t	2026-01-28 16:39:08.569	54e0f50f-6f46-45db-a861-d81499bac8c5	/quan-ly-thu-chi
6c7fb595-51fa-4792-a623-fcec3d2f0db7	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0746_01 chờ duyệt	warning	t	2026-01-28 16:39:08.569	54e0f50f-6f46-45db-a861-d81499bac8c5	/quan-ly-thu-chi
d7c74300-0596-492e-998b-e5eec629365a	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #V0126_02 chờ duyệt	warning	t	2026-01-28 16:42:29.626	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
0e4fbf41-ae76-47e8-aaee-feb83d0d2d5b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_02 chờ duyệt	warning	t	2026-01-28 16:42:29.626	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
d06f9620-f5cc-4163-8f1b-b8373bc757c4	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #V0126_02 thành công	info	t	2026-01-28 16:42:29.629	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
b91527e7-2b1c-4cba-975f-66dcb2e2aad9	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0746_01 thành công	info	f	2026-01-28 16:39:08.572	54e0f50f-6f46-45db-a861-d81499bac8c5	/quan-ly-thu-chi
82ab9af9-5a35-47b4-bba4-29a0236ab2e7	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_08 chờ duyệt	warning	t	2026-01-28 16:45:47.88	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
8679026f-8b09-4908-b9c9-0da72e94b4fa	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_08 chờ duyệt	warning	t	2026-01-28 16:45:47.88	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
56e66881-5adb-40aa-877b-b53f525053c9	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_08 thành công	info	t	2026-01-28 16:45:47.882	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
b2c1e028-1079-46bc-8f46-21f2646e697c	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_09 chờ duyệt	warning	t	2026-01-28 16:47:03.983	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
2966178e-a22c-4b81-9880-911b147fc4a7	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_04 chờ duyệt	warning	f	2026-01-28 16:26:09.782	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
8d507329-a624-40c3-95ce-08f460c08981	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_05 chờ duyệt	warning	f	2026-01-28 16:27:26.708	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
d6549ab3-62a7-4a42-8a88-58d74daf2b76	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_06 chờ duyệt	warning	f	2026-01-28 16:32:27.438	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
6eb8615b-c8f7-43fb-a68f-9783960749e8	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0746_01 chờ duyệt	warning	f	2026-01-28 16:39:08.569	54e0f50f-6f46-45db-a861-d81499bac8c5	/quan-ly-thu-chi
92c81c89-a838-4017-9736-b5c05e22e993	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #V0126_02 chờ duyệt	warning	f	2026-01-28 16:42:29.626	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
c4934d07-1fb0-41fe-a95e-64c77375acef	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_08 chờ duyệt	warning	f	2026-01-28 16:45:47.88	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
49e54650-dd8a-4817-a02b-ca11035c1e16	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_05 chờ duyệt	warning	f	2026-01-28 16:27:26.708	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
abf11e9c-1eb5-4aa6-961b-56920ac16807	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_06 chờ duyệt	warning	f	2026-01-28 16:32:27.438	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
2b60e2f3-683a-40dd-a105-601fc19db567	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0746_01 chờ duyệt	warning	f	2026-01-28 16:39:08.569	54e0f50f-6f46-45db-a861-d81499bac8c5	/quan-ly-thu-chi
2b9a91cc-3088-4e0c-bafa-ff0ab802c969	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #V0126_02 chờ duyệt	warning	f	2026-01-28 16:42:29.626	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
fe56a57f-be52-4113-946d-c8c6a0e05a13	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_08 chờ duyệt	warning	f	2026-01-28 16:45:47.88	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
ac591281-694a-4b11-bc12-2a374d79bb80	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_09 chờ duyệt	warning	f	2026-01-28 16:47:03.983	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
24dc6bac-b47a-4660-b4af-f6a7777999c8	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_09 chờ duyệt	warning	t	2026-01-28 16:47:03.983	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
1472bea1-fb32-402e-b0b1-dffe00bb8c89	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_09 thành công	info	t	2026-01-28 16:47:03.986	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
49565c57-cbf7-4237-927f-92145bd40135	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_09 bị từ chối: Sai số tiền	error	t	2026-01-28 16:47:27.155	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
aee47505-9326-401c-9894-0d7127ef8ad8	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_10 chờ duyệt	warning	t	2026-01-28 16:49:14.835	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
7080e88c-0d4f-45e4-b460-82bea215f2a8	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_10 chờ duyệt	warning	t	2026-01-28 16:49:14.835	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
98921722-aae6-4d7f-a2ae-cc331048c569	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_10 thành công	info	t	2026-01-28 16:49:14.838	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
e2cd26b3-12d8-4872-8c26-bddd2bead629	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_11 chờ duyệt	warning	t	2026-01-28 16:54:03.757	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
570439b0-ee64-46c5-bfb3-af1115cf5e42	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_11 chờ duyệt	warning	t	2026-01-28 16:54:03.757	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
b9dfc573-c6cb-491c-b720-b6920dd9fe0d	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_11 thành công	info	t	2026-01-28 16:54:03.759	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
0efe3915-3441-44e4-aaf5-1247ce3915c7	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_08 đã được duyệt	success	t	2026-01-28 17:25:49.932	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
9756bde0-1f67-4fb7-87b3-80c54627b2cf	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_10 đã được duyệt	success	t	2026-01-28 17:25:56.532	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
615dd8ec-a255-4e60-8887-c25679705ba9	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_11 đã được duyệt	success	t	2026-01-28 17:26:02.23	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
114b400e-f1be-4e67-afb1-dd96be3705fe	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_07 đã được duyệt	success	t	2026-01-28 17:26:07.416	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
e33222d4-82ef-44e0-b821-ea2ac8eb2b0c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_03 đã được duyệt	success	t	2026-01-28 17:26:10.438	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
5184c60f-4409-42b7-909c-6d5daa8e3b08	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_05 đã được duyệt	success	t	2026-01-28 17:26:13.584	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
ef9c4bee-e571-43ae-93c0-17a7229d760f	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Phiếu chi #C0126_02 đã được duyệt	success	t	2026-01-28 17:26:16.445	7fa9b364-d58e-4f2c-9c75-7056964f4f9a	/quan-ly-thu-chi
2869745c-84ba-443c-8598-704f0239803d	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_08 đã được duyệt	success	t	2026-01-28 17:26:30.751	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
8d6c8de7-f3f5-4caa-b0af-33ecac28efef	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_04 đã được duyệt	success	t	2026-01-28 17:26:36.041	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
628bb388-1172-4f5a-9941-8a44da3a6a81	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #V0126_03 chờ duyệt	warning	t	2026-01-28 17:27:26.741	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
ecfc52f3-5cbc-4fae-8c67-e9637d44004f	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_03 chờ duyệt	warning	t	2026-01-28 17:27:26.741	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
cc16c693-c6b5-43c5-8eef-6de9b9149a20	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #V0126_03 thành công	info	t	2026-01-28 17:27:26.743	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
7c7abfb3-2f30-437e-9d4d-72a82af9ce84	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_02 bị từ chối: Bị lặp	error	t	2026-01-28 17:28:04.595	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
8286951f-6d93-4cb9-b18b-a936c8b085f5	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_03 đã được duyệt	success	t	2026-01-28 17:28:10.114	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
31fee386-424e-4f61-b69c-1716d9cef946	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Phiếu thu #T0126_04 đã được duyệt	success	t	2026-01-28 17:28:38.966	a547a95c-f305-4874-b719-13d07908839d	/quan-ly-thu-chi
b4b3922d-73ad-4406-b803-685be800c7a3	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_09 chờ duyệt	warning	t	2026-01-28 17:30:12.736	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
7a03a409-bea7-4eae-a035-c996fba54dc0	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_09 chờ duyệt	warning	f	2026-01-28 16:47:03.983	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
780546a2-59b7-4ca4-aca8-42b620b065a9	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_10 chờ duyệt	warning	f	2026-01-28 16:49:14.835	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
5431076d-274d-437d-8dac-7aa738e1c7ce	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_11 chờ duyệt	warning	f	2026-01-28 16:54:03.757	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
4c8c563d-83b4-46ff-9a87-c48a1e4df11e	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #V0126_03 chờ duyệt	warning	f	2026-01-28 17:27:26.741	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
490145f7-8646-4040-81fb-7cc75a890ba2	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_10 chờ duyệt	warning	f	2026-01-28 16:49:14.835	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
cb2fc35d-effc-475e-8c1e-8ec52a1aec2d	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_11 chờ duyệt	warning	f	2026-01-28 16:54:03.757	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
07812636-d9df-4a69-aca7-ff05c148adfa	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #V0126_03 chờ duyệt	warning	f	2026-01-28 17:27:26.741	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
9ccf60ef-1e9b-4e61-be64-6c0e4e9cb1e9	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_09 chờ duyệt	warning	f	2026-01-28 17:30:12.736	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
7ea48729-8a8f-421a-85e7-00ddb7fb0029	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_09 chờ duyệt	warning	t	2026-01-28 17:30:12.736	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
38a19b81-0f49-4b50-911b-fda5b1f0d11b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu thu #T0126_09 thành công	info	t	2026-01-28 17:30:12.739	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
57daf306-980d-496f-9d9d-2849ef878d1c	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_15 chờ duyệt	warning	t	2026-01-28 17:32:18.376	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
256de455-8dc5-4521-9c8c-9985a5f7f13f	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_15 chờ duyệt	warning	t	2026-01-28 17:32:18.376	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
da10b9cb-1894-4314-bc6d-7120186de037	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_15 thành công	info	t	2026-01-28 17:32:18.378	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
28a5e84a-a26f-4802-be1b-30481bfc1cdd	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_16 chờ duyệt	warning	t	2026-01-28 17:35:24.232	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
9ccf7ab9-f88f-4b6f-861d-df7d8c3e65e2	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_16 chờ duyệt	warning	t	2026-01-28 17:35:24.232	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
6ec96dba-786a-4a7c-b187-92b910cfd0d0	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_16 thành công	info	t	2026-01-28 17:35:24.233	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
d90cea7e-af36-4107-ba5a-478eaab89e03	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_17 chờ duyệt	warning	t	2026-01-28 17:41:26.561	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
243119ee-670c-4889-a68b-d1c9946553b1	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_17 chờ duyệt	warning	t	2026-01-28 17:41:26.561	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
1ef23cc0-7a74-4eb5-a78a-d99ae5341c8e	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_17 thành công	info	t	2026-01-28 17:41:26.564	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
aa41119e-2f92-48fa-8135-f65364ad03b6	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_18 chờ duyệt	warning	t	2026-01-28 18:09:01.937	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
b8a08e32-46ba-4360-af56-e77cbef52e8c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_18 chờ duyệt	warning	t	2026-01-28 18:09:01.937	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
1b2d95f1-84bc-4f45-a73f-58f761335ba6	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_18 thành công	info	t	2026-01-28 18:09:01.94	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
be4ad21c-f488-43c5-8519-3d678d8c3fef	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_18 bị từ chối: Sai tình trạng	error	t	2026-01-28 18:09:46.937	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
37a67f0d-e2f1-417d-8811-b9df647e6f07	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_19 chờ duyệt	warning	t	2026-01-28 18:11:06.703	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
c0b7fa2a-b761-4cb8-8c38-11ef155337b2	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_19 chờ duyệt	warning	t	2026-01-28 18:11:06.703	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
41ca1edb-3cb3-4b41-aefd-e243a36fdf9c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_19 thành công	info	t	2026-01-28 18:11:06.706	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
4e2c6cbe-3397-4443-a78a-f7c7854800c2	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_20 chờ duyệt	warning	t	2026-01-28 18:12:17.424	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
bd01fa3a-79c6-453f-9e9e-4ceea0dfdcaf	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_09 chờ duyệt	warning	f	2026-01-28 17:30:12.736	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
20f8a631-f20d-4abe-b3b3-0cc5be12332e	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_15 chờ duyệt	warning	f	2026-01-28 17:32:18.376	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
2b33275e-449b-42f6-a146-869401c5c0da	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_16 chờ duyệt	warning	f	2026-01-28 17:35:24.232	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
c622f2d3-82b9-469f-83b9-1395d52f87de	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_17 chờ duyệt	warning	f	2026-01-28 17:41:26.561	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
d8d664f2-93eb-474a-9dea-0e3f4b145cb2	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_18 chờ duyệt	warning	f	2026-01-28 18:09:01.937	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
90621de9-9e6c-40ab-829e-311cfa2293d9	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_19 chờ duyệt	warning	f	2026-01-28 18:11:06.703	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
f570b11f-e411-4444-bf3d-310fe141afb0	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_15 chờ duyệt	warning	f	2026-01-28 17:32:18.376	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
395e1b65-9ca7-4b0d-a141-e4cae5b0495d	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_16 chờ duyệt	warning	f	2026-01-28 17:35:24.232	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
c53c6ff0-19d9-4fac-b497-c461fdfeb6d1	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_17 chờ duyệt	warning	f	2026-01-28 17:41:26.561	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
1aae084e-adfb-4eb4-883f-606e494f8f3a	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_18 chờ duyệt	warning	f	2026-01-28 18:09:01.937	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
81df39e0-0e23-47be-9052-0fe1e9de6503	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_19 chờ duyệt	warning	f	2026-01-28 18:11:06.703	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
031aecac-5f5c-4499-9ef0-d060743a6355	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_20 chờ duyệt	warning	f	2026-01-28 18:12:17.424	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
ec1b7c3b-72b4-4075-919e-19afb71f3ae3	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_20 chờ duyệt	warning	t	2026-01-28 18:12:17.424	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
0b9302b3-c8e9-449d-8c1c-b4a43886fb84	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_20 thành công	info	t	2026-01-28 18:12:17.426	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
ef1db4d2-0db7-4d98-a0ad-0287a895f11a	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_21 chờ duyệt	warning	t	2026-01-28 18:14:16.648	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
30590b89-ed0d-42d6-8182-3d3af40a966b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_21 chờ duyệt	warning	t	2026-01-28 18:14:16.648	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
b83b2f85-aff4-4fb3-bf58-678b4232799b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_21 thành công	info	t	2026-01-28 18:14:16.65	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
310d9bcf-7a04-4f73-a95b-f049ddc0aa82	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #V0126_04 chờ duyệt	warning	t	2026-01-28 18:15:23.541	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
66c58b20-dba3-4043-8a1c-a8248b83264f	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_04 chờ duyệt	warning	t	2026-01-28 18:15:23.541	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
9657d2a3-8146-43d4-b706-462d97fd6e2c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #V0126_04 thành công	info	t	2026-01-28 18:15:23.543	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
7c023753-dfc1-476e-8c09-4407341a6717	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_21 đã được duyệt	success	t	2026-01-28 18:15:49.763	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
605ed385-3bcc-4dbb-bbf1-4b9405f9ce6c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_16 đã được duyệt	success	t	2026-01-28 18:15:54.885	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
a26635bd-0c01-447f-977b-f47f63f152cd	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_20 bị từ chối: Sai tình trạng thanh toán	error	t	2026-01-28 18:16:29.098	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
639f75e4-8c76-4b33-9556-f95029bec90a	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_19 bị từ chối: Sai BU	error	t	2026-01-28 18:16:59.626	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
89d97598-9b8d-4fc3-b7f0-13eb744897bb	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_17 bị từ chối: Sai TT 	error	t	2026-01-28 18:17:21.806	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
41ae159e-c4d2-4520-8e63-c0160b8b10e8	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_15 đã được duyệt	success	t	2026-01-28 18:17:31.785	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
fab0fd6b-9f5f-46e2-aeda-c593e4a8e4ca	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_22 chờ duyệt	warning	t	2026-01-28 18:19:04.871	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
91fc8b43-5a3c-4bc0-891a-d614de8942dc	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_22 chờ duyệt	warning	t	2026-01-28 18:19:04.871	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
8cf29913-b199-4ede-ba2b-d9a194a55d34	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_22 thành công	info	t	2026-01-28 18:19:04.873	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
bc53074e-b941-42a5-a0aa-414d74646b59	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_23 chờ duyệt	warning	t	2026-01-28 18:32:06.387	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
ed7a21ec-8d75-4f53-9f50-9bd7d8d7d918	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_23 chờ duyệt	warning	t	2026-01-28 18:32:06.387	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
f2d5f1a6-07c0-4626-b325-e2b8fff9e45b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_23 thành công	info	t	2026-01-28 18:32:06.389	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
c83e42a7-9718-4471-8f25-f026c3348075	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_24 chờ duyệt	warning	t	2026-01-28 18:34:10.261	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
005db548-b3de-4a6c-b9e2-2cb39bd86fe2	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_20 chờ duyệt	warning	f	2026-01-28 18:12:17.424	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
f362e828-6e13-4168-9c96-a061a5c834bc	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_21 chờ duyệt	warning	f	2026-01-28 18:14:16.648	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
77c5c327-244d-4bce-8eb6-a86c36ffad56	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #V0126_04 chờ duyệt	warning	f	2026-01-28 18:15:23.541	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
4f1119be-0afc-4f69-9511-f6dde846d871	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_22 chờ duyệt	warning	f	2026-01-28 18:19:04.871	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
43e1c4e2-f01f-49fb-a888-e31a83f8dba2	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_23 chờ duyệt	warning	f	2026-01-28 18:32:06.387	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
93778b11-5d3b-4927-a940-c9d4041f3dd7	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_21 chờ duyệt	warning	f	2026-01-28 18:14:16.648	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
6d7b13b5-9878-413b-9d49-93bb7aacc6b3	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #V0126_04 chờ duyệt	warning	f	2026-01-28 18:15:23.541	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
d8459070-c0b6-427b-a8b1-ea184fc8aca0	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_22 chờ duyệt	warning	f	2026-01-28 18:19:04.871	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
c61225b9-0e56-414f-a141-b3d656a55df0	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_23 chờ duyệt	warning	f	2026-01-28 18:32:06.387	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
19517c4c-75f2-463f-990b-5726dabdc037	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_24 chờ duyệt	warning	f	2026-01-28 18:34:10.261	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
2ce8e3ce-73d9-4500-b065-c36c3fe810ba	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_24 chờ duyệt	warning	t	2026-01-28 18:34:10.261	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
5beff522-95ed-483d-a1be-41c6c27df9b8	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_24 thành công	info	t	2026-01-28 18:34:10.263	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
7d11e26a-4454-4b2a-8cfb-a10a8aa7ad98	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_25 chờ duyệt	warning	t	2026-01-28 18:37:35.166	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
84b31399-b6c6-423f-af2e-584a4cf92227	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_25 chờ duyệt	warning	t	2026-01-28 18:37:35.166	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
9aa8c8c6-0c6a-404a-89f1-d6dcfe5f2884	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_25 thành công	info	t	2026-01-28 18:37:35.169	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
86343b8c-24aa-4082-bc53-b87e9a656acc	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_26 chờ duyệt	warning	t	2026-01-28 18:39:13.105	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
10ea5dfb-3817-4939-9a34-a9a6b57b722b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_26 chờ duyệt	warning	t	2026-01-28 18:39:13.105	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
785e6dc2-e484-47c4-9fb2-a4727a87bd97	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_26 thành công	info	t	2026-01-28 18:39:13.108	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
3d57d57b-76e4-4e6f-bd51-1bbaca49b29a	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_29 chờ duyệt	warning	t	2026-01-28 18:40:48.321	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
142396ff-759b-4f9a-8162-40df2dc36ce7	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_29 chờ duyệt	warning	t	2026-01-28 18:40:48.321	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
8f038300-f13b-47eb-8e49-b4ea7951c026	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_29 thành công	info	t	2026-01-28 18:40:48.323	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
ce2e0bcd-f9db-4dfd-ab4d-c14405cf7b19	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_30 chờ duyệt	warning	t	2026-01-28 18:41:27.335	4a0191ae-812f-4a4a-838e-c9a0d60f1227	/quan-ly-thu-chi
9097208b-9259-4a50-b9e1-1db3ac9f3a3d	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_30 chờ duyệt	warning	t	2026-01-28 18:41:27.335	4a0191ae-812f-4a4a-838e-c9a0d60f1227	/quan-ly-thu-chi
3911d62b-5d3f-4cd8-9fa8-92b0ff0a08ad	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_30 thành công	info	t	2026-01-28 18:41:27.338	4a0191ae-812f-4a4a-838e-c9a0d60f1227	/quan-ly-thu-chi
0b4942e4-3464-4a36-bada-7117b693bb8f	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_31 chờ duyệt	warning	t	2026-01-28 18:41:56.824	3cdf028e-6557-432a-868f-b7835f25026b	/quan-ly-thu-chi
8b5774b9-43cd-4343-9dda-6800eced2d17	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_31 chờ duyệt	warning	t	2026-01-28 18:41:56.824	3cdf028e-6557-432a-868f-b7835f25026b	/quan-ly-thu-chi
07e1069e-5527-485f-9450-e072d4d8cab4	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_31 thành công	info	t	2026-01-28 18:41:56.826	3cdf028e-6557-432a-868f-b7835f25026b	/quan-ly-thu-chi
1bbde9db-0dde-404e-8ac1-1493218b2afe	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_32 chờ duyệt	warning	t	2026-01-28 18:42:33.062	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
3dc384ad-3bf5-4862-8200-85f828ed5147	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_32 chờ duyệt	warning	t	2026-01-28 18:42:33.062	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
c0466a57-d5ea-4295-9767-14938b8790fb	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_32 thành công	info	t	2026-01-28 18:42:33.065	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
39a0cc4f-4130-4b0b-834a-89c241dec6dd	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_25 chờ duyệt	warning	f	2026-01-28 18:37:35.166	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
4ed39091-2591-478b-86d7-3079a04d5c70	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_26 chờ duyệt	warning	f	2026-01-28 18:39:13.105	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
875b2cec-7761-4abb-a215-c603727b5a7e	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_29 chờ duyệt	warning	f	2026-01-28 18:40:48.321	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
6e962129-fd67-4dc3-a12a-e420b4ce2713	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_30 chờ duyệt	warning	f	2026-01-28 18:41:27.335	4a0191ae-812f-4a4a-838e-c9a0d60f1227	/quan-ly-thu-chi
68df5be4-0bfa-4fff-b471-b30afdbbaae1	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_31 chờ duyệt	warning	f	2026-01-28 18:41:56.824	3cdf028e-6557-432a-868f-b7835f25026b	/quan-ly-thu-chi
45e18b34-39c7-48e0-99ce-2f814c21dbc2	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_25 chờ duyệt	warning	f	2026-01-28 18:37:35.166	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
33d38e18-139b-4ceb-9822-b8f9661ef68c	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_26 chờ duyệt	warning	f	2026-01-28 18:39:13.105	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
3f81acf9-02f8-4319-b344-6b3ed30956ef	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_29 chờ duyệt	warning	f	2026-01-28 18:40:48.321	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
4c8ffa75-c388-4071-b8c9-9c2008150d27	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_30 chờ duyệt	warning	f	2026-01-28 18:41:27.335	4a0191ae-812f-4a4a-838e-c9a0d60f1227	/quan-ly-thu-chi
90b19978-1c8b-4d2a-948c-877ef6654189	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_31 chờ duyệt	warning	f	2026-01-28 18:41:56.824	3cdf028e-6557-432a-868f-b7835f25026b	/quan-ly-thu-chi
09c9ed97-b08d-4394-9ee5-b616a0cb66b7	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_32 chờ duyệt	warning	f	2026-01-28 18:42:33.062	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
70a9a981-fe55-4579-b7a2-56ed84228b65	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_34 chờ duyệt	warning	t	2026-01-28 18:45:30.698	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
7bba1a66-aa5e-480b-bbde-846e46f6439e	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_34 chờ duyệt	warning	t	2026-01-28 18:45:30.698	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
52849f26-7be2-4dbf-b7c1-0860290bcf74	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_34 thành công	info	t	2026-01-28 18:45:30.701	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
20d43b3d-cd2f-43ea-9ece-0cc1fda876da	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_26 đã được duyệt	success	t	2026-01-28 18:48:08.327	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
04c4bd81-abff-4f82-8b22-57f165f719ad	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_22 đã được duyệt	success	t	2026-01-28 18:48:12.591	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
8fa52cec-c40a-4815-bace-68a72cd865b0	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_34 đã được duyệt	success	t	2026-01-28 18:48:16.875	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
f08bf8aa-9063-4491-bf97-75c147eb5bda	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_25 đã được duyệt	success	t	2026-01-28 18:48:20.6	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
9807433f-946c-48a3-893a-0e787c6d3739	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_09 đã được duyệt	success	t	2026-01-28 18:48:32.284	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
60656301-d0c2-4983-95ed-4e8a0293f289	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_04 đã được duyệt	success	t	2026-01-28 18:48:41.416	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
78215738-0638-44c2-af13-6c3269a010e1	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_35 chờ duyệt	warning	t	2026-01-28 18:52:47.277	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
9bfff232-be83-4a07-9226-d55f46018789	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_35 chờ duyệt	warning	t	2026-01-28 18:52:47.277	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
dbf1df94-6163-416e-8a11-f70fc4200020	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_35 thành công	info	t	2026-01-28 18:52:47.279	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
19d50ec2-4304-4aef-b4f3-0e0d94108add	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_35 bị từ chối: Sai ngày	error	t	2026-01-28 18:53:05.654	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
f1ae476a-dded-40cd-a706-89bd01c27c0e	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_36 chờ duyệt	warning	t	2026-01-28 18:53:49.762	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
c4af72e3-1d76-4e54-974b-ab07dc8bf13f	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_36 chờ duyệt	warning	t	2026-01-28 18:53:49.762	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
07fe87e6-ed20-4a28-a22b-d06823ec3163	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_36 thành công	info	t	2026-01-28 18:53:49.765	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
b3b8da36-cccb-4fe0-a5b7-c715c58319a7	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_36 bị từ chối: Sai BU	error	t	2026-01-28 18:53:59.744	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
8e24c0d8-0ec8-441f-8704-45a94785f383	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_37 chờ duyệt	warning	t	2026-01-28 18:54:41.495	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
781ea4e0-3596-4d25-9551-0750e4a0d11d	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_37 chờ duyệt	warning	t	2026-01-28 18:54:41.495	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
d4bc5549-0dfb-45ad-8e02-0739ba1b0ea6	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_37 thành công	info	t	2026-01-28 18:54:41.498	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
982ac656-0540-49bb-bfad-aac3dd7d41dc	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_37 đã được duyệt	success	t	2026-01-28 18:54:44.6	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
ccdfdb48-5920-4b2e-bbd6-ff0d707b0b36	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_38 chờ duyệt	warning	t	2026-01-28 19:01:52.714	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
b8ba3e67-049a-4f06-8719-c76d7adb302a	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_37 chờ duyệt	warning	f	2026-01-28 18:54:41.495	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
7f6adaa9-380f-4d4f-813c-25ca877d5c13	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_34 chờ duyệt	warning	f	2026-01-28 18:45:30.698	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
3cc1dc3d-11d9-4e18-8dea-69bad869f36b	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_34 chờ duyệt	warning	f	2026-01-28 18:45:30.698	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
9645baad-87a5-4201-874c-3d721faa1fee	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_35 chờ duyệt	warning	f	2026-01-28 18:52:47.277	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
eccd3334-81ed-4b65-ba88-0bda59cb09fd	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_36 chờ duyệt	warning	f	2026-01-28 18:53:49.762	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
f9fe1f39-02bb-49e6-b342-433f87ea907e	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_34 chờ duyệt	warning	f	2026-01-28 18:45:30.698	a12fa75e-5523-463c-9cd0-0719ecf90867	/quan-ly-thu-chi
8f1fc591-6421-4dce-a3a9-5a70a9bf2386	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_35 chờ duyệt	warning	f	2026-01-28 18:52:47.277	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
e1cd20e4-a8eb-4620-b323-33f3b3f95912	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_36 chờ duyệt	warning	f	2026-01-28 18:53:49.762	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
1adcebed-8552-4a30-85eb-7170b8532ed5	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_37 chờ duyệt	warning	f	2026-01-28 18:54:41.495	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
895fc088-3762-4506-8b55-5f7197439e32	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_38 chờ duyệt	warning	f	2026-01-28 19:01:52.714	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
83a4cc9d-5c16-4328-9794-33ee957d036b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_38 chờ duyệt	warning	t	2026-01-28 19:01:52.714	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
e7c6f185-4625-4f6b-b8d4-6959eeb083fe	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_38 thành công	info	t	2026-01-28 19:01:52.716	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
44f7713a-91b4-483d-ab49-07b83c2e63ca	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_38 đã được duyệt	success	t	2026-01-28 19:02:04.806	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
4cf0ae5d-a561-4dfe-88d7-801316b3a5f3	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_39 chờ duyệt	warning	t	2026-01-28 19:03:41.414	93cc9cbe-13db-4277-b7b9-9e83badc5baf	/quan-ly-thu-chi
95382605-3944-4be7-802d-51675c5993b2	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_39 chờ duyệt	warning	t	2026-01-28 19:03:41.414	93cc9cbe-13db-4277-b7b9-9e83badc5baf	/quan-ly-thu-chi
e699ce40-ceff-4614-a6eb-e2434610d37f	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_39 thành công	info	t	2026-01-28 19:03:41.417	93cc9cbe-13db-4277-b7b9-9e83badc5baf	/quan-ly-thu-chi
a1a6c506-8d8c-48a1-912f-3a2a9cac7947	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_40 chờ duyệt	warning	t	2026-01-28 19:15:17.995	0e383ad4-7e1e-4e0f-b46a-ae6c85e06eb6	/quan-ly-thu-chi
6bb48228-118f-4ebb-ae73-608321308a5b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_40 chờ duyệt	warning	t	2026-01-28 19:15:17.995	0e383ad4-7e1e-4e0f-b46a-ae6c85e06eb6	/quan-ly-thu-chi
21acf5bc-a2ef-46fe-b472-3d8ce5a46faa	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_40 thành công	info	t	2026-01-28 19:15:17.998	0e383ad4-7e1e-4e0f-b46a-ae6c85e06eb6	/quan-ly-thu-chi
858c68d4-e672-406e-ad8c-5963b31138dc	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_11 chờ duyệt	warning	t	2026-01-29 03:02:09.655	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
3c259852-1cd3-4888-925c-3c96d8333a21	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_11 chờ duyệt	warning	t	2026-01-29 03:02:09.655	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
7f54d37d-e389-4448-aec4-a23bbe38e0aa	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #V0126_05 chờ duyệt	warning	t	2026-01-29 03:03:27.325	2eb0b91c-f6f3-4369-b375-687e049e1d4a	/quan-ly-thu-chi
d8d7d7de-c763-4644-8d26-bced0989d24c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #V0126_05 chờ duyệt	warning	t	2026-01-29 03:03:27.325	2eb0b91c-f6f3-4369-b375-687e049e1d4a	/quan-ly-thu-chi
6d493d25-1d86-4c07-b890-2dd71da5d594	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu chi #V0126_05 thành công	info	f	2026-01-29 03:03:27.356	2eb0b91c-f6f3-4369-b375-687e049e1d4a	/quan-ly-thu-chi
0c0543aa-5e64-4b81-b2ba-5a562654a079	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #V0126_05 chờ duyệt	warning	f	2026-01-29 03:03:27.325	2eb0b91c-f6f3-4369-b375-687e049e1d4a	/quan-ly-thu-chi
17be83c4-148e-4cf5-82d6-f122a7a04a20	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_11 bị từ chối: lỗi	error	f	2026-01-29 03:02:17.169	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
d94c6266-9c57-4113-b6dd-59e2584fb56d	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_40 chờ duyệt	warning	f	2026-01-28 19:15:17.995	0e383ad4-7e1e-4e0f-b46a-ae6c85e06eb6	/quan-ly-thu-chi
55794007-1985-47ce-9a7e-ba6f09481c1f	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_12 chờ duyệt	warning	t	2026-01-29 04:16:43.357	384f4be0-7eab-41c2-a8ff-153046fcab28	/quan-ly-thu-chi
f11f8201-9ad9-4ca5-92d7-f7f5df0aaff4	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_12 chờ duyệt	warning	t	2026-01-29 04:16:43.357	384f4be0-7eab-41c2-a8ff-153046fcab28	/quan-ly-thu-chi
e8350384-de3a-41c7-8a52-0e01cfdf0da8	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_39 chờ duyệt	warning	f	2026-01-28 19:03:41.414	93cc9cbe-13db-4277-b7b9-9e83badc5baf	/quan-ly-thu-chi
459f6ce2-5585-49e6-ab77-381b2dad2dc7	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_11 chờ duyệt	warning	f	2026-01-29 03:02:09.655	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
cad68812-d07a-4310-b161-3e87d6405f9b	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu thu #T0126_11 thành công	info	f	2026-01-29 03:02:09.695	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
e9c5f4f2-72b5-4ed5-a8aa-3db966be8214	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_12 chờ duyệt	warning	f	2026-01-29 04:16:43.357	384f4be0-7eab-41c2-a8ff-153046fcab28	/quan-ly-thu-chi
aa42318f-4b49-4a33-9d04-878630ff2a7b	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_12 chờ duyệt	warning	f	2026-01-29 04:16:43.357	384f4be0-7eab-41c2-a8ff-153046fcab28	/quan-ly-thu-chi
cd7d8659-97f7-42ca-9b78-6e2208ac31fb	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #V0126_05 chờ duyệt	warning	f	2026-01-29 03:03:27.325	2eb0b91c-f6f3-4369-b375-687e049e1d4a	/quan-ly-thu-chi
aac9136c-5796-44bb-bb44-a25aaac83cf9	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_12 chờ duyệt	warning	f	2026-01-29 04:16:43.357	384f4be0-7eab-41c2-a8ff-153046fcab28	/quan-ly-thu-chi
fda648c0-082e-4e37-9283-ae6d662856ef	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #V0126_05 chờ duyệt	warning	f	2026-01-29 03:03:27.325	2eb0b91c-f6f3-4369-b375-687e049e1d4a	/quan-ly-thu-chi
aba35fe2-a265-43f1-b66d-e6387ab38034	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_40 chờ duyệt	warning	f	2026-01-28 19:15:17.995	0e383ad4-7e1e-4e0f-b46a-ae6c85e06eb6	/quan-ly-thu-chi
49f7f5de-2399-4b82-a32f-9be897205d22	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_39 chờ duyệt	warning	f	2026-01-28 19:03:41.414	93cc9cbe-13db-4277-b7b9-9e83badc5baf	/quan-ly-thu-chi
019ecd17-1959-4dda-8937-1c2e5e7cd9c7	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_11 chờ duyệt	warning	f	2026-01-29 03:02:09.655	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
2093d175-2bb5-4741-b49d-cacb376447e9	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_39 chờ duyệt	warning	f	2026-01-28 19:03:41.414	93cc9cbe-13db-4277-b7b9-9e83badc5baf	/quan-ly-thu-chi
4bff84fd-aeb1-4ef0-bd76-9dac75ba0bae	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_40 chờ duyệt	warning	f	2026-01-28 19:15:17.995	0e383ad4-7e1e-4e0f-b46a-ae6c85e06eb6	/quan-ly-thu-chi
9b962cec-3354-45d1-8624-514d11ee8fe0	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_11 chờ duyệt	warning	f	2026-01-29 03:02:09.655	3296d642-8cae-4a68-86a8-1eed589a0b48	/quan-ly-thu-chi
49516d0a-ef89-4e49-9114-b138bf85e44b	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu thu #T0126_12 thành công	info	f	2026-01-29 04:16:43.511	384f4be0-7eab-41c2-a8ff-153046fcab28	/quan-ly-thu-chi
9d73977e-b3ed-45dc-be70-901408f27b48	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Bạn đã tạo phiếu chi #C0126_41 thành công	info	t	2026-01-29 08:40:52.889	f3304040-7080-4200-9d6c-9af77bc293f8	/quan-ly-thu-chi
f70833d0-d209-4440-aeff-48504367fa43	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_23 đã được duyệt	success	t	2026-01-29 10:20:37.32	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
11c6e0df-2ff8-4f0b-81dd-da2665f101a4	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_24 đã được duyệt	success	t	2026-01-29 10:20:40.35	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
289e0342-0dda-4295-8e23-bf7c92964a96	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_29 đã được duyệt	success	t	2026-01-29 10:20:48.868	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
b7aa5b40-8ce3-4d5e-8567-b5095fe8f926	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_32 đã được duyệt	success	t	2026-01-29 10:20:52.284	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
9712d54c-4837-41d6-a1e1-39a21247e726	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_38 chờ duyệt	warning	f	2026-01-28 19:01:52.714	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
14483d47-d8e9-46b7-9aaa-df7e97f2603b	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_30 chờ duyệt	warning	f	2026-01-28 18:41:27.335	4a0191ae-812f-4a4a-838e-c9a0d60f1227	/quan-ly-thu-chi
7df3c028-6092-4d4e-bd0f-1d3b21020d22	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_07 chờ duyệt	warning	f	2026-01-28 16:17:07.273	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
2b108f3e-9509-4eac-9852-a1d386f07591	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_08 chờ duyệt	warning	f	2026-01-28 16:18:10.94	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
23ea8e5e-9e51-4a8b-8cd6-dbecb87b403c	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_03 chờ duyệt	warning	f	2026-01-28 16:23:08.277	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
c2c4511f-3d86-490f-8d42-d2fb909328f3	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_04 chờ duyệt	warning	f	2026-01-28 16:26:09.782	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
d552a184-35bc-4e9c-949e-f26b9b6887c0	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_05 chờ duyệt	warning	f	2026-01-28 16:27:26.708	eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	/quan-ly-thu-chi
80e3b8c6-93e2-4d5b-8e53-a3d34a279049	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_06 chờ duyệt	warning	f	2026-01-28 16:32:27.438	fc0d99b0-0b4b-40fe-8787-a2b3e29e4a19	/quan-ly-thu-chi
97bab129-2a4d-4894-b6b0-ce8c6230afb5	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0746_01 chờ duyệt	warning	f	2026-01-28 16:39:08.569	54e0f50f-6f46-45db-a861-d81499bac8c5	/quan-ly-thu-chi
80cbc159-e00e-4a34-a642-38b300e13efb	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #V0126_02 chờ duyệt	warning	f	2026-01-28 16:42:29.626	0d38e486-53be-4805-9bb1-e0c29be0c1a4	/quan-ly-thu-chi
1e1cc14e-de6d-43c0-b235-ad8007ef2620	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_08 chờ duyệt	warning	f	2026-01-28 16:45:47.88	7b2fea54-d942-42a9-aafb-b54e1ae9cd96	/quan-ly-thu-chi
e7da2945-ced4-4640-aff2-32179a099ecc	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_09 chờ duyệt	warning	f	2026-01-28 16:47:03.983	f0f2230c-5ddc-41ac-b843-8e09d719b7f7	/quan-ly-thu-chi
5deb01e7-009e-4234-9439-48d528e82e86	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_10 chờ duyệt	warning	f	2026-01-28 16:49:14.835	6b7c3045-9d0d-4e23-a116-f52f583a6c66	/quan-ly-thu-chi
0188e530-05be-44e9-8f5f-6ee458dbcdc0	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_11 chờ duyệt	warning	f	2026-01-28 16:54:03.757	1b3dade3-5e0e-4224-8172-f2531f6e5c3b	/quan-ly-thu-chi
3a080049-c5ca-4b58-8f9a-51ea56b22fa6	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #V0126_03 chờ duyệt	warning	f	2026-01-28 17:27:26.741	8c938f88-bed3-4236-b2c5-12d3789b6c22	/quan-ly-thu-chi
25e81c9e-7a5d-4ec1-8936-f80ad8d03254	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_09 chờ duyệt	warning	f	2026-01-28 17:30:12.736	53221a63-c783-4b25-9d73-25e6dacbcede	/quan-ly-thu-chi
1636e83a-8a1e-4fa6-9705-751f464c43b1	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_15 chờ duyệt	warning	f	2026-01-28 17:32:18.376	1b63bef3-a879-40d5-9bfe-baa42e833f7f	/quan-ly-thu-chi
322e6978-17eb-4c87-b27b-88b7e33341b1	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_16 chờ duyệt	warning	f	2026-01-28 17:35:24.232	b466f230-8c62-4ab0-a6f0-eee0b8177bd6	/quan-ly-thu-chi
bff0e3cd-b893-4ac5-a241-880f315b8881	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_17 chờ duyệt	warning	f	2026-01-28 17:41:26.561	64833aa0-6548-4f11-b9a5-b2677f2377f2	/quan-ly-thu-chi
1469585b-6088-4dd6-adb5-6c4a96267a37	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_18 chờ duyệt	warning	f	2026-01-28 18:09:01.937	d69c8e69-0ff2-48bb-b82c-a59d0f772c0d	/quan-ly-thu-chi
6766cabb-df17-4d86-bfe3-c6abbba9d94e	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_19 chờ duyệt	warning	f	2026-01-28 18:11:06.703	8bb51126-17bd-4944-b40c-3b5d14eba3cf	/quan-ly-thu-chi
c7a3394c-bc21-47b0-8806-009c26e376c7	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_20 chờ duyệt	warning	f	2026-01-28 18:12:17.424	3b6e3e1f-0d73-4c5d-9d09-caaed61ad592	/quan-ly-thu-chi
a9ca0716-3698-42fc-bca1-5e56abcd89b2	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_21 chờ duyệt	warning	f	2026-01-28 18:14:16.648	9c10a4d9-327e-4c2a-80c7-a6e256456ada	/quan-ly-thu-chi
e54e191b-f6a1-4a0e-a66d-65b1b9891d27	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #V0126_04 chờ duyệt	warning	f	2026-01-28 18:15:23.541	e184af78-d04b-42a2-9665-2c415177685f	/quan-ly-thu-chi
b891cbd0-b219-4bea-8266-e778af6dee24	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_22 chờ duyệt	warning	f	2026-01-28 18:19:04.871	d653995b-5955-45fc-868a-bc5e1525492f	/quan-ly-thu-chi
fb65d3f7-18f9-45f0-9042-07d4384e6070	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_23 chờ duyệt	warning	f	2026-01-28 18:32:06.387	ad438ff7-e24b-4b96-b9a5-b970ff372690	/quan-ly-thu-chi
6851ef61-a847-4629-9930-8d5c0a8bd5b7	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_24 chờ duyệt	warning	f	2026-01-28 18:34:10.261	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
6ac074ec-724c-48d0-aa6d-105d3b14f049	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_25 chờ duyệt	warning	f	2026-01-28 18:37:35.166	fce576cc-690a-4114-a96a-110fc897b411	/quan-ly-thu-chi
5c1537ea-442d-408b-a17e-72f05c3eb874	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_26 chờ duyệt	warning	f	2026-01-28 18:39:13.105	90851dfa-ea19-4d36-8e66-ee79acc9f344	/quan-ly-thu-chi
46883dc9-4b8d-4e08-8e9a-f219a81be200	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_29 chờ duyệt	warning	f	2026-01-28 18:40:48.321	f486ed20-23bf-41e4-8fec-65fefaf72188	/quan-ly-thu-chi
dce8628e-439e-47e4-bc5e-a606e33664a7	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_31 chờ duyệt	warning	f	2026-01-28 18:41:56.824	3cdf028e-6557-432a-868f-b7835f25026b	/quan-ly-thu-chi
461b744f-ed38-4877-95d0-fa9b8eb3dbcd	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_32 chờ duyệt	warning	f	2026-01-28 18:42:33.062	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
207341af-b503-4a8b-88e5-118524102566	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_35 chờ duyệt	warning	f	2026-01-28 18:52:47.277	51765e71-bc33-4df9-a5dc-9e37e120156c	/quan-ly-thu-chi
3081a079-7494-413e-a03c-0d2dbf865cb4	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_36 chờ duyệt	warning	f	2026-01-28 18:53:49.762	b254286b-051b-48fb-b823-3f286f5088fa	/quan-ly-thu-chi
9f97ed12-2efa-48cd-ba16-e874bff018e8	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_42 chờ duyệt	warning	t	2026-01-30 08:33:44.06	6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	/quan-ly-thu-chi
ec60d4bf-05a8-428e-a080-193361eb156c	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_42 chờ duyệt	warning	t	2026-01-30 08:33:44.06	6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	/quan-ly-thu-chi
e9ab74a2-2461-493d-af2e-d5a6d3afc5d3	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_43 chờ duyệt	warning	t	2026-01-30 08:34:45.97	2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	/quan-ly-thu-chi
1f410b46-a9f2-40c5-9784-c640d8171af8	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_43 chờ duyệt	warning	f	2026-01-30 08:34:45.97	2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	/quan-ly-thu-chi
61b866fb-db5b-47a1-8b51-328b7a8bcf52	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_42 chờ duyệt	warning	f	2026-01-30 08:33:44.06	6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	/quan-ly-thu-chi
2aee7338-bfb4-4386-95a1-f22691395e26	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_43 chờ duyệt	warning	f	2026-01-30 08:34:45.97	2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	/quan-ly-thu-chi
d906362f-ad80-49dd-9d77-456bee714817	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_24 chờ duyệt	warning	f	2026-01-28 18:34:10.261	ee492c9e-0268-4cd8-9de6-e6221fe02fe3	/quan-ly-thu-chi
6260de2d-dd2e-4257-843c-58c26b1cbea2	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_32 chờ duyệt	warning	f	2026-01-28 18:42:33.062	e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	/quan-ly-thu-chi
06b3d2a2-864e-4c53-aa99-221bac224ef7	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_37 chờ duyệt	warning	f	2026-01-28 18:54:41.495	63b95185-2ca3-4e41-9856-6441fc9e9e50	/quan-ly-thu-chi
8f48cfd7-f695-4e4a-b370-5c65fe8c6a45	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_38 chờ duyệt	warning	f	2026-01-28 19:01:52.714	6a28cf38-5324-41da-af63-ac35bcbc51c8	/quan-ly-thu-chi
c6280676-1f66-4ab3-beb2-dfbfde49b8bc	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_43 chờ duyệt	warning	f	2026-01-30 08:34:45.97	2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	/quan-ly-thu-chi
39b42eae-2a08-4270-aa81-5d062992ee0a	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_42 chờ duyệt	warning	f	2026-01-30 08:33:44.06	6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	/quan-ly-thu-chi
d1e8d73f-3927-476c-beeb-f044fb57c334	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_13 chờ duyệt	warning	t	2026-02-02 08:44:37.63	7326df89-5524-41b3-9b6e-2cdd0243acd9	/quan-ly-thu-chi
770927d3-faf1-4f60-895c-885b5a9de3ea	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_13 chờ duyệt	warning	t	2026-02-02 08:44:37.63	7326df89-5524-41b3-9b6e-2cdd0243acd9	/quan-ly-thu-chi
84d1d20c-1458-42f8-a08c-a12bdd10a0f2	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_13 chờ duyệt	warning	t	2026-02-02 08:44:37.63	7326df89-5524-41b3-9b6e-2cdd0243acd9	/quan-ly-thu-chi
594abd3a-6d8c-454f-972c-fb2ec318f0f0	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Bạn đã tạo phiếu thu #T0126_13 thành công	info	t	2026-02-02 08:44:37.633	7326df89-5524-41b3-9b6e-2cdd0243acd9	/quan-ly-thu-chi
98ff2395-690a-4956-920a-08817016ebe5	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu thu #T0126_14 chờ duyệt	warning	t	2026-02-02 08:50:34.702	12403ee1-30d4-4b96-9a20-d9d923e34283	/quan-ly-thu-chi
7418e083-f131-4dc5-b4ae-af582ba41652	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu thu #T0126_14 chờ duyệt	warning	t	2026-02-02 08:50:34.702	12403ee1-30d4-4b96-9a20-d9d923e34283	/quan-ly-thu-chi
c120ab95-048d-47e7-b07a-55990ed1868b	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu thu #T0126_14 chờ duyệt	warning	t	2026-02-02 08:50:34.702	12403ee1-30d4-4b96-9a20-d9d923e34283	/quan-ly-thu-chi
1a2831ac-ea5e-476c-9655-0f9a3308a766	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Bạn đã tạo phiếu thu #T0126_14 thành công	info	t	2026-02-02 08:50:34.704	12403ee1-30d4-4b96-9a20-d9d923e34283	/quan-ly-thu-chi
aacf14ab-2d9f-4b56-8a25-1f54df427e8b	02e42798-fc80-4285-b1e3-fec19fdf3222	Phiếu chi #C0126_44 chờ duyệt	warning	t	2026-02-02 08:59:49.258	05a62516-6d6c-4140-ae5c-774febba4383	/quan-ly-thu-chi
b3747582-e8fd-49ec-98aa-d7c6f58a68bd	5b76cd1d-0f8f-44e2-aebd-576507a45228	Phiếu chi #C0126_44 chờ duyệt	warning	t	2026-02-02 08:59:49.258	05a62516-6d6c-4140-ae5c-774febba4383	/quan-ly-thu-chi
7b005107-b8e9-49dc-8aad-71fcb98b6e19	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Phiếu chi #C0126_44 chờ duyệt	warning	t	2026-02-02 08:59:49.258	05a62516-6d6c-4140-ae5c-774febba4383	/quan-ly-thu-chi
ef03e5ff-9a5f-4a72-b754-39a0d9e991c2	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	Bạn đã tạo phiếu chi #C0126_44 thành công	info	t	2026-02-02 08:59:49.261	05a62516-6d6c-4140-ae5c-774febba4383	/quan-ly-thu-chi
59ce52a4-1796-4708-abf1-0141edce6311	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_14 chờ duyệt	warning	f	2026-02-02 08:50:34.702	12403ee1-30d4-4b96-9a20-d9d923e34283	/quan-ly-thu-chi
9ed38faf-6047-4ffc-8271-33652cc90424	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_44 chờ duyệt	warning	f	2026-02-02 08:59:49.258	05a62516-6d6c-4140-ae5c-774febba4383	/quan-ly-thu-chi
f3410812-9e98-43f6-8016-4cf7135a63ad	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_14 chờ duyệt	warning	f	2026-02-02 08:50:34.702	12403ee1-30d4-4b96-9a20-d9d923e34283	/quan-ly-thu-chi
399c520e-a96e-48c0-a0bf-1df93c9da5fe	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_13 chờ duyệt	warning	f	2026-02-02 08:44:37.63	7326df89-5524-41b3-9b6e-2cdd0243acd9	/quan-ly-thu-chi
e90f9cca-cdcc-4a05-a4d7-d614a9d5f1b3	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_42 chờ duyệt	warning	f	2026-01-30 08:33:44.06	6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	/quan-ly-thu-chi
90c5bca4-89ca-4aa4-8396-edf81da82132	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_43 chờ duyệt	warning	f	2026-01-30 08:34:45.97	2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	/quan-ly-thu-chi
26594452-3316-4802-89d0-1c8283f83a4b	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu chi #C0126_44 chờ duyệt	warning	f	2026-02-02 08:59:49.258	05a62516-6d6c-4140-ae5c-774febba4383	/quan-ly-thu-chi
9e42caf9-2feb-446f-b4ea-ea6f58f027b1	4f228265-d6c1-4a36-bbc5-273cce390f35	Phiếu thu #T0126_13 chờ duyệt	warning	f	2026-02-02 08:44:37.63	7326df89-5524-41b3-9b6e-2cdd0243acd9	/quan-ly-thu-chi
873275a4-7fea-433d-8a9b-beb2adc174f1	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu thu #T0226_02 thành công	info	f	2026-02-02 10:00:26.481	4f6a5d33-1757-46c2-a30f-a3f5afdac18d	/quan-ly-thu-chi
0d93eca9-15d6-41b5-a8b8-e8a51551ad5b	7ffda0d3-3b91-4503-b583-1d50051aa072	Bạn đã tạo phiếu chi #C0126_43 thành công	info	f	2026-01-30 08:34:45.972	2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	/quan-ly-thu-chi
b512fe84-0b14-471f-abad-c58221e13377	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_07 chờ duyệt	warning	f	2026-01-28 16:17:07.273	957be631-311e-4fd1-9d20-8cc940d63a96	/quan-ly-thu-chi
0fc5b9d4-971d-439f-bf1b-0c6d79c6432c	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu thu #T0126_08 chờ duyệt	warning	f	2026-01-28 16:18:10.94	5469c414-398d-426e-8313-f863ad529184	/quan-ly-thu-chi
cf287b43-b702-4481-88d9-f54fbb0edb4c	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_03 chờ duyệt	warning	f	2026-01-28 16:23:08.277	57e5433b-a0ae-4401-b56b-9836f8acdc9b	/quan-ly-thu-chi
310ac961-cc32-4225-a514-dc32e9c5930c	7ffda0d3-3b91-4503-b583-1d50051aa072	Phiếu chi #C0126_04 chờ duyệt	warning	f	2026-01-28 16:26:09.782	55edee4c-bbce-4b52-85bd-8b97ed83575a	/quan-ly-thu-chi
9a45e747-11e2-481c-84aa-c7c763016da6	7ffda0d3-3b91-4503-b583-1d50051aa072	Bạn đã tạo phiếu chi #C0126_42 thành công	info	f	2026-01-30 08:33:44.062	6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	/quan-ly-thu-chi
d880ad4d-75f4-4880-9233-d0eb3c4b993f	7ffda0d3-3b91-4503-b583-1d50051aa072	Bạn đã tạo phiếu thu #BBSW_T0226_001 thành công	info	t	2026-02-04 04:17:33.296	3cb1194e-d407-43b7-ba69-31f7222e5274	/quan-ly-thu-chi
4ba9549c-a1a4-43a7-b021-a8d28d99e9f8	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu chi #BBAC_PV0226_001 thành công	info	f	2026-02-03 08:04:18.358	89ea8171-84ed-49f9-8672-afcac72d66d5	/quan-ly-thu-chi
a9483f4f-02c7-44de-a65b-68bb9b3e0bfc	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu chi #BBAC_PC0126_006 thành công	info	f	2026-02-03 08:32:43.524	5686a92b-3e12-4f7f-b117-94618f6ea5cd	/quan-ly-thu-chi
da53d023-5811-40a1-8c62-f956f61b1136	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu thu #T0126_15 thành công	info	f	2026-02-02 09:49:47.068	93c1f560-f80a-46e7-bd8b-fe52f3b1ca0e	/quan-ly-thu-chi
0bfa9c49-22fb-4055-8a52-6303ee131598	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu chi #BBSV_V0126_002 thành công	info	f	2026-02-04 07:47:54.842	8d762a33-dc2a-4c9b-8b9a-9af95d7f7e12	/quan-ly-thu-chi
42024f6e-f783-4b44-b98e-633e542f214b	4f228265-d6c1-4a36-bbc5-273cce390f35	Bạn đã tạo phiếu thu #BBAC_T0126_003 thành công	info	f	2026-02-04 08:41:56.216	3aa5a1f6-a9d5-41dd-8b45-5ba7116ca068	/quan-ly-thu-chi
bd579545-12fd-485a-b51e-f06a6677e3b2	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Bạn đã tạo phiếu chi #BBSV_C0226_001 thành công	info	t	2026-02-04 13:07:34.863	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	/quan-ly-thu-chi
8e9e7516-86c1-46de-a1b6-8ca35e7f4eb6	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Bạn đã tạo phiếu thu #BBSV_T0226_001 thành công	info	t	2026-02-05 01:51:23.618	31f31a84-8fe0-46ec-b47b-5e78b51a9b44	/quan-ly-thu-chi
b841c067-9900-4a9d-91e6-9559997abe3f	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	Bạn đã tạo phiếu thu #BBSV_T0226_002 thành công	info	t	2026-02-05 02:08:23.846	dc99b142-85da-4893-aac9-1d186d31245c	/quan-ly-thu-chi
fe407ed5-ac67-40b4-995f-3f69009e7a25	7ffda0d3-3b91-4503-b583-1d50051aa072	Bạn đã tạo phiếu chi #BBSW_C0226_001 thành công	info	t	2026-02-06 02:03:50.606	c2a86167-86e0-4a01-8b33-a1b85fc71631	/quan-ly-thu-chi
712916a3-5e6d-48d8-bd46-39766b6801f2	7ffda0d3-3b91-4503-b583-1d50051aa072	Bạn đã tạo phiếu chi #BBSV_C0226_002 thành công	info	t	2026-02-06 02:07:03.13	f1488562-3e11-4b2b-a71e-819aa8321902	/quan-ly-thu-chi
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.partners (id, partner_id, partner_name, partner_type, tax_code, phone, contact_person, status, address, email, representative_name, representative_title, representative_phone, payment_method_id, payment_term, balance, created_at, updated_at) FROM stdin;
c8f26a52-de4b-4ad0-8261-8511e53a4752	KH001	CÔNG TY CỔ PHẦN CASPER VIỆT NAM	CUSTOMER	0107009894	02839905905		ACTIVE	Số 40, ngã tư Sơn Đồng, Xã Sơn Đồng, Thành phố Hà NộI	CSKH@casper-electric.com				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 01:41:57.441	2026-02-03 04:37:36.297
c8fe3ae5-f0de-48d6-a1a4-7f63e9f0124c	KH002	CÔNG TY TNHH PANASONIC VIỆT NAM	CUSTOMER	0101824243	024 3955 0111		ACTIVE	Lô J1-J2 Khu công nghiệp Thăng Long, xã Thiên Lộc, Hà Nội	info@vn.panasonic.com				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 02:10:52.92	2026-02-03 04:37:36.324
7d5d729f-985e-4ada-8ac6-53b2198db4b4	KH003	CÔNG TY TNHH THIẾT BỊ HÓA CHẤT NAKAGAWA VIỆT NAM	CUSTOMER	0103770434	024 37834618		ACTIVE	Tầng 2, Tòa nhà Detech, số 8 đường Tôn Thất Thuyết, Phường Cầu Giấy, Hà Nội	ezaki@nakagawakagaku.co.jp				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 02:12:34.666	2026-02-03 04:37:36.334
97fba3d0-89dc-4e77-8cc6-2c64fc9f234f	KH004	CÔNG TY TNHH META TECH	CUSTOMER	0317131019	0904777780		ACTIVE	\tSố 97 Trần Thị Nghỉ, Phường Hạnh Thông, TP Hồ Chí Minh, Việt Nam	contact@metatech.foundation				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 02:17:32.185	2026-02-03 04:37:36.358
3f57cbea-2849-4e39-af3b-7087561b71bf	KH006	ĐỘI THUẾ Q3	CUSTOMER	1234567890	0123456789		ACTIVE	Số 152 Võ Văn Tần, Phường 6, Quận 3, TPHCM	info@gmail.com				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 08:33:21.326	2026-02-03 04:37:36.406
fac93949-0744-4db7-b2a3-caf1a40ff581	KH007	CÔNG TY CP HẠ TẦNG VIỄN THÔNG CMC	CUSTOMER	01029000049	024710666666		ACTIVE	Tòa nhà CMC, Phố Duy Tân, Phường Cầu Giấy, TP Hà Nội	info@cmctelecom.vn				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 08:36:08.108	2026-02-03 04:37:36.43
550fc744-0e3f-4116-a56a-08856aa745a0	KH005	CÔNG TY DỊCH VỤ KẾ TOÁN ANH TOẢN	CUSTOMER	0123456789	0911716258		ACTIVE	Không có địa chỉ	info@gmail.com				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 08:31:43.575	2026-02-03 04:37:36.391
0eb36d46-e424-4f52-9734-9f304c6ca74c	KH008	mm	CUSTOMER	010101010101	0123456780		INACTIVE	mmm	m@gmail.com				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-02-05 02:01:58.432	2026-02-05 02:05:41.86
0a7902d7-42aa-4e38-8248-841c389b1f75	KH009		CUSTOMER				INACTIVE						cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-02-05 02:36:01.33	2026-02-05 02:36:11.553
6a50589f-0770-4088-b88f-27ca6a6dba22	NCC001	Google Workspace	SUPPLIER	0318079058	0123456789		ACTIVE	Tầng 8, Tòa nhà Hà Đô, Số 2 Hồng Hà, P. Tân Sơn Hòa, Q. Tân Bình.	ggworkspace@gmail.com				cff0ce35-2105-4707-a847-401f61e06d70	30	0	2026-01-28 08:30:33.332	2026-02-03 04:37:36.377
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.payment_methods (id, name, created_at, updated_at) FROM stdin;
3688faf7-67d7-4549-a53f-019c6a5e3578	Tiền mặt	2026-01-19 04:17:45.777	2026-01-19 04:17:45.777
cff0ce35-2105-4707-a847-401f61e06d70	Chuyển khoản	2026-01-19 04:17:45.857	2026-01-19 04:17:45.857
bd3d1522-833a-47c1-b7b8-776a14e50007	Thẻ tín dụng	2026-01-19 04:17:45.901	2026-01-19 04:17:45.901
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.projects (id, code, name, description, start_date, end_date, status, created_at, updated_at, bu_owner, budget, pm, spent) FROM stdin;
df491202-4407-4c88-adcd-10c56c68ac2c	BB-PLATFORM	Hệ thống quản lý thu chi 	\N	2025-11-20 00:00:00	2026-01-23 00:00:00	ongoing	2026-01-20 08:14:28.361	2026-01-20 08:14:28.361	BlueBolt Software	0	Lê Hoàng Đạt	0
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.roles (id, name, description, permissions, is_system_role, created_at, updated_at) FROM stdin;
a99cf48d-7116-40bf-89e4-6b18d0495580	ADMIN	Quản trị hệ thống	[{"edit": true, "view": true, "create": true, "delete": true, "module": "thu_chi", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "bao_cao", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "nhan_su", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "master_data", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "he_thong", "approve": true}]	f	2026-01-19 06:40:00.16	2026-01-19 06:40:33.245
b5312881-dd9c-4bbe-b645-d8437a1976fd	CEO	CEO	[{"edit": true, "view": true, "create": true, "delete": true, "module": "thu_chi", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "bao_cao", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "nhan_su", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "master_data", "approve": true}, {"edit": true, "view": true, "create": true, "delete": true, "module": "he_thong", "approve": true}]	f	2026-01-19 06:38:10.724	2026-01-20 09:36:02.874
62aaa4b7-e684-4b1c-a4f8-5b2c8f1312ff	Trưởng BU	Quản lý BU	[{"edit": true, "view": true, "create": true, "delete": false, "module": "thu_chi", "approve": true}, {"edit": false, "view": true, "create": false, "delete": false, "module": "bao_cao", "approve": false}, {"edit": true, "view": true, "create": true, "delete": true, "module": "doi_tac", "approve": true}, {"edit": true, "view": true, "create": true, "delete": false, "module": "nhan_su", "approve": false}, {"edit": false, "view": false, "create": false, "delete": false, "module": "master_data", "approve": false}, {"edit": false, "view": false, "create": false, "delete": false, "module": "he_thong", "approve": false}]	f	2026-01-19 06:39:25.346	2026-01-22 02:56:43.673
0b147ee8-3e20-4ff3-b351-38c39bbf29af	Admin	Quản trị hệ thống	[]	t	2026-01-19 04:17:44.583	2026-02-03 09:25:32.658
\.


--
-- Data for Name: specializations; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.specializations (id, name, created_at, updated_at, code, description) FROM stdin;
5e4240a5-dd09-4811-bc67-748aa479ee7a	BA	2026-01-19 04:43:10.922	2026-02-02 07:16:34.524	BA	Phân tích yêu cầu kinh doanh để chuyển hóa thành giải pháp kỹ thuật.
e4c39d4d-4a87-4ee2-bc1d-91390e01c632	Đào tạo (Trainer)	2026-01-19 04:43:11.502	2026-02-02 07:16:44.756	TRAIN	Hướng dẫn, đào tạo và phát triển kỹ năng chuyên môn cho nhân sự.
45f17712-2c6e-4a88-831c-b79f3b9a8397	Data Analyst	2026-01-19 04:43:11.079	2026-02-02 07:17:03.023	DA	Thu thập và phân tích số liệu để đưa ra các nhận định.
40195846-ae96-4865-86bf-331b024a45f3	Designer	2026-01-19 04:43:11.256	2026-02-02 07:17:15.753	DESIGN	Thiết kế giao diện bắt mắt và tối ưu hóa trải nghiệm người dùng.
0464359a-cbcd-49a4-a988-fbe44ad3bc3c	Developer	2026-01-19 04:43:11.001	2026-02-02 07:17:28.636	DEV	Viết mã nguồn để xây dựng, vận hành và bảo trì các phần mềm.
c8bea1a2-e03a-4a84-ad6b-64295f4d9bd0	DevOps	2026-01-19 04:43:11.039	2026-02-02 07:17:40.102	DEVOPS	Tối ưu hóa quy trình triển khai và quản lý hạ tầng hệ thống.
b1f6fae8-2469-451f-9d66-659f6fc78c22	Fullstack	2026-01-19 04:43:11.395	2026-02-02 07:17:51.2	STACK	Lập trình linh hoạt cả phần giao diện (Front-end) lẫn hệ thống (Back-end).
cb573dc1-5bd9-4a62-a261-4d4c639ae56c	Kế toán	2026-01-19 04:43:11.453	2026-02-02 07:18:01.414	ACC	Quản lý sổ sách, tài chính, thuế và dòng tiền của doanh nghiệp.
2623c459-42f1-46ab-b45f-11e2b46c9629	Marketing	2026-01-19 04:43:11.35	2026-02-02 07:18:10.687	MARK	Quảng bá thương hiệu và tìm kiếm khách hàng tiềm năng cho công ty.
cdb3f592-cc08-4b13-81a2-c1405076e0e6	PM	2026-01-19 04:43:11.179	2026-02-02 07:18:19.471	PM	Điều phối nguồn lực, tiến độ và chịu trách nhiệm chính về dự án.
022160e3-2700-45cb-acb4-7b3275a41d72	QA/QC	2026-01-19 04:43:11.219	2026-02-02 07:18:29.422	QA	Kiểm tra, phát hiện lỗi để đảm bảo chất lượng sản phẩm đầu ra.
a935f014-dc85-4cad-a9ef-61d2facaf5f0	Sales	2026-01-19 04:43:11.308	2026-02-02 07:18:39.826	SALES	Tiếp cận, tư vấn và thuyết phục khách hàng mua sản phẩm/dịch vụ.
8123907c-5f8d-4e3c-a9db-25da3265cbf2	AI Engineer	2026-01-19 04:43:11.13	2026-02-02 07:18:56.491	AI	Phát triển thuật toán và các mô hình thông minh.
\.


--
-- Data for Name: system_sequences; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.system_sequences (key, value) FROM stdin;
TXNSEQ_53563c80-e91b-4068-9369-b3d676df5628_PV_0226	1
TXNSEQ_53563c80-e91b-4068-9369-b3d676df5628_PC_0126	6
TXNSEQ_f7865cd6-f59b-4897-ab8c-4b18fa9f491e_T_0226	1
TXNSEQ_56bf3663-05b2-4c1d-abf6-b87528361b02_V_0126	2
TXNSEQ_53563c80-e91b-4068-9369-b3d676df5628_T_0126	3
TXNSEQ_56bf3663-05b2-4c1d-abf6-b87528361b02_T_0226	2
TXNSEQ_f7865cd6-f59b-4897-ab8c-4b18fa9f491e_C_0226	1
TXNSEQ_56bf3663-05b2-4c1d-abf6-b87528361b02_C_0226	2
TXN_C_0226	3
TXN_T_0326	1
TXN_V_0126	5
TXN_C_0126	44
TXN_T_0126	15
TXN_T_0226	2
TXNSEQ_53563c80-e91b-4068-9369-b3d676df5628_PC_0746	1
TXN_C_0746	1
TXNSEQ_53563c80-e91b-4068-9369-b3d676df5628_PV_0126	2
TXNSEQ_56bf3663-05b2-4c1d-abf6-b87528361b02_PV_0126	1
TXNSEQ_53563c80-e91b-4068-9369-b3d676df5628_PT_0126	2
TXNSEQ_f7865cd6-f59b-4897-ab8c-4b18fa9f491e_PC_0126	10
TXNSEQ_56bf3663-05b2-4c1d-abf6-b87528361b02_PC_0126	7
TXNSEQ_56bf3663-05b2-4c1d-abf6-b87528361b02_PT_0126	4
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.system_settings (id, key, value, description, category, updated_at) FROM stdin;
2e2913b6-45af-44d1-af73-da65d19079c0	twoFactorEnabled	false	Bật/Tắt xác thực 2 yếu tố	security	2026-01-19 04:17:45.007
5e321816-eb2c-463a-8aeb-d2a8c7537f8c	sessionTimeout	30	Thời gian phiên làm việc (phút)	security	2026-01-19 04:17:45.073
e443e892-f04c-41ae-b3c7-e906251372c0	passwordExpiry	90	Thời hạn mật khẩu (ngày)	security	2026-01-19 04:17:45.115
f21ed221-9474-47bf-858f-39c2ca8b6e8e	loginAttempts	5	Số lần đăng nhập sai tối đa	security	2026-01-19 04:17:45.158
\.


--
-- Data for Name: transaction_attachments; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.transaction_attachments (id, transaction_id, file_name, file_size, file_type, file_url, created_at) FROM stdin;
76a233a3-d708-437c-93e7-7db3ed0692de	31f31a84-8fe0-46ec-b47b-5e78b51a9b44	img-1448.jpeg	116582	image/jpeg	/api/uploads/1770256283562-5261125-img-1448.jpeg	2026-02-05 01:51:23.606
22ebe534-1e3f-47e6-a496-1708d13a9f33	dc99b142-85da-4893-aac9-1d186d31245c	img-1448.jpeg	116582	image/jpeg	/api/uploads/1770257303793-86362781-img-1448.jpeg	2026-02-05 02:08:23.834
46a92b21-47c1-4f7b-b585-59411048710c	3cb1194e-d407-43b7-ba69-31f7222e5274	screenshot_1770257086.png	61161	image/png	/api/uploads/1770263651920-180995540-screenshot_1770257086.png	2026-02-05 03:54:11.943
16691e09-b09f-4b05-912c-4a47babcfc72	c2a86167-86e0-4a01-8b33-a1b85fc71631	hoa_Don_GGEMAIL_0102_280226.png	45319	image/png	/api/uploads/1770343430565-930894624-hoa_Don_GGEMAIL_0102_280226.png	2026-02-06 02:03:50.59
5ad1a7f7-1020-4fae-adc4-b21ef4099adb	f1488562-3e11-4b2b-a71e-819aa8321902	BB_hoadon_GGEMAIL_0102_280226.png	44793	image/png	/api/uploads/1770343623097-677983968-BB_hoadon_GGEMAIL_0102_280226.png	2026-02-06 02:07:03.118
24e4caa9-21bb-4ce1-b24d-b42c06367193	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg	338235	image/jpeg	/api/uploads/1770210454806-588461114-z7501395128964_ea7526d5e511d7756e1abee4153822df.jpg	2026-02-06 03:53:32.698
dd7cbcd9-3304-4487-be8c-cbe59474c25f	2ceff990-5b5a-4d5f-b384-aaba6e4dd678	Screenshot From 2026-02-06 00-04-52.png	38313	image/png	/api/uploads/1770350012663-598283233-Screenshot From 2026-02-06 00-04-52.png	2026-02-06 03:53:32.698
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.transactions (id, transaction_code, transaction_date, transaction_type, category_id, project_id, object_type, partner_id, employee_id, payment_method_id, business_unit_id, amount, cost_allocation, allocation_rule_id, payment_status, approval_status, rejection_reason, description, created_by, created_at, updated_at, is_advance, student_name, other_name, project_name) FROM stdin;
f1488562-3e11-4b2b-a71e-819aa8321902	BBSV_C0226_002	2026-02-06 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	6a50589f-0770-4088-b88f-27ca6a6dba22	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	197910	DIRECT	\N	UNPAID	APPROVED	\N	Email Google Workspace Bluebolt.vn\n7,33$ x 27.000đ = 197.910đ	7ffda0d3-3b91-4503-b583-1d50051aa072	2026-02-06 02:07:03.118	2026-02-06 02:07:03.118	f	\N	\N	Email Bluebolt.vn GG
dc99b142-85da-4893-aac9-1d186d31245c	BBSV_T0226_002	2026-02-04 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	OTHER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	2246400	DIRECT	\N	PAID	APPROVED	\N	N AND H TT CP THAO LAP MAY LANH VP CHUYEN VE FC APD	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-02-05 02:08:23.834	2026-02-05 02:08:23.834	f	\N	N AND H	Lắp đặt
5469c414-398d-426e-8313-f863ad529184	BBAC_T0126_002	2026-01-22 00:00:00	INCOME	121cc413-3ddf-428f-a6f8-a77a6578f917	\N	STUDENT	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	999000	DIRECT	\N	PAID	APPROVED	\N	Khóa học	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:18:10.93	2026-02-03 09:34:04.919	f	Khoá Web01-Tự tay xây dựng Website bằng AI	\N	Khoá Web01-Tự tay xây dựng Website bằng AI
3cb1194e-d407-43b7-ba69-31f7222e5274	BBSW_T0226_001	2026-02-04 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	OTHER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	4320000	DIRECT	\N	PAID	APPROVED	\N	Thu tiền hosting khách hàng Pelio	7ffda0d3-3b91-4503-b583-1d50051aa072	2026-02-04 04:17:33.284	2026-02-04 04:17:33.284	f	\N	Khách hàng Pelio	Hosting Pelio
6d02e27f-dfc3-4a3e-b0f1-6f39bc25e570	BBSW_C0126_002	2026-01-05 00:00:00	EXPENSE	fadf72b4-e1f1-4bab-86cf-424fe5997e1c	\N	PARTNER	97fba3d0-89dc-4e77-8cc6-2c64fc9f234f	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	60000000	DIRECT	\N	PAID	APPROVED	\N	Chi phí văn phòng tháng 01,02- 2026. 30 triệu/ tháng	7ffda0d3-3b91-4503-b583-1d50051aa072	2026-01-30 08:33:44.05	2026-02-03 09:34:04.781	f	\N	\N	Chi phí văn phòng
a547a95c-f305-4874-b719-13d07908839d	BBSV_T0126_001	2026-01-01 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	60000000	DIRECT	\N	PAID	APPROVED	\N	Các khoản thu trước 31/12/2025	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-01-28 01:35:15.328	2026-02-03 09:34:04.945	f	\N	\N	Lắp đặt
eb0b731c-2630-4ba6-85b1-6aa8b7b97cf2	BBAC_C0126_002	2026-01-05 00:00:00	EXPENSE	fadf72b4-e1f1-4bab-86cf-424fe5997e1c	\N	PARTNER	97fba3d0-89dc-4e77-8cc6-2c64fc9f234f	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	20000000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:27:26.696	2026-02-03 09:34:05.071	f	\N	\N	\N
1b3dade3-5e0e-4224-8172-f2531f6e5c3b	BBAC_C0126_004	2026-01-20 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	8420023	DIRECT	\N	PAID	APPROVED	\N	Thanh toán chi phí chạy ads khoá học từ 8/1/2026 - 20/1/2026	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:54:03.746	2026-02-03 09:34:05.084	f	\N	\N	Do Agency 
8c938f88-bed3-4236-b2c5-12d3789b6c22	BBAC_V0126_001	2026-01-01 00:00:00	LOAN	f6558866-1aad-422f-85f9-1144baecb636	\N	OTHER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	50650000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 17:27:26.733	2026-02-03 09:34:05.124	f	\N	CEO Đạt Lê	\N
57e5433b-a0ae-4401-b56b-9836f8acdc9b	BBAC_C0126_001	2026-01-05 00:00:00	EXPENSE	42b77c64-71a5-419f-a5f5-ad9e838576e8	\N	EMPLOYEE	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	27425000	DIRECT	\N	PAID	APPROVED	\N	[Tất cả nhân viên BU BlueBolt Academy] 	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:23:08.265	2026-02-03 09:34:05.136	f	\N	\N	
7fa9b364-d58e-4f2c-9c75-7056964f4f9a	BBSV_C0126_001	2026-01-05 00:00:00	EXPENSE	42b77c64-71a5-419f-a5f5-ad9e838576e8	\N	EMPLOYEE	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	54913250	DIRECT	\N	PAID	APPROVED	\N	[Tất cả nhân viên BU BlueBolt Services] chi phí lương tháng 12/2025	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-01-28 01:43:50.712	2026-02-03 09:34:05.149	f	\N	\N	\N
7b2fea54-d942-42a9-aafb-b54e1ae9cd96	BBSV_C0126_002	2026-01-05 00:00:00	EXPENSE	fadf72b4-e1f1-4bab-86cf-424fe5997e1c	\N	PARTNER	97fba3d0-89dc-4e77-8cc6-2c64fc9f234f	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	20000000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:45:47.868	2026-02-03 09:34:05.177	f	\N	\N	\N
55edee4c-bbce-4b52-85bd-8b97ed83575a	BBAC_C0126_003	2026-01-05 00:00:00	EXPENSE	0f08fbcc-d5a1-4056-be8c-b5b5aed93360	\N	EMPLOYEE	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	3225000	DIRECT	\N	PAID	APPROVED	\N	[Tất cả nhân viên BU BlueBolt Academy] 	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:26:09.772	2026-02-03 09:34:05.189	f	\N	\N	\N
e184af78-d04b-42a2-9665-2c415177685f	BBSV_V0126_001	2026-01-05 00:00:00	LOAN	f6558866-1aad-422f-85f9-1144baecb636	\N	OTHER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	30525457	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:15:23.531	2026-02-03 09:34:05.203	f	\N	CEO Đạt Lê	\N
1b63bef3-a879-40d5-9bfe-baa42e833f7f	BBSV_C0126_003	2026-01-05 00:00:00	EXPENSE	2a025a16-048c-419b-bb2a-2fb20819fb02	\N	PARTNER	550fc744-0e3f-4116-a56a-08856aa745a0	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	3500000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 17:32:18.367	2026-02-03 09:34:05.222	f	\N	\N	\N
05a62516-6d6c-4140-ae5c-774febba4383	BBSW_C0126_008	2026-01-13 00:00:00	EXPENSE	0f08fbcc-d5a1-4056-be8c-b5b5aed93360	\N	EMPLOYEE	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	30000000	DIRECT	\N	PAID	APPROVED	\N	[Tất cả nhân viên BU BlueBolt Software] 	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-02-02 08:59:49.247	2026-02-03 09:34:05.231	f	\N	\N	\N
957be631-311e-4fd1-9d20-8cc940d63a96	BBAC_T0126_001	2026-01-19 00:00:00	INCOME	121cc413-3ddf-428f-a6f8-a77a6578f917	\N	STUDENT	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	5099000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:17:07.262	2026-02-03 09:34:05.239	f	Khoá Web01-Tự tay xây dựng Website bằng AI	\N	Khoá Web01-Tự tay xây dựng Website bằng AI
b466f230-8c62-4ab0-a6f0-eee0b8177bd6	BBSV_C0126_005	2026-01-21 00:00:00	EXPENSE	a0b2500e-e392-4174-b15a-9d344710e780	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	21602207	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 17:35:24.226	2026-02-03 09:34:05.254	f	\N	\N	Thuế cơ sở 16 (Thuế Tân Bình)
53221a63-c783-4b25-9d73-25e6dacbcede	BBSV_T0126_003	2026-01-21 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	PARTNER	c8f26a52-de4b-4ad0-8261-8511e53a4752	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	130000000	DIRECT	\N	PAID	APPROVED	\N	Thu tiền lắp đặt	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 17:30:12.727	2026-02-03 09:34:05.264	f	\N	\N	\N
6b7c3045-9d0d-4e23-a116-f52f583a6c66	BBAC_C0126_005	2026-01-21 00:00:00	EXPENSE	dd7c134e-3667-4f1b-9150-f2168d70cbe6	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	4746000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:49:14.827	2026-02-03 09:34:05.277	f	\N	\N	KP3 Agency
31f31a84-8fe0-46ec-b47b-5e78b51a9b44	BBSV_T0226_001	2026-02-04 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	PARTNER	c8f26a52-de4b-4ad0-8261-8511e53a4752	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	31114800	DIRECT	\N	PAID	APPROVED	\N	Chi phí lắp đặt Tháng 12.2025	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-02-05 01:51:23.606	2026-02-05 01:51:23.606	f	\N	\N	Lắp Đặt
c2a86167-86e0-4a01-8b33-a1b85fc71631	BBSW_C0226_001	2026-02-06 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	6a50589f-0770-4088-b88f-27ca6a6dba22	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	3022111	DIRECT	\N	UNPAID	APPROVED	\N	Email Google Workspace Tháng 2 2026\n111,93$ x 27.000đ = 3.022.111đ	7ffda0d3-3b91-4503-b583-1d50051aa072	2026-02-06 02:03:50.59	2026-02-06 02:03:50.59	f	\N	\N	Email Google Workspace
2ceff990-5b5a-4d5f-b384-aaba6e4dd678	BBSV_C0226_001	2026-02-04 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	EMPLOYEE	\N	eb08f070-d84a-45d0-9124-f16b646f8399	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	5000000	DIRECT	\N	PAID	APPROVED	\N	Tạm ứng thanh toán đơn thợ lẻ	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-02-04 13:07:34.85	2026-02-04 13:07:34.85	f	\N	\N	Lắp đặt
ad438ff7-e24b-4b96-b9a5-b970ff372690	BBSW_C0126_005	2026-01-05 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	150000000	DIRECT	\N	PAID	APPROVED	\N	- CÔNG TY TNHH MTV KHAI THÁC DỮ LIỆU SỐ\n- Số tài khoản: 0161001651729 \n- Tại Ngân hàng Ngoại thương - CN Thừa Thiên Huế (VCB)	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:32:06.376	2026-02-03 09:34:05.296	f	\N	\N	BData-Dev FG2025
ee492c9e-0268-4cd8-9de6-e6221fe02fe3	BBSW_C0126_006	2026-01-05 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	25000000	DIRECT	\N	PAID	APPROVED	\N	- CÔNG TY TNHH MTV KHAI THÁC DỮ LIỆU SỐ\n- Số tài khoản: 0161001651729 \n- Tại Ngân hàng Ngoại thương - CN Thừa Thiên Huế (VCB)	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:34:10.25	2026-02-03 09:34:05.304	f	\N	\N	BData-Dev CMD_GR
54e0f50f-6f46-45db-a861-d81499bac8c5	BBAC_C0746_001	0046-07-04 00:00:00	EXPENSE	dd7c134e-3667-4f1b-9150-f2168d70cbe6	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	53563c80-e91b-4068-9369-b3d676df5628	4746000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 16:39:08.558	2026-02-03 09:34:05.314	f	\N	\N	Không điền được tên KP3
6a28cf38-5324-41da-af63-ac35bcbc51c8	BBSW_C0126_009	2026-01-26 00:00:00	EXPENSE	0f08fbcc-d5a1-4056-be8c-b5b5aed93360	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	30000000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 19:01:52.704	2026-02-03 09:34:05.287	f	\N	\N	BHXH Kênh Nhiêu Lộc
fce576cc-690a-4114-a96a-110fc897b411	BBSW_C0126_007	2026-01-07 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	23300000	DIRECT	\N	PAID	APPROVED	\N	-0161001723905\n-LE GIA DUC\n-VIETCOMBANK"	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:37:35.155	2026-02-03 09:34:05.323	f	\N	\N	BData-CS FG2025
90851dfa-ea19-4d36-8e66-ee79acc9f344	BBSW_C0126_010	2026-01-28 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	fac93949-0744-4db7-b2a3-caf1a40ff581	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	56923000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:39:13.096	2026-02-03 09:34:05.331	f	\N	\N	FG2025 + CMD_GR
d653995b-5955-45fc-868a-bc5e1525492f	BBSV_C0126_006	2026-01-28 00:00:00	EXPENSE	2a025a16-048c-419b-bb2a-2fb20819fb02	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	13500000	DIRECT	\N	PAID	APPROVED	\N	Thanh toán đợt 1 Hợp đồng dịch vụ tư vấn pháp lý số 0501/HĐDV/2026 với đối tác Legal MA&A	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:19:04.862	2026-02-03 09:34:05.345	f	\N	\N	CÔNG TY TNHH TƯ VẤN QUẢN LÝ MA&A
9c10a4d9-327e-4c2a-80c7-a6e256456ada	BBSV_C0126_007	2026-01-28 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	PARTNER	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	93040000	DIRECT	\N	PAID	APPROVED	\N	Thanh toán công nợ lắp đặt của Thợ năm 2025 (có ds)	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:14:16.636	2026-02-03 09:34:05.354	f	\N	\N	Chi phí thợ 2025
7326df89-5524-41b3-9b6e-2cdd0243acd9	BBSV_T0126_004	2026-01-30 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	PARTNER	c8fe3ae5-f0de-48d6-a1a4-7f63e9f0124c	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	9957600	DIRECT	\N	PAID	APPROVED	\N	Công nợ lắp đặt T12/2025	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-02-02 08:44:37.619	2026-02-03 09:34:05.364	f	\N	\N	Lắp đặt
12403ee1-30d4-4b96-9a20-d9d923e34283	BBSV_T0126_002	2026-01-07 00:00:00	INCOME	6f69ea92-d80b-45fa-94d1-46c22cd972a9	\N	PARTNER	7d5d729f-985e-4ada-8ac6-53b2198db4b4	\N	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	8920800	DIRECT	\N	PAID	APPROVED	\N	Cộng nợ lắp đặt T11/2025	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-02-02 08:50:34.693	2026-02-03 09:34:05.374	f	\N	\N	Lắp đặt
e6f7ab21-0691-4cf0-9f2b-304bdc2f3172	BBSW_C0126_001	2026-01-05 00:00:00	EXPENSE	2a025a16-048c-419b-bb2a-2fb20819fb02	\N	PARTNER	550fc744-0e3f-4116-a56a-08856aa745a0	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	3500000	DIRECT	\N	PAID	APPROVED	\N		eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:42:33.053	2026-02-03 09:34:05.383	f	\N	\N	\N
f486ed20-23bf-41e4-8fec-65fefaf72188	BBSW_C0126_003	2026-01-05 00:00:00	EXPENSE	42b77c64-71a5-419f-a5f5-ad9e838576e8	\N	EMPLOYEE	\N	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	206527954	DIRECT	\N	PAID	APPROVED	\N	[Tất cả nhân viên BU BlueBolt Software] 	eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	2026-01-28 18:40:48.314	2026-02-03 09:34:05.393	f	\N	\N	\N
2bc0f640-64a1-47dc-a2e6-80f0b4d0a54d	BBSW_C0126_004	2026-01-05 00:00:00	EXPENSE	0f08fbcc-d5a1-4056-be8c-b5b5aed93360	\N	PARTNER	3f57cbea-2849-4e39-af3b-7087561b71bf	\N	cff0ce35-2105-4707-a847-401f61e06d70	f7865cd6-f59b-4897-ab8c-4b18fa9f491e	12115550	DIRECT	\N	PAID	APPROVED	\N	Nhân viên BBSW & BBGA	7ffda0d3-3b91-4503-b583-1d50051aa072	2026-01-30 08:34:45.96	2026-02-03 09:34:05.402	f	\N	\N	Bảo hiểm xã hội
f3304040-7080-4200-9d6c-9af77bc293f8	BBSV_C0126_004	2026-01-16 00:00:00	EXPENSE	317aceb4-59d5-45f7-adda-887965c8bc33	\N	EMPLOYEE	\N	eb08f070-d84a-45d0-9124-f16b646f8399	cff0ce35-2105-4707-a847-401f61e06d70	56bf3663-05b2-4c1d-abf6-b87528361b02	5000000	DIRECT	\N	PAID	APPROVED	\N	[Tất cả nhân viên BU BlueBolt Services] Tạm ứng chi phí thanh toán công thợ lẻ 	ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	2026-01-29 08:40:52.881	2026-02-03 09:34:05.414	f	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: thuchi
--

COPY public.users (id, email, password, name, avatar, bu_id, created_at, updated_at, data_scope, full_name, last_login, role_id, status, two_fa_enabled) FROM stdin;
5b76cd1d-0f8f-44e2-aebd-576507a45228	honghuynh@bluebolt.vn	$2a$10$vc0Cp.bWKZeVTES7TaVSteVM0KdsOLhgyVos94pilhLUaVwCsuY/u	Huỳnh Thị Mỹ Hồng	\N	\N	2026-01-22 02:48:39.648	2026-02-03 07:08:59.274	global	Huỳnh Thị Mỹ Hồng	\N	b5312881-dd9c-4bbe-b645-d8437a1976fd	active	f
7ffda0d3-3b91-4503-b583-1d50051aa072	duypham@bluebolt.vn	$2a$10$qrymJLG0Rwn84XTlJBxvdOv4wBFoTndB9vlE54oaymq8ERoQ6l7Dy	Phạm Anh Duy	\N	\N	2026-01-19 06:41:19.571	2026-01-26 03:23:57.805	global	Phạm Anh Duy	\N	0b147ee8-3e20-4ff3-b351-38c39bbf29af	active	f
02e42798-fc80-4285-b1e3-fec19fdf3222	datle@bluebolt.vn	$2a$10$GIbNBvZS2gb6bw3.H8n7Ou6GkX3xPjLTPyXRpIJ.0mpPHld1lzFR6	Lê Hoàng Đạt	\N	\N	2026-01-22 02:49:02.837	2026-01-26 03:25:59.578	global	Lê Hoàng Đạt	\N	b5312881-dd9c-4bbe-b645-d8437a1976fd	active	f
eab2eb0f-dfd4-4ab0-8c83-38613ac673f7	trinhhuynh@bluebolt.vn	$2a$10$qMJkaAjh8hj0fFdu6hfW8OOmGt4QGhlxTie6IJod.N7IrWqEBP/9C	Huỳnh Thị Quốc Trinh	\N	\N	2026-01-19 06:41:43.297	2026-01-26 03:28:13.362	global	Huỳnh Thị Quốc Trinh	\N	0b147ee8-3e20-4ff3-b351-38c39bbf29af	active	f
ec4dc7d7-bf2e-47c3-8851-a3155f6a8bd1	chaunga@bluebolt.vn	$2a$10$RLgBtm0TbMzaxrI0/pwFDuqp1xgtj7mopPyT1UsfCru5FKiq8BU6O	Châu Nga	\N	56bf3663-05b2-4c1d-abf6-b87528361b02	2026-01-19 06:42:03.421	2026-01-26 03:29:50.057	personal	Châu Nga	\N	62aaa4b7-e684-4b1c-a4f8-5b2c8f1312ff	active	f
4f228265-d6c1-4a36-bbc5-273cce390f35	admin@bluebolt.com	$2a$10$OA2skMkheZAM5JznZO.Z0eC5Mqzv.ZZMZJsiQGSaaSN1GaK0S9pcG	Hệ thống Admin	\N	\N	2026-01-19 04:17:44.964	2026-02-03 04:04:51.669	personal	Hệ thống Admin	\N	a99cf48d-7116-40bf-89e4-6b18d0495580	active	f
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: allocation_previews allocation_previews_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.allocation_previews
    ADD CONSTRAINT allocation_previews_pkey PRIMARY KEY (id);


--
-- Name: allocation_rules allocation_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.allocation_rules
    ADD CONSTRAINT allocation_rules_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: business_units business_units_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.business_units
    ADD CONSTRAINT business_units_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: employee_levels employee_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.employee_levels
    ADD CONSTRAINT employee_levels_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: login_history login_history_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: specializations specializations_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.specializations
    ADD CONSTRAINT specializations_pkey PRIMARY KEY (id);


--
-- Name: system_sequences system_sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.system_sequences
    ADD CONSTRAINT system_sequences_pkey PRIMARY KEY (key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: transaction_attachments transaction_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transaction_attachments
    ADD CONSTRAINT transaction_attachments_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _BusinessUnitToPartner_AB_unique; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX "_BusinessUnitToPartner_AB_unique" ON public."_BusinessUnitToPartner" USING btree ("A", "B");


--
-- Name: _BusinessUnitToPartner_B_index; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE INDEX "_BusinessUnitToPartner_B_index" ON public."_BusinessUnitToPartner" USING btree ("B");


--
-- Name: allocation_rules_name_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX allocation_rules_name_key ON public.allocation_rules USING btree (name);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_table_name_record_id_idx; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE INDEX audit_logs_table_name_record_id_idx ON public.audit_logs USING btree (table_name, record_id);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: business_units_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX business_units_code_key ON public.business_units USING btree (code);


--
-- Name: business_units_name_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX business_units_name_key ON public.business_units USING btree (name);


--
-- Name: categories_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX categories_code_key ON public.categories USING btree (code);


--
-- Name: contracts_contract_number_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX contracts_contract_number_key ON public.contracts USING btree (contract_number);


--
-- Name: employee_levels_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX employee_levels_code_key ON public.employee_levels USING btree (code);


--
-- Name: employee_levels_name_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX employee_levels_name_key ON public.employee_levels USING btree (name);


--
-- Name: employees_email_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX employees_email_key ON public.employees USING btree (email);


--
-- Name: employees_employee_id_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX employees_employee_id_key ON public.employees USING btree (employee_id);


--
-- Name: notifications_unread_idx; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE INDEX notifications_unread_idx ON public.notifications USING btree (unread);


--
-- Name: notifications_user_id_idx; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id);


--
-- Name: partners_partner_id_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX partners_partner_id_key ON public.partners USING btree (partner_id);


--
-- Name: partners_tax_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX partners_tax_code_key ON public.partners USING btree (tax_code);


--
-- Name: payment_methods_name_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX payment_methods_name_key ON public.payment_methods USING btree (name);


--
-- Name: projects_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX projects_code_key ON public.projects USING btree (code);


--
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- Name: specializations_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX specializations_code_key ON public.specializations USING btree (code);


--
-- Name: specializations_name_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX specializations_name_key ON public.specializations USING btree (name);


--
-- Name: system_settings_key_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX system_settings_key_key ON public.system_settings USING btree (key);


--
-- Name: transactions_transaction_code_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX transactions_transaction_code_key ON public.transactions USING btree (transaction_code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: thuchi
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: _BusinessUnitToPartner _BusinessUnitToPartner_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public."_BusinessUnitToPartner"
    ADD CONSTRAINT "_BusinessUnitToPartner_A_fkey" FOREIGN KEY ("A") REFERENCES public.business_units(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _BusinessUnitToPartner _BusinessUnitToPartner_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public."_BusinessUnitToPartner"
    ADD CONSTRAINT "_BusinessUnitToPartner_B_fkey" FOREIGN KEY ("B") REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: allocation_previews allocation_previews_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.allocation_previews
    ADD CONSTRAINT allocation_previews_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: bank_accounts bank_accounts_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: contracts contracts_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: employees employees_business_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES public.business_units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: employees employees_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.employee_levels(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: employees employees_specialization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_specialization_id_fkey FOREIGN KEY (specialization_id) REFERENCES public.specializations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: login_history login_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.login_history
    ADD CONSTRAINT login_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: partners partners_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transaction_attachments transaction_attachments_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transaction_attachments
    ADD CONSTRAINT transaction_attachments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: transactions transactions_allocation_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_allocation_rule_id_fkey FOREIGN KEY (allocation_rule_id) REFERENCES public.allocation_rules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_business_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES public.business_units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: transactions transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_payment_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: transactions transactions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_bu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_bu_id_fkey FOREIGN KEY (bu_id) REFERENCES public.business_units(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: thuchi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: thuchi
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

