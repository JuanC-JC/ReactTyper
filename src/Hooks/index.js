import React,{useCallback, useRef, useState} from "react"

export function useStateRef (initialState) {

  const [state,setState] = useState(initialState)
  const stateRef = useRef(initialState)


  const setStateRef = useCallback((newState)=>{
    stateRef.current = newState
    setState(newState)
  },[])

  return [state,stateRef,setStateRef]
}