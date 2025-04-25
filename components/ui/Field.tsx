import React, { FC } from 'react'
import { TextInput } from 'react-native'
import { StyleSheet } from 'react-native'

interface IField {
    onChange: (val: string) => void
    val: string
    placeholder: string
    isSecure?: boolean
}

const Field: FC<IField> = ({ onChange, placeholder, val, isSecure }) => {
    return (
        <TextInput
            placeholder={placeholder}
            onChangeText={onChange}
            value={val}
            secureTextEntry={isSecure}
            autoCapitalize="none"
            style={styles.wrapper}
        />
    )
}

export default Field

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        borderRadius: 10,
        marginTop: 10,
        padding: 8,
        backgroundColor: '#f3f4f6',
        fontSize: 18,
    },
})
