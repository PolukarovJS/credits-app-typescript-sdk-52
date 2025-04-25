import { transformDateN } from './utils/transformDate'

export const LOAD_CREDITS = 'LOAD_CREDITS'
export const ADD_CREDIT = 'ADD_CREDIT'
export const UPDATE_CREDIT = 'UPDATE_CREDIT'
export const REMOVE_CREDIT = 'REMOVE_CREDIT'
export const REMOVE_REPAYMENT = 'REMOVE_REPAYMENT'
export const REMOVE_CREDITS = 'REMOVE_CREDITS'
export const CHANGE_SCREEN = 'CHANGE_SCREEN'
export const ADD_PAY_CREDIT = 'ADD_PAY_CREDIT'

export type TypeCurrency = 'RUB' | 'USD'
export type TypeRepayment = 'term' | 'payment' | 'standard' | 'holiday'

export type RepaymentType = {
    id: number
    pay: number
    date: Date
    id_credit: number
    type: TypeRepayment
}

export type HolidayType = {
    id: number
    date: Date
    number_pay: number
    id_credit: number
}

export type CreditType = {
    id: number
    sum: number
    date: Date
    dayOfPay: number
    term: number
    percents: number
    repayments: RepaymentType[]
    holidays: HolidayType[]
    balanceLoanDebt?: number
    dateOfNextPay?: Date
    latestDateOfPay?: Date
    nextPay?: number
}

export type RowType = {
    id: string
    date: string
    payment: string
    interests: string
    debt: string
    totalDebt: string
}

export type ICreditRow = {
    id: string
    date: Date
    payment: number
    interests: number
    debt: number
    totalDebt: number
}

export type CreditCoffType = {
    id: string
    credit: CreditType
    pay: number
    coefficient: number
    balanceLoanDebt: number
}

export type BalanceType = {
    _id: string
    sumOfCredit: string
    dateOfCredit: string
    termOfCredit: string
    percentsOfCredit: string
    balanceLoanDebtOfCredit: number
    loanRepaymentDate: string
    month_pay: string
}

export const convertICreditRowToRowType = (rowICreditRow: ICreditRow) => {
    let dateString = rowICreditRow.date.toString()
    let dateDate = new Date(dateString)
    return {
        id: rowICreditRow.id,
        debt: rowICreditRow.debt.toFixed(2),
        interests: rowICreditRow.interests.toFixed(2),
        payment: rowICreditRow.payment.toFixed(2),
        totalDebt: rowICreditRow.totalDebt.toFixed(2),
        date: transformDateN(dateDate),
    } as RowType
}
