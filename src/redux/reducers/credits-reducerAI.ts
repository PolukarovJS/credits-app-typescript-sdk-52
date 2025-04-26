import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Alert } from 'react-native'
import { creditsAPI } from '../../api/credits-api'
import { HolidayType, CreditType, RepaymentType, TypeRepayment } from '../../../app/types'
import { AppThunk } from '../redux-store'
import AsyncStorage from '@react-native-async-storage/async-storage'

const initialState = {
    credits: [] as CreditType[],
    tempCredit: {
        id: Date.now(),
        sum: 1500000,
        term: 84,
        date: new Date(Date.now()),
        dayOfPay: new Date(Date.now()).getDate(),
        percents: 12,
        repayments: [],
        holidays: [],
    } as CreditType,
    isLoading: true,
    error: '',
    selectedCredit: -1,
    lastDataBaseName: 'credit.db',
}

export const lastDataBaseNameFunc = async () => {
    let lastDb = (await AsyncStorage.getItem('LAST_DB_KEY')) as string
    console.log('lastDb {credit-reducer.ts, lastDataBaseNameFunc}: ' + lastDb)
    if (!lastDb || lastDb === 'undefined') {
        lastDb = 'credit.db'
        console.log('lastDb {credit-reducer.ts, lastDataBaseNameFunc, if}: ' + lastDb)
        // await creditsAPI.init(lastDb)
    }
    return lastDb
}

export const getCreditsAsync = createAsyncThunk('credits/getCredits', async (_: void, thunkApi) => {
    try {
        const lastDb = await lastDataBaseNameFunc()
        console.log('lastDb {credit-reducer.ts, getCreditsAsync}: ' + lastDb)
        console.log('Fetching credits...')

        const credits = (await creditsAPI.getCredits(lastDb)) as CreditType[]
        console.log('credits {credit-reducer.ts, getCreditsAsync}:' + JSON.stringify(credits))
        const repayments = (await creditsAPI.getRepayments(lastDb)) as RepaymentType[]
        console.log('repayments {credit-reducer.ts, getCreditsAsync}:' + JSON.stringify(repayments))
        const holidays = (await creditsAPI.getHolidays(lastDb)) as HolidayType[]
        console.log('holidays {credit-reducer.ts, getCreditsAsync}:' + JSON.stringify(holidays))

        credits.forEach((credit) => {
            credit.repayments = repayments.filter((repayment) => repayment.id_credit === credit.id)
            credit.holidays = holidays.filter((holiday) => holiday.id_credit === credit.id)
        })

        return credits
            .map((c) => c)
            .sort((a, b) => a.sum - b.sum)
            .reverse()
    } catch (error) {
        return thunkApi.rejectWithValue('Не удалось загрузить кредиты!')
    }
})

export const createCreditAsync = createAsyncThunk(
    'credits/createCredit',
    async (credit: CreditType, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            const creditId = (await creditsAPI.createCredit(
                lastDb,
                new Date(credit.date).toISOString(),
                credit.dayOfPay.toString(),
                credit.sum.toString(),
                credit.term.toString(),
                credit.percents.toString()
            )) as number
            Alert.alert('Добавление кредита', 'Кредит успешно добавлен!')
            return {
                ...credit,
                id: creditId,
            }
        } catch (error: any) {
            Alert.alert('Ошибка добавления кредита', error.message)
            return thunkApi.rejectWithValue('Не удалось добавить кредит!')
        }
    }
)

export const updateCreditAsync = createAsyncThunk(
    'credits/updateCredit',
    async (credit: CreditType, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            await creditsAPI.updateCredit(lastDb, credit)
            Alert.alert('Update credit', 'Credit successfully updated!')
            return credit
        } catch (error: any) {
            Alert.alert('Error apply update credit', error.message)
            return thunkApi.rejectWithValue('Не удалось обновить кредит!')
        }
    }
)

export const deleteCreditAsync = createAsyncThunk(
    'credits/deleteCredit',
    async (credit: CreditType, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            await creditsAPI.deleteCredit(lastDb, credit.id)
            if (credit.repayments) {
                for (let index = 0; index < credit.repayments.length; index++) {
                    await creditsAPI.deleteRepayment(lastDb, credit.repayments[index].id)
                }
            }
            Alert.alert('Delete credit', 'Credit successfully deleted!')
            return credit
        } catch (error: any) {
            Alert.alert('Error delete credit', error.message)
            return thunkApi.rejectWithValue('Не удалось удалить кредит!')
        }
    }
)

export interface ICreateRepaymentAsync {
    credit: CreditType
    dateOfPay: Date
    pay: number
    type: TypeRepayment
}

export const createRepaymentAsync = createAsyncThunk(
    'credits/createRepayment',
    async ({ credit, dateOfPay: period, pay, type }: ICreateRepaymentAsync, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            let repaymentId = (await creditsAPI.createRepayment(
                lastDb,
                credit.id,
                new Date(period).toISOString(),
                pay.toFixed(2),
                type.toString()
            )) as number

            let repayment: RepaymentType = {
                id: repaymentId,
                pay: pay,
                date: period,
                id_credit: credit.id,
                type: type,
            }
            Alert.alert('Добавление платежа', 'Платеж успешно добавлен!')
            return { repayment, id: credit.id }
        } catch (error: any) {
            Alert.alert('Ошибка добавления платежа', error.message)
            return thunkApi.rejectWithValue('Не удалось добавить платеж!')
        }
    }
)

export const deleteRepaymentAsync = createAsyncThunk(
    'credits/deleteRepayment',
    async (repaymentId: number, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            await creditsAPI.deleteRepayment(lastDb, repaymentId)
            Alert.alert('Удаление платежа', 'Досрочный платёж успешно удален!')
            return repaymentId
        } catch (error: any) {
            Alert.alert('Ошибка удаления платежа', error.message)
            return thunkApi.rejectWithValue('Не удалось удалить платеж!')
        }
    }
)

export interface ICreateHolidayAsync {
    credit: CreditType
    date: Date
    number_pay: number
}

export const createHolidayAsync = createAsyncThunk(
    'credits/createHoliday',
    async ({ credit, date, number_pay }: ICreateHolidayAsync, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            let holidayId = (await creditsAPI.createHoliday(
                lastDb,
                new Date(date).toISOString(),
                number_pay.toString(),
                credit.id
            )) as number

            let holiday: HolidayType = {
                id: holidayId,
                date: date,
                number_pay: number_pay,
                id_credit: credit.id,
            }

            Alert.alert('Пропуск платежа', 'Вы подключили услугу!')
            return { holiday, id: credit.id }
        } catch (error: any) {
            Alert.alert('Ошибка пропуска платежа', error.message)
            return thunkApi.rejectWithValue('Не удалось пропустить платеж!')
        }
    }
)

export const deleteHolidayAsync = createAsyncThunk(
    'credits/deleteHoliday',
    async (holidayId: number, thunkApi) => {
        try {
            const lastDb = await lastDataBaseNameFunc()
            await creditsAPI.deleteHolidays(lastDb, holidayId)
            Alert.alert('Delete holiday', 'Holiday successfully deleted!')
            return holidayId
        } catch (error: any) {
            Alert.alert('Error delete holiday', error.message)
            return thunkApi.rejectWithValue('Не удалось отключить услугу!')
        }
    }
)

export const creditsSlice = createSlice({
    name: 'credits',
    initialState,
    reducers: {
        setSelectedCreditActionCreator: (state, action: PayloadAction<number>) => {
            state.selectedCredit = action.payload
        },
        setIsLoadingActionCreator: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        setErrorActionCreator: (state, action: PayloadAction<string>) => {
            state.error = action.payload
        },
        setLastDbName: (state, action: PayloadAction<string>) => {
            state.lastDataBaseName = action.payload
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getCreditsAsync.fulfilled, (state, action) => {
            state.credits = action.payload
            state.isLoading = false
        })
        builder.addCase(getCreditsAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(createCreditAsync.fulfilled, (state, action) => {
            state.credits.push(action.payload)
            state.credits = state.credits.sort((a, b) => b.sum - a.sum)
            state.isLoading = false
        })
        builder.addCase(createCreditAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(updateCreditAsync.fulfilled, (state, action) => {
            const index = state.credits.findIndex((credit) => credit.id === action.payload.id)
            if (index !== -1) {
                state.credits[index] = action.payload
            }
        })
        builder.addCase(updateCreditAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(deleteCreditAsync.fulfilled, (state, action) => {
            state.credits = state.credits.filter((credit) => credit.id !== action.payload.id)
        })
        builder.addCase(deleteCreditAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(createRepaymentAsync.fulfilled, (state, action) => {
            const { repayment, id } = action.payload
            const credit = state.credits.find((c) => c.id === id)
            if (credit) {
                credit.repayments.push(repayment)
            }
        })
        builder.addCase(createRepaymentAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(deleteRepaymentAsync.fulfilled, (state, action) => {
            state.credits.forEach((credit) => {
                credit.repayments = credit.repayments.filter(
                    (repayment) => repayment.id !== action.payload
                )
            })
        })
        builder.addCase(deleteRepaymentAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(createHolidayAsync.fulfilled, (state, action) => {
            const { holiday, id } = action.payload
            const credit = state.credits.find((c) => c.id === id)
            if (credit) {
                credit.holidays.push(holiday)
            }
        })
        builder.addCase(createHolidayAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
        builder.addCase(deleteHolidayAsync.fulfilled, (state, action) => {
            state.credits.forEach((credit) => {
                credit.holidays = credit.holidays.filter((holiday) => holiday.id !== action.payload)
            })
        })
        builder.addCase(deleteHolidayAsync.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload as string
        })
    },
})

export const {
    setSelectedCreditActionCreator,
    setIsLoadingActionCreator,
    setErrorActionCreator,
    setLastDbName,
} = creditsSlice.actions

export default creditsSlice.reducer
