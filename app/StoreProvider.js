'use client'
import { useRef, useEffect } from 'react'
import { Provider } from 'react-redux'
import { makeStore } from '../lib/store'
import { useUser } from '@clerk/nextjs'

function UserSync() {
    const { isSignedIn, isLoaded } = useUser()

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetch('/api/user', { method: 'POST' })
        }
    }, [isSignedIn, isLoaded])

    return null
}

export default function StoreProvider({ children }) {
    const storeRef = useRef(undefined)
    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    return (
        <Provider store={storeRef.current}>
            <UserSync />
            {children}
        </Provider>
    )
}