import React, { FC } from 'react'
import { StyleSheet, View } from 'react-native'
import { COLORS } from '../../constants/theme'
import { RowType } from '../../app/types'
import { AppText } from './AppText'

export const Row: FC<{ row: RowType }> = ({ row }) => {
    return (
        <View style={styles.row}>
            <View style={{ alignItems: 'center', width: '10%', padding: 0 }}>
                <AppText style={styles.text}>{row.id + '.'}</AppText>
            </View>
            <View style={{ alignItems: 'center', width: '30%' }}>
                <AppText style={styles.text}>{row.payment + ' \u20BD'}</AppText>
                <AppText style={styles.text}>{row.date}</AppText>
            </View>
            <View style={{ alignItems: 'center', width: '30%' }}>
                <AppText style={styles.text}>{row.debt + ' \u20BD'}</AppText>
                <AppText style={styles.text}>{row.interests + ' \u20BD'}</AppText>
            </View>
            <View style={{ alignItems: 'center', width: '30%' }}>
                <AppText style={styles.text}>{row.totalDebt + ' \u20BD'}</AppText>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        color: COLORS.white,
        paddingBottom: 3,
        paddingTop: 3,
        borderBottomWidth: 1,
        borderColor: COLORS.MAIN_BLUE_2,
    },
    text: {
        fontSize: 13,
        color: COLORS.MAIN_BLUE_2,
    },
})
