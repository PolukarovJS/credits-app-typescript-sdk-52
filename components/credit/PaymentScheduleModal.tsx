import React, { FC, useEffect, useState } from 'react'
import { FlatList, Modal, StyleSheet, View, useColorScheme } from 'react-native'
import { RowType } from '../../src/types'
import { AppButton } from '../ui/AppButton'
import { AppText } from '../ui/AppText'
import { Row } from '../ui/Row'
import { COLORS } from '../../constants'

type PropsType = {
    rowsShow: RowType[]
    onCancel: () => void
    visible: boolean
}

export const PaymentScheduleModal: FC<PropsType> = ({ rowsShow, onCancel, visible }) => {
    const [rows, setRows] = useState<RowType[]>(rowsShow)

    useEffect(() => {
        setRows(rowsShow)
    }, [])

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
                    <View style={{ ...styles.row, ...themeTextStyle }}>
                        <View style={{ alignItems: 'center', width: '10%' }}>
                            <AppText style={{ ...styles.text, ...themeTextStyle }}>
                                №
                            </AppText>
                        </View>
                        <View style={{ alignItems: 'center', width: '30%' }}>
                            <AppText style={{ ...styles.text, ...themeTextStyle }}>
                                Сумма и дата платежа
                            </AppText>
                        </View>
                        <View style={{ alignItems: 'center', width: '30%' }}>
                            <AppText style={{ ...styles.text, ...themeTextStyle }}>
                                Основной долг и проценты
                            </AppText>
                        </View>
                        <View style={{ alignItems: 'center', width: '30%' }}>
                            <AppText style={{ ...styles.text, ...themeTextStyle }}>
                                Остаток
                            </AppText>
                        </View>
                    </View>
                    <FlatList
                        data={rows}
                        renderItem={({ item }) => <Row row={item} />}
                        keyExtractor={(item) => item.id}
                    />
                    <View style={styles.buttons}>
                        <AppButton onPress={onCancel}>
                            Вернуться к описанию кредита
                        </AppButton>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    buttons: {
        marginTop: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center', // по вертикале
        paddingBottom: 10,
        borderBottomWidth: 1,
    },
    text: {
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapperShadow: {
        margin: 20,
        borderRadius: 20,
        padding: 10,
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
    lightContainer: {
        backgroundColor: COLORS.TEXT_LightWhite,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_1,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLUE_5,
        borderColor: COLORS.MAIN_BLUE_5,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
        borderColor: COLORS.MAIN_BLUE_2,
    },
})
