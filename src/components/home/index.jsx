import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Word from './Word';
import {useStateRef} from '../../Hooks'

import '../../styles/Home/Home.scss';

const phrase = `this phrase does not make sense sorry own one long present need now during govern life much one fact the develop before some get still thing group they last
old here on run face move stand world that because mean after word text return develop production test to pharagraph`


// const phrase = `off way`

//accuracy ( correct keys / keysPressed )

                // console.log(phrase.split(' '))
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

function calcStatics(data){


  return ({
    wpm:0,
    acc:0,
    time:0
  })
}

//lo mejor seria colocar 
export default function Home () {

  const phraseMemo = useMemo(()=> buildPhrase(phrase),[])

  const [listPhrase,refListPhrase ,setListPhrase] = useStateRef(phraseMemo)

  const refWord = useRef({...phraseMemo[0]})
  const refLetter = useRef({...refWord.current.letters[0]})

  const firstKey = useRef(false)
  const date = useRef(null)
  const [nWord,setNWord] = useState(0)
  const [nLetter, setNLetter] = useState(0)
  const [finished, setFinished] = useState(false)
  const referencia = useRef(null)
  const bar = useRef(null)
  const [teclado, setTeclado] = useState(null)
  const [info, setInfo] = useState({
    wpm:0,
    acc:0,
    time:0,
    letters: listPhrase.reduce((accumulative, word) => accumulative + word.letters.length ,0),
    keysPressed: 0,
    typeErrors: 0
  })

  const setRef = useCallback(function (node){
    if(referencia.current){
      //
    }

    if(node){
      const phraseDiv =  document.getElementById('phrase').getBoundingClientRect()

      const xPos = node.getBoundingClientRect().left - phraseDiv.left 
      const yPos = node.getBoundingClientRect().top - phraseDiv.top

      bar.current.style.top = `${yPos}px`

      //si estamos en cualquier letra menos la ultima
      if(refWord.current.letters.length-1 !== refLetter.current.index) {
        // console.log('entro aca')
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
    referencia.current = node

  },[])


  useEffect(()=>{
    window.onresize = ()=>{

      // console.log(node)
      const node = referencia.current
      const phraseDiv =  document.getElementById('phrase').getBoundingClientRect()

      const xPos = node.getBoundingClientRect().left - phraseDiv.left 
      const yPos = node.getBoundingClientRect().top - phraseDiv.top

      // console.log(bar.current,referencia.current)

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


  const handlerKey = useCallback((e)=>{

    //get copy of state before start
    // console.log(e.key,[...listPhrase].map(element=>{

    //   return({
    //     ...element,
    //     letters: element.letters.map(letter => ({...letter}))
    //     })
    // }))

    // console.log(e.key)
    if(!firstKey.current){
      date.current = new Date()
      firstKey.current = true
    }

    //only if there more words
    if(!finished){

      //return if is not letter or its length is larger than 1 or if not is backspace and not is space
      if((!/[aA-zZ]/.test(e.key) || e.key.length > 1) && e.key !== 'Backspace' && e.which !== 32){
        return
      }

      
      const bufferPhrase = [...refListPhrase.current]
      const currentWord = {...refWord.current}
      const currentLetter = currentWord.letters[nLetter]
      let nextLetter =  nLetter+1 < currentWord.letters.length ?  currentWord.letters[nLetter+1]  : null;
      let backLetter = nLetter > 0 ? currentWord.letters[nLetter-1] : null
      const typeInsert = e.key !== 'Backspace'
      const bufferInfo = {...info}
      
      bufferPhrase[nWord] = currentWord
      
      setTeclado(e.key === ' ' ? 'Space' : e.key)


      if(e.which === 32){

        //return if is the last word cannnot space
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

          //if current letter is lastword and its set
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
        //si no existe una letra anterior y la palabra no es la 0 
        else if(nWord > 0){


          //solo eliminar si la anterior palabra esta mal escrota
          const previousWord = {...bufferPhrase[nWord-1]}

          if(previousWord.letters.filter(letter => !letter.correct).length === 0){
            return
          }

          bufferPhrase[nWord-1] = previousWord


          console.log()

          currentLetter.active = false

          //var to calculate last word before jumped or if not jumped set lenght of word
          let n = null

          previousWord.letters = previousWord.letters.map((letter,index) =>{

            
            if(letter.jumped && n === null ){
              n = index
              console.log(n)
            }

            return({
              ...letter,
              correct: letter.jumped ? null : letter.correct,
              jumped: false,
              active: n ? index === n : index === previousWord.letters.length -1
            })
          })
          
          //EL BUG DE PREVIOUSE PUEDE SER POR QUE N === 0 ES VALIDO COMO FALSE
          refWord.current = previousWord
          refLetter.current = previousWord.letters[n || previousWord.letters.length -1]

          // setear de nuevo la palabra anterior
          setNWord(nWord-1)
          setNLetter(n || previousWord.letters.length -1)
        }

      }
      else if(typeInsert){


        bufferInfo.keysPressed++

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
            bufferInfo.typeErrors++
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
            bufferInfo.typeErrors++

          }else{

            //the last letter for the last word
            if(nWord >= refListPhrase.current.length -1){
              setFinished(true)

              const newDate = new Date()

              const totalTime = (newDate.getTime() -  date.current.getTime())/1000

              // console.log(totalTime,1 / 60 * totalTime)

              // console.log(t)
              // setInfo({
              //   ...info,
              //   acc: info
              // })

              bufferInfo.acc = (1 - (bufferInfo.typeErrors / bufferInfo.keysPressed).toFixed(2)) * 100
              bufferInfo.wpm = Math.floor((bufferPhrase.length / totalTime) * 60)
              bufferInfo.time = totalTime.toFixed(1)

            }

              //correct is not defined (null)
              refWord.current = currentWord
              currentLetter.correct = e.key === currentLetter.key
              refLetter.current = currentLetter

              if(!currentLetter.correct){
                info.typeErrors++
              }
            
          }
        }

      }

      
      // console.log('changed by letter',bufferPhrase)
      setInfo(bufferInfo)
      setListPhrase(bufferPhrase)

    }

  },[info,refListPhrase,setListPhrase,finished,nWord,nLetter])


    useEffect(()=>{

      document.addEventListener('keyup',handlerKey)

      return ()=> document.removeEventListener('keyup',handlerKey)
    },[handlerKey])


    return (
    <div  className='home'>
      <h1>ReactTyper</h1>
      <div id='phrase' className='phrase'>
        <div ref={bar} className='bar'></div>
        {
          listPhrase.map((element,index)=> <Word setRef={setRef} key={index} text={element}></Word>)
        }
      </div>


      <div className='teclado'>

        <div className='teclado__firstBlock'>
          {
            ['q','w','e','r','t','y','u','i','o','p'].map((ltter,index) =>{
              return(
                <div key={index} onAnimationEnd={()=>{setTeclado(null)}} className={`tecla ${teclado === ltter && 'clicked'}`} ><div><span>{ltter}</span></div></div>
              )
            })
          }
        </div>

        <div className='teclado__secondBlock'>
          {
            ['a','s','d','f','g','h','j','k','l','ñ'].map((ltter,index) =>{
              return(
                <div key={index} onAnimationEnd={()=>{setTeclado(null)}} className={`tecla ${teclado === ltter && 'clicked'}`} ><div><span>{ltter}</span></div></div>
              )
            })
          }
        </div>
        <div className='teclado__secondBlock'>
          {
            ['','z','x','c','v','b','n','m','',''].map((ltter,index) =>{
              const style ={}
              if(ltter === ''){
                style.opacity = '0'
              }

              return(
                <div 
                  key={index} 
                  onAnimationEnd={()=>{setTeclado(null)}} 
                  className={`tecla ${teclado === ltter && 'clicked'}`}
                  style={style}
                >
                  <div>
                    <span>{ltter !== '' && ltter}</span>
                  </div>
                </div>
              )
            })
          }
        </div>

        <div>
          <div onAnimationEnd={()=>{setTeclado(null)}} className={`tecla space ${teclado === 'Space' && 'clicked'}`} ><div></div></div>
        </div>
      </div>


      <div className="info">
        <h2>Wpm <div>{info.wpm}</div></h2>
        <h2>Accuracy <div>{info.acc}%</div></h2>
        <h2>Time <div>{info.time}s</div></h2>
      </div>
    </div>
);
};