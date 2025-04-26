import React, { FC, useState } from 'react'
import { Alert, Modal, StyleSheet, Text, TextInput, View, useColorScheme } from 'react-native'
import { Foundation } from '@expo/vector-icons'
import ComboBox from 'react-native-combobox'
import { AppButton } from '../ui/AppButton'
import { AppDateInput } from '../ui/AppDateInput'
import { TypeRepayment } from '../../src/types'
import { COLORS, SIZES } from '../../constants'

type PropsType = {
    visible: boolean
    onSave: (period: Date, pay: number, type: TypeRepayment) => void
    onCancel: () => void
}

export const AddPayModal: FC<PropsType> = ({ visible = false, onCancel, onSave }) => {
    const [selectedValue, setSelectedValue] = useState(0)
    const [period, setPeriod] = useState(new Date())
    const [pay, setPay] = useState('')
    const values = ['Срок кредита', 'Сумма платежа']

    const saveHandler = () => {
        if (period && pay) {
            onSave(period, Number(pay), values[selectedValue] as TypeRepayment)
            resetForm()
        } else {
            Alert.alert('Введите обязательные поля!')
        }
    }

    const resetForm = () => {
        setPeriod(new Date())
        setPay('')
    }

    const onCancelHandler = () => {
        resetForm()
        onCancel()
    }

    const onChangePay = (pay: string) => {
        if (/^(\d+)?(\.\d*)?$/.test(pay)) {
            setPay(pay)
        }
    }

    const colorScheme = useColorScheme()
    const isLightTheme = colorScheme === 'light'

    const themeStyles = {
        container: isLightTheme ? styles.lightContainer : styles.darkContainer,
        text: isLightTheme ? styles.lightThemeText : styles.darkThemeText,
        borderBottomColor: (str: string) => (str ? COLORS.MAIN_BLUE_5 : COLORS.DANGER_COLOR),
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <View style={[styles.container, themeStyles.container]}>
                <View style={[styles.wrapperShadow, themeStyles.container]}>
                    <View style={[styles.wrap, themeStyles.container]}>
                        <View style={styles.block}>
                            <AppDateInput
                                commentData="Дата выдачи"
                                defaultDate={period}
                                setValueDate={setPeriod}
                            />
                        </View>
                        <View
                            style={[
                                styles.block,
                                { borderBottomColor: themeStyles.borderBottomColor(pay) },
                            ]}
                        >
                            <Foundation name="dollar-bill" size={30} color={COLORS.MAIN_BLUE_5} />
                            <View style={styles.input}>
                                <Text style={styles.comment}>Сумма платежа</Text>
                                <TextInput
                                    keyboardType="decimal-pad"
                                    value={pay}
                                    style={[styles.text, themeStyles.text]}
                                    placeholder="Сумма платежа"
                                    placeholderTextColor={COLORS.DANGER_COLOR}
                                    onChangeText={onChangePay}
                                />
                            </View>
                        </View>
                        <View style={[styles.block, styles.comboBoxContainer]}>
                            <Foundation name="arrow-down" size={30} color={COLORS.MAIN_BLUE_5} />
                            <View style={[styles.input, styles.comboBox]}>
                                <Text style={styles.comment}>Что сократить?</Text>
                                <ComboBox
                                    values={values}
                                    onValueSelect={setSelectedValue}
                                    defaultValue="Срок кредита"
                                    {...themeStyles.container}
                                    textColor={isLightTheme ? COLORS.MAIN_BLACK_1 : COLORS.MAIN_BLUE_2}
                                    fontSize={SIZES.large}
                                />
                            </View>
                        </View>
                        <View style={styles.buttons}>
                            <AppButton onPress={onCancelHandler} color={COLORS.DANGER_COLOR}>
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
        paddingLeft: 10,
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
    comboBoxContainer: {
        marginBottom: 10,
        height: 90,
        zIndex: 100,
    },
    comboBox: {
        padding: 0,
        height: 90,
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
