import Database from 'better-sqlite3';
import path from 'path';

export interface EmailLogEntry {
  id?: number;
  to: string;
  subject: string;
  html: string;
  timestamp: string;
  status: 'logged' | 'sent';
}

class EmailLogDatabase {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), 'email-logs.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create the email_logs table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        to_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        html TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'logged'
      )
    `);
  }

  /**
   * Log an email that would have been sent
   */
  logEmail(emailData: Omit<EmailLogEntry, 'id' | 'timestamp' | 'status'>): void {
    const stmt = this.db.prepare(`
      INSERT INTO email_logs (to_email, subject, html, timestamp, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      emailData.to,
      emailData.subject,
      emailData.html,
      new Date().toISOString(),
      'logged'
    );
  }

  /**
   * Mark an email as sent (when SEND_ACTUAL_EMAIL is true)
   */
  markEmailAsSent(to: string, subject: string): void {
    const stmt = this.db.prepare(`
      UPDATE email_logs 
      SET status = 'sent' 
      WHERE to_email = ? AND subject = ? AND status = 'logged'
      ORDER BY timestamp DESC 
      LIMIT 1
    `);
    
    stmt.run(to, subject);
  }

  /**
   * Get all email logs
   */
  getAllLogs(): EmailLogEntry[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        to_email as to,
        subject,
        html,
        timestamp,
        status
      FROM email_logs 
      ORDER BY timestamp DESC
    `);
    
    return stmt.all() as EmailLogEntry[];
  }

  /**
   * Get logs by status
   */
  getLogsByStatus(status: 'logged' | 'sent'): EmailLogEntry[] {
    const stmt = this.db.prepare(`
      SELECT 
        id,
        to_email as to,
        subject,
        html,
        timestamp,
        status
      FROM email_logs 
      WHERE status = ?
      ORDER BY timestamp DESC
    `);
    
    return stmt.all(status) as EmailLogEntry[];
  }

  /**
   * Clear old logs (older than specified days)
   */
  clearOldLogs(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const stmt = this.db.prepare(`
      DELETE FROM email_logs 
      WHERE timestamp < ?
    `);
    
    const result = stmt.run(cutoffDate.toISOString());
    return result.changes;
  }

  /**
   * Close the database connection
   */
  close(): void {
    this.db.close();
  }
}

// Singleton instance
let emailLogDb: EmailLogDatabase | null = null;

export function getEmailLogDatabase(): EmailLogDatabase {
  if (!emailLogDb) {
    emailLogDb = new EmailLogDatabase();
  }
  return emailLogDb;
}
