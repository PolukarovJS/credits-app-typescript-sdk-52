import React, { FC, useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, useColorScheme, Alert, FlatList } from 'react-native'
import { useAppSelector, useAppDispatch } from '../../src/hooks/hook'
import { deleteCreditAsync, getCreditsAsync, setSelectedCredit } from '../../src/redux/reducers/credits-reducer'
import { CreditType } from '../../src/types'
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

    const renderItem = ({ item }: { item: CreditType }) => (
        <CreditItem
            credit={item}
            onPress={onPress}
            onLongPress={onLongPress}
        />
    )

    const EmptyComponent = () => (
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
    )

    const ErrorComponent = () => (
        <AppText
            style={{
                ...themeTextStyle,
                textAlign: 'center',
                fontSize: 25,
                marginTop: 50,
            }}
        >
            {error?.toString()}
        </AppText>
    )

    return (
        <View style={styles.container}>
            <Padding style={{ ...styles.wrapper, ...themeContainerStyle }}>
                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <FlatList
                        data={[]}
                        renderItem={null}
                        ListEmptyComponent={ErrorComponent}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <FlatList
                        data={credits}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        ListEmptyComponent={EmptyComponent}
                        showsVerticalScrollIndicator={false}
                    />
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