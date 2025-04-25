import React, { FC } from 'react'
import { Text, StyleSheet } from 'react-native'

type PropsType = {
    style: any
    children: any
}

export const AppTextBold: FC<PropsType> = (props) => (
    <Text style={{ ...styles.default, ...props.style }}>{props.children}</Text>
)

const styles = StyleSheet.create({
    default: {
        fontFamily: 'roboto-bold',
    },
})
