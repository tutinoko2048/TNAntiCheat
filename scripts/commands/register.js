import { help } from './help';
import { op } from './op';
import { deop } from './deop';
import { version } from './version';
import { setting } from './setting';
import { settingitem } from './settingitem';
import { kick } from './kick';
import { tempkick } from './tempkick';
import { ban } from './ban';
import { mute } from './mute';
import { runjs } from './runjs';
import { about } from './about';

export function register(handler) {
  handler.create(help);
  handler.create(op);
  handler.create(deop);
  handler.create(version);
  handler.create(setting);
  handler.create(settingitem);
  handler.create(kick);
  handler.create(tempkick);
  handler.create(ban);
  handler.create(mute);
  //handler.create(runjs);
  handler.create(about);
}