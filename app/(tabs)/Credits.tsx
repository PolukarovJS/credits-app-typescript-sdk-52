import React, { FC, Fragment, useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView, RefreshControl, useColorScheme, Alert } from 'react-native'
import { useAppSelector, useAppDispatch } from '../hooks/hook'
import { deleteCreditAsync, getCreditsAsync, setSelectedCredit } from '../../src/redux/reducers/credits-reducer'
import { CreditType } from '../types'
import Loader from '../../components/ui/Loader'
import Padding from '../../components/ui/Padding'
import { CreditItem } from '../../components/item/CreditItem'
import { useRouter } from 'expo-router'
import { COLORS } from '../../constants'
import { AppText } from '../../components/ui/AppText'

const Credits: FC = () => {
    console.log('Selected Credits.tsx')
    const dispatch = useAppDispatch()
    const router = useRouter()
    const [refreshing, setRefreshing] = useState(false)
    const { credits, isLoading, error } = useAppSelector((state) => state.creditsPage)

    const onPress = (selectedCredit: CreditType) => {
        dispatch(setSelectedCredit(selectedCredit.id))
        router.push('/credit')
    }

    const onLongPress = (selectCredit: CreditType) => {
        Alert.alert(
            'Удаление кредита',
            `\nВы действительно хотите удалить кредит ${selectCredit.sum} \u20BD`,
            [
                {
                    text: 'Отмена',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: () => {
                        dispatch(deleteCreditAsync(selectCredit))
                        dispatch(setSelectedCredit(-1))
                    },
                    style: 'default',
                },
            ],
            { userInterfaceStyle: 'unspecified' }
        )
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true)
        dispatch(getCreditsAsync())
        setRefreshing(false)
    }, [])

    useEffect(() => {
        dispatch(getCreditsAsync())
    }, [])

    const colorScheme = useColorScheme()

    const themeTextStyle = colorScheme === 'light' ? styles.lightThemeText : styles.darkThemeText
    const themeContainerStyle = colorScheme === 'light' ? styles.lightContainer : styles.darkContainer

    return (
        <View style={styles.container}>
            <Padding style={{ ...styles.wrapper, ...themeContainerStyle }}>
                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <AppText
                            style={{
                                ...themeTextStyle,
                                textAlign: 'center',
                                fontSize: 25,
                                marginTop: 50,
                            }}
                        >
                            {error.toString()}
                        </AppText>
                    </ScrollView>
                ) : credits.length ? (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        {credits.map((credit) => (
                            <View key={credit.id}>
                                <Fragment key={credit.id}>
                                    <CreditItem
                                        credit={credit}
                                        onPress={onPress}
                                        onLongPress={onLongPress}
                                    />
                                </Fragment>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    >
                        <AppText
                            style={{
                                ...themeTextStyle,
                                textAlign: 'center',
                                fontSize: 25,
                                marginTop: 50,
                            }}
                        >
                            У Вас не кредитов!!!
                        </AppText>
                    </ScrollView>
                )}
            </Padding>
        </View>
    )
}
export default Credits

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        paddingTop: 10,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
    },
    lightContainer: {
        backgroundColor: COLORS.lightWhite,
    },
    darkContainer: {
        backgroundColor: COLORS.MAIN_BLACK_0,
    },
    lightThemeText: {
        color: COLORS.MAIN_BLUE_5,
    },
    darkThemeText: {
        color: COLORS.MAIN_BLUE_2,
    },
})
