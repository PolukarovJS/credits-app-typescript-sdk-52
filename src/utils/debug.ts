// src/utils/debug.ts
// Вспомогательные функции для отладки
import { creditsAPI } from '../api/credits-api';

export const logAppState = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    if (data) {
        try {
            console.log(JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Невозможно сериализовать данные:', data);
        }
    }
};

export const errorHandler = (error: any, context: string) => {
    console.error(`Ошибка в ${context}:`, error);
    if (error instanceof Error) {
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
    }
};

export const checkDatabaseTables = async () => {
    try {
        const credits = await creditsAPI.getCredits();
        console.log('Количество записей в таблице credits:', credits.length);
        
        const repayments = await creditsAPI.getRepayments();
        console.log('Количество записей в таблице repayments:', repayments.length);
        
        const holidays = await creditsAPI.getHolidays();
        console.log('Количество записей в таблице holidays:', holidays.length);
        
        return {
            credits,
            repayments,
            holidays
        };
    } catch (error) {
        console.error('Ошибка при проверке таблиц базы данных:', error);
        throw error;
    }
};