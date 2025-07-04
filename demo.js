import 'babel-polyfill';
import DanceParty from './src/p5.dance';
import jazzy_beats from './metadata/jazzy_beats';
import interpreted from 'raw-loader!./src/p5.dance.interpreted.js';
import injectInterpreted from './test/helpers/injectInterpreted';
import { codeBlocks } from './codeBlocks.js';

const textareaCode = document.querySelector('#code');
const buttonRun = document.querySelector('#run');

const nativeAPI = (window.nativeAPI = new DanceParty({
  onPuzzleComplete: () => {},
  playSound: (url, callback, onEnded) =>
    setTimeout(() => {
      callback && callback();
    }, 0),
  onInit: () => {
    document.querySelector('#run').style.display = 'inline';
    const currentURL = window.location.href;
    const match = currentURL.match(/\/pages\/(.+?)\.html/);
    const page = match ? match[1] : null;
    runCode(page);
  },
  container: 'dance',
}));

// Note: We don't just declare
//   async function runCode() {
// here because of a bug in Babel that tries to hoist the async function definition above
// the prerequisite polyfill import, above.  This is fixed in Babel 7.
// See https://github.com/babel/babel/issues/5085 and https://github.com/babel/babel/issues/6956
const runCode = async function (page) {
  await nativeAPI.ensureSpritesAreLoaded();
  textareaCode.value = textareaCode.value || codeBlocks[page];
  const {runUserSetup, runUserEvents, getCueList} = injectInterpreted(
    nativeAPI,
    interpreted,
    textareaCode.value
  );

  // Setup event tracking.
  nativeAPI.addCues(getCueList());
  nativeAPI.onHandleEvents = currentFrameEvents =>
    runUserEvents(currentFrameEvents);

  runUserSetup();

  nativeAPI.play(jazzy_beats);
};

document.querySelector('#run').addEventListener('click', () => {
  if (buttonRun.innerText === 'Reset') {
    buttonRun.innerText = 'Run!';
    nativeAPI.reset();
  } else {
    buttonRun.innerText = 'Reset';
    runCode();
  }
});
