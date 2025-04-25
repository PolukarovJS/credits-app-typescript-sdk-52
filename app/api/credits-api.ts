import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'
import { HolidayType, CreditType, RepaymentType } from '../types'

const db = SQLite.openDatabaseSync('credit.db')

export class creditsAPI {
    static createDatabase(db_name: string) {
        const dbs = SQLite.openDatabaseSync(db_name)
        
        // Создание таблицы credits
        dbs.execSync(`
            CREATE TABLE IF NOT EXISTS credits (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT,
                dayOfPay TEXT,
                sum TEXT,
                term TEXT,
                percents TEXT
            )
        `);
        console.log('Таблица credits создана в БД: ' + `${db_name}`);
        
        // Создание таблицы repayments
        dbs.execSync(`
            CREATE TABLE IF NOT EXISTS repayments (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT,
                pay TEXT,
                type TEXT,
                id_credit INTEGER NOT NULL,
                FOREIGN KEY (id_credit) REFERENCES credits (id)
            )
        `);
        console.log('Таблица repayments создана в БД: ' + `${db_name}`);
        
        // Создание таблицы holidays
        dbs.execSync(`
            CREATE TABLE IF NOT EXISTS holidays (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT,
                number_pay TEXT,
                id_credit INTEGER NOT NULL,
                FOREIGN KEY (id_credit) REFERENCES credits (id)
            )
        `);
        console.log('Таблица holidays создана в БД: ' + `${db_name}`);
    }

    // Другие методы нужно обновить аналогичным образом
    static deleteDatabase(db_name: string) {
        return new Promise<void>(async (resolve, reject) => {
            const dbPath = `${FileSystem.documentDirectory}SQLite/${db_name}`
            try {
                await FileSystem.deleteAsync(dbPath, { idempotent: true })
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }

    static init() {
        // Создание таблицы credits
        db.execSync(`
            CREATE TABLE IF NOT EXISTS credits (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT,
                dayOfPay TEXT,
                sum TEXT,
                term TEXT,
                percents TEXT
            )
        `);
        console.log('Таблица credits создана в БД Credit.db функцией init()');
        
        // Создание таблицы repayments
        db.execSync(`
            CREATE TABLE IF NOT EXISTS repayments (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT,
                pay TEXT,
                type TEXT,
                id_credit INTEGER NOT NULL,
                FOREIGN KEY (id_credit) REFERENCES credits (id)
            )
        `);
        console.log('Таблица repayments создана в БД Credit.db функцией init()');
        
        // Создание таблицы holidays
        db.execSync(`
            CREATE TABLE IF NOT EXISTS holidays (
                id INTEGER PRIMARY KEY NOT NULL,
                date TEXT,
                number_pay TEXT,
                id_credit INTEGER NOT NULL,
                FOREIGN KEY (id_credit) REFERENCES credits (id)
            )
        `);
        console.log('Таблица holidays создана в БД Credit.db функцией init()');
    }

    static deleteCredits() {
        // Удаление таблиц
        db.execSync('DROP TABLE IF EXISTS credits');
        console.log('Таблица credits удалена');
        
        db.execSync('DROP TABLE IF EXISTS repayments');
        console.log('Таблица repayments удалена');
        
        db.execSync('DROP TABLE IF EXISTS holidays');
        console.log('Таблица holidays удалена');
    }

    static getCredits(): Promise<CreditType[]> {
        const result = db.getAllSync<CreditType>('SELECT * FROM credits');
        return Promise.resolve(result);
    }

    static getRepayments(): Promise<RepaymentType[]> {
        const result = db.getAllSync<RepaymentType>('SELECT * FROM repayments');
        return Promise.resolve(result);
    }

    static getHolidays(): Promise<HolidayType[]> {
        const result = db.getAllSync<HolidayType>('SELECT * FROM holidays');
        return Promise.resolve(result);
    }

    static createCredit(date: string, dayOfPay: string, sum: string, term: string, percents: string) {
        const result = db.runSync(
            `INSERT INTO credits (date, dayOfPay, sum, term, percents) VALUES (?, ? ,?, ?, ?)`,
            [date, dayOfPay, sum, term, percents]
        );
        return Promise.resolve(result.lastInsertRowId);
    }

    static updateCredit(credit: CreditType) {
        // Обходим глюк undefine credit.date.toISOString()
        let dateString = credit.date.toString();
        let date = new Date(dateString);
        
        db.runSync(
            'UPDATE credits SET date = ?, dayOfPay = ?, sum = ?, term = ?, percents = ? WHERE id = ?',
            [date.toISOString(), credit.dayOfPay, credit.sum, credit.term, credit.percents, credit.id]
        );
        return Promise.resolve();
    }

    static deleteCredit(id: number) {
        db.runSync('DELETE FROM credits WHERE id = ?', [id]);
        return Promise.resolve();
    }

    static createRepayment(id_credit: number, period: string, pay: string, type: string) {
        const result = db.runSync(
            `INSERT INTO repayments (date, pay, id_credit, type) VALUES (?, ? ,?, ?)`,
            [period, pay, id_credit, type]
        );
        return Promise.resolve(result.lastInsertRowId);
    }

    static deleteRepayment(id: number) {
        db.runSync('DELETE FROM repayments WHERE id = ?', [id]);
        return Promise.resolve();
    }

    static createHoliday(date: string, number_pay: string, id_credit: number) {
        const result = db.runSync(
            `INSERT INTO holidays (date, number_pay, id_credit) VALUES (?, ? ,?)`,
            [date, number_pay, id_credit]
        );
        return Promise.resolve(result.lastInsertRowId);
    }

    static deleteHolidays(id: number) {
        db.runSync('DELETE FROM holidays WHERE id = ?', [id]);
        return Promise.resolve();
    }
}