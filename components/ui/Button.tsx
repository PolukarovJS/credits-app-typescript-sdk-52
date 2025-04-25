import React, { FC } from 'react'
import { Text, TouchableHighlight, StyleSheet } from 'react-native'
import { SIZES } from '../../constants'

interface IButton {
    onPress: () => void
    title: string
    colors?: [string, string]
}

const Button: FC<IButton> = ({ onPress, title, colors = ['#fde047', '#FBBF24'] }) => {
    return (
        <TouchableHighlight
            onPress={onPress}
            underlayColor={colors[1]}
            style={{ ...styles.wrapper, backgroundColor: colors[0] }}
        >
            <Text style={styles.text}>{title}</Text>
        </TouchableHighlight>
    )
}

export default Button

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 10,
        marginVertical: 10,
        paddingVertical: 8,
    },
    text: {
        textAlign: 'center',
        // color: '#1f2937',
        fontWeight: '700',
        fontSize: SIZES.xLarge,
        lineHeight: 30,
        marginBottom: 4,
    },
})
