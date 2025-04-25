import React, { FC } from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    TouchableNativeFeedback,
    Platform,
    useColorScheme,
} from 'react-native'
import { AppTextBold } from './AppTextBold'
import { COLORS } from '../../constants'

type PropsType = {
    children: any
    onPress: () => void
    color?: string
}

export const AppButton: FC<PropsType> = ({
    children,
    onPress,
    color = COLORS.MAIN_BLUE_5,
}) => {
    const Wrapper = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity
    const colorScheme = useColorScheme()

    const themeTextStyle =
        colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle =
        colorScheme === 'light' ? styles.lightContainer : styles.darkContainer
    return (
        // @ts-ignore
        <Wrapper onPress={onPress} activeOpacity={0.7}>
            <View
                style={{ ...styles.button, ...themeContainerStyle, borderColor: color }}
            >
                <AppTextBold style={{ ...styles.text, ...themeTextStyle }}>
                    {children}
                </AppTextBold>
            </View>
        </Wrapper>
    )
}

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 5,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
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
