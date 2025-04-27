import { Picker } from '@react-native-picker/picker'
import React, { FC, useEffect, useState } from 'react'
import { Alert, StyleSheet, TextInput, View, useColorScheme } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { AppButton } from '../../components/ui/AppButton'
import { useAppDispatch, useAppSelector } from '../../src/hooks/hook'
import { COLORS, SIZES } from '../../constants'
import { creditsAPI } from '../../src/api/credits-api'
import { AppText } from '../../components/ui/AppText'
import AsyncStorage from '@react-native-async-storage/async-storage'

const saveLastDatabase = async (dbName: string) => {
    try {
        console.log('Сохранение последней базы данных:', dbName)
        await AsyncStorage.setItem('LAST_DB_KEY', dbName)
    } catch (error) {
        console.error('Ошибка при сохранении последней базы данных:', error)
    }
}

const ServicesBD: FC = () => {
    const [dbName, setDbName] = useState('')
    const [databases, setDatabases] = useState<string[]>([])
    const [selectedDb, setSelectedDb] = useState<string>('')
    console.log('dbs', databases)
    console.log('selectedDb', selectedDb)
    const deleteDatabaseHandler = async () => {
        creditsAPI
            .deleteDatabase(selectedDb)
            .then(async () => {
                Alert.alert('Успех', `База данных ${selectedDb} успешно удалена!`)
                // Путь к каталогу баз данных на устройстве Android
                const dbDirectory = `${FileSystem.documentDirectory}SQLite`

                // Получение списка файлов в каталоге баз данных
                const files = await FileSystem.readDirectoryAsync(dbDirectory)
                setDatabases(files)
                if (files.length > 0) {
                    setSelectedDb(files[0])
                    saveLastDatabase(selectedDb)
                }
            })
            .catch((error) => Alert.alert('Ошибка', 'Не удалось удалить базу данных: ' + error))
    }

    const showDatabases = async () => {
        try {
            // Путь к каталогу баз данных на устройстве Android
            const dbDirectory = `${FileSystem.documentDirectory}SQLite`

            // Получение списка файлов в каталоге баз данных
            const files = await FileSystem.readDirectoryAsync(dbDirectory)
            console.log('files[0]', files[0])
            // Создание сообщения для Alert с перечислением всех файлов баз данных
            const message = files.length ? files.join('\n') : 'Нет баз данных'

            // Отображение списка файлов баз данных в Alert
            Alert.alert('Базы данных SQLite', message)
            return files
        } catch (error) {
            console.error('Ошибка при получении списка баз данных:', error)
            Alert.alert('Ошибка', 'Не удалось получить список баз данных')
        }
    }

    const loadLastDatabase = async () => {
        try {
            const lastDb = await AsyncStorage.getItem('LAST_DB_KEY')
            if (lastDb && lastDb !== undefined) {
                console.log('selectedDb_1', selectedDb + '!')
                setSelectedDb(lastDb)
            }
        } catch (error) {
            console.error('Ошибка при загрузке последней базы данных:', error)
        }
    }

    const loadDatabases = async () => {
        const dbs = (await showDatabases()) as string[]
        console.log('dbs_0', dbs[0])
        if (dbs.length > 0 && dbs[0] !== 'undefined') {
            console.log('dbs_1', databases + '!')
            setDatabases(dbs)
        }
        console.log('dbs_2', databases)
        // if (dbs.length > 0 ) {
        //     setSelectedDb(dbs[dbs.length - 1])
        // }
    }

    const createDatabase = async (dbName: string) => {
        if (dbName.trim() === '') {
            Alert.alert('Ошибка', 'Введите имя базы данных')
            return
        }
        creditsAPI.createDatabase(dbName)
        //.then(() => Alert.alert(`Успех', 'База данных ${dbName}.db успешно создана`))
        //.catch((error) =>
        //    Alert.alert('Ошибка', `Не удалось создать базу данных ${dbName}.db: ` + error)
        //)
    }

    useEffect(() => {
        loadDatabases()
        loadLastDatabase()
    }, [])

    const colorScheme = useColorScheme()
    const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle = colorScheme === 'light' ? styles.lightContainer : styles.darkContainer

    return (
        <View>
            {databases.length > 0 && (
                <Picker
                    selectedValue={selectedDb}
                    style={{
                        height: 50,
                        ...themeContainerStyle,
                        ...themeTextStyle,
                    }}
                    onValueChange={(itemValue) => {
                        setSelectedDb(itemValue)
                        saveLastDatabase(itemValue)
                    }}
                >
                    {databases.map((db, index) => (
                        <Picker.Item key={index} label={db} value={db} />
                    ))}
                </Picker>
            )}
            {selectedDb && (
                <View style={styles.buttons}>
                    <AppText style={{ ...styles.text, ...themeTextStyle }}>
                        Выбрана база данных: {selectedDb}
                    </AppText>
                </View>
            )}
            {/* {credits.length > 0 && (
                
            )} */}
            <View style={styles.buttons}>
                <View style={styles.button}>
                    <AppButton onPress={deleteDatabaseHandler} color={COLORS.DANGER_COLOR}>
                        Удалить базу данных
                    </AppButton>
                </View>
            </View>
            <View style={styles.buttons}>
                <TextInput
                    style={{ ...styles.text, ...themeTextStyle }}
                    placeholder="Введите имя новой базы данных"
                    placeholderTextColor={COLORS.DANGER_COLOR}
                    value={dbName}
                    onChangeText={setDbName}
                />
            </View>
            <View style={styles.buttons}>
                <View style={styles.button}>
                    <AppButton onPress={() => createDatabase(dbName)}>Создать базу данных</AppButton>
                </View>
            </View>
            <View style={styles.buttons}>
                <View style={styles.button}>
                    <AppButton onPress={loadDatabases}>Показать базы данных SQLite</AppButton>
                </View>
            </View>
        </View>
    )
}

export default ServicesBD

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 5,
    },
    button: {
        width: 370,
    },
    text: {
        fontSize: SIZES.large,
    },
    lightContainer: {
        backgroundColor: COLORS.MAIN_BLUE_2,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_0,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLACK_0,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})
