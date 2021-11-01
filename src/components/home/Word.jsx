import React, {useState,useCallback, useEffect, memo, forwardRef} from 'react';

const Letter = ({active,correct,index,value,setRef})=>{

  return (
    <div ref={(node)=>{
      if(active){
        setRef(node)
      }
    }} 
    key={index} 
    className={`letter ${active ? 'active' : ''}  ${correct === false ? 'incorrect' : ''}  ${correct ? 'correct' : ''}`} >
      <pre>
        {value}
      </pre>
    </div>
  )
}

function Word ({text,setRef}) {

  // console.log(setRef)

    return (
    <div className='word'>
      {
        text.letters.map((letter,index)=>{
          return(
          <Letter 
            setRef={setRef} 
            key={index} 
            active={letter.active} 
            correct={letter.correct} 
            value={letter.key}/>)
        })
      }

    </div>
);
};


//memoized the props of the word to prevent updates if not changes
export default memo(Word)


