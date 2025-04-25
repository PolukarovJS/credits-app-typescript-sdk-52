import { StatusBar } from 'expo-status-bar'
import { Platform, ScrollView, StyleSheet, LogBox, useColorScheme } from 'react-native'

import { Text, View } from '../components/Themed'
import { useEffect, useState } from 'react'
import { calculateWithEarlyPaymentsRows } from './utils/calculator'
import { CreditType, RowType, convertICreditRowToRowType } from './types'

import { useAppSelector } from './hooks/hook'
import Loader from '../components/ui/Loader'
import { PaymentScheduleModal } from '../components/credit/PaymentScheduleModal'
import { transformDate } from './utils/transformDate'
import { AppButton } from '../components/ui/AppButton'
import Padding from '../components/ui/Padding'
import { AppText } from '../components/ui/AppText'
import { COLORS, SIZES } from '../constants'

const Credit = () => {
    const { isLoading, tempCredit } = useAppSelector((state) => state.creditsPage)
    const [isReady, setIsReady] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)

    let defaultPayment = 10000

    if (tempCredit) {
        defaultPayment =
            tempCredit.sum *
            (tempCredit.percents / 1200 +
                tempCredit.percents /
                    1200 /
                    ((1 + tempCredit.percents / 1200) ** tempCredit.term - 1))
        let totalDebt = tempCredit.sum
        let interests = (tempCredit.sum * tempCredit.percents) / 1200
        let debt = 0
        let defaultFullInterests = 0
        let defaultFullPayment = 0

        for (let index = 1; index <= tempCredit.term; index++) {
            interests = (totalDebt * tempCredit.percents) / 1200
            debt = defaultPayment - interests
            totalDebt = totalDebt - debt
            defaultFullInterests = defaultFullInterests + interests
            defaultFullPayment = defaultFullPayment + interests + debt
        }
    }

    const [payment, setPayment] = useState(defaultPayment)
    const [fullInterests, setFullInterests] = useState(0)
    const [fullPayment, setFullPayment] = useState(0)
    const [rowsShow, setRowsShow] = useState<RowType[]>([])

    const calculator = (credit: CreditType) => {
        setIsReady(false)
        setFullInterests(0)
        setFullPayment(0)
        setPayment(0)

        const percentMonth = credit.percents / 1200
        setPayment(
            credit.sum *
                (percentMonth + percentMonth / ((1 + percentMonth) ** credit.term - 1))
        )
        let totalDebt = credit.sum
        let interests = credit.sum * percentMonth
        let debt = 0
        let v = 0
        let y = 0
        for (let index = 1; index <= credit.term; index++) {
            interests = totalDebt * percentMonth
            debt = payment - interests
            totalDebt = totalDebt - debt
            v = v + interests
            y = y + interests + debt
        }

        setFullInterests(v)
        setFullPayment(y)
        setIsReady(true)
    }

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested'])
    }, [])

    useEffect(() => {
        console.log('useEffect с зависимостью tempCredit')
        if (tempCredit) {
            calculator(tempCredit)
            let rowsDefault = calculateWithEarlyPaymentsRows({
                date: tempCredit.date,
                dayOfPay: tempCredit.dayOfPay,
                id: tempCredit.id,
                percents: tempCredit.percents,
                sum: tempCredit.sum,
                term: tempCredit.term,
            } as CreditType)
            let rowsRowType: Array<RowType> = []
            for (let i = 0; i < rowsDefault.length; i++) {
                rowsRowType.push(convertICreditRowToRowType(rowsDefault[i]))
            }
            setRowsShow(rowsRowType)
        }
    }, [tempCredit])

    const colorScheme = useColorScheme()

    const themeTextStyle =
        colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle =
        colorScheme === 'light' ? styles.lightContainer : styles.darkContainer

    if (tempCredit && isReady && !isLoading && rowsShow) {
        return (
            <View style={styles.container}>
                <Padding style={{ ...styles.wrapper, ...themeContainerStyle }}>
                    <PaymentScheduleModal
                        rowsShow={rowsShow}
                        visible={modalVisible}
                        onCancel={() => setModalVisible(false)}
                    />
                    <ScrollView>
                        <>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Сумма кредита'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {tempCredit.sum + ' \u20BD'}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Процентная ставка по кредиту'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {tempCredit.percents + '%'}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Срок кредита'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {tempCredit.term + ' месяцев'}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Дата выдачи'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {transformDate(tempCredit.date)}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'День платежа'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {tempCredit.dayOfPay}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Ежемесячный платеж'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {payment.toFixed(2) + ' \u20BD'}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Переплата'}
                            </AppText>

                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {fullInterests.toFixed(2) + ' \u20BD'}
                            </AppText>
                            <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                {'Общая сумма выплат'}
                            </AppText>
                            <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                {fullPayment.toFixed(2) + ` \u20BD `}
                            </AppText>
                        </>

                        <View style={styles.buttons}>
                            <View style={{ ...styles.button, ...themeTextStyle }}>
                                <AppButton onPress={() => setModalVisible(true)}>
                                    <Text>График</Text>
                                </AppButton>
                            </View>
                        </View>
                    </ScrollView>
                    {/* Используйте светлую строку состояния в iOS, чтобы учесть черное пространство над модальным */}
                    <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
                </Padding>
            </View>
        )
    } else
        return (
            <View style={styles.container}>
                <Loader />
                {/* Используйте светлую строку состояния в iOS, чтобы учесть черное пространство над модальным */}
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
            </View>
        )
}

export default Credit

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        height: '100%',
        width: '100%',
        justifyContent: 'center',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
        paddingBottom: 10,
    },
    button: {
        width: '100%',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    headerTitle: {
        marginTop: 15,
        marginLeft: 10,
        fontSize: SIZES.medium,
        opacity: 0.6,
    },
    title: {
        marginLeft: 10,
        fontSize: SIZES.large,
    },
    lightContainer: {
        backgroundColor: COLORS.lightWhite,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_0,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLUE_7,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})
