CREATE TABLE IF NOT EXISTS user_themes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    banner TEXT,
    custom_theme_bg TEXT,
    custom_text_color VARCHAR(255),
    CONSTRAINT fk_user_theme_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
