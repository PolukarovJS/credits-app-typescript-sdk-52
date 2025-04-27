import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system'
import { HolidayType, CreditType, RepaymentType } from '../types'

// Создаем подключение к БД и храним его как синглтон
const db = SQLite.openDatabaseSync('credit.db')

export class creditsAPI {
    static createDatabase(db_name: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const dbs = SQLite.openDatabaseSync(db_name)

                // Создание таблиц и индексов последовательно
                dbs.execSync(`
                    CREATE TABLE IF NOT EXISTS credits (
                        id INTEGER PRIMARY KEY NOT NULL,
                        date TEXT,
                        dayOfPay TEXT,
                        sum TEXT,
                        term TEXT,
                        percents TEXT
                    );
                    CREATE INDEX IF NOT EXISTS idx_credits_id ON credits(id);
                    
                    CREATE TABLE IF NOT EXISTS repayments (
                        id INTEGER PRIMARY KEY NOT NULL,
                        date TEXT,
                        pay TEXT,
                        type TEXT,
                        id_credit INTEGER NOT NULL,
                        FOREIGN KEY (id_credit) REFERENCES credits (id)
                    );
                    CREATE INDEX IF NOT EXISTS idx_repayments_id_credit ON repayments(id_credit);
                    
                    CREATE TABLE IF NOT EXISTS holidays (
                        id INTEGER PRIMARY KEY NOT NULL,
                        date TEXT,
                        number_pay TEXT,
                        id_credit INTEGER NOT NULL,
                        FOREIGN KEY (id_credit) REFERENCES credits (id)
                    );
                    CREATE INDEX IF NOT EXISTS idx_holidays_id_credit ON holidays(id_credit);
                `)

                console.log(`База данных ${db_name} успешно создана с таблицами и индексами`)
                resolve()
            } catch (error) {
                console.error('Ошибка при создании БД:', error)
                reject(error)
            }
        })
    }

    static deleteDatabase(db_name: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            const dbPath = `${FileSystem.documentDirectory}SQLite/${db_name}`
            try {
                await FileSystem.deleteAsync(dbPath, { idempotent: true })
                console.log(`База данных ${db_name} успешно удалена`)
                resolve()
            } catch (error) {
                console.error(`Ошибка при удалении БД ${db_name}:`, error)
                reject(error)
            }
        })
    }

    static init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // Создание таблиц и индексов последовательно
                db.execSync(`
                    CREATE TABLE IF NOT EXISTS credits (
                        id INTEGER PRIMARY KEY NOT NULL,
                        date TEXT,
                        dayOfPay TEXT,
                        sum TEXT,
                        term TEXT,
                        percents TEXT
                    );
                    CREATE INDEX IF NOT EXISTS idx_credits_id ON credits(id);
                    
                    CREATE TABLE IF NOT EXISTS repayments (
                        id INTEGER PRIMARY KEY NOT NULL,
                        date TEXT,
                        pay TEXT,
                        type TEXT,
                        id_credit INTEGER NOT NULL,
                        FOREIGN KEY (id_credit) REFERENCES credits (id)
                    );
                    CREATE INDEX IF NOT EXISTS idx_repayments_id_credit ON repayments(id_credit);
                    
                    CREATE TABLE IF NOT EXISTS holidays (
                        id INTEGER PRIMARY KEY NOT NULL,
                        date TEXT,
                        number_pay TEXT,
                        id_credit INTEGER NOT NULL,
                        FOREIGN KEY (id_credit) REFERENCES credits (id)
                    );
                    CREATE INDEX IF NOT EXISTS idx_holidays_id_credit ON holidays(id_credit);
                `)

                console.log('БД Credit.db успешно инициализирована с таблицами и индексами')
                resolve()
            } catch (error) {
                console.error('Ошибка при инициализации БД:', error)
                reject(error)
            }
        })
    }

    static migrateIndexes(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                db.execSync(`
                    CREATE INDEX IF NOT EXISTS idx_credits_id ON credits(id);
                    CREATE INDEX IF NOT EXISTS idx_repayments_id_credit ON repayments(id_credit);
                    CREATE INDEX IF NOT EXISTS idx_holidays_id_credit ON holidays(id_credit);
                `)
                console.log('Индексы успешно созданы или уже существуют')
                resolve()
            } catch (error) {
                console.error('Ошибка при создании индексов:', error)
                reject(error)
            }
        })
    }

    static deleteCredits(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                db.execSync(`
                    DROP TABLE IF EXISTS holidays;
                    DROP TABLE IF EXISTS repayments;
                    DROP TABLE IF EXISTS credits;
                `)
                console.log('Все таблицы успешно удалены')
                resolve()
            } catch (error) {
                console.error('Ошибка при удалении таблиц в БД:', error)
                reject(error)
            }
        })
    }

    static getCredits(): Promise<CreditType[]> {
        return new Promise<CreditType[]>((resolve, reject) => {
            try {
                const result = db.getAllSync<CreditType>('SELECT * FROM credits')
                console.log(`Получено ${result.length} кредитов из БД`)
                resolve(result)
            } catch (error) {
                console.error('Ошибка при получении кредитов:', error)
                reject(error)
            }
        })
    }

    static getRepayments(): Promise<RepaymentType[]> {
        return new Promise<RepaymentType[]>((resolve, reject) => {
            try {
                const result = db.getAllSync<RepaymentType>('SELECT * FROM repayments')
                console.log(`Получено ${result.length} платежей из БД`)
                resolve(result)
            } catch (error) {
                console.error('Ошибка при получении платежей:', error)
                reject(error)
            }
        })
    }

    static getHolidays(): Promise<HolidayType[]> {
        return new Promise<HolidayType[]>((resolve, reject) => {
            try {
                const result = db.getAllSync<HolidayType>('SELECT * FROM holidays')
                console.log(`Получено ${result.length} каникул из БД`)
                resolve(result)
            } catch (error) {
                console.error('Ошибка при получении каникул:', error)
                reject(error)
            }
        })
    }

    static createCredit(
        date: string,
        dayOfPay: string,
        sum: string,
        term: string,
        percents: string
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const result = db.runSync(
                    `INSERT INTO credits (date, dayOfPay, sum, term, percents) VALUES (?, ?, ?, ?, ?)`,
                    [date, dayOfPay, sum, term, percents]
                )
                console.log(`Создан кредит с ID: ${result.lastInsertRowId}`)
                resolve(Number(result.lastInsertRowId))
            } catch (error) {
                console.error('Ошибка при создании кредита:', error)
                reject(error)
            }
        })
    }

    static updateCredit(credit: CreditType): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // Обходим глюк undefine credit.date.toISOString()
                let dateString = credit.date.toString()
                let date = new Date(dateString)

                db.runSync(
                    'UPDATE credits SET date = ?, dayOfPay = ?, sum = ?, term = ?, percents = ? WHERE id = ?',
                    [
                        date.toISOString(),
                        credit.dayOfPay,
                        credit.sum,
                        credit.term,
                        credit.percents,
                        credit.id,
                    ]
                )
                console.log(`Обновлен кредит с ID: ${credit.id}`)
                resolve()
            } catch (error) {
                console.error('Ошибка при обновлении кредита:', error)
                reject(error)
            }
        })
    }

    static deleteCredit(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                // Выполняем удаление в блоке try-catch для имитации транзакции
                db.runSync('DELETE FROM holidays WHERE id_credit = ?', [id])
                db.runSync('DELETE FROM repayments WHERE id_credit = ?', [id])
                db.runSync('DELETE FROM credits WHERE id = ?', [id])
                console.log(`Удален кредит с ID: ${id}`)
                resolve()
            } catch (error) {
                console.error(`Ошибка при удалении кредита с ID: ${id}:`, error)
                reject(error)
            }
        })
    }

    static createRepayment(
        id_credit: number,
        period: string,
        pay: string,
        type: string
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const result = db.runSync(
                    `INSERT INTO repayments (date, pay, id_credit, type) VALUES (?, ?, ?, ?)`,
                    [period, pay, id_credit, type]
                )
                console.log(`Создан платеж с ID: ${result.lastInsertRowId}`)
                resolve(Number(result.lastInsertRowId))
            } catch (error) {
                console.error('Ошибка при создании платежа:', error)
                reject(error)
            }
        })
    }

    static deleteRepayment(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                db.runSync('DELETE FROM repayments WHERE id = ?', [id])
                console.log(`Удален платеж с ID: ${id}`)
                resolve()
            } catch (error) {
                console.error('Ошибка при удалении платежа:', error)
                reject(error)
            }
        })
    }

    static createHoliday(date: string, number_pay: string, id_credit: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const result = db.runSync(
                    `INSERT INTO holidays (date, number_pay, id_credit) VALUES (?, ?, ?)`,
                    [date, number_pay, id_credit]
                )
                console.log(`Создан выходной с ID: ${result.lastInsertRowId}`)
                resolve(Number(result.lastInsertRowId))
            } catch (error) {
                console.error('Ошибка при создании выходного:', error)
                reject(error)
            }
        })
    }

    static deleteHolidays(id: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                db.runSync('DELETE FROM holidays WHERE id = ?', [id])
                console.log(`Удален выходной с ID: ${id}`)
                resolve()
            } catch (error) {
                console.error('Ошибка при удалении выходного:', error)
                reject(error)
            }
        })
    }
}
