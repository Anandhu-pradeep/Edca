CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY,
    room_id VARCHAR(255),
    interviewer_id UUID REFERENCES users(id),
    interviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    grade VARCHAR(20),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interviews_interviewee_id ON interviews(interviewee_id);
CREATE INDEX idx_interviews_room_id ON interviews(room_id);
