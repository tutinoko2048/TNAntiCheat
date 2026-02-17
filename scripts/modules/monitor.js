import { ButtonState, EasingType, InputButton } from '@minecraft/server';
import { ModerationManager } from '../util/ModerationManager';
import { Vec3 } from '../lib/bedrock-boost/Vec3';


/**
 * @param {import('@minecraft/server').Player} player 
 */
export function onTick(player) {
  const state = ModerationManager.getMonitoringState(player);
  if (!state) return;

  if (!state.target.isValid) {
    ModerationManager.setMonitoringState(player);
    player.sendMessage('§7[Monitor] プレイヤーが退出したため、視点の固定を解除しました');
    return;
  }

  const target = state.target;

  // camera control
  const center = Vec3.from(target.getHeadLocation());
  const delta = Vec3.from(player.getViewDirection()).multiply(-1 * state.zoom);

  player.camera.setCamera('minecraft:free', {
    location: center.add(delta),
    rotation: player.getRotation(),
    easeOptions: {
      easeTime: 0.1,
      easeType: EasingType.Linear
    }
  });

  // zoom level
  if (player.inputInfo.getButtonState(InputButton.Sneak) === ButtonState.Pressed) {
    state.zoom += 0.1;
  }

  if (player.inputInfo.getButtonState(InputButton.Jump) === ButtonState.Pressed) {
    state.zoom -= 0.1;
  }
}
