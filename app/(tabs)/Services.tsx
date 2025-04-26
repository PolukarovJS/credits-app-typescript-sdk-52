import React, { FC, useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native'

import * as Progress from 'react-native-progress'

import { useAppSelector, useAppDispatch } from '../hooks/hook'
import {
    calculateBenefit,
    calculateNumberOfPayOnDate,
    calculateWithEarlyPaymentsRows,
    randomKeyGenerator,
} from './../utils/calculator'
import { AppButton } from '../../components/ui/AppButton'
import { CreditCoffType, CreditType, TypeRepayment } from '../types'
import { AppTextBold } from '../../components/ui/AppTextBold'
import { AppDateInput } from '../../components/ui/AppDateInput'
import { Foundation } from '@expo/vector-icons'
import { COLORS, SIZES } from '../../constants'
import { createRepaymentAsync, getCreditsAsync, setIsLoading } from '../../src/redux/reducers/credits-reducer'

const Services: FC = () => {
    // console.log('Selected ServicesScreen')
    const { credits, isLoading } = useAppSelector((state) => state.creditsPage)
    const dispatch = useAppDispatch()
    const [progress, setProgress] = useState(0) // Начальное состояние прогресса
    const [pay, setPay] = useState('')
    const [maxPay, setMaxPay] = useState(0)
    const [valueAccuracy, setValueAccuracy] = useState('1000')
    const [datePay, setDatePay] = useState(new Date(Date.now()))
    const [creditsWithCoff, setCreditsWithCoff] = useState<CreditCoffType[]>([])

    const changeHandlerPay = (sum: string) => {
        if (sum.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/)) {
            setPay(sum)
        }
    }

    const changeHandlerValueAccuracy = (sum: string) => {
        if (sum.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/)) {
            setValueAccuracy(sum)
        }
    }

    /**
     * Условие предотвращает parseFloat(null) = NaN (когда пользователь удаляет входные данные)
     * @returns void
     */
    const handleFloat = () => {
        setPay((parseFloat(pay) || '').toString())
        setValueAccuracy((parseFloat(valueAccuracy) || '').toString())
    }

    useEffect(() => {
        if (Number(pay) > maxPay) {
            setPay(maxPay.toFixed(0))
        }
    }, [pay, maxPay])

    useEffect(() => {
        // Загружаем кредиты в массив CreditCoffType[] для расчета коэффициентов выгоды
        let creditsWithCoefficient = credits.map((item) => {
            /**
             * Номер следующего платежа
             */
            let numberOfPay = calculateNumberOfPayOnDate(new Date(Date.now()), item)
            /**
             * Загружаем график платежей
             */
            let iPays = calculateWithEarlyPaymentsRows(item)
            /**
             * Остаток задолженности
             */
            let balanceLoanDebt: number

            if (numberOfPay > 1) {
                balanceLoanDebt = iPays[numberOfPay - 2].totalDebt
            } else balanceLoanDebt = iPays[numberOfPay].totalDebt
            return {
                id: randomKeyGenerator(),
                credit: item,
                pay: 1,
                coefficient: 0,
                balanceLoanDebt,
            } as CreditCoffType
        })

        let total_balanceLoanDebt = 0
        for (let index = 0; index < creditsWithCoefficient.length; index++) {
            total_balanceLoanDebt = total_balanceLoanDebt + creditsWithCoefficient[index].balanceLoanDebt
        }
        setMaxPay(total_balanceLoanDebt * 0.9)
    }, [])

    useEffect(() => {
        if (Number(pay) > maxPay) {
            setPay(maxPay.toFixed(0))
        }
    }, [pay, maxPay])

    const saveCreateRepaymentHandler = (
        credit: CreditType,
        period: Date,
        pay: number,
        type: TypeRepayment
    ) => {
        dispatch(createRepaymentAsync({ credit, dateOfPay: period, pay, type }))
        dispatch(getCreditsAsync())
    }

    /**
     * Рассчитывает итоговую выгоду при внесении платежа
     * @returns number
     */
    const fullBenefit = (creditCoff: any) => {
        let sumPay = 0
        for (let i = 0; i < creditCoff.length; i++) {
            if (creditCoff[i].pay > 1) {
                sumPay = sumPay + creditCoff[i].coefficient * creditCoff[i].pay
            }
        }
        return sumPay
    }

    /**
     * Рассчитывает оптимальные размеры досрочных платежей по каждому кредиту
     * для достижения максимальной выгоды
     * @returns void
     */
    const calculate = async (
        newCredits: CreditType[],
        setCreditsCoff: (credits: CreditCoffType[]) => void,
        /**
         * Сумма досрочного платежа
         */
        pay: number,
        /**
         * Точность досрочного платежа
         */
        valueAccuracy: number,
        /**
         * Дата досрочного платежа
         */
        dayOfPay: Date
    ) => {
        // Фиксируем время начала расчета
        let time_1 = new Date(Date.now()).getTime()

        // Обнуляем загруженные кредиты
        setCreditsCoff([])

        // Загружаем кредиты в массив CreditCoffType[] для расчета коэффициентов выгоды
        let creditsWithCoff = newCredits.map((item) => {
            /**
             * Номер следующего платежа
             */
            let numberOfPay = calculateNumberOfPayOnDate(new Date(Date.now()), item)
            /**
             * Загружаем график платежей
             */
            let iPays = calculateWithEarlyPaymentsRows(item)
            /**
             * Остаток задолженности
             */
            let balanceLoanDebt: number

            if (numberOfPay > 1) {
                balanceLoanDebt = iPays[numberOfPay - 1].totalDebt
            } else balanceLoanDebt = iPays[numberOfPay].totalDebt
            return {
                id: randomKeyGenerator(),
                credit: item,
                pay: 0.9,
                coefficient: 0,
                balanceLoanDebt,
            } as CreditCoffType
        })

        // Если массив CreditCoffType[] для расчета загружен
        if (creditsWithCoff) {
            // Загружаем его в состояние
            setCreditsCoff(creditsWithCoff)

            // Создаем выражение для условия цикла (сумма досрочных платежей по всем кредитам)
            // не должна превышать суммарный досрочный платеж)
            const condition = () => {
                let amountOfPay = 0
                for (let i = 0; i < creditsWithCoff.length; i++) {
                    amountOfPay = amountOfPay + creditsWithCoff[i].pay
                }
                return amountOfPay
            }

            // Начинаем итерацию до достижения платежа оптимального значения для конкретного кредита
            for (let j = 0; j < pay; j = condition()) {
                // console.log(
                //     'Выполнено на ' + ((condition() / pay) * 100).toFixed(0) + '%'
                // )
                setProgress(condition() / pay)
                // Имитация асинхронной работы без нее ничего не работает
                await new Promise((resolve) => setTimeout(resolve, 1))
                // Расчет коэффициентов выгоды для различных сумм платежей
                // до увеличения досрочного платежа

                let value
                if (valueAccuracy === 0) {
                    value = pay / 10
                } else {
                    value = valueAccuracy
                }
                for (let i = 0; i < creditsWithCoff.length; i++) {
                    creditsWithCoff[i].coefficient =
                        calculateBenefit(
                            creditsWithCoff[i].credit,
                            creditsWithCoff[i].pay,
                            dayOfPay,
                            value
                        ) / creditsWithCoff[i].pay
                }

                // Сортируем кредиты по максимальной выгоде при конкретном платеже
                creditsWithCoff.sort((a, b) => a.coefficient - b.coefficient).reverse()

                const add_pay = (numberOfCredit: number) => {
                    if (valueAccuracy === 0) {
                        creditsWithCoff[numberOfCredit].pay =
                            creditsWithCoff[numberOfCredit].pay + pay / 10
                        // Расчет коэффициентов выгоды для различных сумм платежей
                        // после увеличения досрочного платежа
                        for (let i = 0; i < creditsWithCoff.length; i++) {
                            creditsWithCoff[i].coefficient =
                                calculateBenefit(
                                    creditsWithCoff[i].credit,
                                    creditsWithCoff[i].pay,
                                    dayOfPay,
                                    pay / 10
                                ) / creditsWithCoff[i].pay
                        }
                    } else {
                        creditsWithCoff[numberOfCredit].pay =
                            creditsWithCoff[numberOfCredit].pay + valueAccuracy
                        // Расчет коэффициентов выгоды для различных сумм платежей
                        // после внесения досрочного платежа
                        for (let i = 0; i < creditsWithCoff.length; i++) {
                            creditsWithCoff[i].coefficient =
                                calculateBenefit(
                                    creditsWithCoff[i].credit,
                                    creditsWithCoff[i].pay,
                                    dayOfPay,
                                    valueAccuracy
                                ) / creditsWithCoff[i].pay
                        }
                    }
                }
                //#region Алгоритм добавления платежа в случае когда он равен остатку
                // задолженности по кредиту
                // Номер кредита по убыванию выгоды
                let nc = 0
                // В случае удачного повышения платежа true
                let is_success = false
                do {
                    // рассчитаем остаток по кредиту до внесения увеличенного платежа
                    let creditShRows = calculateWithEarlyPaymentsRows(creditsWithCoff[nc].credit)
                    let total =
                        creditShRows[calculateNumberOfPayOnDate(dayOfPay, creditsWithCoff[nc].credit)]
                            .totalDebt
                    // Если после увеличения досрочного платежа он меньше
                    // остатка по кредиту добавляем платеж
                    if (creditsWithCoff[nc].pay + valueAccuracy < total) {
                        add_pay(nc)
                        is_success = true
                    }
                    // Иначе переходим к следующему менее выгодному
                    else {
                        nc++
                        // console.log(
                        //     'Переход к следующему кредиту ' +
                        //         creditsWithCoff[nc].credit.sum
                        // )
                    }
                } while (nc < creditsWithCoff.length && !is_success)
                //#endregion
            }

            // Сортируем кредиты по размеру выгоды при конкретном платеже
            creditsWithCoff.sort((a, b) => a.pay * a.coefficient - b.pay * b.coefficient).reverse()

            for (let index = 0; index < creditsWithCoff.length; index++) {
                creditsWithCoff[index].pay = creditsWithCoff[index].pay - 0.9
            }

            // Перезаписываем их в состояние
            setCreditsCoff(creditsWithCoff)

            // Фиксируем время завершения расчета
            let time_2 = new Date(Date.now()).getTime()

            //#region Выводим результат
            // Выводим в консоль сообщение об окончании подсчета и затраченном на это времени
            setProgress(1)
            console.log('Выполнено 100% за ' + ((time_2 - time_1) / 1000).toFixed(0) + ' sec.')
            let msg = 'Выполнено 100% за ' + ((time_2 - time_1) / 1000).toFixed(0) + ' sec.' + '\n\n'
            for (let first of creditsWithCoff) {
                if (first.pay > 1) {
                    msg +=
                        `По кредиту ${first.credit.sum} \u20BD: \nвнесите ${first.pay.toFixed(
                            0
                        )} и выгода ${(Number(first.coefficient) * Number(first.pay)).toFixed(
                            2
                        )} \u20BD` + '\n\n'
                }
            }

            Alert.alert(
                'Итоговая выгода',
                `${msg} \nВыгода при внесении ${pay.toFixed(2)} \u20BD составляет ${fullBenefit(
                    creditsWithCoff
                ).toFixed(2)} \u20BD`,
                [
                    {
                        text: 'Добавить платежи',
                        onPress: () => {
                            for (let item of creditsWithCoff) {
                                if (item.pay > 1) {
                                    item.credit
                                    saveCreateRepaymentHandler(item.credit, datePay, item.pay, 'term')
                                }
                            }
                            dispatch(getCreditsAsync())
                            dispatch(setIsLoading(false))
                        },
                    },
                    {
                        text: 'Отмена',
                        onPress: () => dispatch(setIsLoading(false)),
                        style: 'cancel',
                    },
                    {
                        text: 'OK',
                        onPress: () => {
                            dispatch(setIsLoading(false))
                        },
                    },
                ],
                { userInterfaceStyle: 'unspecified' }
            )
            //#endregion
        }
    }

    const onPress = async () => {
        dispatch(setIsLoading(true))
        try {
            await calculate(
                credits,
                setCreditsWithCoff,
                Number(pay),
                Number(valueAccuracy),
                new Date(datePay)
            )
        } catch (error) {
            console.error('Ошибка при расчете:', error)
            Alert.alert('Ошибка', 'Не удалось выполнить расчет. Пожалуйста, попробуйте снова.')
        }
        dispatch(setIsLoading(false))
    }

    const colorScheme = useColorScheme()

    const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle = colorScheme === 'light' ? styles.lightContainer : styles.darkContainer
    // Если в поле пустое значение, то рамка красного цвета
    const themeBorderBottomColor = (str: string) => {
        return {
            borderBottomColor: str !== '' ? COLORS.MAIN_BLUE_5 : COLORS.DANGER_COLOR,
        }
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={{ ...styles.text, ...themeTextStyle }}>
                    Выполнено на {(progress * 100).toFixed(0)}%
                </Text>
                <Progress.Bar width={370} progress={progress} />
            </View>
        )
    } else
        return (
            <>
                <View>
                    <AppTextBold style={{ ...styles.title, ...themeTextStyle }}>
                        Расчет выгоды от досрочного погашения
                    </AppTextBold>
                </View>
                <View style={styles.block}>
                    <AppDateInput
                        commentData="Дата платежа"
                        defaultDate={datePay}
                        setValueDate={(currentDate: Date) => setDatePay(new Date(currentDate))}
                    />
                </View>
                <View style={{ ...styles.block, ...themeBorderBottomColor(pay) }}>
                    <Foundation name="dollar-bill" size={30} color={COLORS.MAIN_BLUE_5} />
                    <View style={styles.input}>
                        <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>
                            Сумма платежа
                        </Text>
                        <TextInput
                            keyboardType="decimal-pad"
                            value={pay}
                            style={{ ...styles.text, ...themeTextStyle }}
                            placeholder="Введите сумму платежа"
                            placeholderTextColor={COLORS.DANGER_COLOR}
                            onChangeText={changeHandlerPay}
                            onBlur={handleFloat}
                        />
                    </View>
                </View>
                <View style={{ ...styles.block, ...themeBorderBottomColor(valueAccuracy) }}>
                    <Foundation name="dollar-bill" size={30} color={COLORS.MAIN_BLUE_5} />
                    <View style={styles.input}>
                        <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>
                            Точность платежа
                        </Text>
                        <TextInput
                            keyboardType="decimal-pad"
                            value={valueAccuracy}
                            style={{ ...styles.text, ...themeTextStyle }}
                            placeholder="Укажите точность платежа"
                            placeholderTextColor={COLORS.DANGER_COLOR}
                            onChangeText={changeHandlerValueAccuracy}
                            onBlur={handleFloat}
                        />
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    <AppButton onPress={onPress}>Провести расчет</AppButton>
                </View>
            </>
        )
}

export default Services

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        paddingVertical: 25,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 'bold',
    },
    wrap: {
        marginTop: 50,
        marginLeft: 20,
    },
    input: {
        padding: 10,
        width: '80%',
        fontSize: 20,
        fontFamily: 'roboto-bold',
    },
    buttons: {
        width: '100%',
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    block: {
        marginLeft: 20,
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        marginBottom: 15,
        borderBottomColor: COLORS.MAIN_BLUE_5,
        borderBottomWidth: 2,
        width: '90%',
    },
    text: {
        fontSize: SIZES.large,
    },
    comment: {
        fontSize: SIZES.small,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textBlock: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginLeft: 25,
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
