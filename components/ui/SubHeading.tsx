import React, { FC } from 'react'
import { Text } from 'react-native'
import Padding from './Padding'

const SubHeading: FC<{ text: string }> = ({ text }) => {
    return (
        <Padding>
            <Text style={{ fontSize: 20, color: '#1f2937', fontWeight: '700' }}>
                {text}
            </Text>
        </Padding>
    )
}

export default SubHeading
