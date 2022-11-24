import { Container, ItemStack, MinecraftItemTypes } from '@minecraft/server';
const AIR = new ItemStack(MinecraftItemTypes.dirt, 0, 0);

if (!Container.prototype.clearItem) Container.prototype.clearItem = function (slot) {
  this.setItem(slot, AIR);
}