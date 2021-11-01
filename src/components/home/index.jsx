import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Word from './Word';
import {useStateRef} from '../../Hooks'
import Phrase from './Phrase';
import Keyboard from './Keyboard';

import '../../styles/Home/Home.scss';

// const phrase = `this phrase does not make sense sorry own one long present need now during govern life much one fact the develop before some get still thing group they last
// old here on run face move stand world that because mean after word text return develop production test to pharagraph`

const phrase = `this phrase does not make sense sorry own one long present need now during govern`

//BUG CUANDO el espacio (jumped) se ejecuta desdee la primer letra, cuando vuelvo no vuelve a la primera

const buildPhrase = (phrase)=>{

  const words = phrase.split(' ').filter(word => word !== '').map( (word,index) => {

    return(
      { word: word,
        active: index === 0 ? true : false,
        letters: word.split('').map((letter,i) =>{
          return({
            key:letter,
            correct:null, 
            index:i ,
            active: index === 0 && i === 0 ? true : false,
            jumped: false,
          })
        }) }
      
    )})

  return words

}

//lo mejor seria colocar 
export default function Home () {

  const phraseMemo = useMemo(()=> buildPhrase(phrase),[])

  const [listPhrase,refListPhrase ,setListPhrase] = useStateRef(phraseMemo)
  const refWord = useRef({...phraseMemo[0]})
  const refLetter = useRef({...refWord.current.letters[0]})


  const [state,refState,setState] = useStateRef({
    start: false,
    finished: false,
    initTime: null,
    wpm:0,
    acc:0,
    time:0,
    letters: listPhrase.reduce((accumulative, word) => accumulative + word.letters.length ,0),
    keysPressed: 0,
    typeErrors: 0
  })
  
  const [nWord,setNWord] = useState(0)
  const [nLetter, setNLetter] = useState(0)

  const bar = useRef(null)
  const [keyPressed, setKeyPressed] = useState(null)
  const activeLetter = useRef(null)


  const setRef = useCallback(function (node){
    if(activeLetter.current){
      //remove events to the previous 
    }

    if(node){

      const phraseDiv =  document.getElementById('phrase').getBoundingClientRect()

      const xPos = node.getBoundingClientRect().left - phraseDiv.left 
      const yPos = node.getBoundingClientRect().top - phraseDiv.top

      bar.current.style.top = `${yPos}px`

      //si estamos en cualquier letra menos la ultima
      if(refWord.current.letters.length-1 !== refLetter.current.index) {
        bar.current.style.left=`${xPos}px`
      }
      //si ya estamos en la ultima entonces //si esta seleccionada
      else if(typeof refLetter.current.correct === 'boolean'){
        bar.current.style.left=`${xPos+10}px`
      }else{
        bar.current.style.left=`${xPos}px`
      }

    }

    // console.log(activeWord)
    activeLetter.current = node

  },[])

  const handlerKey = useCallback((e)=>{

    //if the current typing session has not started yet
    if(!refState.current.start){
      setState({
        ...refState.current,
        initTime: new Date(),
        start: true,
      })
    }

    //if the session has not finished yet
    if(!refState.current.finished){

      //return if is not letter or its length is larger than 1 or if not is backspace and not is space
      if((!/[aA-zZ]/.test(e.key) || e.key.length > 1) && e.key !== 'Backspace' && e.which !== 32){
        return
      }

      
      const typeInsert = e.key !== 'Backspace'
      const bufferPhrase = [...refListPhrase.current]
      const currentWord = {...refWord.current}
      const currentLetter = currentWord.letters[nLetter]
      let nextLetter =  nLetter+1 < currentWord.letters.length ?  currentWord.letters[nLetter+1]  : null;
      let backLetter = nLetter > 0 ? currentWord.letters[nLetter-1] : null
      const bufferState = {...refState.current}
      bufferPhrase[nWord] = currentWord
      
      setKeyPressed(e.key === ' ' ? 'Space' : e.key)

      if(e.which === 32){

        //return to prevent space in the lastword
        if(nWord+1 >= bufferPhrase.length){
          return
        }
        
        setNWord(nWord+1)
        setNLetter(0)
        
        const nextWord = {...bufferPhrase[nWord+1]}

        currentWord.letters = currentWord.letters.map((letter,index)=>{
          return({
            ...letter,
            active: false,
            jumped:   nLetter === currentWord.letters.length -1 ? false : index >= nLetter ? true : false,
            correct: typeof letter.correct === 'boolean' ? letter.correct ? true : false : false
          })
        })
        
        bufferPhrase[nWord+1] = nextWord
        nextWord.letters[0].active = true
        refWord.current = nextWord
        refLetter.current = nextWord.letters[0]
        
        setListPhrase(bufferPhrase)
        
        return
      }

      //BUG CUANDO ESTOY EN LA PENULTIMA PALARABA Y HAGO SPACE LA ULTIMA LETRA NO SE MARCA COMO JUMPED

      //is delete and have backletter
      if(!typeInsert){

        //si existe una letra anterior
        if(backLetter){
          //if the letter is extra remove
          if(currentLetter.extra){
            //remove and set the last word
            currentWord.letters.pop()
            backLetter.active = true
            
            refLetter.current = backLetter
            setNLetter(nLetter-1)
    

          }else{

          //if current letter is the last letter in word and it has value
            if(currentLetter.index === currentWord.letters.length -1 && typeof currentLetter.correct === 'boolean'){
              currentLetter.correct = null
              refLetter.current = currentLetter
            }else{

              currentLetter.correct = null
              currentLetter.active = false
              backLetter.active = true  
              backLetter.correct = null

              refLetter.current = backLetter
              setNLetter(nLetter-1)
            }

          }
        }
        //si no existe una letra anterior y la palabra no es la inicial (index 0)
        else if(nWord > 0){

          //solo eliminar si la anterior palabra esta mal escrota
          const previousWord = {...bufferPhrase[nWord-1]}

          //if the previousword is correct cannot return
          if(previousWord.letters.filter(letter => !letter.correct).length === 0){
            return
          }

          bufferPhrase[nWord-1] = previousWord
          currentLetter.active = false

          //var to calculate last word before jumped or if not jumped set lenght of word
          let firstJumped = previousWord.letters.find(letter => letter.jumped)

          let n = firstJumped ? firstJumped.index : previousWord.letters.length -1

          previousWord.letters = previousWord.letters.map((letter,index) =>{

            return({
              ...letter,
              correct: letter.jumped ? null : letter.correct,
              jumped: false,
              active: n === index
              // n equivale a la que encontro o la ultima por defecto
            })
          })
          
          refWord.current = previousWord
          refLetter.current = previousWord.letters[n]

          // setear de nuevo la palabra anterior
          setNWord(nWord-1)
          setNLetter(n)
        }

      }
      else if(typeInsert){


        bufferState.keysPressed++

        //there more letters 
        if(nextLetter){
          //set if press key is correct and remove active for the currentLetter
          currentLetter.correct = e.key === currentLetter.key 
          currentLetter.active = false

          //set nextletter as activate
          nextLetter.active = true
          setNLetter(nLetter+1)

          //set current letter
          refWord.current = currentWord
          refLetter.current = nextLetter

          //every time to a insert key is incorrect the accuracy is affect
          if(!currentLetter.correct){
            bufferState.typeErrors++
          }
          

        }else{

          //if the las letter set as true or false, insert one more letter
          if(typeof currentLetter.correct === 'boolean'){

            currentLetter.active = false
            nextLetter = {active: true, correct: false, key: e.key, extra: true, index: nLetter+1}
            currentWord.letters.push(nextLetter)
            setNLetter(nLetter+1)

            //setcurrent letter
            refWord.current = currentWord
            refLetter.current = nextLetter

            // extra letter equal error typing
            bufferState.typeErrors++

          }else{

            //the last letter for the last word
            if(nWord >= refListPhrase.current.length -1){

              const newDate = new Date()

              const totalTime = (newDate.getTime() -  state.initTime.getTime())/1000
              
              bufferState.finished = true
              bufferState.acc = (1 - (bufferState.typeErrors / bufferState.keysPressed).toFixed(2)) * 100
              bufferState.wpm = Math.floor((bufferPhrase.length / totalTime) * 60)
              bufferState.time = totalTime.toFixed(1)

            }

              //correct is not defined (null)
              refWord.current = currentWord
              currentLetter.correct = e.key === currentLetter.key
              refLetter.current = currentLetter

              if(!currentLetter.correct){
                bufferState.typeErrors++
              }
            
          }
        }

      }

      
      setState(bufferState)
      setListPhrase(bufferPhrase)

    }

  },[refListPhrase,setListPhrase,setState,refState,state,nWord,nLetter])


  useEffect(()=>{

    document.addEventListener('keyup',handlerKey)

    return ()=> document.removeEventListener('keyup',handlerKey)
  },[handlerKey])

  useEffect(()=>{
    window.onresize = ()=>{

      // console.log(node)
      const node = activeLetter.current
      const phraseDiv =  document.getElementById('phrase').getBoundingClientRect()

      const xPos = node.getBoundingClientRect().left - phraseDiv.left 
      const yPos = node.getBoundingClientRect().top - phraseDiv.top

      bar.current.style.top = `${yPos}px`

      if(refWord.current.letters.length-1 !== refLetter.current.index) {
        bar.current.style.left=`${xPos}px`
      }
      //si ya estamos en la ultima entonces //si esta seleccionada
      else if(typeof refLetter.current.correct === 'boolean'){
        bar.current.style.left=`${xPos+10}px`
      }else{
        bar.current.style.left=`${xPos}px`
      }

    }

    return () => window.onresize = null
  },[])
  

    return (
    <div  className='home'>
      <h1>ReactTyper</h1>

      <Phrase ref={bar} setRef={setRef} listPhrase={listPhrase} />


      <Keyboard teclado={keyPressed} setTeclado={setKeyPressed}/>

      <div className="info">
        <h2>Wpm <div>{state.wpm}</div></h2>
        <h2>Accuracy <div>{state.acc}%</div></h2>
        <h2>Time <div>{state.time}s</div></h2>
      </div>
    </div>
);
};