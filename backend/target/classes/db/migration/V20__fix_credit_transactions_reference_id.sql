-- V20__fix_credit_transactions_reference_id.sql

ALTER TABLE credit_transactions DROP CONSTRAINT fk_transaction_payment;
ALTER TABLE credit_transactions RENAME COLUMN payment_id TO reference_id;
