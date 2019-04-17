import { dialogflow } from 'actions-on-google';

export const app = dialogflow();

app.intent('Default Welcome Intent', conv => {
  conv.ask('Ciao mondo');
});

app.intent('ask-the-seer', conv => {
  let sunsign = conv.parameters.sunsign;
  conv.ask('Quindi sei del segno ' + sunsign);
});

app.catch((conv, error) => {
  console.error(error);
  conv.ask('Scusa, c\'è stato un errore. Potresti ripetere?');
});

app.fallback((conv) => {
  conv.ask('Non ho capito. Potresti ripetere?');
});
