-- V18__fix_payments_id_type.sql

ALTER TABLE payments DROP COLUMN id CASCADE;
ALTER TABLE payments ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();

ALTER TABLE wallets DROP COLUMN id CASCADE;
ALTER TABLE wallets ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();

ALTER TABLE credit_transactions DROP COLUMN id CASCADE;
ALTER TABLE credit_transactions ADD COLUMN id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
