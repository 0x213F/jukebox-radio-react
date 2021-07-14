import React, { useEffect, useRef } from "react";

import { connect } from 'react-redux';
import { Notation } from 'react-abc';

import { chordParserFactory, chordRendererFactory } from 'chord-symbol';
import { BbFormat } from 'bb-format';

// eslint-disable-next-line
import { Pianokeys } from 'custom-piano-keys';


function TheoryNotation(props) {

  /*
   * 🏗
   */
  const text = props.text;

  const parseChord = chordParserFactory();
  const renderChord = chordRendererFactory();
  const chord = parseChord(text);

  let markedKeys;
  if(chord && !chord.error) {
    const rootNote = chord.input.rootNote,
          noteToDisplacement = {
            'C': 1,
            'D': 3,
            'E': 5,
            'F': 6,
            'G': 8,
            'A': 10,
            'B': 12,
            'Cb': 12,
            'Db': 2,
            'Eb': 4,
            'Fb': 6,
            'Gb': 7,
            'Ab': 9,
            'Bb': 11,
            'C#': 2,
            'D#': 4,
            'E#': 6,
            'F#': 7,
            'G#': 9,
            'A#': 11,
            'B#': 12,
          },
          rootDisplacement = noteToDisplacement[rootNote],
          notes = chord.normalized.semitones.map(st => st + rootDisplacement);
    markedKeys = notes.join(' ');
  }

  const bbRef = useRef();
  useEffect(() => {
    const canvas = bbRef.current;
    if(canvas) {
      const ratio = window.devicePixelRatio || 1,
            canvas = bbRef.current,
            context = canvas.getContext('2d'),
            rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * ratio;
      canvas.height = 100 * ratio;

      const bbChordRenderer = new BbFormat(context);
      context.clearRect(0, 0, rect.width * ratio, 100 * ratio);
      context.font = "100px Boogaloo";

      bbChordRenderer.fillChordSymbol(renderChord(chord), 100, 100);
    }
  // eslint-disable-next-line
  }, [text])

  /*
   * 🎨
   */
  return (
    chord && !chord.error ?
      <>
        <canvas ref={bbRef} style={{width: "100%", height: "100px"}} />
        <custom-piano-keys oct-w-factor={1} marked-keys={markedKeys}
                           oct-count={3}
                           style={{marginLeft: '27.5px'}} />
      </> :
      <Notation notation={text}
                engraverParams={{ staffwidth: 278 }}/>
  );
}


const mapStateToProps = (state) => ({
  textCommentMap: state.textCommentMap,
});


export default connect(mapStateToProps)(TheoryNotation);
