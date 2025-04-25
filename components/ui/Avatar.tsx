import React, { FC } from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface IAvatar {
    name?: string | null
    size?: 'small' | 'large'
}

const Avatar: FC<IAvatar> = ({ name, size = 'small' }) => {
    const isSmall = size === 'small'
    return (
        <View style={isSmall ? styles.avatarSmall : styles.avatarBig}>
            <Text style={isSmall ? styles.textSmall : styles.textBig}>
                {name?.slice(0, 1)}
            </Text>
        </View>
    )
}

export default Avatar

const styles = StyleSheet.create({
    avatarSmall: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: '#d1d5db',
    },
    avatarBig: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        borderRadius: 25,
        backgroundColor: '#d1d5db',
    },
    textSmall: {
        fontSize: 20,
        fontWeight: '500',
        color: 'white',
    },
    textBig: {
        fontSize: 25,
        fontWeight: '500',
        color: 'white',
    },
})
