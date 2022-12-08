import { 
  Container,
  InventoryComponentContainer,
  PlayerInventoryComponentContainer,
  BlockInventoryComponentContainer,
  ItemStack, MinecraftItemTypes, world } from '@minecraft/server';
const AIR = new ItemStack(MinecraftItemTypes.dirt, 0, 0);

if (!Container.prototype.clearItem) {
  Container.prototype.clearItem = clearItem; 
  InventoryComponentContainer.prototype.clearItem = clearItem;
  PlayerInventoryComponentContainer.prototype.clearItem = clearItem;
  BlockInventoryComponentContainer.prototype.clearItem = clearItem;
}

function clearItem(slot) {
  this.setItem(slot, AIR);
}