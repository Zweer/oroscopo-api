import { Sky } from './lib/sky';
import { endpoint, param } from './utils/lambda/decorators';

class Retrieve {
  private sky: Sky;

  constructor() {
    this.sky = new Sky();
  }

  @endpoint
  async daily(@param('sunsign') sunsign) {
    return this.sky.daily(sunsign);
  }

  @endpoint
  async tomorrow(@param('sunsign') sunsign) {
    return this.sky.tomorrow(sunsign);
  }

  @endpoint
  async weekly(@param('sunsign') sunsign) {
    return this.sky.weekly(sunsign);
  }

  @endpoint
  async yearly(@param('sunsign') sunsign) {
    return this.sky.yearly(sunsign);
  }
}

const retrieve = new Retrieve();

export const daily = event => retrieve.daily(event);
export const tomorrow = event => retrieve.tomorrow(event);
export const weekly = event => retrieve.weekly(event);
export const yearly = event => retrieve.yearly(event);
