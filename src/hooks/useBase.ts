import { useEffect, useState } from 'react'
import { creditsAPI } from '../api/credits-api'

export function useDataBase(): [boolean, Error | null, () => void] {
    const [isLoadDB, setIsLoadDB] = useState(false)
    const [errorDB, setErrorDB] = useState<Error | null>(null)

    useEffect(() => {
        async function prepare() {
            try {
                console.log('Начало инициализации базы данных в useDataBase')
                // Если БД не существует, то создаем её
                await creditsAPI.init()
                await creditsAPI.migrateIndexes()
                console.log('БД успешно инициализирована в useDataBase')
                setIsLoadDB(true) // Это было закомментировано, из-за чего isLoadDB всегда оставался false
                console.log('isLoadDB установлен в true')
            } catch (error) {
                console.error('Ошибка при инициализации БД:', error)
                setErrorDB(error instanceof Error ? error : new Error('Неизвестная ошибка'))
            }
        }
        prepare()
    }, [])

    const deleteBD = async () => {
        // Для удаления БД
        try {
            await creditsAPI.deleteCredits()
            console.log('База данных успешно удалена')
        } catch (error) {
            console.error('Ошибка при удалении БД:', error)
            setErrorDB(error instanceof Error ? error : new Error('Ошибка при удалении БД'))
        }
    }

    return [isLoadDB, errorDB, deleteBD]
}
