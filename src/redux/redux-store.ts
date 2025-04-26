import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import creditsReducer from './reducers/credits-reducer'
import logger from 'redux-logger'

export const store = configureStore({
    reducer: {
        creditsPage: creditsReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(logger),
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>
