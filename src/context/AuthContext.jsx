import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage or Redux
    try {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')
      
      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        // Sync with Redux
        if (!authState.user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user: parsedUser, token: savedToken } })
        }
      } else if (authState.user) {
        setUser(authState.user)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setIsLoading(false)
    }
  }, [authState.user, dispatch])

  const login = useCallback((credentials) => {
    dispatch({ type: 'LOGIN_REQUEST', payload: credentials })
  }, [dispatch])

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT_REQUEST' })
    setUser(null)
  }, [dispatch])

  const register = useCallback((userData) => {
    dispatch({ type: 'REGISTER_REQUEST', payload: userData })
  }, [dispatch])

  // Update user when Redux state changes
  useEffect(() => {
    if (authState.user) {
      setUser(authState.user)
    }
  }, [authState.user])

  const isAuthenticated = useMemo(() => !!user || !!authState.user, [user, authState.user])

  // Check if user has permission
  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false
      // SuperAdmin and Admin have all permissions
      if (user.role === 'superAdmin' || user.role === 'admin') return true
      // Check if user has the specific permission
      return user.permissions?.includes(permission) || false
    },
    [user]
  )

  // Check if user has any of the permissions
  const hasAnyPermission = useCallback(
    (permissions) => {
      if (!user) return false
      if (user.role === 'superAdmin' || user.role === 'admin') return true
      return permissions.some((permission) => user.permissions?.includes(permission))
    },
    [user]
  )

  const value = useMemo(
    () => ({
      user,
      isLoading,
      login,
      logout,
      register,
      isAuthenticated,
      hasPermission,
      hasAnyPermission,
    }),
    [user, isLoading, login, logout, register, isAuthenticated, hasPermission, hasAnyPermission]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext

