import FontAwesome from '@expo/vector-icons/FontAwesome'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { Provider } from 'react-redux'
import { store } from '../src/redux/redux-store'
import { useDataBase } from './hooks/useBase'
import { useAppDispatch } from './hooks/hook'
import { getCreditsAsync } from '../src/redux/reducers/credits-reducer'
import { COLORS } from '../constants/theme'

export {
    // Улавливать любые ошибки, генерируемые компонентом компоновки.
    ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
    // Убедитесь, что при перезагрузке в "/model" присутствует кнопка "назад".
    initialRouteName: '(tabs)',
}

// Предотвратите автоматическое скрытие экрана-заставки до завершения загрузки ресурсов.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
    // Загрузка шрифтов
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        'roboto-regular': require('../assets/fonts/Roboto-Regular.ttf'),
        'roboto-bold': require('../assets/fonts/Roboto-Bold.ttf'),
        ...FontAwesome.font,
    })

    // Загрузка БД
    const [isLoadDB, errorDB] = useDataBase()

    // Expo Router использует границы ошибок для отслеживания ошибок в дереве навигации.
    useEffect(() => {
        if (error) throw error
    }, [error])

    useEffect(() => {
        if (errorDB) throw errorDB
    }, [errorDB])

    useEffect(() => {
        if (loaded && isLoadDB) {
            SplashScreen.hideAsync()
        }
    }, [loaded, isLoadDB])

    if (!loaded || !isLoadDB) {
        return null
    }
    return (
        <Provider store={store}>
            <RootLayoutNav />
        </Provider>
    )

    function RootLayoutNav() {
        const colorScheme = useColorScheme()
        const dispatch = useAppDispatch()
        useEffect(() => {
            // Загружаем данные по имеющимся кредитам
            dispatch(getCreditsAsync())
        }, [])

        return (
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen
                        name="credit"
                        options={{
                            presentation: 'transparentModal',
                            animation: 'fade',
                            headerTitle: 'Информация о кредите',
                            headerTitleStyle: {
                                color: colorScheme === 'dark' ? COLORS.MAIN_BLUE_2 : COLORS.MAIN_BLACK_1,
                            },
                            headerStyle: {
                                backgroundColor:
                                    colorScheme === 'dark' ? COLORS.MAIN_BLACK_1 : COLORS.MAIN_BLUE_2,
                            },
                        }}
                    />
                    <Stack.Screen
                        name="AddCredit"
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_left',
                            headerTitle: 'Добавление кредита',
                            headerTitleStyle: {
                                color: colorScheme === 'dark' ? COLORS.MAIN_BLUE_2 : COLORS.MAIN_BLACK_1,
                            },
                            headerStyle: {
                                backgroundColor:
                                    colorScheme === 'dark' ? COLORS.MAIN_BLACK_1 : COLORS.MAIN_BLUE_2,
                            },
                        }}
                    />
                    <Stack.Screen
                        name="tempCredit"
                        options={{
                            presentation: 'modal',
                            animation: 'slide_from_left',
                            headerTitle: 'Параметры кредита',
                            headerTitleStyle: {
                                color: colorScheme === 'dark' ? COLORS.MAIN_BLUE_2 : COLORS.MAIN_BLACK_1,
                            },
                            headerStyle: {
                                backgroundColor:
                                    colorScheme === 'dark' ? COLORS.MAIN_BLACK_1 : COLORS.MAIN_BLUE_2,
                            },
                        }}
                    />
                </Stack>
            </ThemeProvider>
        )
    }
}
