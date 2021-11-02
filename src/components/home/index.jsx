import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useStateRef } from "../../Hooks";
import {Bar, Line} from 'react-chartjs-2'
import Phrase from "./Phrase";
import Keyboard from "./Keyboard";

import "../../styles/Home/Home.scss";

// const phrase = `this phrase does not make sense sorry own one long present need now during govern life much one fact the develop before some get still thing group they last
// old here on run face move stand world that because mean after word text return develop production test to pharagraph`

const phrase = `this phrase does don't not make sense sorry own one long present need now during govern`;

const phrases = [
  `In reasonable compliment favourable is connection dispatched in terminated. Do esteem object we called father excuse remove. So dear real on 
  like more it. Laughing for two families addition expenses surprise the. If sincerity he to curiosity arranging. Learn taken terms be as. Scarcely  
  mrs produced too removing new old.`,
  `Improved own provided blessing may peculiar domestic. Sight house has sex never. No visited raising gravity outward subject my cottage mr be. 
  Hold do at tore in park feet near my case. Invitation at understood occasional sentiments insipidity inhabiting in. Off melancholy alteration 
  principles old. Is do speedily kindness properly oh. Respect article painted cottage he is offices parlors.`,
  `Although moreover mistaken kindness me feelings do be marianne. Son over own nay with tell they cold upon are. Cordial village and settled she
  ability law herself. Finished why bringing but sir bachelor unpacked any thoughts. Unpleasing unsatiable particular inquietude did nor sir. Get 
  his declared appetite distance his together now families. Friends am himself at on norland it viewing. Suspected elsewhere you belonging continued 
  commanded she.`,
  `Acceptance middletons me if discretion boisterous travelling an. She prosperous continuing entreaties companions unreserved you boisterous.
  Middleton sportsmen sir now cordially ask additions for. You ten occasional saw everything but conviction. Daughter returned quitting few are 
  day advanced branched. Do enjoyment defective objection or we if favourite. At wonder afford so danger cannot former seeing. Power visit charm money 
  add heard new other put. Attended no indulged marriage is to judgment offering landlord.`,
  `Necessary ye contented newspaper zealously breakfast he prevailed. Melancholy middletons yet understood decisively boy law she. Answer him easily are 
  its barton little. Oh no though mother be things simple itself. Dashwood horrible he strictly on as. Home fine in so am good body this hope.`,
  `Building mr concerns servants in he outlived am breeding. He so lain good miss when sell some at if. Told hand so an rich gave next. How doubt 
  yet again see son smart. While mirth large of on front. Ye he greater related adapted proceed entered an. Through it examine express promise no. 
  Past add size game cold girl off how old.`,
  `In alteration insipidity impression by travelling reasonable up motionless. Of regard warmth by unable sudden garden ladies. No kept hung am size
  spot no. Likewise led and dissuade rejoiced welcomed husbands boy. Do listening on he suspected resembled. Water would still if to. Position boy
  required law moderate was may.`,
  `En un cumplido razonable, la conexion se envia en terminada. Hacer el objeto de estima que llamamos padre excusa quitar.
  Tan querido, real como mas. Riendo por dos familias, los gastos adicionales sorprenden a los. Si la sinceridad es a la curiosidad arreglando.
  Aprenda los terminos tomados como. Apenas la señora produjo demasiada eliminacion de lo nuevo y lo viejo.`,
  `ver prica las siguible explica cumple pera lsangusti burry has sento hab esma calimonc monio estrena shala zozo las fuga
  parse cual bacha ntico soci que endie mira contiencia siguimo que mano util corte cnicos ras pablando extrevido una iba`
];

//BUG CUANDO el espacio (jumped) se ejecuta desdee la primer letra, cuando vuelvo no vuelve a la primera


//BUG Cuando hago un jumped y me paro a eliminar no se borra todo

const buildPhrase = (phrase) => {

  const random = Math.floor(Math.random() * (phrases.length)) 

  const words = phrases[random]
    .toLowerCase()
    .split(" ")
    .map(word=> word.trim())
    .filter((word) => word !== "")
    .map((word, index) => {
      return {
        word: word,
        active: index === 0 ? true : false,
        letters: word.split("").map((letter, i) => {
          return {
            key: letter,
            correct: null,
            index: i,
            active: index === 0 && i === 0 ? true : false,
            jumped: false,
            extra: false,
          };
        }),
      };
    });

  return words;
};

//lo mejor seria colocar
export default function Home() {
  const phraseMemo = useMemo(() => buildPhrase(phrase), []);

  const test = useRef({})

  const [listPhrase, refListPhrase, setListPhrase] = useStateRef(phraseMemo);
  const refWord = useRef({ ...phraseMemo[0] });
  const refLetter = useRef({ ...refWord.current.letters[0] });
  const [inputText,refInputText, setInputText] = useStateRef('')

  const [state, refState, setState] = useStateRef({
    start: false,
    finished: false,
    initTime: null,
    wpm: 0,
    acc: 0,
    time: 0,
    letters: listPhrase.reduce(
      (accumulative, word) => accumulative + word.letters.length,
      0
    ),
    keysPressed: 0,
    typeErrors: 0,
  });

  const [nWord, setNWord] = useState(0);
  const [nLetter, setNLetter] = useState(0);

  const bar = useRef(null);
  const [keyPressed, setKeyPressed] = useState(null);
  const activeLetter = useRef(null);

  const setRef = useCallback(function (node) {
    if (activeLetter.current) {
      //remove events to the previous
    }

    if (node) {
      const phraseDiv = document
        .getElementById("phrase")
        .getBoundingClientRect();

      const xPos = node.getBoundingClientRect().left - phraseDiv.left;
      const yPos = node.getBoundingClientRect().top - phraseDiv.top;

      bar.current.style.top = `${yPos}px`;

      //si estamos en cualquier letra menos la ultima
      if (refWord.current.letters.length - 1 !== refLetter.current.index) {
        bar.current.style.left = `${xPos}px`;
      }
      //si ya estamos en la ultima entonces //si esta seleccionada
      else if (typeof refLetter.current.correct === "boolean") {
        bar.current.style.left = `${xPos + 10}px`;
      } else {
        bar.current.style.left = `${xPos}px`;
      }
    }

    // console.log(activeWord)
    activeLetter.current = node;
  }, []);

  const handlerKey = useCallback((e) => {
      // console.log(e.which, e.key);

      e.preventDefault()
      // console.log(test.current)

      //if the current typing session has not started yet
      if (!refState.current.start) {
        setState({
          ...refState.current,
          initTime: new Date(),
          start: true,
        });
      }

      //if the session has not finished yet
      if (!refState.current.finished) {
        const x = [`.`, `,`, `'`, "Backspace", " ", 'ñ', 'Control'];

        //return if is not letter or its length is larger than 1 or if not is backspace and not is space
        if (
          (!/[aA-zZ]/.test(e.key) || e.key.length > 1) &&
          !x.includes(e.key)
        ) {
          return;
        }

        const typeInsert = e.key !== "Backspace";
        const bufferPhrase = [...refListPhrase.current];
        const currentWord = { ...refWord.current };
        const currentLetter = currentWord.letters[nLetter];
        let nextLetter =
          nLetter + 1 < currentWord.letters.length
            ? currentWord.letters[nLetter + 1]
            : null;
        let backLetter = nLetter > 0 ? currentWord.letters[nLetter - 1] : null;
        const bufferState = { ...refState.current };
        bufferPhrase[nWord] = currentWord;

        setKeyPressed(e.key === " " ? "Space" : e.key);

        if (e.key === ' ') {
          //return to prevent space in the lastword
          if (nWord + 1 >= bufferPhrase.length) {
            return;
          }

          setNWord(nWord + 1);
          setNLetter(0);

          const nextWord = { ...bufferPhrase[nWord + 1] };

          currentWord.letters = currentWord.letters.map((letter, index) => {
            return {
              ...letter,
              active: false,
              jumped:
                nLetter === currentWord.letters.length - 1
                  ? false
                  : index >= nLetter
                  ? true
                  : false,
              correct:
                typeof letter.correct === "boolean"
                  ? letter.correct
                    ? true
                    : false
                  : false,
            };
          });

          bufferPhrase[nWord + 1] = nextWord;
          nextWord.letters[0].active = true;
          refWord.current = nextWord;
          refLetter.current = nextWord.letters[0];

          setListPhrase(bufferPhrase);

          return;
        }

        //BUG CUANDO ESTOY EN LA PENULTIMA PALARABA Y HAGO SPACE LA ULTIMA LETRA NO SE MARCA COMO JUMPED

        //is delete and have backletter
        if (!typeInsert) {

          // console.log(test.current['Control'])
          if (backLetter) {

            //if control is press
            if(test.current['Control']){
              //palabra actual
              //eliminar todas las letras y posiconar en el 1

              currentWord.letters = currentWord.letters.filter(letter => !letter.extra).map((letter,index)=>{
                return({
                  ...letter,
                  correct: null,
                  active: index === 0,
                  jumped: false,
                })
              })


              setNLetter(0)
              refLetter.current = currentWord.letters[0]
              refWord.current = currentWord
            }else{
            //normally
            //if the letter is extra remove
            if (currentLetter.extra) {
              //remove and set the last word
              currentWord.letters.pop();
              backLetter.active = true;

              refLetter.current = backLetter;
              setNLetter(nLetter - 1);
            } else {

              //if current letter is the last letter in word and it has value
              if (
                currentLetter.index === currentWord.letters.length - 1 &&
                typeof currentLetter.correct === "boolean"
              ) {
                currentLetter.correct = null;
                refLetter.current = currentLetter;
              } else {
                currentLetter.correct = null;
                currentLetter.active = false;
                backLetter.active = true;
                backLetter.correct = null;

                refLetter.current = backLetter;
                setNLetter(nLetter - 1);
              }
            }
            }


          }

          //si no existe una letra anterior y la palabra no es la inicial (index 0)
          else if (nWord > 0) {

            //TODO: si estoy en el inicio de una palabra y debo borrar 
            //debo borrar desde el espacio y toda la palabra

            //solo eliminar si la anterior palabra esta mal escrota
            const previousWord = { ...bufferPhrase[nWord - 1] };

            //if the previousword is correct cannot return
            if (
              previousWord.letters.filter((letter) => !letter.correct)
                .length === 0
            ) {
              return;
            }

            bufferPhrase[nWord - 1] = previousWord;
            currentLetter.active = false;

            //var to calculate last word before jumped or if not jumped set lenght of word
            let firstJumped = previousWord.letters.find(
              (letter) => letter.jumped
            );

            let n = firstJumped
              ? firstJumped.index
              : previousWord.letters.length - 1;

            previousWord.letters = previousWord.letters.map((letter, index) => {
              return {
                ...letter,
                correct: letter.jumped ? null : letter.correct,
                jumped: false,
                active: n === index,
                // n equivale a la que encontro o la ultima por defecto
              };
            });

            refWord.current = previousWord;
            refLetter.current = previousWord.letters[n];

            // setear de nuevo la palabra anterior
            setNWord(nWord - 1);
            setNLetter(n);
          }
        } 

          //inserting key
        else if (typeInsert && e.key !== 'Control') {
          bufferState.keysPressed++;

          //there more letters
          if (nextLetter) {
            //set if press key is correct and remove active for the currentLetter
            currentLetter.correct = e.key === currentLetter.key;
            currentLetter.active = false;

            //set nextletter as activate
            nextLetter.active = true;
            setNLetter(nLetter + 1);

            //set current letter
            refWord.current = currentWord;
            refLetter.current = nextLetter;

            //every time to a insert key is incorrect the accuracy is affect
            if (!currentLetter.correct) {
              bufferState.typeErrors++;
            }
          } else {
            //if the las letter set as true or false, insert one more letter
            if (typeof currentLetter.correct === "boolean") {
              currentLetter.active = false;
              nextLetter = {
                active: true,
                correct: false,
                key: e.key,
                extra: true,
                index: nLetter + 1,
              };
              currentWord.letters.push(nextLetter);
              setNLetter(nLetter + 1);

              //setcurrent letter
              refWord.current = currentWord;
              refLetter.current = nextLetter;

              // extra letter equal error typing
              bufferState.typeErrors++;
            } else {
              //the last letter for the last word
              if (nWord >= refListPhrase.current.length - 1) {
                const newDate = new Date();

                const totalTime =
                  (newDate.getTime() - state.initTime.getTime()) / 1000;

                bufferState.finished = true;
                bufferState.acc = (1 -(bufferState.typeErrors / bufferState.keysPressed).toFixed(2)) * 100;
                bufferState.wpm = Math.floor(( (bufferState.letters/5) / totalTime) * 60);
                bufferState.time = totalTime.toFixed(1);
              }

              //correct is not defined (null)
              refWord.current = currentWord;
              currentLetter.correct = e.key === currentLetter.key;
              refLetter.current = currentLetter;

              if (!currentLetter.correct) {
                bufferState.typeErrors++;
              }
            }
          }
        }

        setState(bufferState);
        setListPhrase(bufferPhrase);
      }

    },
    [refListPhrase, setListPhrase, setState, refState, state, nWord, nLetter]
  );

  const preses = useCallback((e)=>{

    test.current[e.key] = e.type === 'keydown'

  },[])

  useEffect(() => {

    document.addEventListener("keydown", preses)
    document.addEventListener("keyup",preses)

    document.addEventListener("keydown", handlerKey);
    

    return () => {
      document.removeEventListener('keydown',preses)
      document.removeEventListener("keyup", preses)
      document.removeEventListener("keydown", handlerKey)
    }

  }, [handlerKey,preses]);

  useEffect(() => {
    window.onresize = () => {
      // console.log(node)
      const node = activeLetter.current;
      const phraseDiv = document
        .getElementById("phrase")
        .getBoundingClientRect();

      const xPos = node.getBoundingClientRect().left - phraseDiv.left;
      const yPos = node.getBoundingClientRect().top - phraseDiv.top;

      bar.current.style.top = `${yPos}px`;

      if (refWord.current.letters.length - 1 !== refLetter.current.index) {
        bar.current.style.left = `${xPos}px`;
      }
      //si ya estamos en la ultima entonces //si esta seleccionada
      else if (typeof refLetter.current.correct === "boolean") {
        bar.current.style.left = `${xPos + 10}px`;
      } else {
        bar.current.style.left = `${xPos}px`;
      }
    };

    return () => (window.onresize = null);
  }, []);

  return (
    <div className="home">
      <h1>ReactTyper</h1>

      <Phrase ref={bar} setRef={setRef} listPhrase={listPhrase} />

      <Keyboard teclado={keyPressed} setTeclado={setKeyPressed} />


      <div className="info">
        <h2>
          Wpm <div>{state.wpm}</div>
        </h2>
        <h2>
          Accuracy <div>{state.acc}%</div>
        </h2>
        <h2>
          Time <div>{state.time}s</div>
        </h2>
      </div>

      <div className="chartContainer">
        <Line
          height={300}
          options={{
            maintainAspectRatio:true,
            responsive:true,
          }}
          width={600}
          data={{
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: '# of Votes',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }}
        />
      </div>
    </div>
  );
}
