import { useReducer, useEffect } from 'react'
import axios from 'axios'

// Actions that can be performed on state
const ACTIONS = {
    MAKE_REQUEST: 'make-request',
    GET_DATA: 'get-data',
    ERROR: 'error',
    UPDATE_HAS_NEXT_PAGE: 'update-has-next-page'
}
// https://cors-anywhere.herokuapp.com/ acts as proxy to get around CORS policy in development
const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json'

// Reducer function called every time app calls dispatch
// Whatever is passed into dispatch will pass into action
// State is whatever the current state of app is in
function reducer(state, action) {
    switch (action.type) {
        case ACTIONS.MAKE_REQUEST:
            // Change state to loading and clear jobs array
            return { loading: true, jobs: [] }
        case ACTIONS.GET_DATA:
            // Take everything in current state and put it in new state - turn jobs into the payload of actions
            return { ...state, loading: false, jobs: action.payload.jobs }
        case ACTIONS.ERROR:
            // Make error the payload and clear jobs array
            return { ...state, loading: false, error: action.payload.error, jobs: [] }
        case ACTIONS.UPDATE_HAS_NEXT_PAGE:
            return {...state, hasNextPage: action.payload.hasNextPage}
        default:
            return state
    }
}

export default function useFetchJobs(params, page) {
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true }) // Default state

    // Whenever params or page change, call useEffect()
    useEffect(() => {
        // Make request once and stops
        const cancelToken1 = axios.CancelToken.source()

        dispatch({ type: ACTIONS.MAKE_REQUEST })
        // Get data from URL
        axios.get(BASE_URL, {
            cancelToken: cancelToken1.token,
            params: { markdown: true, page: page, ...params } // ...params in this case are parameters listed here: https://jobs.github.com/api
            // Save data by using GET_DATA action, setting jobs as res.data
        }).then(res => {
            dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } }) 
        }).catch(e => {
             // Cancels are treated like errors. If it is a cancel, simply return. If true error occurs, dispatch error
            if (axios.isCancel(e)) return 
             // If error happens, change state to error clear jobs array
            dispatch({ type: ACTIONS.ERROR, payload: { error: e } }) 
        })

        const cancelToken2 = axios.CancelToken.source()
        axios.get(BASE_URL, {
            cancelToken: cancelToken2.token,
            params: { markdown: true, page: page + 1, ...params } // ...params in this case are parameters listed here: https://jobs.github.com/api
            // Check to see if there is data on the next page
        }).then(res => {
            // If there is data, it will set hasNextPage param to true, passing it to App.js which passes it to the JobPagination component as true or false
            dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: { hasNextPage: res.data.length !== 0} }) 
        }).catch(e => {
             // Cancels are treated like errors. If it is a cancel, simply return. If true error occurs, dispatch error
            if (axios.isCancel(e)) return 
             // If error happens, change state to error clear jobs array
            dispatch({ type: ACTIONS.ERROR, payload: { error: e } }) 
        })

         return () => {
             cancelToken1.cancel()
             cancelToken2.cancel()
         }
    }, [params, page])

    return state
}