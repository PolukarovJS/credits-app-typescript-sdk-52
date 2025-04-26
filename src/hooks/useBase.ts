import { useEffect, useState } from 'react'
import { creditsAPI } from '../api/credits-api'

export function useDataBase(): [boolean, Error | null, () => void] {
    const [isLoadDB, setIsLoadDB] = useState(false)
    const [errorDB, setErrorDB] = useState<Error | null>(null)

    useEffect(() => {
        async function prepare() {
            // Если БД не существует, то создаем её
            creditsAPI
                .init()
                //.then(() => {
                //    console.log('Database loaded!')
                //    setIsLoadDB(true)
                //})
                //.catch(setErrorDB)
            // await new Promise((resolve) => setTimeout(resolve, 5000))
        }
        prepare()
    }, [])
    const deleteBD = async () => {
        // Для удаления БД
        creditsAPI.deleteCredits()
    }
    return [isLoadDB, errorDB, deleteBD]
}
