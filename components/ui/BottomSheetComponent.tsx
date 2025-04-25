import React, { FC, useState } from 'react'
import { BottomSheet, Button, ListItem } from 'react-native-elements'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { CreditType } from '../../app/types'

type BottomSheetComponentProps = {
    credits: CreditType[]
    onSelect: (credit: CreditType) => void
}

const BottomSheetComponent: FC<BottomSheetComponentProps> = ({ credits, onSelect }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [isSelect, setIsSelect] = useState(false)
    const [selectedCredit, setSelectedCredit] = useState<CreditType>({} as CreditType)
    const list = credits.map((credit) => {
        return {
            title: 'Кредит ' + credit.sum + ' \u20BD на ' + credit.term + ' м.',
            containerStyle: {
                // backgroundColor: THEME.MAIN_COLOR,
                marginHorizontal: 10,
                marginVertical: 5,
            },
            titleStyle: { color: 'white' },
            onPress: () => {
                setIsVisible(false)
                setIsSelect(true)
                setSelectedCredit(credit)
                onSelect(credit)
            },
        }
    })

    return (
        <SafeAreaProvider>
            {isSelect && selectedCredit ? (
                <Button
                    title={'Кредит ' + selectedCredit.sum.toString() + ' \u20BD'}
                    onPress={() => setIsVisible(true)}
                    buttonStyle={styles.button}
                />
            ) : (
                <Button
                    title="Выберите кредит"
                    onPress={() => setIsVisible(true)}
                    buttonStyle={styles.button}
                />
            )}
            {/* @ts-ignore*/}
            <BottomSheet modalProps={{}} isVisible={isVisible}>
                {list.map((l, i) => (
                    <ListItem
                        key={i}
                        containerStyle={l.containerStyle}
                        onPress={l.onPress}
                        //@ts-ignore
                        hasTVPreferredFocus={BottomSheet}
                        tvParallaxProperties={BottomSheet}
                    >
                        <ListItem.Content>
                            <ListItem.Title style={l.titleStyle}>
                                {l.title}
                            </ListItem.Title>
                        </ListItem.Content>
                    </ListItem>
                ))}
            </BottomSheet>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    //@ts-ignore
    button: {
        marginLeft: 0,
        width: '100%',
        // backgroundColor: THEME.MAIN_COLOR,
    },
})

export default BottomSheetComponent
