import React, { useMemo, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar'
import {
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    LogBox,
    useColorScheme,
} from 'react-native'

import { Text, View } from '../components/Themed'
import { useEffect, useState } from 'react'
import { calculateNumberOfPayOnDate, calculateWithEarlyPaymentsRows } from './../src/utils/calculator'
import { CreditType, RepaymentType, RowType, TypeRepayment, convertICreditRowToRowType } from './../src/types'
import {
    createHolidayAsync,
    createRepaymentAsync,
    deleteCreditAsync,
    deleteHolidayAsync,
    deleteRepaymentAsync,
    getCreditsAsync,
    setSelectedCredit,
    updateCreditAsync,
} from '../src/redux/reducers/credits-reducer'
import { useRouter } from 'expo-router'
import { useAppDispatch, useAppSelector } from './../src/hooks/hook'
import Loader from '../components/ui/Loader'
import { EditModal } from '../components/credit/EditModal'
import { PaymentScheduleModal } from '../components/credit/PaymentScheduleModal'
import { AddPayModal } from '../components/credit/AddPayModalAI'
import { AppTextBold } from '../components/ui/AppTextBold'
import { transformDate } from './../src/utils/transformDate'
import { Repayment } from '../components/credit/Repayment'
import { Holiday } from '../components/credit/Holiday'
import { AppButton } from '../components/ui/AppButton'
import Padding from '../components/ui/Padding'
import { AppText } from '../components/ui/AppText'
import { AddHolidayModal } from '../components/credit/AddHolidayModal'
import { COLORS, SIZES } from '../constants'
import { useCalculateAnnuity } from '../src/hooks/useCalculateAnnuity'

const Credit = () => {
    const router = useRouter()
    const dispatch = useAppDispatch()
    const { credits, isLoading, selectedCredit } = useAppSelector((state) => state.creditsPage)
    const [isReady, setIsReady] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalSVisible, setModalSVisible] = useState(false)
    const [modalRVisible, setModalRVisible] = useState(false)
    const [modalHVisible, setModalHVisible] = useState(false)

    let credit = credits.find((credit: CreditType) => credit.id === selectedCredit) as CreditType
    const {calculatedPayment, calculatedFullInterests, calculatedFullPayment} = useCalculateAnnuity(credit.sum, credit.term, credit.percents)
    const [payment, setPayment] = useState(calculatedPayment)
    const [fullInterests, setFullInterests] = useState(calculatedFullInterests)
    const [fullInterestsAfterPay, setFullInterestsAfterPay] = useState(0)
    const [fullPayment, setFullPayment] = useState(calculatedFullPayment)
    const [fullPaymentAfterPay, setFullPaymentAfterPay] = useState(0)
    const [rowsShow, setRowsShow] = useState<RowType[]>([])

    const updateCreditHandler = (upCredit: CreditType) => {
        dispatch(updateCreditAsync(upCredit))
        setModalVisible(false)
    }

    const saveCreateRepaymentHandler = (period: Date, pay: number, type: TypeRepayment) => {
        console.log('Press AddPayModal {credit.ts, saveCreateRepaymentHandler}: ' + period + pay + type)
        dispatch(createRepaymentAsync({ credit, dateOfPay: period, pay, type }))
        dispatch(getCreditsAsync())
        setModalRVisible(false)
    }

    const deleteRepaymentHandler = (id: number) => {
        dispatch(deleteRepaymentAsync(id))
        dispatch(getCreditsAsync())
    }

    const deleteAllRepaymentsHandler = () => {
        for (let index = 0; index < credit.repayments.length; index++) {
            const repayment = credit.repayments[index]
            if (new Date(repayment.date).getTime() > new Date(Date.now()).getTime()) {
                dispatch(deleteRepaymentAsync(repayment.id))
            }
        }
        dispatch(getCreditsAsync())
    }

    const deleteHolidayHandler = (id: number) => {
        dispatch(deleteHolidayAsync(id))
        dispatch(getCreditsAsync())
    }

    const deleteCreditHandler = () => {
        dispatch(deleteCreditAsync(credit))
        dispatch(setSelectedCredit(-1))
        dispatch(getCreditsAsync())
        router.push('/Credits')
    }

    const addHolidayHandler = (datePay: Date) => {
        let number_pay = calculateNumberOfPayOnDate(datePay, credit) + 1
        let date = calculateWithEarlyPaymentsRows(credit)[number_pay - 1].date
        dispatch(createHolidayAsync({ credit, date, number_pay }))
        dispatch(getCreditsAsync())
        setModalHVisible(false)
    }

    const onCancelHandler = () => {
        setModalRVisible(false)
    }
    const onCancelHandlerH = () => {
        setModalHVisible(false)
    }

    const calculator = (credit: CreditType) => {
        setIsReady(false)
        setFullInterests(0)
        setFullPayment(0)
        setPayment(0)

        const percentMonth = credit.percents / 1200
        setPayment(credit.sum * (percentMonth + percentMonth / ((1 + percentMonth) ** credit.term - 1)))
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

    // Выносим useMemo на верхний уровень компонента
    const rowsDefault = useMemo(() => {
        if (!credit) return [];
        return calculateWithEarlyPaymentsRows(credit);
    }, [credit]);

    const rowsRowType = useMemo(() => {
        let z = 0;
        let u = 0;
        const rows = rowsDefault.map((row) => {
            const rowType = convertICreditRowToRowType(row);
            z += row.interests;
            u += row.payment;
            return rowType;
        });
        return { rows, fullInterestsAfterPay: z, fullPaymentAfterPay: u };
    }, [rowsDefault]);

    // useEffect(() => {
    //     LogBox.ignoreLogs(['VirtualizedLists should never be nested'])
    // }, []);

    useEffect(() => {
        if (credit) {
            calculator(credit);
            setRowsShow(rowsRowType.rows);
            setFullInterestsAfterPay(rowsRowType.fullInterestsAfterPay);
            setFullPaymentAfterPay(rowsRowType.fullPaymentAfterPay);
        }
    }, [credit, rowsRowType])

    const colorScheme = useColorScheme()

    const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle = colorScheme === 'light' ? styles.lightContainer : styles.darkContainer

    if (credit && isReady && !isLoading) {
        return (
            <View style={styles.container}>
                <Padding style={{ ...styles.wrapper, ...themeContainerStyle }}>
                    <EditModal
                        onUpdate={updateCreditHandler}
                        value={credit}
                        visible={modalVisible}
                        onCancel={() => setModalVisible(false)}
                    />
                    <PaymentScheduleModal
                        rowsShow={rowsShow}
                        visible={modalSVisible}
                        onCancel={() => setModalSVisible(false)}
                    />
                    <AddPayModal
                        visible={modalRVisible}
                        onSave={saveCreateRepaymentHandler}
                        onCancel={onCancelHandler}
                    />
                    <AddHolidayModal
                        visible={modalHVisible}
                        onSave={addHolidayHandler}
                        onCancel={onCancelHandlerH}
                    />
                    
                    <FlatList
                        data={credit.repayments && credit.repayments.length > 0 ? credit.repayments : []}
                        renderItem={({ item }) => (
                            <Repayment remove={deleteRepaymentHandler} repayment={item} />
                        )}
                        keyExtractor={(item) => item.id.toString()}
                        ListEmptyComponent={<View />} // Пустой компонент для пустого списка
                        ListHeaderComponent={() => (
                            <>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Сумма кредита'}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {credit.sum + ' \u20BD'}
                                </AppText>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Процентная ставка по кредиту'}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {credit.percents + '%'}
                                </AppText>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Срок кредита'}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {credit.term + ' месяцев'}
                                </AppText>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Дата выдачи'}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {transformDate(credit.date)}
                                </AppText>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Ежемесячный платеж'}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {payment.toFixed(2) + ' \u20BD'}
                                </AppText>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Переплата (с учетом досрочных платежей)'}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {credit.repayments || credit.holidays
                                        ? fullInterests.toFixed(2) +
                                          ' \u20BD' +
                                          ` (${fullInterestsAfterPay.toFixed(2)}  \u20BD)`
                                        : fullInterests.toFixed(2) +
                                          ` \u20BD (${fullInterests.toFixed(2) + '\u20BD'})`}
                                </AppText>
                                <AppText style={{ ...styles.headerTitle, ...themeTextStyle }}>
                                    {'Общая сумма выплат (с учетом досрочных платежей) '}
                                </AppText>
                                <AppText style={{ ...styles.title, ...themeTextStyle }}>
                                    {fullPayment.toFixed(2) +
                                        ` \u20BD (${fullPaymentAfterPay.toFixed(2)}  \u20BD)`}
                                </AppText>
                                
                                {credit.repayments && credit.repayments.length > 0 && (
                                    <AppTextBold
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 16,
                                            marginTop: 10,
                                            ...themeTextStyle,
                                        }}
                                    >
                                        Досрочные платежи
                                    </AppTextBold>
                                )}
                            </>
                        )}
                        ListFooterComponent={() => (
                            <>
                                {credit.repayments && credit.repayments.length > 0 && (
                                    <View
                                        style={{
                                            width: 'auto',
                                        }}
                                    >
                                        <AppButton
                                            onPress={deleteAllRepaymentsHandler}
                                            color={COLORS.MAIN_COLOR}
                                        >
                                            <Text style={{ color: COLORS.MAIN_COLOR }}>
                                                Удалить все досрочные платежи
                                            </Text>
                                        </AppButton>
                                    </View>
                                )}

                                {credit.holidays && credit.holidays.length > 0 && (
                                    <>
                                        <AppTextBold
                                            style={{
                                                textAlign: 'center',
                                                fontSize: 16,
                                                marginTop: 10,
                                                ...themeTextStyle,
                                            }}
                                        >
                                            Кредитные каникулы
                                        </AppTextBold>
                                        
                                        {credit.holidays.map(item => (
                                            <Holiday 
                                                key={item.id.toString()}
                                                remove={deleteHolidayHandler} 
                                                holiday={item} 
                                            />
                                        ))}
                                    </>
                                )}

                                <View style={styles.buttons}>
                                    <View style={styles.button}>
                                        <AppButton onPress={() => setModalVisible(true)}>
                                            <Text>Изменить</Text>
                                        </AppButton>
                                    </View>
                                    <View style={styles.button}>
                                        <AppButton
                                            onPress={() => setModalRVisible(true)}
                                            color={COLORS.MAIN_COLOR}
                                        >
                                            <Text>Внести платеж</Text>
                                        </AppButton>
                                    </View>
                                    <View style={styles.button}>
                                        <AppButton onPress={() => setModalSVisible(true)}>
                                            <Text>График</Text>
                                        </AppButton>
                                    </View>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-around',
                                    }}
                                >
                                    <View
                                        style={{
                                            width: '99%',
                                        }}
                                    >
                                        <AppButton
                                            onPress={() => setModalHVisible(true)}
                                            color={COLORS.DANGER_COLOR}
                                        >
                                            <Text>Пропустить платеж</Text>
                                        </AppButton>
                                    </View>
                                </View>

                                <View style={styles.buttons}>
                                    <View style={styles.button}>
                                        <AppButton
                                            onPress={() => {
                                                dispatch(getCreditsAsync())
                                                router.back()
                                            }}
                                            color={COLORS.MAIN_BLUE_5}
                                        >
                                            <Text>Назад</Text>
                                        </AppButton>
                                    </View>
                                    <View style={styles.button}>
                                        <AppButton onPress={deleteCreditHandler} color={COLORS.MAIN_BLUE_5}>
                                            <Text>Удалить кредит</Text>
                                        </AppButton>
                                    </View>
                                </View>
                            </>
                        )}
                    />
                    
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
        width: Dimensions.get('window').width > 400 ? 125 : 110,
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
        backgroundColor: COLORS.TEXT_LightWhite,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_0,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLUE_5,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})