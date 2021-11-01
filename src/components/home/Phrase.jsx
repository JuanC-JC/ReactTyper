import React from 'react';
import { forwardRef } from 'react';
import Word from './Word';

//Component phrase 
const Phrase = forwardRef( ({setRef, listPhrase},bar) => {
    return (
      <div id='phrase' className='phrase'>
      <div ref={bar} className='bar'></div>
      {
        listPhrase.map((element,index)=> <Word setRef={setRef} key={index} text={element}></Word>)
      }
    </div>
)})

export default Phrase