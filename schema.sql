

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(255) NULL,
);

CREATE TABLE modules (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Questions table
CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    question_text TEXT NOT NULL,
    answer TEXT NOT NULL,

    FOREIGN KEY (module_id)
        REFERENCES modules(module_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);



CREATE TABLE options (
    option_id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL,

    FOREIGN KEY (question_id)
        REFERENCES questions(question_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);