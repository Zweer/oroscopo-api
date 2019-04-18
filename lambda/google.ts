import { dialogflow } from 'actions-on-google';
import axios from 'axios';

export const app = dialogflow({
  debug: true
});

app.intent('Default Welcome Intent', conv => {
  conv.ask('Bnvenuto. Cosa vuoi sapere?');
});

app.intent('ask-the-seer', (conv, {sunsign, period, astrologerCategory}) => {
  const mapPeriodToAPIPeriod: (p: string) => (string) = p => {
    switch (p) {
      case 'oggi':
        return 'daily';
      case 'domani':
        return 'tomorrow';
      case 'settimanale':
        return 'weekly';
      default:
        return 'yearly'
    }
  };

  return executeAsyncCall(sunsign, mapPeriodToAPIPeriod(period as string))
    .then(body => {
      const horoscope = body.data.horoscope;
      const love = body.data.love;
      const work = body.data.work;

      let response = astrologerCategory === 'amore' ?  `In amore ${love}`
        : astrologerCategory === 'lavoro' ? `In amore ${work}`
          : `${horoscope} In amore. ${love} Per quanto riguarda il lavoro. {work}`;
      conv.ask(response);
    });
});

app.catch((conv, error) => {
  console.error(error);
  conv.ask(`Scusa, c'è stato un errore. Potresti ripetere?`);
});

app.fallback((conv) => {
  conv.ask(`Non ho capito. Potresti ripetere?`);
});


function executeAsyncCall(sunsing, period) : Promise<any> {
  const apiEndpoint = 'https://8dv2b6stqb.execute-api.eu-west-1.amazonaws.com/dev/';
  const uri = `${apiEndpoint + period}/${sunsing}`;

  return axios.get(uri)
    .then(({ data }) => data);
}
