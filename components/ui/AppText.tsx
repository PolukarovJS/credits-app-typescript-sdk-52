import React, { FC } from 'react'
import { StyleSheet, Text } from 'react-native'

type PropsType = {
    props?: any
    style?: any
    children: any
}

export const AppText: FC<PropsType> = (props) => (
    <Text style={{ ...styles.default, ...props.style }}>{props.children}</Text>
)

const styles = StyleSheet.create({
    default: {
        fontFamily: 'roboto-regular',
    },
})
