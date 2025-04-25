import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { THEME } from '../../constants/theme'
import { CreditType } from '../../app/types'
import { AppText } from './AppText'

type PropsType = {
    creditCoff: {
        id: string
        credit: CreditType
        pay: number
        coefficient: number
    }
}
export const CreditItem: FC<PropsType> = ({ creditCoff }) => {
    return (
        <View style={styles.credit}>
            <AppText style={styles.title}>
                {`По кредиту ${creditCoff.credit.sum} \u20BD ` +
                    'внесите: ' +
                    `${creditCoff.pay.toFixed(0)} \u20BD \nвыгода составит: ${(
                        creditCoff.coefficient * creditCoff.pay
                    ).toFixed(2)} \u20BD`}
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    credit: {
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: THEME.MAIN_BLACK_1,
    },
    title: {
        fontSize: 15,
        color: THEME.TEXT_WHITE,
    },
})
