import { StatusBar } from 'expo-status-bar'
import { Platform, ScrollView, StyleSheet, LogBox, useColorScheme } from 'react-native'

import { Text, View } from '../components/Themed'
import { useEffect, useState, useMemo } from 'react'
import { calculateWithEarlyPaymentsRows } from './../src/utils/calculator'
import { CreditType, RowType, convertICreditRowToRowType } from './../src/types'

import { useAppSelector } from './../src/hooks/hook'
import Loader from '../components/ui/Loader'
import { PaymentScheduleModal } from '../components/credit/PaymentScheduleModal'
import { transformDate } from './../src/utils/transformDate'
import { AppButton } from '../components/ui/AppButton'
import Padding from '../components/ui/Padding'
import { AppText } from '../components/ui/AppText'
import { COLORS, SIZES } from '../constants'
import { useCalculateAnnuity } from '../src/hooks/useCalculateAnnuity'

const Credit = () => {
    const { isLoading, tempCredit } = useAppSelector((state) => state.creditsPage)
    const [isReady, setIsReady] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)

    const {calculatedPayment, calculatedFullInterests, calculatedFullPayment} = useCalculateAnnuity(tempCredit.sum, tempCredit.term, tempCredit.percents)

    const [payment, setPayment] = useState(calculatedPayment)
    const [fullInterests, setFullInterests] = useState(calculatedFullInterests)
    const [fullPayment, setFullPayment] = useState(calculatedFullPayment)
    const [rowsShow, setRowsShow] = useState<RowType[]>([])

    const calculator = (credit: CreditType) => {
        setIsReady(false)
        setFullInterests(0)
        setFullPayment(0)
        setPayment(0)
        const {calculatedPayment, calculatedFullInterests, calculatedFullPayment} = useCalculateAnnuity(credit.sum, credit.term, credit.percents)
        setPayment(calculatedPayment)
        setFullInterests(calculatedFullInterests)
        setFullPayment(calculatedFullPayment)
        setIsReady(true)
    }

    // Выносим useMemo на верхний уровень компонента
    const rowsDefault = useMemo(() => {
        if (!tempCredit) return [];
        return calculateWithEarlyPaymentsRows({
            date: tempCredit.date,
            dayOfPay: tempCredit.dayOfPay,
            id: tempCredit.id,
            percents: tempCredit.percents,
            sum: tempCredit.sum,
            term: tempCredit.term,
        } as CreditType);
    }, [tempCredit]);

    const rowsRowType = useMemo(() => {
        let z = 0;
        let u = 0;
        const rows = rowsDefault.map((row) => {
            const rowType = convertICreditRowToRowType(row);
            z += row.interests;
            u += row.payment;
            return rowType;
        });
        return { rows, fullInterests: z, fullPayment: u };
    }, [rowsDefault]);

    useEffect(() => {
        LogBox.ignoreLogs(['VirtualizedLists should never be nested'])
    }, [])

    useEffect(() => {
        console.log('useEffect с зависимостью tempCredit')
        if (tempCredit) {
            calculator(tempCredit);
            setRowsShow(rowsRowType.rows);
            setFullInterests(rowsRowType.fullInterests);
            setFullPayment(rowsRowType.fullPayment);
        }
    }, [tempCredit, rowsRowType])

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