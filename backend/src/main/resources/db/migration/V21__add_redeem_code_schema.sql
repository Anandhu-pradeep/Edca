CREATE TABLE redeem_codes (
    id UUID PRIMARY KEY,
    code_hash VARCHAR(255) NOT NULL UNIQUE,
    credits BIGINT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_redemptions INT,
    redemption_count INT NOT NULL DEFAULT 0,
    per_user_limit INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE redeem_code_redemptions (
    id UUID PRIMARY KEY,
    redeem_code_id UUID NOT NULL REFERENCES redeem_codes(id),
    user_id UUID NOT NULL REFERENCES users(id),
    credits_granted BIGINT NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_redeem_codes_hash ON redeem_codes(code_hash);
CREATE INDEX idx_redeem_codes_status ON redeem_codes(status);
CREATE INDEX idx_redeem_codes_expires_at ON redeem_codes(expires_at);
CREATE INDEX idx_redeem_code_redemptions_composite ON redeem_code_redemptions(redeem_code_id, user_id);
