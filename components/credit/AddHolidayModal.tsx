import React, { FC, useState } from 'react'
import { Alert, Modal, StyleSheet, Text, View, useColorScheme } from 'react-native'
import { AppButton } from '../ui/AppButton'
import { AppDateInput } from '../ui/AppDateInput'
import { COLORS } from '../../constants'

type PropsType = {
    visible: boolean
    onSave: (period: Date) => void
    onCancel: () => void
}

export const AddHolidayModal: FC<PropsType> = ({ visible, onCancel, onSave }) => {
    const [period, setPeriod] = useState(new Date(Date.now()))

    const saveHandler = () => {
        if (period !== undefined) {
            onSave(period)
            setPeriod(new Date(Date.now()))
        } else {
            Alert.alert('Введите обязательные поля!')
        }
    }

    const onCancelHandler = () => {
        setPeriod(new Date(Date.now()))
        onCancel()
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
                            <AppDateInput
                                commentData="Дата платежа"
                                defaultDate={period}
                                setValueDate={(currentDate: Date) =>
                                    setPeriod(currentDate)
                                }
                            />
                        </View>

                        <View style={styles.buttons}>
                            <AppButton
                                onPress={onCancelHandler}
                                color={COLORS.DANGER_COLOR}
                            >
                                <Text>Отменить</Text>
                            </AppButton>
                            <AppButton onPress={saveHandler} color={COLORS.MAIN_BLUE_5}>
                                Сохранить
                            </AppButton>
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
    buttons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 5,
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
        color: COLORS.TEXT_WHITE,
    },
})
