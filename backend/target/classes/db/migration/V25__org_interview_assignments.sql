CREATE TABLE IF NOT EXISTS org_interview_assignments (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    org_class_id UUID,
    interview_id UUID NOT NULL,
    credit_cost INTEGER DEFAULT 5,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_oia_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_oia_org_class FOREIGN KEY (org_class_id) REFERENCES org_classes(id) ON DELETE SET NULL,
    CONSTRAINT fk_oia_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);
