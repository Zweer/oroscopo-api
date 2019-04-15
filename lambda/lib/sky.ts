import axios from 'axios';
import * as cheerio from 'cheerio';
import * as moment from 'moment';

export interface horoscope {
  date: string;
  horoscope: string;
  sunsign: string;
}

export class Sky {
  static URL = 'https://oroscopo.sky.it/oroscopo/{WHEN}/{SUNSIGN}.html';
  static CLASS_PATH = '.c-multitab--oroscopo .c-multi-tab__tab-body p';

  static WHENS = ['giorno', 'domani', 'settimana', 'anno'];
  static SUNSIGNS = {
    aries: 'ariete',
    taurus: 'toro',
    gemini: 'gemelli',
    cancer: 'cancro',
    leo: 'leone',
    virgo: 'vergine',
    libra: 'bilancia',
    scorpio: 'scorpione',
    sagittarius: 'sagittario',
    capricorn: 'capricorno',
    aquarius: 'acquario',
    pisces: 'pesci',
  };

  static parseDate(dateRaw) {
    const date = moment(dateRaw, 'DD MMMM YYYY');

    return date.format('YYYY-MM-DD');
  }

  static parseYear(dateRaw) {
    const date = moment(dateRaw, 'YYYY');

    return date.format('YYYY');
  }

  async daily(sunsign) {
    const { date: dateRaw, horoscope, love, work, sunsign: normalizedSunsign } = await this.retrieve('giorno', sunsign);

    const date = Sky.parseDate(dateRaw);

    return { date, horoscope, love, work, sunsign: normalizedSunsign };
  }

  async tomorrow(sunsign) {
    const { date: dateRaw, horoscope, love, work, sunsign: normalizedSunsign } = await this.retrieve('domani', sunsign);

    const date = Sky.parseDate(dateRaw);

    return { date, horoscope, love, work, sunsign: normalizedSunsign };
  }

  async weekly(sunsign) {
    const { date: dateRaw, horoscope, love, work, sunsign: normalizedSunsign } = await this.retrieve('settimana', sunsign);

    const date = Sky.parseDate(dateRaw);

    return { date, horoscope, love, work, sunsign: normalizedSunsign };
  }

  async yearly(sunsign) {
    const { date: dateRaw, horoscope, love, work, sunsign: normalizedSunsign } = await this.retrieve('anno', sunsign);

    const date = Sky.parseYear(dateRaw);

    return { date, horoscope, love, work, sunsign: normalizedSunsign };
  }

  async retrieve(when, sunsign) {
    if (!Sky.WHENS.includes(when)) {
      throw new Error(`Invalid "when": ${when}`);
    }

    const translatedSunsign = Sky.SUNSIGNS[sunsign] || sunsign;

    if (!Object.values(Sky.SUNSIGNS).includes(translatedSunsign)) {
      throw new Error(`Invalid "sunsign": ${translatedSunsign}`);
    }

    const response = await this.request(when, translatedSunsign);

    return {
      ...response,
      sunsign: translatedSunsign,
    };
  }

  private async request(when, sunsign) {
    const url = Sky.URL.replace('{WHEN}', when).replace('{SUNSIGN}', sunsign);
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const [date, horoscope, love, work] = $(Sky.CLASS_PATH)
      .map((i, element) => $(element).text())
      .toArray()
      .map(text => text.trim());

    return { date, horoscope, love, work };
  }
}
