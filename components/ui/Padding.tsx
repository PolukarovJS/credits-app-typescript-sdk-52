import React, { FC } from 'react'
import { View } from 'react-native'

const Padding: FC<{ style?: any; children: React.ReactNode }> = ({
    children,
    style = {},
}) => {
    return <View style={{ ...{ paddingHorizontal: 10 }, ...style }}>{children}</View>
}

export default Padding
