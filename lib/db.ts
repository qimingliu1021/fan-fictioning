import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "fan-fictioning.db");

let db: Database.Database | null = null;

function generateUid(): string {
    return crypto.randomUUID();
}

function getDb(): Database.Database {
    if (!db) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
        db = new Database(DB_PATH);
        db.pragma("journal_mode = WAL");

        db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

        db.exec(`
      CREATE TABLE IF NOT EXISTS comics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        character TEXT NOT NULL,
        movie TEXT NOT NULL,
        user_prompt TEXT NOT NULL,
        script TEXT NOT NULL,
        image_base64 TEXT NOT NULL,
        youtube_url TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (username) REFERENCES users(username)
      )
    `);

        db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_url TEXT NOT NULL,
        name TEXT NOT NULL,
        movie TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

        db.exec(`
      CREATE INDEX IF NOT EXISTS idx_characters_youtube_url ON characters(youtube_url)
    `);

        db.exec(`
      CREATE INDEX IF NOT EXISTS idx_comics_uid ON comics(uid)
    `);

        // Seed mock users if none exist
        const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
        if (userCount.count === 0) {
            const insertUser = db.prepare(`
        INSERT INTO users (username, display_name, avatar_url) VALUES (?, ?, ?)
      `);
            const seedUsers = db.transaction(() => {
                insertUser.run("moviebuff42", "Alex Chen", null);
                insertUser.run("comicfanatic", "Jordan Lee", null);
                insertUser.run("storyspin", "Sam Rivera", null);
                insertUser.run("plottwist_pro", "Casey Morgan", null);
                insertUser.run("cinemanerd", "Riley Park", null);
            });
            seedUsers();
        }
    }
    return db;
}

// --- Users ---

export interface User {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
    created_at: string;
}

export function getUsers(): User[] {
    const db = getDb();
    return db.prepare("SELECT * FROM users").all() as User[];
}

export function getUserById(id: number): User | undefined {
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function getUserByUsername(username: string): User | undefined {
    const db = getDb();
    return db.prepare("SELECT * FROM users WHERE username = ?").get(username) as User | undefined;
}

export function getRandomUser(): User {
    const db = getDb();
    return db.prepare("SELECT * FROM users ORDER BY RANDOM() LIMIT 1").get() as User;
}

// --- Comics ---

export interface Comic {
    id: number;
    uid: string;
    username: string;
    character: string;
    movie: string;
    user_prompt: string;
    script: string;
    image_base64: string;
    youtube_url: string | null;
    created_at: string;
}

export interface ComicWithUser extends Comic {
    username: string;
    display_name: string;
    avatar_url: string | null;
}

export function saveComic(data: {
    username: string;
    character: string;
    movie: string;
    userPrompt: string;
    script: string;
    imageBase64: string;
    youtubeUrl?: string;
}): Comic {
    const db = getDb();
    const uid = generateUid();
    const stmt = db.prepare(`
    INSERT INTO comics (uid, username, character, movie, user_prompt, script, image_base64, youtube_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const result = stmt.run(
        uid,
        data.username,
        data.character,
        data.movie,
        data.userPrompt,
        data.script,
        data.imageBase64,
        data.youtubeUrl ?? null
    );

    return getComic(Number(result.lastInsertRowid))!;
}

export function getComic(id: number): Comic | undefined {
    const db = getDb();
    return db.prepare("SELECT * FROM comics WHERE id = ?").get(id) as Comic | undefined;
}

export function getLatestComics(limit: number = 20, beforeUid?: string): ComicWithUser[] {
    const db = getDb();

    if (beforeUid) {
        return db.prepare(`
      SELECT c.*, u.display_name, u.avatar_url
      FROM comics c
      JOIN users u ON c.username = u.username
      WHERE c.created_at <= (SELECT created_at FROM comics WHERE uid = ?)
        AND c.uid != ?
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT ?
    `).all(beforeUid, beforeUid, limit) as ComicWithUser[];
    }

    return db.prepare(`
    SELECT c.*, u.display_name, u.avatar_url
    FROM comics c
    JOIN users u ON c.username = u.username
    ORDER BY c.created_at DESC, c.id DESC
    LIMIT ?
  `).all(limit) as ComicWithUser[];
}

export function getComicsByUsername(username: string): ComicWithUser[] {
    const db = getDb();
    return db.prepare(`
    SELECT c.*, u.display_name, u.avatar_url
    FROM comics c
    JOIN users u ON c.username = u.username
    WHERE c.username = ?
    ORDER BY c.created_at DESC
  `).all(username) as ComicWithUser[];
}

// --- Characters ---

export interface CharacterRecord {
    id: number;
    youtube_url: string;
    name: string;
    movie: string;
    description: string;
    created_at: string;
}

export function getCharactersByYoutubeUrl(
    youtubeUrl: string
): CharacterRecord[] {
    const db = getDb();
    const stmt = db.prepare(
        "SELECT * FROM characters WHERE youtube_url = ?"
    );
    return stmt.all(youtubeUrl) as CharacterRecord[];
}

export function saveCharacters(
    youtubeUrl: string,
    characters: Array<{ name: string; movie: string; description: string }>
): CharacterRecord[] {
    const db = getDb();
    const stmt = db.prepare(`
    INSERT INTO characters (youtube_url, name, movie, description)
    VALUES (?, ?, ?, ?)
  `);

    const insertMany = db.transaction(
        (chars: Array<{ name: string; movie: string; description: string }>) => {
            for (const char of chars) {
                stmt.run(youtubeUrl, char.name, char.movie, char.description);
            }
        }
    );

    insertMany(characters);
    return getCharactersByYoutubeUrl(youtubeUrl);
}
