import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import AsyncStorage from '@react-native-async-storage/async-storage'

const initialState = {
    dbName: 'credit.db',
    loading: false,
    error: '',
}

// Сохранение имени активной базы данных в LocalStorage
export const saveDatabasePath = async (dbName: string) => {
    try {
        await AsyncStorage.setItem('databaseName', dbName)
    } catch (error) {
        console.error('Error saving database path to LocalStorage', error)
    }
}

// Асинхронное действие для загрузки имени активной базы данных
export const loadDatabaseName = createAsyncThunk('database/loadPath', async (_: void, thunkApi) => {
    try {
        const dbName = await AsyncStorage.getItem('databaseName')
        if (dbName) {
            return dbName
        } else {
            throw new Error('Database path not found in LocalStorage')
        }
    } catch (error) {
        console.error('Error loading database path from LocalStorage', error)
        throw thunkApi.rejectWithValue('Не удалось загрузить кредиты!')
    }
})

// Redux slice для базы данных
export const databaseSlice = createSlice({
    name: 'database',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadDatabaseName.pending, (state) => {
                state.loading = true
            })
            .addCase(loadDatabaseName.fulfilled, (state, action: PayloadAction<string>) => {
                state.dbName = action.payload
                state.loading = false
            })
            .addCase(loadDatabaseName.rejected.type, (state, action: PayloadAction<string>) => {
                state.error = action.payload
                state.loading = false
            })
    },
})

export default databaseSlice.reducer
