/** @typedef {import('@minecraft/server').ItemCustomComponent} ItemCustomComponent */

import { EquipmentSlot, Player } from '@minecraft/server';
import { AdminPanel } from '../form/AdminPanel';
import { Util } from '../util/util';

/** @implements {ItemCustomComponent} */
export class AdminPanelComponent {
  static componentName = 'tn:admin_panel';
  
  /** @param {import('@minecraft/server').ItemComponentUseEvent} ev */
  onUse(ev) {
    const { source, itemStack } = ev;

    if (!Util.isOP(source)) return;

    if (AdminPanel.isPanelItem_old(itemStack)) {
      // migrate old item
      source.getComponent('minecraft:equippable').setEquipment(
        EquipmentSlot.Mainhand,
        AdminPanel.getPanelItem()
      );
    }

    if (AdminPanel.isPanelItem(itemStack)) {
      const hit = source.getEntitiesFromViewDirection({ maxDistance: 24 })[0];
      if (hit?.entity instanceof Player) new AdminPanel(source).playerInfo(hit.entity);
      else new AdminPanel(source).show();
    }
  }
}
