import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Tabs, router } from 'expo-router'
import { Pressable, useColorScheme } from 'react-native'

import Colors from '../../constants/Colors'
import { COLORS } from '../../constants'

/**
 * Вы можете ознакомиться со встроенными семействами значков и иконками в Интернете по адресу https://icons.expo.fyi/
 */
function TabBarIcon(props: {
    name: React.ComponentProps<typeof MaterialCommunityIcons>['name']
    color: string
}) {
    return <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
    const colorScheme = useColorScheme()
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
                tabBarActiveBackgroundColor:
                    Colors[colorScheme ?? 'light'].tabBarBackgroundColor,
                tabBarInactiveBackgroundColor:
                    Colors[colorScheme ?? 'light'].tabBarBackgroundColor,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Добавить кредит',
                    headerTitle: 'Добавить кредит',
                    headerTitleStyle: {
                        color: Colors[colorScheme ?? 'dark'].headerTitleColor,
                    },
                    headerStyle: {
                        backgroundColor:
                            Colors[colorScheme ?? 'light'].tabBarBackgroundColor,
                    },
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="credit-card-plus-outline" color={color} />
                    ),
                    headerRight: () => (
                        <Pressable onPress={() => router.push('/tempCredit')}>
                            {({ pressed }) => (
                                <MaterialCommunityIcons
                                    name="information-outline"
                                    size={25}
                                    color={
                                        colorScheme === 'dark'
                                            ? COLORS.MAIN_BLUE_2
                                            : COLORS.MAIN_BLACK_1
                                    }
                                    style={{
                                        marginRight: 15,
                                        opacity: pressed ? 0.5 : 1,
                                    }}
                                />
                            )}
                        </Pressable>
                    ),
                }}
            />
            <Tabs.Screen
                name="Credits"
                options={{
                    title: 'Кредиты',
                    headerTitle: 'Кредиты',
                    headerTitleStyle: {
                        color:
                            colorScheme === 'dark'
                                ? COLORS.MAIN_BLUE_2
                                : COLORS.MAIN_BLACK_1,
                    },
                    headerStyle: {
                        backgroundColor:
                            colorScheme === 'dark'
                                ? COLORS.MAIN_BLACK_1
                                : COLORS.MAIN_BLUE_2,
                    },
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="credit-card-multiple-outline" color={color} />
                    ),
                    headerRight: () => (
                        <Pressable onPress={() => router.push('/AddCredit')}>
                            {({ pressed }) => (
                                <MaterialCommunityIcons
                                    name="plus-circle-outline"
                                    size={25}
                                    color={Colors[colorScheme ?? 'light'].text}
                                    style={{
                                        marginRight: 15,
                                        opacity: pressed ? 0.5 : 1,
                                    }}
                                />
                            )}
                        </Pressable>
                    ),
                }}
            />
            <Tabs.Screen
                name="Services"
                options={{
                    title: 'Аналитика',
                    headerTitle: 'Аналитика',
                    headerTitleStyle: {
                        color:
                            colorScheme === 'dark'
                                ? COLORS.MAIN_BLUE_2
                                : COLORS.MAIN_BLACK_1,
                    },
                    headerStyle: {
                        backgroundColor:
                            colorScheme === 'dark'
                                ? COLORS.MAIN_BLACK_1
                                : COLORS.MAIN_BLUE_2,
                    },
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="home-analytics" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Services BD"
                options={{
                    title: 'Управление БД',
                    headerTitle: 'Управление доступом к БД',
                    headerTitleStyle: {
                        color:
                            colorScheme === 'dark'
                                ? COLORS.MAIN_BLUE_2
                                : COLORS.MAIN_BLACK_1,
                    },
                    headerStyle: {
                        backgroundColor:
                            colorScheme === 'dark'
                                ? COLORS.MAIN_BLACK_1
                                : COLORS.MAIN_BLUE_2,
                    },
                    tabBarIcon: ({ color }) => (
                        <TabBarIcon name="store-settings" color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
