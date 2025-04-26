import { AntDesign, FontAwesome, Foundation } from '@expo/vector-icons'
import React, { FC, useState } from 'react'
import {
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    View,
    useColorScheme,
} from 'react-native'
import { CreditType } from '../../src/types'
import { AppButton } from '../ui/AppButton'
import { AppDateInput } from '../ui/AppDateInput'
import { COLORS, SIZES } from '../../constants'

type PropsType = {
    visible: boolean
    value: CreditType
    onCancel: () => void
    onUpdate: (credit: CreditType) => void
}

export const EditModal: FC<PropsType> = ({ visible, value, onCancel, onUpdate }) => {
    const [credit, setCredit] = useState(value)
    const defaultPayment =
        value.sum *
        (value.percents / 1200 +
            value.percents / 1200 / ((1 + value.percents / 1200) ** value.term - 1))

    let totalDebt = value.sum
    let interests = (value.sum * value.percents) / 1200
    let debt = 0
    let defaultFullInterests = 0
    let defaultFullPayment = 0

    for (let index = 1; index <= value.term; index++) {
        interests = (totalDebt * value.percents) / 1200
        debt = defaultPayment - interests
        totalDebt = totalDebt - debt
        defaultFullInterests = defaultFullInterests + interests
        defaultFullPayment = defaultFullPayment + interests + debt
    }
    const [payment, setPayment] = useState(defaultPayment.toFixed(2))
    const [fullInterestsD, setFullInterestsD] = useState(defaultFullInterests.toFixed(2))
    const [fullPaymentD, setFullPaymentD] = useState(defaultFullPayment.toFixed(2))
    const [sum, setSum] = useState(value.sum.toString())
    const [day, setDay] = useState(value.dayOfPay.toString())
    const [date, setDate] = useState(value.date)
    const [term, setTerm] = useState(value.term.toString())
    const [percents, setPercents] = useState(value.percents.toString())

    // Расчет платежа по кредиту
    const calculate = (sum: number, term: number, percentages: number) => {
        if (percentages > 0 && sum > 0 && term > 0) {
            const percentMonth = percentages / 1200
            const newPayment =
                sum * (percentMonth + percentMonth / ((1 + percentMonth) ** term - 1))
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
            console.log('Введите обязательные поля!')
        }
    }

    const saveHandler = () => {
        if (credit.date && credit.sum > 0 && credit.term > 0 && credit.percents > 0) {
            onUpdate(credit)
        } else {
            Alert.alert('Введите обязательные поля!!!')
        }
    }

    const onCancelHandler = () => {
        setCredit(value)
        setPayment(defaultPayment.toFixed(2))
        setFullInterestsD(defaultFullInterests.toFixed(2))
        setFullPaymentD(defaultFullPayment.toFixed(2))
        onCancel()
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

    const colorScheme = useColorScheme()

    const themeTextStyle =
        colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle =
        colorScheme === 'light' ? styles.lightContainer : styles.darkContainer

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View
                style={{
                    ...styles.container,
                    ...(colorScheme === 'light'
                        ? { backgroundColor: COLORS.TEXT_LightWhite }
                        : { backgroundColor: COLORS.MAIN_BLACK_0 }),
                }}
            >
                <View style={{ ...styles.wrapperShadow, ...themeContainerStyle }}>
                    <View
                        style={{
                            ...styles.wrap,
                            ...themeContainerStyle,
                        }}
                    >
                        <View style={styles.block}>
                            <View style={{ marginLeft: 16 }}>
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
                        </View>
                        <View style={styles.block}>
                            <Foundation
                                name="calendar"
                                size={36}
                                color={COLORS.MAIN_BLUE_5}
                            />
                            <View style={styles.input}>
                                <Text style={styles.comment}>День платежа</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    placeholder="День платежа"
                                    placeholderTextColor={COLORS.DANGER_COLOR}
                                    value={day}
                                    style={{ ...styles.text, ...themeTextStyle }}
                                    onChangeText={onChangeDayPay}
                                />
                            </View>
                        </View>
                        <View style={styles.block}>
                            <Foundation
                                name="dollar-bill"
                                size={28}
                                color={COLORS.MAIN_BLUE_5}
                            />
                            <View style={styles.input}>
                                <Text style={styles.comment}>Сумма кредита</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={sum}
                                    style={{ ...styles.text, ...themeTextStyle }}
                                    onChangeText={onChangeSum}
                                    placeholder="Сумма кредита"
                                    placeholderTextColor={COLORS.DANGER_COLOR}
                                    onBlur={handleFloat}
                                />
                            </View>
                        </View>
                        <View style={styles.block}>
                            <AntDesign
                                name="piechart"
                                size={24}
                                color={COLORS.MAIN_BLUE_5}
                            />
                            <View style={styles.input}>
                                <Text style={styles.comment}>Срок кредита, мес</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={term}
                                    style={{ ...styles.text, ...themeTextStyle }}
                                    placeholder="Срок кредита, мес"
                                    placeholderTextColor={COLORS.DANGER_COLOR}
                                    onChangeText={onChangeTerm}
                                />
                            </View>
                        </View>
                        <View style={styles.block}>
                            <FontAwesome
                                name="percent"
                                size={24}
                                color={COLORS.MAIN_BLUE_5}
                            />
                            <View style={styles.input}>
                                <Text style={styles.comment}>Ставка, %</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={percents}
                                    style={{ ...styles.text, ...themeTextStyle }}
                                    placeholder="Ставка, %"
                                    placeholderTextColor={COLORS.DANGER_COLOR}
                                    onChangeText={onChangePercentages}
                                    onBlur={handleFloat}
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ ...styles.text, ...themeTextStyle }}>
                                Ежемесячный платеж:{' '}
                            </Text>
                            <Text style={{ ...styles.text, ...themeTextStyle }}>
                                {payment + ' \u20BD'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ ...styles.text, ...themeTextStyle }}>
                                Переплата:{' '}
                            </Text>
                            <Text style={{ ...styles.text, ...themeTextStyle }}>
                                {fullInterestsD + ' \u20BD'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ ...styles.text, ...themeTextStyle }}>
                                Общая сумма:{' '}
                            </Text>
                            <Text style={{ ...styles.text, ...themeTextStyle }}>
                                {fullPaymentD + ' \u20BD'}
                            </Text>
                        </View>

                        <View style={styles.buttons}>
                            <AppButton
                                onPress={onCancelHandler}
                                color={COLORS.DANGER_COLOR}
                            >
                                Отменить
                            </AppButton>
                            <AppButton onPress={saveHandler}>Сохранить</AppButton>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapperShadow: {
        margin: 50,
        padding: 15,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    wrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    block: {
        justifyContent: 'center',
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        marginBottom: 15,
        borderBottomColor: COLORS.MAIN_BLUE_5,
        borderBottomWidth: 2,
        width: '100%',
    },
    input: {
        padding: 10,
        width: '80%',
        fontSize: 20,
        fontFamily: 'roboto-bold',
    },
    comment: {
        fontSize: SIZES.small,
        color: COLORS.MAIN_BLUE_5,
    },
    text: {
        fontSize: SIZES.large,
    },
    buttons: {
        width: '80%',
        marginLeft: 7,
        marginTop: 20,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    lightContainer: {
        backgroundColor: COLORS.TEXT_LightWhite,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_1,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLACK_1,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})
