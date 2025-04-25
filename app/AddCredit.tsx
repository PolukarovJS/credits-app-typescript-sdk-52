import { AntDesign, FontAwesome, Foundation } from '@expo/vector-icons'
import React, { FC, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native'
import { createCreditAsync, getCreditsAsync } from './redux/reducers/credits-reducer'
import { AppButton } from '../components/ui/AppButton'
import { AppDateInput } from '../components/ui/AppDateInput'
import { AppTextBold } from '../components/ui/AppTextBold'
import { CreditType, HolidayType, RepaymentType } from './types'
import { useAppDispatch } from './hooks/hook'
import { COLORS, SIZES } from '../constants'

const AddCredit: FC = () => {
    console.log('Selected AddCreditScreen')
    const dispatch = useAppDispatch()

    const defaultCredit: CreditType = {
        id: Date.now(),
        sum: 1500000,
        term: 84,
        date: new Date(Date.now()),
        dayOfPay: new Date(Date.now()).getDate(),
        percents: 12,
        repayments: [] as RepaymentType[],
        holidays: [] as HolidayType[],
    }

    const [credit, setCredit] = useState(defaultCredit)

    const defaultPayment =
        defaultCredit.sum *
        (defaultCredit.percents / 1200 +
            defaultCredit.percents /
                1200 /
                ((1 + defaultCredit.percents / 1200) ** defaultCredit.term - 1))

    let totalDebt = defaultCredit.sum
    let interests = (defaultCredit.sum * defaultCredit.percents) / 1200
    let debt = 0
    let defaultFullInterests = 0
    let defaultFullPayment = 0

    for (let index = 1; index <= defaultCredit.term; index++) {
        interests = (totalDebt * defaultCredit.percents) / 1200
        debt = defaultPayment - interests
        totalDebt = totalDebt - debt
        defaultFullInterests = defaultFullInterests + interests
        defaultFullPayment = defaultFullPayment + interests + debt
    }
    const [payment, setPayment] = useState(defaultPayment.toFixed(2))
    const [fullInterestsD, setFullInterestsD] = useState(defaultFullInterests.toFixed(2))
    const [fullPaymentD, setFullPaymentD] = useState(defaultFullPayment.toFixed(2))

    const [day, setDay] = useState(defaultCredit.dayOfPay.toString())
    const [sum, setSum] = useState(defaultCredit.sum.toString())
    const [date, setDate] = useState(defaultCredit.date)
    const [term, setTerm] = useState(defaultCredit.term.toString())
    const [percents, setPercents] = useState(defaultCredit.percents.toString())

    // Расчет платежа по кредиту
    const calculate = (sum: number, term: number, percentages: number) => {
        if (percentages.toString().trim() && sum.toString().trim() && term.toString().trim()) {
            const percentMonth = percentages / 1200
            const newPayment = sum * (percentMonth + percentMonth / ((1 + percentMonth) ** term - 1))
            let totalDebt = sum
            let interests = sum * percentMonth
            let debt = 0
            let fullInterests = 0
            let fullPayment = 0

            for (let index = 1; index <= term; index++) {
                interests = totalDebt * percentMonth
                debt = newPayment - interests
                totalDebt = totalDebt - debt
                fullInterests = fullInterests + interests
                fullPayment = fullPayment + interests + debt
            }
            setPayment(newPayment.toFixed(2))
            setFullInterestsD(fullInterests.toFixed(2))
            setFullPaymentD(fullPayment.toFixed(2))
        } else {
            Alert.alert('Введите обязательные поля!')
        }
    }

    const saveHandler = () => {
        if (credit.date && credit.dayOfPay && credit.sum && credit.term && credit.percents) {
            dispatch(createCreditAsync(credit))
            dispatch(getCreditsAsync())
            setCredit(defaultCredit)
        } else {
            Alert.alert('Введите обязательные поля!')
        }
    }

    const setDefaultCredit = () => {
        setCredit(defaultCredit)
        setDay(defaultCredit.dayOfPay.toString())
        setSum(defaultCredit.sum.toString())
        setDate(defaultCredit.date)
        setTerm(defaultCredit.term.toString())
        setPercents(defaultCredit.percents.toString())
        setPayment(defaultPayment.toFixed(2))
        setFullInterestsD(defaultFullInterests.toFixed(2))
        setFullPaymentD(defaultFullPayment.toFixed(2))
    }

    const onChangeDayPay = (dayPay: string) => {
        if (dayPay.match(/^([1-3]{1})?([0-9]{1})?$/)) {
            let d = new Date(date.toString())
            var m = d.getMonth() + 1
            var y = d.getFullYear()
            var days = new Date(y, m, 0).getDate()
            if (dayPay === '') {
                setDay(dayPay)
            } else if (parseInt(dayPay) >= 1 && parseInt(dayPay) <= days) {
                setDay(dayPay)
                calculate(credit.sum, credit.term, credit.percents)
                setCredit({
                    ...credit,
                    date: credit.date,
                    dayOfPay: dayPay as unknown as number,
                    sum: credit.sum,
                    term: credit.term,
                    percents: credit.percents,
                    repayments: credit.repayments,
                })
            }
        }
    }

    const onChangeSum = (sum: string) => {
        if (sum.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/)) {
            setSum(sum)
            calculate(Number(sum), credit.term, credit.percents)
            setCredit({
                ...credit,
                date: credit.date,
                dayOfPay: credit.dayOfPay,
                sum: sum as unknown as number,
                term: credit.term,
                percents: credit.percents,
                repayments: credit.repayments,
            })
        }
    }

    const onChangeTerm = (term: string) => {
        if (term.match(/^([1-9]{1})?([0-9]{2})?$/)) {
            setTerm(term)
            calculate(credit.sum, Number(term), credit.percents)
            setCredit({
                ...credit,
                date: credit.date,
                dayOfPay: credit.dayOfPay,
                sum: credit.sum,
                term: term as unknown as number,
                percents: credit.percents,
                repayments: credit.repayments,
            })
        }
    }

    const onChangePercentages = (percents: string) => {
        if (percents.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/)) {
            setPercents(percents)
            calculate(credit.sum, credit.term, Number(percents))
            setCredit({
                ...credit,
                date: credit.date,
                dayOfPay: credit.dayOfPay,
                sum: credit.sum,
                term: credit.term,
                percents: percents as unknown as number,
                repayments: credit.repayments,
            })
        }
    }

    const handleFloat = () => {
        // Условие предотвращает parseFloat(null) = NaN (когда пользователь удаляет входные данные)
        setSum((parseFloat(sum) || '').toString())
        setPercents((parseFloat(percents) || '').toString())
    }

    const styles = StyleSheet.create({
        title: {
            paddingVertical: 25,
            textAlign: 'center',
            fontSize: 25,
            fontWeight: 'bold',
        },
        input: {
            padding: 10,
            width: '100%',
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

    const colorScheme = useColorScheme()

    const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle = colorScheme === 'light' ? styles.lightContainer : styles.darkContainer
    // Для визуализации корректного значения
    const themeBorderBottomColor = (str: string) => {
        return {
            borderBottomColor: str !== '' ? COLORS.MAIN_BLUE_5 : COLORS.DANGER_COLOR,
        }
    }

    return (
        <>
            {/* Заголовок */}
            <View>
                <AppTextBold style={{ ...styles.title, ...themeTextStyle }}>
                    Расчет параметров кредита
                </AppTextBold>
            </View>
            {/* Содержимое */}
            <View style={styles.block}>
                <AppDateInput
                    commentData="Дата выдачи"
                    defaultDate={new Date(credit.date)}
                    setValueDate={(currentDate: Date) => {
                        setCredit({
                            ...credit,
                            date: currentDate,
                            dayOfPay: credit.dayOfPay,
                            sum: credit.sum,
                            term: credit.term,
                            percents: credit.percents,
                            repayments: credit.repayments,
                        })
                        setDate(currentDate)
                    }}
                />
            </View>
            <View style={{ ...styles.block, ...themeBorderBottomColor(day) }}>
                <Foundation name="calendar" size={36} color={COLORS.MAIN_BLUE_5} />
                <View style={styles.input}>
                    <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>День платежа</Text>
                    <TextInput
                        keyboardType="decimal-pad"
                        placeholder="Введите дату платежа"
                        placeholderTextColor={COLORS.DANGER_COLOR}
                        value={day}
                        style={{ ...styles.text, ...themeTextStyle }}
                        onChangeText={onChangeDayPay}
                    />
                </View>
            </View>
            <View style={{ ...styles.block, ...themeBorderBottomColor(sum) }}>
                <Foundation name="dollar-bill" size={28} color={COLORS.MAIN_BLUE_5} />
                <View style={styles.input}>
                    <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>Сумма кредита</Text>
                    <TextInput
                        keyboardType="decimal-pad"
                        value={sum}
                        style={{ ...styles.text, ...themeTextStyle }}
                        placeholder="Введите сумму кредита"
                        placeholderTextColor={COLORS.DANGER_COLOR}
                        onChangeText={onChangeSum}
                        onBlur={handleFloat}
                    />
                </View>
            </View>
            <View style={{ ...styles.block, ...themeBorderBottomColor(term) }}>
                <AntDesign name="piechart" size={24} color={COLORS.MAIN_BLUE_5} />
                <View style={styles.input}>
                    <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>
                        Срок кредита, мес
                    </Text>
                    <TextInput
                        keyboardType="decimal-pad"
                        value={term}
                        style={{ ...styles.text, ...themeTextStyle }}
                        placeholder="Введите срок кредита, мес"
                        placeholderTextColor={COLORS.DANGER_COLOR}
                        onChangeText={onChangeTerm}
                        onBlur={handleFloat}
                    />
                </View>
            </View>
            <View style={{ ...styles.block, ...themeBorderBottomColor(percents) }}>
                <FontAwesome name="percent" size={24} color={COLORS.MAIN_BLUE_5} />
                <View style={styles.input}>
                    <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>Ставка, %</Text>
                    <TextInput
                        keyboardType="decimal-pad"
                        value={percents}
                        style={{ ...styles.text, ...themeTextStyle }}
                        placeholder="Укажите процент по кредиту"
                        placeholderTextColor={COLORS.DANGER_COLOR}
                        onChangeText={onChangePercentages}
                        onBlur={handleFloat}
                    />
                </View>
            </View>

            <View style={styles.textBlock}>
                <Text style={{ ...styles.text, ...themeTextStyle }}>Ежемесячный платеж: </Text>
                <Text style={{ ...styles.text, ...themeTextStyle }}>{payment + ' \u20BD'}</Text>
            </View>
            <View style={styles.textBlock}>
                <Text style={{ ...styles.text, ...themeTextStyle }}>Переплата: </Text>
                <Text style={{ ...styles.text, ...themeTextStyle }}>{fullInterestsD + ' \u20BD'}</Text>
            </View>
            <View style={styles.textBlock}>
                <Text style={{ ...styles.text, ...themeTextStyle }}>Общая сумма: </Text>
                <Text style={{ ...styles.text, ...themeTextStyle }}>{fullPaymentD + ' \u20BD'}</Text>
            </View>
            <View style={styles.buttons}>
                <AppButton onPress={setDefaultCredit} color={COLORS.MAIN_COLOR}>
                    Начальное значение
                </AppButton>
                <AppButton onPress={saveHandler}>Добавить кредит</AppButton>
            </View>
        </>
    )
}

export default AddCredit
