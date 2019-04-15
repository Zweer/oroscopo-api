import { Sky } from './lib/sky';

const sky = new Sky();

async function main() {
  console.log(await sky.daily('gemini'));
  console.log(await sky.tomorrow('gemini'));
  console.log(await sky.weekly('gemini'));
  console.log(await sky.yearly('gemini'));
}

main().catch(e => console.error(e));
