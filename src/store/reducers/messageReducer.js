const initialState = {
  conversations: [],
  selectedConversation: null,
  loading: false,
  error: null,
  stats: {
    totalMessages: 0,
    closedOrders: 0,
    totalConversations: 0,
  },
}

const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'GET_CONVERSATIONS_REQUEST':
    case 'GET_CONVERSATION_REQUEST':
    case 'CREATE_CONVERSATION_REQUEST':
    case 'UPDATE_CONVERSATION_REQUEST':
    case 'DELETE_CONVERSATION_REQUEST':
    case 'CREATE_MESSAGE_REQUEST':
    case 'UPDATE_MESSAGE_REQUEST':
    case 'DELETE_MESSAGE_REQUEST':
    case 'GET_MESSAGE_STATS_REQUEST':
      return { ...state, loading: true, error: null }

    case 'GET_CONVERSATIONS_SUCCESS':
      return {
        ...state,
        loading: false,
        conversations: action.payload,
        error: null,
      }

    case 'GET_CONVERSATION_SUCCESS':
      return {
        ...state,
        loading: false,
        selectedConversation: action.payload,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id ? { ...conv, unread: 0 } : conv
        ),
        error: null,
      }

    case 'CREATE_CONVERSATION_SUCCESS':
      return {
        ...state,
        loading: false,
        conversations: [...state.conversations, action.payload],
        error: null,
      }

    case 'UPDATE_CONVERSATION_SUCCESS':
      return {
        ...state,
        loading: false,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id ? action.payload : conv
        ),
        selectedConversation:
          state.selectedConversation?.id === action.payload.id
            ? { ...state.selectedConversation, ...action.payload }
            : state.selectedConversation,
        error: null,
      }

    case 'DELETE_CONVERSATION_SUCCESS':
      return {
        ...state,
        loading: false,
        conversations: state.conversations.filter((conv) => conv.id !== action.payload),
        selectedConversation:
          state.selectedConversation?.id === action.payload ? null : state.selectedConversation,
        error: null,
      }

    case 'CREATE_MESSAGE_SUCCESS':
      const messagePayload = {
        ...action.payload,
        sender: action.payload.sender === 'user' ? 'me' : 'user', // Convert backend format to frontend
      }
      const conversationId = action.payload.conversationId || action.payload.conversation?.toString()
      const updatedConversations = state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: action.payload.text,
              messages: [...(conv.messages || []), messagePayload],
            }
          : conv
      )

      return {
        ...state,
        loading: false,
        conversations: updatedConversations,
        selectedConversation:
          state.selectedConversation?.id === conversationId
            ? {
                ...state.selectedConversation,
                lastMessage: action.payload.text,
                messages: [...(state.selectedConversation.messages || []), messagePayload],
              }
            : state.selectedConversation,
        error: null,
      }

    case 'UPDATE_MESSAGE_SUCCESS':
      const updateMessageInConversation = (conv) => {
        if (conv.messages) {
          return {
            ...conv,
            messages: conv.messages.map((msg) =>
              msg.id === action.payload.id ? action.payload : msg
            ),
          }
        }
        return conv
      }

      return {
        ...state,
        loading: false,
        conversations: state.conversations.map(updateMessageInConversation),
        selectedConversation: state.selectedConversation
          ? updateMessageInConversation(state.selectedConversation)
          : null,
        error: null,
      }

    case 'DELETE_MESSAGE_SUCCESS':
      const removeMessageFromConversation = (conv) => {
        if (conv.messages) {
          return {
            ...conv,
            messages: conv.messages.filter((msg) => msg.id !== action.payload),
          }
        }
        return conv
      }

      return {
        ...state,
        loading: false,
        conversations: state.conversations.map(removeMessageFromConversation),
        selectedConversation: state.selectedConversation
          ? removeMessageFromConversation(state.selectedConversation)
          : null,
        error: null,
      }

    case 'GET_MESSAGE_STATS_SUCCESS':
      return {
        ...state,
        loading: false,
        stats: action.payload,
        error: null,
      }

    case 'SET_SELECTED_CONVERSATION':
      return {
        ...state,
        selectedConversation: action.payload,
      }

    case 'GET_CONVERSATIONS_FAILURE':
    case 'GET_CONVERSATION_FAILURE':
    case 'CREATE_CONVERSATION_FAILURE':
    case 'UPDATE_CONVERSATION_FAILURE':
    case 'DELETE_CONVERSATION_FAILURE':
    case 'CREATE_MESSAGE_FAILURE':
    case 'UPDATE_MESSAGE_FAILURE':
    case 'DELETE_MESSAGE_FAILURE':
    case 'GET_MESSAGE_STATS_FAILURE':
      return { ...state, loading: false, error: action.payload }

    default:
      return state
  }
}

export default messageReducer

