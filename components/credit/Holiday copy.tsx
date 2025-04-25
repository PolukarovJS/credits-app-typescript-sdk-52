import React, { FC } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native'
import { HolidayType, RepaymentType } from '../../app/types'
import { transformDate } from '../../app/utils/transformDate'
import { AppText } from '../ui/AppText'
import { COLORS } from '../../constants'

type PropsType = {
    holiday: HolidayType
    remove: (id: number) => void
}

export const Holiday: FC<PropsType> = ({ holiday, remove }) => {
    const onPressHandler = () => {
        Alert.alert(
            'Удаление кредита',
            `\nВы действительно хотите отменить кредитные каникулы ${transformDate(
                holiday.date
            )}`,
            [
                {
                    text: 'Отмена',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: () => {
                        remove(holiday.id)
                    },
                    style: 'default',
                },
            ],
            { userInterfaceStyle: 'unspecified' }
        )
    }
    const title =
        'Платеж № ' + holiday.number_pay + ' Дата платежа: ' + transformDate(holiday.date)
    const colorScheme = useColorScheme()

    const themeTextStyle =
        colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle =
        colorScheme === 'light' ? styles.lightContainer : styles.darkContainer
    return (
        <TouchableOpacity
            onLongPress={onPressHandler}
            onPress={() => console.log('Press', transformDate(holiday.date))}
        >
            <View style={{ ...styles.holiday, ...themeContainerStyle }}>
                <AppText style={{ ...styles.title, ...themeTextStyle }}>{title}</AppText>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    holiday: {
        alignItems: 'center',
        padding: 15,
        borderWidth: 2,
        borderColor: COLORS.DANGER_COLOR,
        borderRadius: 5,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
    },
    date: {
        fontSize: 14,
    },
    lightContainer: {
        backgroundColor: COLORS.TEXT_LightWhite,
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
