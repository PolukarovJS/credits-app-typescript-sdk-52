import React, { FC, useState } from 'react'
import { StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native'
import DateTimePicker, {
    DateTimePickerEvent,
    Event,
} from '@react-native-community/datetimepicker'
import { FontAwesome } from '@expo/vector-icons'
import { transformDate } from '../../src/utils/transformDate'
import { COLORS, SIZES } from '../../constants'

type PropsType = {
    commentData: string
    setValueDate: (currentDate: Date) => void
    defaultDate: Date
}

export const AppDateInput: FC<PropsType> = ({
    commentData,
    setValueDate,
    defaultDate,
}) => {
    const colorScheme = useColorScheme()

    const themeTextStyle =
        colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle =
        colorScheme === 'light' ? styles.lightContainer : styles.darkContainer

    const [date, setDate] = useState(defaultDate)
    const [show, setShow] = useState(false)
    const [dateString, setDateString] = useState(transformDate(defaultDate))

    const onChange = (event: DateTimePickerEvent, selectedDate?: Date | undefined) => {
        const currentDate = selectedDate || date
        setShow(false)
        setDate(currentDate)
        setDateString(transformDate(currentDate))
        setValueDate(currentDate)
    }

    const showDatePicker = () => {
        setShow(true)
    }

    return (
        <View>
            <View style={styles.block}>
                {/* <FontAwesome name="calendar" size={24} color={THEME.TEXT_WHITE} /> */}
                <FontAwesome name="calendar" size={24} color={COLORS.MAIN_BLUE_5} />
                <TouchableOpacity style={styles.input} onPress={showDatePicker}>
                    <Text style={{ ...styles.comment, color: COLORS.MAIN_BLUE_5 }}>
                        {commentData}
                    </Text>
                    <Text style={{ ...styles.text, ...themeTextStyle }}>
                        {dateString}
                    </Text>
                </TouchableOpacity>
            </View>
            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode={'date'}
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    datePicker: {
        color: COLORS.TEXT_WHITE,
    },
    block: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    text: {
        fontSize: SIZES.large,
    },
    comment: {
        fontSize: SIZES.small,
    },
    input: {
        margin: 10,
        borderStyle: 'solid',
        height: 40,
        alignItems: 'flex-start',
        width: '80%',
    },
    lightContainer: {
        backgroundColor: COLORS.MAIN_BLUE_2,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLUE_5,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLACK_0,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})
