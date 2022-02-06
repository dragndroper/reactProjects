import camelcase from 'camelcase';
import ENDPOINTS from "./endpoints";
import {API_ACTIONS} from "./actions";


function initApiState() {
    return Object.keys(ENDPOINTS).reduce((acc, next) => {
        const inner = {
            data: null,
            loading: false,
            error: null
        };

        acc[camelcase(next)] = inner;
        return acc;
    }, {})
}

const INITIAL_STATE = initApiState()

// Обработка actions
const apiReducer = (state = INITIAL_STATE, action) => {
    if (action.type.startsWith(API_ACTIONS.FETCH_START)) {
        // убираем название endpoint
        const inner = camelcase(action.type.replace(API_ACTIONS.FETCH_START, ''))

        return {
            ...state,
            [inner]: {
                ...state[inner],
                loading: true,
                error: null
            }
        };
    }

    if (action.type.startsWith(API_ACTIONS.FETCH_SUCCESS)) {
        // убираем название endpoint
        const inner = camelcase(action.type.replace(API_ACTIONS.FETCH_SUCCESS, ''))

        return {
            ...state,
            [inner]: {
                ...state[inner],
                data: action.payload,
                loading: false,
                error: null
            }
        };
    }

    if (action.type.startsWith(API_ACTIONS.FETCH_FAILURE)) {
        // убираем название endpoint
        const inner = camelcase(action.type.replace(API_ACTIONS.FETCH_FAILURE, ''))

        return {
            ...state,
            [inner]: {
                ...state[inner],
                loading: false,
                error: action.payload
            }
        };
    }
    // по Redux если ни один if не сработал, то верни state
    return state;
}

export default apiReducer