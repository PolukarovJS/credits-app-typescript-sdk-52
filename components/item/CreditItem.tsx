import React, { FC } from 'react'
import { StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native'
import { CreditType } from '../../app/types'
import { transformDateL, transformDateN } from '../../app/utils/transformDate'
import { AppText } from '../ui/AppText'
import { calculateNumberOfPayOnDate, calculateWithEarlyPaymentsRows } from '../../app/utils/calculator'
import { COLORS, SIZES } from '../../constants'

type PropsType = {
    credit: CreditType
    onPress: (credit: CreditType) => void
    onLongPress: (credit: CreditType) => void
}
export const CreditItem: FC<PropsType> = ({ credit, onPress, onLongPress }) => {
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

    const onPressHandler = () => {
        onPress(credit)
    }

    const onPressLongHandler = () => {
        onLongPress(credit)
    }

    const title_1 = 'Кредит ' + credit.sum.toString() + ' \u20BD до ' + transformDateN(latestDateOfPay)
    const title_2 = 'остаток ' + balanceLoanDebt.toFixed(2) + ' \u20BD'
    const title_3 = 'Платеж ' + transformDateL(dateOfNextPay) + ' ' + pay.toFixed(2) + ' \u20BD '

    const colorScheme = useColorScheme()

    const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle = colorScheme === 'light' ? styles.lightContainer : styles.darkContainer
    return (
        <TouchableOpacity onLongPress={onPressLongHandler} onPress={onPressHandler}>
            <View style={{ ...styles.credit, ...themeContainerStyle }}>
                <AppText style={{ ...styles.title_2, ...themeTextStyle }}>{title_1}</AppText>
                <AppText style={{ ...styles.title_3, ...themeTextStyle }}>{title_2}</AppText>
                <AppText style={{ ...styles.title_2, ...themeTextStyle }}>{title_3}</AppText>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    credit: {
        alignItems: 'center',
        padding: 10,
        borderRadius: 0,
        borderWidth: 0.1,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 30,
        elevation: 5,
    },

    title_1: {
        fontSize: SIZES.small,
    },
    title_2: {
        fontSize: SIZES.medium,
        opacity: 0.7,
    },
    title_3: {
        fontSize: SIZES.large,
    },
    lightContainer: {
        backgroundColor: COLORS.TEXT_WHITE,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_1,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLUE_5,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})
