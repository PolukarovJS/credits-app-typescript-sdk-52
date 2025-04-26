import { Foundation } from '@expo/vector-icons'
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
import { AppButton } from '../ui/AppButton'
import { AppDateInput } from '../ui/AppDateInput'
import ComboBox from 'react-native-combobox'
import { TypeRepayment } from '../../src/types'
import { COLORS, SIZES } from '../../constants'

type PropsType = {
    visible: boolean
    onSave: (period: Date, pay: number, type: TypeRepayment) => void
    onCancel: () => void
}

export const AddPayModal: FC<PropsType> = ({ visible, onCancel, onSave }) => {
    const [selectedValue, setSelectedValue] = useState(0)
    const [period, setPeriod] = useState(new Date(Date.now()))
    const values = ['Срок кредита', 'Сумма платежа']
    const [pay, setPay] = useState('')

    const saveHandler = () => {
        if (period !== undefined && pay !== '') {
            onSave(period, Number(pay), values[selectedValue] as TypeRepayment)
            setPeriod(new Date(Date.now()))
            setPay('')
        } else {
            Alert.alert('Введите обязательные поля!')
        }
    }

    const onCancelHandler = () => {
        setPeriod(new Date(Date.now()))
        setPay('')
        onCancel()
    }

    const onChangePay = (pay: string) => {
        if (pay.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/)) {
            setPay(pay)
        }
    }

    const colorScheme = useColorScheme()

    const themeTextStyle =
        colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle =
        colorScheme === 'light' ? styles.lightContainer : styles.darkContainer
    const themeBorderBottomColor = (str: string) => {
        return {
            borderBottomColor: str !== '' ? COLORS.MAIN_BLUE_5 : COLORS.DANGER_COLOR,
        }
    }

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
                                commentData="Дата выдачи"
                                defaultDate={period}
                                setValueDate={(currentDate: Date) =>
                                    setPeriod(currentDate)
                                }
                            />
                        </View>
                        <View style={{ ...styles.block, ...themeBorderBottomColor(pay) }}>
                            <Foundation
                                name="dollar-bill"
                                size={30}
                                color={COLORS.MAIN_BLUE_5}
                            />
                            <View style={styles.input}>
                                <Text style={styles.comment}>Сумма платежа</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={pay}
                                    style={{ ...styles.text, ...themeTextStyle }}
                                    placeholder="Сумма платежа"
                                    placeholderTextColor={COLORS.DANGER_COLOR}
                                    onChangeText={onChangePay}
                                />
                            </View>
                        </View>
                        <View
                            style={{
                                ...styles.block,
                                marginBottom: 10,
                                height: 90,
                                zIndex: 100,
                            }}
                        >
                            <Foundation
                                name="arrow-down"
                                size={30}
                                color={COLORS.MAIN_BLUE_5}
                            />
                            <View style={{ ...styles.input, padding: 0, height: 90 }}>
                                <Text style={styles.comment}>Что сократить?</Text>
                                <View
                                    style={{
                                        paddingTop: 10,
                                        paddingBottom: 0,
                                        paddingHorizontal: 0,
                                        justifyContent: 'center',
                                        width: 210,
                                        height: 10,
                                    }}
                                >
                                    <ComboBox
                                        values={values}
                                        onValueSelect={setSelectedValue}
                                        defaultValue="Срок кредита"
                                        {...themeContainerStyle}
                                        textColor={
                                            colorScheme === 'dark'
                                                ? COLORS.MAIN_BLUE_2
                                                : COLORS.MAIN_BLACK_1
                                        }
                                        fontSize={SIZES.large}
                                    />
                                </View>
                            </View>
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
        alignItems: 'center',
    },
    input: {
        padding: 10,
        width: '80%',
        fontSize: 20,
        fontFamily: 'roboto-bold',
    },
    buttons: {
        width: '100%',
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
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
    text: {
        fontSize: SIZES.large,
    },
    comment: {
        fontSize: SIZES.small,
        color: COLORS.MAIN_BLUE_5,
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
