import React , {useState} from 'react';


const keys = {
  firstBlock: ['q','w','e','r','t','y','u','i','o','p'],
  secondBlock: ['a','s','d','f','g','h','j','k','l','ñ'],
  thirdBlock: ['','z','x','c','v','b','n','m','','']
}

const Key = ({setTeclado,teclado,letter})=>{

  const style = {opacity: letter === '' ? 0 : 1}
  return(
    <div 
      onAnimationEnd={()=>{setTeclado(null)}} 
      className={`tecla ${teclado === letter && 'clicked'}`} 
      style={style}
    >
      <div>
        <span>
          {letter}
        </span>
      </div>
    </div>
  )
}


const KeyboardBlock = ({letters, setTeclado,teclado}) =>{
  return(
    <div className="keyboard__block">
      {
        letters.map((letter,index) => <Key key={index} setTeclado={setTeclado} teclado={teclado} letter={letter}/> )
      }
    </div>
  )
} 

export default function Keyboard ({setTeclado, teclado}) {

    return (
    <div className='keyboard'>

        {
          Object.values(keys).map(block=><KeyboardBlock letters={block} setTeclado={setTeclado} teclado={teclado}/>)
        }

        <div>
          <div onAnimationEnd={()=>{setTeclado(null)}} className={`tecla space ${teclado === 'Space' && 'clicked'}`} ><div></div></div>
        </div>
    </div>
);
};