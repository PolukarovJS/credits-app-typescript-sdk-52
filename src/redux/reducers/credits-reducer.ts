import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Alert } from 'react-native'
import { creditsAPI } from '../../api/credits-api'
import { HolidayType, CreditType, RepaymentType, TypeRepayment } from '../../../src/types'
import { AppThunk } from '../redux-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SQLite from 'expo-sqlite'
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
}

export const getCreditsAsync = createAsyncThunk('credits/getCredits', async (_: void, thunkApi) => {
    try {
        const credits = (await creditsAPI.getCredits()) as CreditType[]
        console.log('credits {credit-reducer.ts, getCreditsAsync}:' + JSON.stringify(credits))
        const repayments = (await creditsAPI.getRepayments()) as RepaymentType[]
        console.log('repayments {credit-reducer.ts, getCreditsAsync}:' + JSON.stringify(repayments))
        const holidays = (await creditsAPI.getHolidays()) as HolidayType[]
        console.log('holidays {credit-reducer.ts, getCreditsAsync}:' + JSON.stringify(holidays))

        if (repayments.length > 0) {
            repayments.forEach((repayment) => {
                credits.map((credit) => {
                    if (credit.id === repayment.id_credit) {
                        if (credit.repayments) {
                            credit.repayments.push(repayment)
                        } else {
                            credit.repayments = [repayment]
                        }
                    }
                    return credit
                })
            })
        }
        if (holidays.length > 0) {
            holidays.forEach((holiday) => {
                credits.map((credit) => {
                    if (credit.id === holiday.id_credit) {
                        if (credit.holidays) {
                            credit.holidays.push(holiday)
                        } else {
                            credit.holidays = [holiday]
                        }
                    }
                    return credit
                })
            })
        }
        credits.map((credit) => {
            if (credit.repayments) {
                return credit
            } else
                return {
                    date: credit.date,
                    dayOfPay: credit.dayOfPay,
                    id: credit.id,
                    sum: credit.sum,
                    term: credit.term,
                    percents: credit.percents,
                    repayments: [] as RepaymentType[],
                } as CreditType
        })
        credits.map((credit) => {
            if (credit.holidays) {
                return credit
            } else
                return {
                    date: credit.date,
                    dayOfPay: credit.dayOfPay,
                    id: credit.id,
                    sum: credit.sum,
                    term: credit.term,
                    percents: credit.percents,
                    repayments: credit.repayments,
                    holidays: [] as HolidayType[],
                } as CreditType
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
            const creditId = (await creditsAPI.createCredit(
                new Date(credit.date).toISOString(),
                credit.dayOfPay.toString(),
                credit.sum.toString(),
                credit.term.toString(),
                credit.percents.toString()
            )) as number
            Alert.alert('Добавление кредита', 'Кредит успешно добавлен!')
            return {
                date: credit.date,
                dayOfPay: credit.dayOfPay,
                id: creditId,
                percents: credit.percents,
                repayments: credit.repayments || [],
                sum: credit.sum,
                term: credit.term,
                holidays: credit.holidays || [],
            } as CreditType
        } catch (error: any) {
            Alert.alert('Ошибка добавления кредита', error.message)
            return thunkApi.rejectWithValue('Не удалось добавить кредиты!')
        }
    }
)

export const updateCreditAsync = createAsyncThunk(
    'credits/updateCredit',
    async (credit: CreditType, thunkApi) => {
        try {
            await creditsAPI.updateCredit(credit)
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
            await creditsAPI.deleteCredit(credit.id)
            if (credit.repayments) {
                for (let index = 0; index < credit.repayments.length; index++) {
                    await creditsAPI.deleteRepayment(credit.repayments[index].id)
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
            let repaymentId = (await creditsAPI.createRepayment(
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
            await creditsAPI.deleteRepayment(repaymentId)
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
            let holidayId = (await creditsAPI.createHoliday(
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
            await creditsAPI.deleteHolidays(holidayId)
            Alert.alert('Delete holiday', 'repayment successfully deleted!')
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
        setTempCreditActionCreator: (state, action: PayloadAction<CreditType>) => {
            state.tempCredit = action.payload
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getCreditsAsync.fulfilled.type, (state, action: PayloadAction<CreditType[]>) => {
                state.isLoading = false
                state.error = ''
                state.credits = action.payload
            })
            .addCase(getCreditsAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(getCreditsAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(createCreditAsync.fulfilled.type, (state, action: PayloadAction<CreditType>) => {
                state.isLoading = false
                state.error = ''
                state.credits = [...state.credits, action.payload]
            })
            .addCase(createCreditAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(createCreditAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(updateCreditAsync.fulfilled.type, (state, action: PayloadAction<CreditType>) => {
                state.isLoading = false
                state.error = ''
                state.credits = state.credits.map((credit) => {
                    if (credit.id === action.payload.id) {
                        credit.sum = action.payload.sum
                        credit.dayOfPay = action.payload.dayOfPay
                        credit.term = action.payload.term
                        credit.percents = action.payload.percents
                        credit.date = action.payload.date
                        return credit
                    }
                    return credit
                })
            })
            .addCase(updateCreditAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(updateCreditAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(deleteCreditAsync.fulfilled.type, (state, action: PayloadAction<CreditType>) => {
                state.isLoading = false
                state.error = ''
                state.credits = state.credits.filter((credit) => credit.id !== action.payload.id)
            })
            .addCase(deleteCreditAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(deleteCreditAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(
                createRepaymentAsync.fulfilled.type,
                (state, action: PayloadAction<{ repayment: RepaymentType; id: number }>) => {
                    state.isLoading = false
                    state.error = ''
                    state.credits = state.credits.map((credit) => {
                        if (credit.id === action.payload.id) {
                            if (credit.repayments) {
                                credit.repayments.push(action.payload.repayment)
                                console.log('Добавлен очередной досрочный платеж!')
                            } else {
                                credit.repayments = [action.payload.repayment]
                                console.log('Первый элемент досрочный платеж добавлен!')
                            }
                        }
                        return credit
                    })
                }
            )
            .addCase(createRepaymentAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(createRepaymentAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(deleteRepaymentAsync.fulfilled.type, (state, action: PayloadAction<number>) => {
                state.isLoading = false
                state.error = ''
                state.credits = state.credits.filter((credit) =>
                    credit.repayments.filter((pay) => pay.id !== action.payload)
                )
            })
            .addCase(deleteRepaymentAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(deleteRepaymentAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(
                createHolidayAsync.fulfilled.type,
                (state, action: PayloadAction<{ holiday: HolidayType; id: number }>) => {
                    state.isLoading = false
                    state.error = ''
                    state.credits = state.credits.map((credit) => {
                        if (credit.id === action.payload.id) {
                            if (credit.holidays) {
                                credit.holidays.push(action.payload.holiday)
                                console.log('Добавлен очередной пропуск платежа!')
                            } else {
                                credit.holidays = [action.payload.holiday]
                                console.log('Первый элемент пропуск платежа добавлен!')
                            }
                        }
                        return credit
                    })
                }
            )
            .addCase(createHolidayAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(createHolidayAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
            .addCase(deleteHolidayAsync.fulfilled.type, (state, action: PayloadAction<number>) => {
                state.isLoading = false
                state.error = ''
                state.credits = state.credits.filter((credit) =>
                    credit.holidays?.filter((pay) => pay.id !== action.payload)
                )
            })
            .addCase(deleteHolidayAsync.pending.type, (state) => {
                state.isLoading = true
            })
            .addCase(deleteHolidayAsync.rejected.type, (state, action: PayloadAction<string>) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { setSelectedCreditActionCreator, setIsLoadingActionCreator, setTempCreditActionCreator } =
    creditsSlice.actions

export const setSelectedCredit = (id: number): AppThunk => {
    return (dispatch) => {
        dispatch(setSelectedCreditActionCreator(id))
    }
}

export const setIsLoading = (isLoading: boolean): AppThunk => {
    return (dispatch) => {
        dispatch(setIsLoadingActionCreator(isLoading))
    }
}

export const setTempCredit = (credit: CreditType): AppThunk => {
    return (dispatch) => {
        dispatch(setTempCreditActionCreator(credit))
    }
}

export default creditsSlice.reducer
