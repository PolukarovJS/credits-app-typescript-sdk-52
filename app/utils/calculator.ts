import { current } from '@reduxjs/toolkit'
import { CreditType, HolidayType, ICreditRow } from '../types'
import { transformDateN } from './transformDate'

/**
 * Создает случайный ключ
 */
export const randomKeyGenerator = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let word = ''

    for (let i = 0; i < 15; i++) {
        word += letters.charAt(Math.floor(Math.random() * letters.length))
    }

    const randomKey = word.substring(0, 5) + '-' + word.substring(5, 5) + '-' + word.substring(10, 5)

    return randomKey.toUpperCase()
}

/**
 * Определяем по дате номер платежа по графику
 * @returns number
 */
export const calculateNumberOfPayOnDate = (date: Date, credit: CreditType) => {
    let month
    /**
     * Загружаем график платежей
     */
    let schedulePays = calculateWithEarlyPaymentsRows(credit)
    for (let index = 0; index < schedulePays.length; index++) {
        let date_1 = new Date(schedulePays[index].date)
        let date_2 = new Date(date)
        let date_3 = new Date()
        if (index + 1 < schedulePays.length) {
            date_3 = new Date(schedulePays[index + 1].date)
        } else {
            date_3 = new Date(schedulePays[index].date)
        }
        if (date_1 < date_2 && date_2 <= date_3) {
            month = index + 1
        }
    }
    if (month === undefined) month = 0
    return month
}

/**
 * Расчет затрат на оплату итоговых процентов
 * @returns number
 */
export const calculateFullInterestLoan = (credit: CreditType) => {
    let fullInterestLoan = 0
    /**
     * Загружаем график платежей
     */
    let schedulePays = calculateWithEarlyPaymentsRows(credit)
    // Отображаем график
    // for (let index = 0; index < schedulePays.length; index++) {
    //     console.log(
    //         schedulePays[index].id +
    //             '  ' +
    //             transformDateN(schedulePays[index].date) +
    //             '  ' +
    //             schedulePays[index].payment.toFixed(2) +
    //             '  ' +
    //             schedulePays[index].debt.toFixed(2) +
    //             '  ' +
    //             schedulePays[index].interests.toFixed(2) +
    //             '  ' +
    //             schedulePays[index].totalDebt.toFixed(2)
    //     )
    // }

    for (let index = 0; index < schedulePays.length; index++) {
        fullInterestLoan = fullInterestLoan + schedulePays[index].interests
    }
    // console.log(`По кредиту ${credit.sum} переплата = ${fullInterestLoan.toFixed(2)}`)
    return fullInterestLoan
}

/**
 * Расчет выгоды в рублях от внесения досрочного платежа в виде суммы снижения
 * затрат на оплату итоговых процентов
 * @returns number
 */
export const calculateBenefit = (
    credit: CreditType,
    pay: number,
    dateOfPay: Date,
    // необходимо подумать стоит ли учитывать коэффициент от valueAccuracy
    valueAccuracy?: number
): number => {
    let benefit = 0
    let creditTest_1: CreditType
    // let creditTest_2: CreditType

    if (credit.repayments && credit.repayments.length > 0) {
        let repaymentsTest_1 = credit.repayments.map((item) => item)
        // let repaymentsTest_2 = credit.repayments.map((item) => item)
        creditTest_1 = {
            id: Number(credit.id),
            sum: Number(credit.sum),
            date: new Date(credit.date),
            dayOfPay: Number(credit.dayOfPay),
            term: Number(credit.term),
            percents: Number(credit.percents),
            repayments: repaymentsTest_1,
            holidays: credit.holidays as HolidayType[],
        }
        // creditTest_2 = {
        //     id: Number(credit.id),
        //     sum: Number(credit.sum),
        //     date: new Date(credit.date),
        //     dayOfPay: Number(credit.dayOfPay),
        //     term: Number(credit.term),
        //     percents: Number(credit.percents),
        //     repayments: repaymentsTest_2,
        //     holidays: credit.holidays as HolidayType[],
        // }
    } else {
        creditTest_1 = {
            id: Number(credit.id),
            sum: Number(credit.sum),
            date: new Date(credit.date),
            dayOfPay: Number(credit.dayOfPay),
            term: Number(credit.term),
            percents: Number(credit.percents),
            repayments: [],
            holidays: credit.holidays as HolidayType[],
        }
        // creditTest_2 = {
        //     id: Number(credit.id),
        //     sum: Number(credit.sum),
        //     date: new Date(credit.date),
        //     dayOfPay: Number(credit.dayOfPay),
        //     term: Number(credit.term),
        //     percents: Number(credit.percents),
        //     repayments: [],
        //     holidays: credit.holidays as HolidayType[],
        // }
    }
    // Расчет переплаты до внесения платежа
    let oldFullInterestLoan = calculateFullInterestLoan(creditTest_1)
    // console.log(
    //     `По кредиту ${creditTest_1.sum} переплата до = ${oldFullInterestLoan.toFixed(2)} `
    // )
    // console.log(`date: ${transformDateN(dateOfPay)} pay: ${pay}`)

    creditTest_1.repayments.push({
        id: creditTest_1.repayments.length + 1,
        id_credit: creditTest_1.id,
        date: dateOfPay,
        pay: pay,
        type: 'term',
    })
    // if (creditTest_1.holidays) {
    //     for (let index = 0; index < creditTest_1.holidays.length; index++) {
    //         console.log(
    //             'holidays[' +
    //                 index +
    //                 ']: ' +
    //                 transformDateN(creditTest_1.holidays[index].date) +
    //                 ' ' +
    //                 creditTest_1.holidays[index].number_pay
    //         )
    //     }
    // }
    // if (creditTest_1.repayments) {
    //     for (let index = 0; index < creditTest_1.repayments.length; index++) {
    //         console.log(
    //             'repayments[' +
    //                 index +
    //                 ']: ' +
    //                 transformDateN(creditTest_1.repayments[index].date) +
    //                 ' ' +
    //                 creditTest_1.repayments[index].pay
    //         )
    //     }
    // }

    // creditTest_2.repayments.push({
    //     id: creditTest_1.repayments.length,
    //     id_credit: creditTest_1.id,
    //     date: dateOfPay,
    //     pay: Number(pay) - Number(valueAccuracy),
    //     type: 'term',
    // })
    // console.log(creditTest)
    let newFullInterestLoan_1 = calculateFullInterestLoan(creditTest_1)
    // let newFullInterestLoan_2 = calculateFullInterestLoan(creditTest_2)
    // console.log(
    //     `По кредиту ${creditTest_1.sum} переплата после = ${newFullInterestLoan_1.toFixed(
    //         2
    //     )} `
    // )
    // Итоговая выгода
    benefit = oldFullInterestLoan - newFullInterestLoan_1
    // if (pay > 1) {
    //     benefit = newFullInterestLoan_1 - newFullInterestLoan_2
    // } else {
    //     benefit = oldFullInterestLoan - newFullInterestLoan_1
    // }
    // console.log(`По кредиту ${creditTest.sum} Итоговая выгода = ${benefit.toFixed(2)}`)
    return benefit
}

/**
 * Возьмите разницу между датами и разделите на миллисекунды в день.
 * Округлите до ближайшего целого числа, чтобы иметь дело с DST.
 */
const dateDiff = (first: Date, second: Date) => {
    return Math.round((Number(second) - Number(first)) / (1000 * 60 * 60 * 24))
}

/**
 * Вычисляет количество дней в году.
 * Округлите до ближайшего целого числа, чтобы иметь дело с DST.
 */
const daysInYear = (year: number) => {
    return (year % 4 === 0 && year % 100 > 0) || year % 400 === 0 ? 366 : 365
}

/**
 * Рассчитывает строки для calculateWithEarlyPaymentsRows
 * @returns Object
 */
const rowsFromCredit = (credit: CreditType) => {
    const array = []

    //#region Установка параметров кредита
    // Месячная процентная ставка
    const percentMonth = credit.percents / 1200

    /**
     * Ежемесячный платеж
     * @returns number
     */
    const payment = credit.sum * (percentMonth + percentMonth / ((1 + percentMonth) ** credit.term - 1))

    /**
     * Дата предыдущего платежа
     * @returns number
     */
    let date_previous = new Date(credit.date.toString())
    //#endregion

    let dayPay
    if (credit.dayOfPay !== undefined) {
        dayPay = credit.dayOfPay
    } else {
        dayPay = new Date(credit.date.toString()).getDate()
    }

    let dayOfMonth = date_previous.getDate()
    if (dayOfMonth >= dayPay) {
        date_previous.setMonth(date_previous.getMonth() + 1)
        date_previous.setDate(dayPay)
    } else {
        date_previous = new Date(date_previous)
        date_previous.setDate(dayPay)
    }
    // Количество пропусков кредита
    let numberOfPasses = 0
    for (let numberOfPay = 0; numberOfPay < credit.term; numberOfPay++) {
        // Определяем дату очередного платежа
        let date_next_1 = new Date(date_previous)
        let date_next_2 = new Date(date_previous)
        if (numberOfPay > 0) {
            date_next_1.setMonth(date_previous.getMonth() + numberOfPay - 1)
        } else date_next_1 = new Date(credit.date.toString())

        date_next_2.setMonth(date_previous.getMonth() + numberOfPay)
        let dayOfWeek_1 = date_next_1.getDay()
        let dayOfWeek_2 = date_next_2.getDay()
        if (numberOfPay > 0) {
            switch (dayOfWeek_1) {
                case 0:
                    date_next_1.setDate(date_next_1.getDate() + 1)
                    break
                case 6:
                    date_next_1.setDate(date_next_1.getDate() + 2)
                    break
                case 1 | 2 | 3 | 4 | 5:
                    date_next_1.setDate(date_next_1.getDate())
                    break
                default:
                    break
            }
        }
        switch (dayOfWeek_2) {
            case 0:
                date_next_2.setDate(date_next_2.getDate() + 1)
                break
            case 6:
                date_next_2.setDate(date_next_2.getDate() + 2)
                break
            case 1 | 2 | 3 | 4 | 5:
                date_next_2.setDate(date_next_2.getDate())
                break
            default:
                break
        }

        if (credit.holidays) {
            if (
                credit.holidays.find(
                    (holiday) =>
                        transformDateN(new Date(holiday.date.toString())) ==
                        transformDateN(new Date(date_next_2.toString()))
                )
            ) {
                array.push({
                    date: new Date(
                        //@ts-ignore
                        credit.holidays
                            .find(
                                (holiday) =>
                                    transformDateN(new Date(holiday.date.toString())) ===
                                    transformDateN(new Date(date_next_2.toString()))
                            )
                            .date.toString()
                    ),
                    payment: 0,
                    type: 'holiday',
                })
                numberOfPasses++
            } else if (
                credit.holidays.find(
                    (holiday) =>
                        transformDateN(new Date(holiday.date.toString())) !==
                        transformDateN(new Date(date_next_2.toString()))
                )
            ) {
                array.push({
                    date: new Date(date_next_2.toString()),
                    payment: payment,
                    type: 'standard',
                })
            }
        } else {
            array.push({
                date: new Date(date_next_2.toString()),
                payment: Number(payment),
                type: 'standard',
            })
        }
    }

    // Добавляем дополнительные платежи в связи с пропуском платежей по программе Кредитные каникулы
    if (numberOfPasses > 0) {
        for (let index = 0; index < credit.holidays.length; index++) {
            let date_last: Date = new Date(array[array.length - 1].date)
            let date_add_1 = new Date(date_last)
            let date_add_2 = new Date(date_last)
            let date_add_3 = new Date(date_last)
            date_last.setMonth(array[array.length - 1].date.getMonth())
            date_add_1.setMonth(date_last.getMonth() + 1)
            date_add_2.setMonth(date_last.getMonth() + 2)
            date_add_3.setMonth(date_last.getMonth() + 3)
            let dayOfWeek_1 = date_add_1.getDay()
            let dayOfWeek_2 = date_add_2.getDay()
            let dayOfWeek_3 = date_add_3.getDay()
            switch (dayOfWeek_1) {
                case 0:
                    date_add_1.setDate(date_add_1.getDate() + 1)
                    break
                case 6:
                    date_add_1.setDate(date_add_1.getDate() + 2)
                    break
                case 1 | 2 | 3 | 4 | 5:
                    date_add_1.setDate(date_add_1.getDate())
                    break
                default:
                    break
            }
            array.push({
                date: new Date(date_add_1.toString()),
                payment: payment,
                type: 'standard',
            })
            switch (dayOfWeek_2) {
                case 0:
                    date_add_2.setDate(date_add_2.getDate() + 1)
                    break
                case 6:
                    date_add_2.setDate(date_add_2.getDate() + 2)
                    break
                case 1 | 2 | 3 | 4 | 5:
                    date_add_2.setDate(date_add_2.getDate())
                    break
                default:
                    break
            }
            array.push({
                date: new Date(date_add_2.toString()),
                payment: payment,
                type: 'standard',
            })
            switch (dayOfWeek_3) {
                case 0:
                    date_add_3.setDate(date_add_3.getDate() + 1)
                    break
                case 6:
                    date_add_3.setDate(date_add_3.getDate() + 2)
                    break
                case 1 | 2 | 3 | 4 | 5:
                    date_add_3.setDate(date_add_3.getDate())
                    break
                default:
                    break
            }
            array.push({
                date: new Date(date_add_3.toString()),
                payment: payment,
                type: 'standard',
            })
        }
    }

    // Добавляем досрочные платежи
    if (credit.repayments && credit.repayments.length > 0) {
        for (let index = 0; index < credit.repayments.length; index++) {
            array.push({
                date: new Date(credit.repayments[index].date.toString()),
                payment: Number(credit.repayments[index].pay),
                type: credit.repayments[index].type,
            })
        }
    }

    //@ts-ignore сортируем по размеру выданного кредита
    array.sort((a, b) => b.date - a.date).reverse()
    // Отобразим array
    //    for (let i = 0; i < array.length; i++) {
    //     console.log(
    //         'array[' +
    //             i +
    //             ']: ' +
    //             // creditsWithCoff[i].id +
    //             ' sum: ' +
    //             transformDateN(array[i].date) +
    //             ' \u20BD' +
    //             ' --- pay: ' +
    //             array[i].payment.toFixed(2) +
    //             ' \u20BD' +
    //             ' --- type: ' +
    //             array[i].type
    //     )
    // }

    return array
}

/**
 * Рассчитывает строки для отображения графика платежей (суточная процентная ставка)
 * @returns ICreditRow[]
 */

export const calculateWithEarlyPaymentsRows = (credit: CreditType) => {
    const rows: ICreditRow[] = []
    const array = rowsFromCredit(credit)

    //#region Установка параметров кредита
    // Месячная процентная ставка
    const percentMonth = credit.percents / 1200

    /**
     * Ежемесячный платеж по графику
     * @returns number
     */
    let payment = credit.sum * (percentMonth + percentMonth / ((1 + percentMonth) ** credit.term - 1))

    /**
     * Остаток ссудной задолженности до внесения платежа
     * @returns number
     */
    let loanDebtBalanceOld = credit.sum

    /**
     * Остаток ссудной задолженности после внесения платежа
     * @returns number
     */
    let loanDebtBalanceNew = 0

    /**
     * Сумма платежа в погашение процентов
     * @returns number
     */
    let interestLoan = 0

    /**
     * Сумма платежа в погашение основного долга
     * @returns number
     */
    let loanDebt = 0

    /**
     * Предыдущий платеж
     * @returns number
     */
    let payment_previous = payment

    /**
     * Остаток неуплаченных процентов
     * @returns number
     */
    let interest_debt = 0

    /**
     * Дата предыдущего платежа
     * @returns Date
     */
    let date_previous = new Date(credit.date.toString())

    //#endregion

    for (let index = 0; index < array.length; index++) {
        // Если тип платежа = standard: платеж = расчетному платежу графика
        if (array[index].type === 'standard') {
            array[index].payment = payment
        }
        //#region Определяем диапазон дат для вычисления процентов
        // Если платеж № 1, то date_next_1 = дате выдачи кредита, иначе = дате предыдущего платежа
        let date_next_1 = new Date()
        if (index === 0) {
            date_next_1 = new Date(credit.date.toString())
        } else date_next_1 = new Date(date_previous.toString())

        // Определяем дату текущего платежа date_next_2
        let date_next_2 = new Date(array[index].date)
        //#endregion

        //#region Вычисляем основной долг и проценты в платеже
        if (array[index].payment === 0 && array[index].type === 'holiday') {
            interestLoan = 0
            loanDebt = 0
            payment_previous = 0
            date_previous = new Date(date_next_1)
        } else if (array[index].payment > 0 && array[index].payment < payment) {
            interestLoan =
                (((loanDebtBalanceOld * credit.percents) / 100) * dateDiff(date_next_1, date_next_2)) /
                daysInYear(array[index].date.getFullYear())
            if (interestLoan > array[index].payment) {
                // Вычисляем остаток процентов
                interest_debt = interestLoan - array[index].payment
                // Платим только проценты
                interestLoan = array[index].payment
                loanDebt = 0
                date_previous = new Date(date_next_1)
                payment_previous = interestLoan + loanDebt
            } else {
                interest_debt = 0
                loanDebt = array[index].payment - interestLoan
                date_previous = new Date(date_next_1)
                payment_previous = array[index].payment
            }
        } else {
            if (payment_previous === 0) {
                interestLoan =
                    (((loanDebtBalanceOld * credit.percents) / 100) *
                        dateDiff(date_next_1, date_next_2)) /
                    daysInYear(array[index].date.getFullYear())
                // Если проценты больше ежемесячного платежа
                if (interestLoan > array[index].payment) {
                    // Вычисляем остаток процентов
                    interest_debt = interestLoan - array[index].payment
                    // Платим только проценты
                    interestLoan = array[index].payment
                    loanDebt = 0
                    date_previous = new Date(date_next_1)
                    payment_previous = interestLoan + loanDebt
                } else {
                    interest_debt = 0
                    loanDebt = array[index].payment - interestLoan
                    date_previous = new Date(date_next_1)
                    payment_previous = array[index].payment
                }
                payment_previous = interestLoan + loanDebt
            } else {
                if (interest_debt > 0) {
                    interestLoan =
                        (((loanDebtBalanceOld * credit.percents) / 100) *
                            dateDiff(date_next_1, date_next_2)) /
                            daysInYear(array[index].date.getFullYear()) +
                        interest_debt
                    loanDebt = array[index].payment - interestLoan
                    if (interestLoan > array[index].payment) {
                        // Вычисляем остаток процентов
                        interest_debt = interestLoan - array[index].payment
                        // Платим только проценты
                        interestLoan = array[index].payment
                        loanDebt = 0
                        date_previous = new Date(date_next_1)
                        payment_previous = interestLoan + loanDebt
                    } else {
                        interest_debt = 0
                        loanDebt = array[index].payment - interestLoan
                        date_previous = new Date(date_next_1)
                        payment_previous = array[index].payment
                    }
                    // if (interestLoan > array[index].payment) {
                    //     interest_debt = interestLoan - array[index].payment
                    // } else {
                    //     interest_debt = 0
                    // }
                } else {
                    interestLoan =
                        (((loanDebtBalanceOld * credit.percents) / 100) *
                            dateDiff(date_next_1, date_next_2)) /
                        daysInYear(array[index].date.getFullYear())
                    loanDebt = array[index].payment - interestLoan
                }
            }
        }
        //#endregion

        // Расчет основного долга последнего платежа
        if (loanDebtBalanceOld <= loanDebt) {
            loanDebt = loanDebtBalanceOld
        }

        // Расчет ссудной задолженности после платежа
        loanDebtBalanceNew = loanDebtBalanceOld - loanDebt

        // На случай пропуска платежа
        let loanDebtBalanceOld_0 = loanDebtBalanceOld

        if (array[index].payment > 0) {
            date_previous = new Date(date_next_2)
        }
        //#endregion

        // if (interestLoan + loanDebt < 1) {
        //     interestLoan = 0
        //     loanDebt = 0.9
        //     loanDebtBalanceOld = loanDebtBalanceOld_0 - loanDebt
        //     date_previous = new Date(date_next_1)
        // }

        //#region Добавляем запись
        if (loanDebtBalanceOld > 0) {
            if (array[index].payment === 0.9) {
                interestLoan = 0.9
                loanDebt = 0
                loanDebtBalanceOld = loanDebtBalanceOld_0 - loanDebt
                date_previous = new Date(date_next_2)
            }
            rows.push({
                id: (index + 1).toString(),
                date: date_next_2,
                payment: interestLoan + loanDebt,
                interests: interestLoan,
                debt: loanDebt,
                totalDebt: loanDebtBalanceNew,
            })
        }
        //#region Определяем остаток ссудной задолженности до внесения платежа и предыдущий платеж для следующего платежа
        if (loanDebtBalanceOld < 0 || loanDebtBalanceOld < interestLoan + loanDebt) {
            loanDebtBalanceOld = 0
        } else {
            loanDebtBalanceOld = loanDebtBalanceNew
        }
        //#endregion

        // Снижаем платеж по кредиту
        if (array[index].type === 'payment') {
            payment =
                loanDebtBalanceNew *
                (percentMonth + percentMonth / ((1 + percentMonth) ** (credit.term - index) - 1))
        }
    }

    return rows
}

/**
 * Добавляет к кредиту текущие параметры (остаток задолженности, дата следующего платежа, его размер, а также дату полного погашения кредита)
 * @returns full CreditType
 */

export const currentInfoCredit = (credit: CreditType) => {
    /**
     * Номер следующего платежа
     */
    let numberOfNextPay = calculateNumberOfPayOnDate(new Date(Date.now()), credit)

    /**
     * Загружаем график платежей
     */
    let iCredits = calculateWithEarlyPaymentsRows(credit)

    /**
     * Дата следующего платежа
     */
    let dateOfNextPay = iCredits[numberOfNextPay]?.date ?? new Date(Date.now())

    /**
     * Дата погашения кредита
     */
    let latestDateOfPay = iCredits[iCredits.length - 1]?.date ?? new Date(Date.now())

    /**
     * Остаток задолженности
     */
    let balanceLoanDebt: number
    if (numberOfNextPay > 0) {
        balanceLoanDebt = iCredits[numberOfNextPay - 1].totalDebt
    } else {
        balanceLoanDebt = Number(credit.sum.toString())
    }

    /**
     * Ежемесячный платеж
     */
    let pay = iCredits[numberOfNextPay + 1]?.payment ?? 5000

    let currentCredit: CreditType = {
        id: credit.id,
        sum: credit.sum,
        date: credit.date,
        dayOfPay: credit.dayOfPay,
        term: credit.term,
        percents: credit.percents,
        repayments: credit.repayments,
        holidays: credit.holidays,
        balanceLoanDebt: balanceLoanDebt,
        dateOfNextPay: dateOfNextPay,
        latestDateOfPay: latestDateOfPay,
        nextPay: pay,
    }

    return currentCredit
}
