import { ErrorHandler, HandlerInput, RequestHandler, SkillBuilders } from 'ask-sdk-core';
import { IntentRequest, Response } from 'ask-sdk-model';
import axios from 'axios';
import * as moment from 'moment';

const { ALEXA_SKILL_ID } = process.env;

class LaunchRequestHandler implements RequestHandler {
  canHandle(input: HandlerInput): Promise<boolean> | boolean {
    return input.requestEnvelope.request.type === 'LaunchRequest';
  }

  handle(input: HandlerInput): Promise<Response> | Response {
    return input.responseBuilder
      .speak('Ciao, che oroscopo vuoi sapere?')
      .getResponse();
  }
}

class HoroscopeRequestHandler implements RequestHandler {
  canHandle(input: HandlerInput): Promise<boolean> | boolean {
    return input.requestEnvelope.request.type === 'IntentRequest' && input.requestEnvelope.request.intent.name === 'HoroscopeIntent';
  }

  async handle(input: HandlerInput): Promise<Response> {
    const request = input.requestEnvelope.request as IntentRequest;
    const slots = request.intent.slots;

    const whenRaw = slots.when.value || 'daily';
    const whenTranslations = {
      oggi: 'daily',
      domani: 'tomorrow',
      settimana: 'weekly',
      anno: 'yearly',
    };
    const when = whenTranslations[whenRaw] || whenRaw;
    const sunsign = slots.sunsign.value;

    const url = `https://8dv2b6stqb.execute-api.eu-west-1.amazonaws.com/dev/${when}/${sunsign}`;
    const { data: { data } } = await axios.get(url);

    moment.locale('it');
    const date = moment(data.date).format('DD MMMM YYYY');

    let text = 'Ecco qui l\'oroscopo ';
    switch (when) {
      case 'daily':
        text += `di oggi, ${date}: ${data.horoscope}`;
        break;

      case 'tomorrow':
        text += `di domani, ${date}: ${data.horoscope}`;
        break;

      case 'weekly':
        text += `della settimana del ${date}: ${data.horoscope}`;
        break;

      case 'yearly':
        text += `dell'anno ${data.date}`;
        break;

      default:
        // do nothing
        break;
    }

    text += `\nPer quanto riguarda l'amore: ${data.love}\nInfine il lavoro: ${data.work}`;

    return input.responseBuilder
      .speak(text)
      .getResponse();
  }
}

class ErrorHandlerRequest implements ErrorHandler {
  canHandle(handlerInput: HandlerInput, error: Error): Promise<boolean> | boolean {
    return true;
  }

  handle(handlerInput: HandlerInput, error: Error): Response {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Scusa ma non ti capisco. Puoi ripetere?')
      .reprompt('Scusa ma non ti capisco. Puoi ripetere?')
      .getResponse()
  }
}

export const handler = SkillBuilders.custom()
  .withSkillId(ALEXA_SKILL_ID)
  .addRequestHandlers(
    new LaunchRequestHandler(),
    new HoroscopeRequestHandler(),
  )
  .addErrorHandlers(new ErrorHandlerRequest())
  .lambda();
